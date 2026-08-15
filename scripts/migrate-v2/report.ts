import { config as loadEnv } from "dotenv";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createDataSource, portfolioLegacyEntities } from "../../src/db/data-source";
import { buildProposedPlan } from "./build-proposed";
import {
  countConfidence,
  countResources,
} from "./consolidate";
import { writeCoverageReport } from "./coverage";
import {
  compareLegacySnapshots,
  writeFixtureDriftReport,
} from "./compare-fixtures";
import { fingerprintSourceId } from "./decisions";
import { loadLegacySnapshot } from "./load-legacy";
import { fixtureLegacyCounts, loadLegacyFromFixtures } from "./load-fixtures";
import {
  assertLegacyBaseline,
  assertV2Empty,
  countTables,
  countsEqual,
  formatCounts,
  LEGACY_TABLES,
  V2_TABLES,
} from "./safety";
import type { DryRunReport, RecordAnalysis } from "./types";

loadEnv({ path: resolve(process.cwd(), ".env") });

const CONFIDENTIAL_ALIAS_RE = /\b(athenas|inspector)\b/i;
const FISERV_ALIAS_RE = /\bfiserv\b/i;

function mdEscape(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

/** Sanitize named_list / deferred labels for report output. */
function sanitizeSensitiveLabel(label: string): string {
  if (/athenas|inspector/i.test(label)) return "[deferred-confidential]";
  if (/fiserv/i.test(label)) return "[deferred]";
  return label;
}

function sanitizeDeferredOrDiscardedItem<
  T extends { id: string; label: string },
>(item: T): T {
  if (
    CONFIDENTIAL_ALIAS_RE.test(item.id) ||
    CONFIDENTIAL_ALIAS_RE.test(item.label)
  ) {
    return {
      ...item,
      id: fingerprintSourceId(item.id),
      label: "[deferred-confidential]",
    };
  }
  if (FISERV_ALIAS_RE.test(item.id) || FISERV_ALIAS_RE.test(item.label)) {
    return {
      ...item,
      label: "[deferred]",
    };
  }
  return item;
}

function sanitizeHumanDecisionNote(note: string): string {
  if (CONFIDENTIAL_ALIAS_RE.test(note)) {
    return note
      .replace(/\bathenas\b/gi, "[deferred-confidential]")
      .replace(/\binspector\b/gi, "[deferred-confidential]");
  }
  if (FISERV_ALIAS_RE.test(note)) {
    return note.replace(/\bfiserv\b/gi, "[deferred]");
  }
  return note;
}

/** Redact confidential aliases from inventory records before JSON/md output. */
function sanitizeRecord(rec: RecordAnalysis): RecordAnalysis {
  if (
    CONFIDENTIAL_ALIAS_RE.test(rec.legacyId) ||
    CONFIDENTIAL_ALIAS_RE.test(rec.title)
  ) {
    return {
      ...rec,
      legacyId: fingerprintSourceId(rec.legacyId),
      title: "[deferred-confidential]",
      proposedDestination: "DEFERRED",
    };
  }
  return rec;
}

export function writeDryRunReports(
  report: DryRunReport,
  outDir = resolve(process.cwd(), "reports"),
): { mdPath: string; jsonPath: string } {
  mkdirSync(outDir, { recursive: true });
  const mdPath = resolve(outDir, "content-v2-dry-run-mysql.md");
  const jsonPath = resolve(outDir, "content-v2-dry-run-mysql.json");

  writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
  writeFileSync(mdPath, renderMarkdown(report), "utf8");

  return { mdPath, jsonPath };
}

function renderMarkdown(r: DryRunReport): string {
  const lines: string[] = [];

  lines.push("# Content Model V2 — Dry Run Report");
  lines.push("");
  lines.push(`Generado: ${r.generatedAt}`);
  lines.push(`Modo: **${r.mode}** (read-only, sin writes en V2)`);
  lines.push(`Source: **${r.source}**`);
  lines.push("");

  lines.push("## Resumen ejecutivo");
  lines.push("");
  lines.push("| Métrica | Valor |");
  lines.push("|---------|------:|");
  lines.push(`| Proposed Entities | ${r.summary.proposedEntities} |`);
  lines.push(`| Proposed Projects | ${r.summary.proposedProjects} |`);
  lines.push(`| Standalone Pieces | ${r.summary.standalonePieces} |`);
  lines.push(`| Pieces en Projects | ${r.summary.piecesInProjects} |`);
  lines.push(`| Proposed piece_entities | ${r.summary.proposedPieceEntities} |`);
  lines.push(`| ProjectResources | ${r.summary.projectResources} |`);
  lines.push(`| PieceResources | ${r.summary.pieceResources} |`);
  lines.push(
    `| Lanes AUTO / MANUAL / DEFERRED / DISCARDED | ${r.laneCounts.AUTO_MIGRATED} / ${r.laneCounts.MANUAL_DECISION_MIGRATED} / ${r.laneCounts.DEFERRED} / ${r.laneCounts.DISCARDED} |`,
  );
  lines.push(`| Confianza alta / media / baja | ${r.confidenceCounts.alta} / ${r.confidenceCounts.media} / ${r.confidenceCounts.baja} |`);
  lines.push(`| Notas del manifesto (aplicadas) | ${r.humanDecisions.length} |`);
  lines.push("");

  lines.push("## Verificación de seguridad");
  lines.push("");
  lines.push(`- Legacy counts unchanged: **${r.legacyCountsUnchanged ? "SÍ" : "NO"}**`);
  lines.push(`- V2 untouched (0 filas): **${r.v2Untouched ? "SÍ" : "NO"}**`);
  lines.push(`- migration_map before/after: ${r.migrationMapBefore} / ${r.migrationMapAfter}`);
  lines.push("");
  lines.push("### Legacy counts");
  lines.push("```");
  for (const [k, v] of Object.entries(r.legacyCounts)) lines.push(`${k}: ${v}`);
  lines.push("```");
  lines.push("");
  lines.push("### V2 counts (before → after)");
  lines.push("```");
  for (const table of Object.keys(r.v2CountsBefore)) {
    lines.push(
      `${table}: ${r.v2CountsBefore[table]} → ${r.v2CountsAfter[table]}`,
    );
  }
  lines.push("```");
  lines.push("");

  lines.push("## Proposed Entities");
  lines.push("");
  for (const e of r.proposedEntities) {
    lines.push(`### ${e.name} (\`${e.id}\`)`);
    lines.push(`- type: **${e.type}** (${e.typeSource})`);
    lines.push(`- slug: \`${e.slug}\``);
    lines.push(`- relaciones legacy: ${e.legacyRelationCount}`);
    lines.push(`- pageEnabled sugerido: ${e.pageEnabledSuggested ? "sí" : "no"} — ${e.pageEnabledReason}`);
    lines.push(`- confianza: ${e.confidence}`);
    lines.push(`- decisión humana: ${e.requiresHumanDecision ? "sí" : "no"}`);
    lines.push("");
  }

  lines.push("## Proposed Projects");
  lines.push("");
  for (const p of r.proposedProjects) {
    lines.push(`### ${p.name} (\`${p.id}\`)`);
    lines.push(`- slug: \`${p.slug}\``);
    lines.push(`- areas: ${p.areas.join(", ")}`);
    lines.push(`- type: ${p.type ?? "—"}`);
    lines.push(`- status: ${p.status}`);
    if (p.context != null) lines.push(`- context: ${p.context}`);
    if (p.published != null) lines.push(`- published: ${p.published ? "sí" : "no"}`);
    if (p.lane != null) lines.push(`- lane: ${p.lane}`);
    lines.push(
      `- roles: ${Array.isArray(p.roles) ? p.roles.join(", ") : p.roles}`,
    );
    lines.push(`- fuentes: ${p.legacySources.join(", ")}`);
    lines.push(`- pieces: ${p.pieces.length} | resources: ${p.resources.length}`);
    lines.push(`- confianza: ${p.confidence}`);
    if (p.entities.length) {
      lines.push("- entities:");
      for (const rel of p.entities) {
        lines.push(
          `  - ${rel.entityName} → **${rel.relationRole}** (${rel.confidence})`,
        );
      }
    }
    if (p.notes?.length) {
      lines.push(`- notas: ${p.notes.join("; ")}`);
    }
    lines.push("");
  }

  lines.push("## Standalone Pieces");
  lines.push("");
  lines.push("| ID | Título | Categoría | Origin | Tags | Conf |");
  lines.push("|----|--------|-----------|--------|------|------|");
  for (const p of r.standalonePieces) {
    lines.push(
      `| ${p.id} | ${mdEscape(p.title)} | ${p.category} | ${p.origin} | ${p.tags.join(", ")} | ${p.confidence} |`,
    );
  }
  lines.push("");

  lines.push("## Proposed piece_entities");
  lines.push("");
  if (!r.proposedPieceEntities.length) {
    lines.push("_Ningún link piece↔entity propuesto._");
  } else {
    lines.push("| pieceId | entityId | entityName | role | primary | sort |");
    lines.push("|---------|----------|------------|------|---------|------|");
    for (const link of r.proposedPieceEntities) {
      lines.push(
        `| ${link.pieceId} | ${link.entityId} | ${mdEscape(link.entityName)} | ${link.relationRole} | ${link.isPrimary ? "sí" : "no"} | ${link.sortOrder} |`,
      );
    }
  }
  lines.push("");

  lines.push("## Project ↔ Entity relationships requiring review");
  lines.push("");
  if (!r.entityRelationsRequiringReview.length) {
    lines.push("_Ninguna relación marcada para revisión._");
  } else {
    for (const rel of r.entityRelationsRequiringReview) {
      lines.push(
        `- **${rel.projectName}** ↔ **${rel.entityName}**: rol \`${rel.suggestedRole}\` — ${rel.legacyEvidence} (${rel.confidence})`,
      );
      if (rel.issue) lines.push(`  - ⚠ ${rel.issue}`);
    }
  }
  lines.push("");

  lines.push("## Mapping categorías gráficas legacy → propuesta");
  lines.push("");
  for (const [section, cat] of Object.entries(r.graphicCategoryMapping)) {
    lines.push(`- \`${section}\` → **${cat}**`);
  }
  lines.push("");
  lines.push("Reglas adicionales:");
  lines.push("- `eventos` → Project.type=event");
  lines.push("- `personal` → origin=personal");
  lines.push("- `fan-art`, `cover` → tags");
  lines.push("- `manual` → Piece bajo identidad visual");
  lines.push("");

  lines.push("## Tags");
  lines.push("");
  lines.push("### Catálogo y uso");
  lines.push("| slug | label | usos |");
  lines.push("|------|-------|-----:|");
  for (const t of r.tagAnalysis.catalogTags) {
    lines.push(`| ${t.slug} | ${mdEscape(t.labelEs)} | ${t.usedCount} |`);
  }
  lines.push("");
  lines.push(`Sin uso en catálogo: ${r.tagAnalysis.unusedCatalogTags.join(", ") || "—"}`);
  lines.push(
    `Slugs en piezas ausentes del catálogo: ${r.tagAnalysis.slugsInPiecesNotInCatalog.join(", ") || "—"}`,
  );
  lines.push("");

  lines.push("## named_list_items");
  lines.push("");
  lines.push("| ID | kind | label | clasificación | target | home replacement |");
  lines.push("|----|------|-------|---------------|--------|------------------|");
  for (const n of r.namedListItems) {
    const label = sanitizeSensitiveLabel(n.label);
    lines.push(
      `| ${n.id} | ${n.kind} | ${mdEscape(label)} | ${n.classification} | ${mdEscape(n.proposedTarget)} | ${mdEscape(n.homeReplacement)} |`,
    );
  }
  lines.push("");

  lines.push("## Testimonials");
  lines.push("");
  for (const t of r.testimonials) {
    lines.push(`### ${t.authorName} (\`${t.id}\`)`);
    lines.push(`- entity propuesta: ${t.proposedEntityId ?? "—"} (${t.proposedEntityName ?? "—"})`);
    lines.push(`- redundante tras link: ${t.redundantAfterLink.join("; ") || "—"}`);
    lines.push(`- conservar override: ${t.keepAsOverride.join("; ") || "—"}`);
    lines.push("");
  }

  lines.push("## brand_manuals");
  lines.push("");
  for (const m of r.brandManuals) {
    lines.push(`### ${m.title}`);
    for (const alt of m.alternatives) {
      lines.push(`- ${alt.key}: ${alt.description}`);
    }
    lines.push(`- **Recomendación ${m.recommendation}**: ${m.recommendationReason}`);
    lines.push("");
  }

  lines.push("## Deferred");
  lines.push("");
  if (!r.deferred.length) {
    lines.push("_Ningún ítem deferred._");
  } else {
    for (const d of r.deferred) {
      lines.push(
        `- \`${d.id}\` (${d.kind}): **${sanitizeSensitiveLabel(d.label)}** — ${d.reason}`,
      );
    }
  }
  lines.push("");

  lines.push("## Discarded");
  lines.push("");
  if (!r.discarded.length) {
    lines.push("_Ningún ítem discarded._");
  } else {
    for (const d of r.discarded) {
      lines.push(
        `- \`${d.id}\` (${d.kind}): **${sanitizeSensitiveLabel(d.label)}** — ${d.reason}`,
      );
    }
  }
  lines.push("");

  lines.push("## migration_map preview (NO insertado)");
  lines.push("");
  lines.push(`Total mappings propuestos: ${r.migrationMapPreview.length}`);
  lines.push("");
  lines.push("| source | target |");
  lines.push("|--------|--------|");
  for (const m of r.migrationMapPreview.slice(0, 200)) {
    lines.push(
      `| ${m.sourceTable}:${m.sourceId} | ${m.targetType}:${m.targetId}${m.notes ? ` (${m.notes})` : ""} |`,
    );
  }
  if (r.migrationMapPreview.length > 200) {
    lines.push(`| … | +${r.migrationMapPreview.length - 200} más (ver JSON) |`);
  }
  lines.push("");

  lines.push("## Inventario registro por registro");
  lines.push("");
  for (const rec of r.records) {
    lines.push(`### ${rec.sourceTable}:${rec.legacyId}`);
    lines.push(`- **Título:** ${rec.title}`);
    lines.push(`- **Clasificación:** ${rec.classification}`);
    lines.push(`- **Destino:** ${rec.proposedDestination}`);
    lines.push(`- **Confianza:** ${rec.confidence}`);
    lines.push(`- **Decisión humana:** ${rec.requiresHumanDecision ? "sí" : "no"}`);
    lines.push(`- **Razón:** ${rec.reason}`);
    if (rec.observations.length) {
      lines.push("- **Observaciones:**");
      for (const o of rec.observations) lines.push(`  - ${o}`);
    }
    lines.push("");
  }

  lines.push("## Decisiones humanas (notas del manifesto aplicado)");
  lines.push("");
  for (const d of r.humanDecisions) {
    lines.push(`- ${d}`);
  }
  lines.push("");

  return lines.join("\n");
}

export type DryRunOptions = {
  compareFixtures?: boolean;
};

export async function runContentV2DryRun(options: DryRunOptions = {}): Promise<DryRunReport> {
  const ds = createDataSource(false, portfolioLegacyEntities);
  await ds.initialize();

  try {
    console.log("[migrate-v2] Fase 3C.3A - dry-run (read-only) + decision manifest");
    console.log("[migrate-v2] source=mysql\n");

    const legacyCountsBefore = await countTables(ds, LEGACY_TABLES);
    const v2CountsBefore = await countTables(ds, V2_TABLES);
    const migrationMapBefore = v2CountsBefore.migration_map ?? 0;

    console.log("Legacy counts (before):");
    console.log(formatCounts(legacyCountsBefore));
    console.log("\nV2 counts (before):");
    console.log(formatCounts(v2CountsBefore));

    assertV2Empty(v2CountsBefore);
    assertLegacyBaseline(legacyCountsBefore);

    const snapshot = await loadLegacySnapshot(ds);

    if (options.compareFixtures) {
      const fixtureSnapshot = loadLegacyFromFixtures();
      const driftReport = compareLegacySnapshots(snapshot, fixtureSnapshot);
      const driftPath = writeFixtureDriftReport(driftReport);
      console.log(`\n[migrate-v2] DB vs fixtures drift report: ${driftPath}`);

      const fixtureCounts = fixtureLegacyCounts(fixtureSnapshot);
      console.log("\nFixture vs DB legacy counts:");
      for (const table of LEGACY_TABLES) {
        const db = legacyCountsBefore[table] ?? 0;
        const fixture = fixtureCounts[table] ?? 0;
        const status = db === fixture ? "OK" : "DIFF";
        console.log(`  ${table}: DB=${db} fixture=${fixture} ${status}`);
      }
    }

    const { applied, classifiers } = await buildProposedPlan(ds);
    const {
      manualResult,
      tagAnalysis,
      graphicResult,
      records: classifierRecords,
    } = classifiers;

    const records: RecordAnalysis[] = classifierRecords.map(sanitizeRecord);

    const coveragePaths = writeCoverageReport(
      resolve(process.cwd(), "reports/content-v2-coverage-mysql.md"),
      applied,
      snapshot,
    );
    console.log(`\n[migrate-v2] Coverage report: ${coveragePaths.mdPath}`);

    // Manifest resolved roles — no pending relation reviews after decisions
    const entityRelationsRequiringReview: DryRunReport["entityRelationsRequiringReview"] =
      [];

    const humanDecisions = applied.humanDecisionNotes.map(sanitizeHumanDecisionNote);

    const resourceCounts = countResources(
      applied.proposedProjects,
      applied.standalonePieces,
      applied.piecesInProjects,
    );

    const discarded = applied.discarded.map(sanitizeDeferredOrDiscardedItem);
    const deferred = applied.deferred.map(sanitizeDeferredOrDiscardedItem);

    const namedListItems = applied.namedListItems.map((n) => ({
      ...n,
      label: sanitizeSensitiveLabel(n.label),
    }));

    const legacyCountsAfter = await countTables(ds, LEGACY_TABLES);
    const v2CountsAfter = await countTables(ds, V2_TABLES);
    const migrationMapAfter = v2CountsAfter.migration_map ?? 0;

    const legacyCountsUnchanged = countsEqual(
      legacyCountsBefore,
      legacyCountsAfter,
    );
    const v2Untouched = countsEqual(v2CountsBefore, v2CountsAfter);

    if (!legacyCountsUnchanged) {
      throw new Error("[safety] Legacy counts changed during dry-run!");
    }
    if (!v2Untouched) {
      throw new Error("[safety] V2 counts changed during dry-run!");
    }

    const report: DryRunReport = {
      generatedAt: new Date().toISOString(),
      mode: "dry-run",
      source: "mysql",
      legacyCounts: legacyCountsBefore,
      v2CountsBefore,
      v2CountsAfter,
      migrationMapBefore,
      migrationMapAfter,
      legacyCountsUnchanged,
      v2Untouched,
      records,
      proposedEntities: applied.proposedEntities,
      proposedProjects: applied.proposedProjects,
      standalonePieces: applied.standalonePieces,
      piecesInProjects: applied.piecesInProjects,
      proposedPieceEntities: applied.proposedPieceEntities,
      entityRelationsRequiringReview,
      tagAnalysis,
      namedListItems,
      testimonials: applied.testimonials,
      brandManuals: manualResult.manuals,
      graphicCategoryMapping: graphicResult.categoryMapping,
      confidenceCounts: countConfidence(records),
      humanDecisions,
      migrationMapPreview: applied.migrationMapPreview,
      laneCounts: {
        AUTO_MIGRATED: applied.laneCounts.AUTO_MIGRATED ?? 0,
        MANUAL_DECISION_MIGRATED:
          applied.laneCounts.MANUAL_DECISION_MIGRATED ?? 0,
        DEFERRED: applied.laneCounts.DEFERRED ?? 0,
        DISCARDED: applied.laneCounts.DISCARDED ?? 0,
      },
      discarded,
      deferred,
      summary: {
        proposedEntities: applied.proposedEntities.length,
        proposedProjects: applied.proposedProjects.length,
        standalonePieces: applied.standalonePieces.length,
        piecesInProjects: applied.piecesInProjects.length,
        proposedPieceEntities: applied.proposedPieceEntities.length,
        projectResources: resourceCounts.projectResources,
        pieceResources: resourceCounts.pieceResources,
      },
    };

    const { mdPath, jsonPath } = writeDryRunReports(report);

    console.log("\n[migrate-v2] Dry-run complete.");
    console.log(`  Proposed Entities: ${report.summary.proposedEntities}`);
    console.log(`  Proposed Projects: ${report.summary.proposedProjects}`);
    console.log(`  Standalone Pieces: ${report.summary.standalonePieces}`);
    console.log(`  Pieces in Projects: ${report.summary.piecesInProjects}`);
    console.log(
      `  Proposed piece_entities: ${report.summary.proposedPieceEntities}`,
    );
    console.log(`  ProjectResources: ${report.summary.projectResources}`);
    console.log(`  PieceResources: ${report.summary.pieceResources}`);
    console.log(
      `  Lanes AUTO/MANUAL/DEFERRED/DISCARDED: ${report.laneCounts.AUTO_MIGRATED}/${report.laneCounts.MANUAL_DECISION_MIGRATED}/${report.laneCounts.DEFERRED}/${report.laneCounts.DISCARDED}`,
    );
    console.log(
      `  Confidence alta/media/baja: ${report.confidenceCounts.alta}/${report.confidenceCounts.media}/${report.confidenceCounts.baja}`,
    );
    console.log(`  Manifest notes: ${report.humanDecisions.length}`);
    console.log(`\nReport: ${mdPath}`);
    console.log(`JSON:   ${jsonPath}`);
    console.log("\nV2 counts (after): unchanged at 0.");
    console.log("migration_map: 0 (no inserts).");

    return report;
  } finally {
    await ds.destroy();
  }
}

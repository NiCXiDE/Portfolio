import { config as loadEnv } from "dotenv";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createDataSource, portfolioLegacyEntities } from "../../src/db/data-source";
import {
  classifyBrandManuals,
  classifyBrands,
  classifyGraphicItems,
  classifyNamedListItems,
  classifyTags,
  classifyTestimonials,
  classifyUiProjects,
} from "./classifiers";
import {
  buildMigrationMapPreview,
  collectHumanDecisions,
  consolidateProjects,
  countConfidence,
  countResources,
  enrichEntityWorkCounts,
} from "./consolidate";
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

function mdEscape(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

export function writeDryRunReports(
  report: DryRunReport,
  outDir = resolve(process.cwd(), "reports"),
): { mdPath: string; jsonPath: string } {
  mkdirSync(outDir, { recursive: true });
  const mdPath = resolve(outDir, "content-v2-dry-run.md");
  const jsonPath = resolve(outDir, "content-v2-dry-run.json");

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
  lines.push("");

  lines.push("## Resumen ejecutivo");
  lines.push("");
  lines.push("| Métrica | Valor |");
  lines.push("|---------|------:|");
  lines.push(`| Proposed Entities | ${r.summary.proposedEntities} |`);
  lines.push(`| Proposed Projects | ${r.summary.proposedProjects} |`);
  lines.push(`| Standalone Pieces | ${r.summary.standalonePieces} |`);
  lines.push(`| Pieces en Projects | ${r.summary.piecesInProjects} |`);
  lines.push(`| ProjectResources | ${r.summary.projectResources} |`);
  lines.push(`| PieceResources | ${r.summary.pieceResources} |`);
  lines.push(`| Confianza alta / media / baja | ${r.confidenceCounts.alta} / ${r.confidenceCounts.media} / ${r.confidenceCounts.baja} |`);
  lines.push(`| Decisiones humanas | ${r.humanDecisions.length} |`);
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
    lines.push(
      `| ${n.id} | ${n.kind} | ${mdEscape(n.label)} | ${n.classification} | ${mdEscape(n.proposedTarget)} | ${mdEscape(n.homeReplacement)} |`,
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

  lines.push("## Decisiones humanas necesarias");
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
    console.log("[migrate-v2] Fase 3A - dry-run (read-only)\n");

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
      const fixtureCounts = fixtureLegacyCounts(fixtureSnapshot);
      console.log("\nFixture vs DB legacy counts:");
      for (const table of LEGACY_TABLES) {
        const db = legacyCountsBefore[table] ?? 0;
        const fixture = fixtureCounts[table] ?? 0;
        const status = db === fixture ? "OK" : "DIFF";
        console.log(`  ${table}: DB=${db} fixture=${fixture} ${status}`);
      }
    }

    const brandResult = classifyBrands(snapshot);
    const uiResult = classifyUiProjects(snapshot);
    const graphicResult = classifyGraphicItems(snapshot);
    const manualResult = classifyBrandManuals(snapshot);
    const tagAnalysis = classifyTags(snapshot);
    const testimonialAnalysis = classifyTestimonials(snapshot);

    const consolidatedProjects = consolidateProjects(
      uiResult.projects,
      graphicResult.projects,
      snapshot.namedListItems,
    );

    const proposedEntities = enrichEntityWorkCounts(
      brandResult.entities,
      consolidatedProjects,
    );

    const namedListAnalysis = classifyNamedListItems(
      snapshot,
      consolidatedProjects,
      proposedEntities,
    );

    const records: RecordAnalysis[] = [
      ...brandResult.records,
      ...uiResult.records,
      ...graphicResult.records,
      ...manualResult.records,
    ];

    const entityRelationsRequiringReview = [
      ...uiResult.relationReviews,
      ...graphicResult.relationReviews,
    ];

    const humanDecisions = collectHumanDecisions(
      records,
      proposedEntities,
      entityRelationsRequiringReview,
      namedListAnalysis,
      testimonialAnalysis,
      manualResult.manuals,
    );

    const resourceCounts = countResources(
      consolidatedProjects,
      graphicResult.standalonePieces,
      graphicResult.piecesInProjects,
    );

    const migrationMapPreview = buildMigrationMapPreview(
      records,
      consolidatedProjects,
      graphicResult.standalonePieces,
      graphicResult.piecesInProjects,
      proposedEntities,
    );

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
      legacyCounts: legacyCountsBefore,
      v2CountsBefore,
      v2CountsAfter,
      migrationMapBefore,
      migrationMapAfter,
      legacyCountsUnchanged,
      v2Untouched,
      records,
      proposedEntities,
      proposedProjects: consolidatedProjects,
      standalonePieces: graphicResult.standalonePieces,
      piecesInProjects: graphicResult.piecesInProjects,
      entityRelationsRequiringReview,
      tagAnalysis,
      namedListItems: namedListAnalysis,
      testimonials: testimonialAnalysis,
      brandManuals: manualResult.manuals,
      graphicCategoryMapping: graphicResult.categoryMapping,
      confidenceCounts: countConfidence(records),
      humanDecisions,
      migrationMapPreview,
      summary: {
        proposedEntities: proposedEntities.length,
        proposedProjects: consolidatedProjects.length,
        standalonePieces: graphicResult.standalonePieces.length,
        piecesInProjects: graphicResult.piecesInProjects.length,
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
    console.log(`  ProjectResources: ${report.summary.projectResources}`);
    console.log(`  PieceResources: ${report.summary.pieceResources}`);
    console.log(
      `  Confidence alta/media/baja: ${report.confidenceCounts.alta}/${report.confidenceCounts.media}/${report.confidenceCounts.baja}`,
    );
    console.log(`  Human decisions: ${report.humanDecisions.length}`);
    console.log(`\nReport: ${mdPath}`);
    console.log(`JSON:   ${jsonPath}`);
    console.log("\nV2 counts (after): unchanged at 0.");
    console.log("migration_map: 0 (no inserts).");

    return report;
  } finally {
    await ds.destroy();
  }
}

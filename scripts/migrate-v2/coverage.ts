import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { DecisionApplicationResult } from "./apply-decisions";
import {
  fingerprintSourceId,
  migrationDecisions,
  type DecisionManifest,
  type MigrationLane,
} from "./decisions";
import { localizedEs } from "./load-legacy";
import type { LegacySnapshot, MigrationMapEntry, ProposedProject } from "./types";

export type ProjectKind = "source-backed-1:1" | "composite" | "synthetic";

export type LegacyCoverageRow = {
  sourceTable: string;
  sourceId: string;
  lane: MigrationLane | "UNMAPPED";
  targets: string[];
  reason: string;
  projectKind?: ProjectKind;
};

/** Expected legacy source row counts for formal coverage. */
export const EXPECTED_COVERAGE_COUNTS: Record<string, number> = {
  graphic_items: 47,
  ui_projects: 13,
  brands: 7,
  brand_manuals: 1,
  testimonials: 5,
  named_list_items: 40,
  tags: 9,
  ui_list_items: 8,
};

function classifyProjectKindById(
  projectId: string,
  decisions: DecisionManifest,
): ProjectKind {
  const decision = decisions.projects.find((p) => p.id === projectId);
  const sources = decision?.sources ?? [];
  if (sources.length === 0) return "synthetic";
  if (sources.length === 1) return "source-backed-1:1";
  return "composite";
}

export function classifyProjectKind(
  project: ProposedProject,
  decisions: DecisionManifest,
): ProjectKind {
  return classifyProjectKindById(project.id, decisions);
}

/** Map proposed project id → A/B/C kind for dry-run reports. */
export function classifyProjectsForReport(
  projects: ProposedProject[],
  decisions: DecisionManifest = migrationDecisions,
): Record<string, ProjectKind> {
  const out: Record<string, ProjectKind> = {};
  for (const project of projects) {
    out[project.id] = classifyProjectKind(project, decisions);
  }
  return out;
}

function isConfidentialSource(
  decisions: DecisionManifest,
  table: string,
  id: string,
): boolean {
  if (id === "athenas" || id === "inspector") return true;
  for (const project of decisions.projects) {
    if (
      project.sources?.some(
        (s) => s.table === table && s.id === id && s.confidential,
      )
    ) {
      return true;
    }
  }
  return false;
}

function safeSourceId(
  decisions: DecisionManifest,
  table: string,
  id: string,
): string {
  return isConfidentialSource(decisions, table, id)
    ? fingerprintSourceId(id)
    : id;
}

function mapTargets(
  preview: MigrationMapEntry[],
  sourceTable: string,
  sourceId: string,
): string[] {
  const aliases = new Set([sourceId, fingerprintSourceId(sourceId)]);
  return preview
    .filter(
      (m) => m.sourceTable === sourceTable && aliases.has(m.sourceId),
    )
    .map((m) => `${m.targetType}:${m.targetId}`);
}

function discardedLane(
  decisions: DecisionManifest,
  table: string,
  id: string,
): { lane: MigrationLane; reason: string } | null {
  for (const d of decisions.discarded) {
    if (d.id === id || d.legacyRef?.id === id) {
      if (!d.legacyRef || d.legacyRef.table === table) {
        return { lane: "DISCARDED", reason: d.reason };
      }
    }
  }
  return null;
}

function deferredLane(
  decisions: DecisionManifest,
  _table: string,
  id: string,
): { lane: MigrationLane; reason: string } | null {
  for (const d of decisions.deferred) {
    if (d.id === id) {
      return { lane: "DEFERRED", reason: d.reason };
    }
  }
  return null;
}

function pieceDecisionLane(
  decisions: DecisionManifest,
  graphicId: string,
): MigrationLane | null {
  const piece = decisions.pieces.find(
    (p) => p.legacyGraphicItemId === graphicId,
  );
  if (!piece) return null;
  if (piece.discard || piece.asProjectResourceOnly) return "DISCARDED";
  return piece.lane;
}

function projectSourceLane(
  decisions: DecisionManifest,
  table: string,
  id: string,
): { lane: MigrationLane; projectId: string; projectKind: ProjectKind } | null {
  for (const project of decisions.projects) {
    const match = project.sources?.find(
      (s) => s.table === table && s.id === id,
    );
    if (match) {
      const kind = classifyProjectKindById(project.id, decisions);
      return { lane: project.lane, projectId: project.id, projectKind: kind };
    }
  }
  return null;
}

export function generateLegacyCoverage(
  applied: DecisionApplicationResult,
  snapshot: LegacySnapshot,
  decisions: DecisionManifest = migrationDecisions,
): LegacyCoverageRow[] {
  const preview = applied.migrationMapPreview;
  const rows: LegacyCoverageRow[] = [];

  for (const item of snapshot.graphicItems) {
    const targets = mapTargets(preview, "graphic_items", item.id);
    const discarded = discardedLane(decisions, "graphic_items", item.id);
    const deferred = deferredLane(decisions, "graphic_items", item.id);
    const pieceLane = pieceDecisionLane(decisions, item.id);
    const projectHit = projectSourceLane(decisions, "graphic_items", item.id);
    const resourceOnly = decisions.pieces.find(
      (p) =>
        p.legacyGraphicItemId === item.id && p.asProjectResourceOnly,
    );

    let lane: MigrationLane | "UNMAPPED";
    let reason: string;

    if (resourceOnly?.asProjectResourceOnly) {
      lane = "DISCARDED";
      reason = `Piece discarded (authorship); ProjectResource → ${resourceOnly.asProjectResourceOnly.projectId}`;
    } else if (discarded) {
      lane = "DISCARDED";
      reason = discarded.reason;
    } else if (deferred) {
      lane = "DEFERRED";
      reason = deferred.reason;
    } else if (pieceLane || projectHit || targets.length) {
      lane =
        pieceLane ??
        projectHit?.lane ??
        "MANUAL_DECISION_MIGRATED";
      reason = targets.length
        ? `Migrated to ${targets.join(", ")}`
        : projectHit
          ? `Source for project ${projectHit.projectId}`
          : `lane=${lane}`;
    } else {
      lane = "UNMAPPED";
      reason = "No V2 target / lane classification";
    }

    rows.push({
      sourceTable: "graphic_items",
      sourceId: safeSourceId(decisions, "graphic_items", item.id),
      lane,
      targets,
      reason,
      projectKind: projectHit?.projectKind,
    });
  }

  for (const project of snapshot.uiProjects) {
    const targets = mapTargets(preview, "ui_projects", project.id);
    const discarded = discardedLane(decisions, "ui_projects", project.id);
    const deferred = deferredLane(decisions, "ui_projects", project.id);
    const sourceHit = projectSourceLane(decisions, "ui_projects", project.id);

    let lane: MigrationLane | "UNMAPPED";
    let reason: string;
    if (discarded) {
      lane = "DISCARDED";
      reason = discarded.reason;
    } else if (deferred) {
      lane = "DEFERRED";
      reason = deferred.reason;
    } else if (sourceHit || targets.length) {
      lane = sourceHit?.lane ?? "MANUAL_DECISION_MIGRATED";
      reason = sourceHit
        ? `Migrated to project ${sourceHit.projectId}`
        : `Migrated to ${targets.join(", ")}`;
    } else {
      lane = "UNMAPPED";
      reason = "ui_project not referenced in decision manifest sources";
    }

    rows.push({
      sourceTable: "ui_projects",
      sourceId: safeSourceId(decisions, "ui_projects", project.id),
      lane,
      targets,
      reason,
      projectKind: sourceHit?.projectKind,
    });
  }

  for (const brand of snapshot.brands) {
    const targets = mapTargets(preview, "brands", brand.id);
    const entityDecision = decisions.entities.find(
      (e) => e.id === brand.id || e.logoFromBrandId === brand.id,
    );
    rows.push({
      sourceTable: "brands",
      sourceId: brand.id,
      lane:
        entityDecision?.lane ??
        (targets.length ? "MANUAL_DECISION_MIGRATED" : "UNMAPPED"),
      targets,
      reason: entityDecision
        ? `Entity ${entityDecision.id} (${entityDecision.name})`
        : targets.length
          ? `Migrated to ${targets.join(", ")}`
          : "Brand not in decision manifest entities",
    });
  }

  for (const manual of snapshot.brandManuals) {
    const targets = mapTargets(preview, "brand_manuals", manual.id);
    const sourceHit = projectSourceLane(decisions, "brand_manuals", manual.id);
    rows.push({
      sourceTable: "brand_manuals",
      sourceId: manual.id,
      lane:
        sourceHit?.lane ??
        (targets.length ? "MANUAL_DECISION_MIGRATED" : "UNMAPPED"),
      targets,
      reason: sourceHit
        ? `Manual source for project ${sourceHit.projectId}`
        : targets.length
          ? `Migrated to ${targets.join(", ")}`
          : "Pending manual piece/project decision",
      projectKind: sourceHit?.projectKind,
    });
  }

  for (const testimonial of snapshot.testimonials) {
    const decision = decisions.testimonials.find((t) => t.id === testimonial.id);
    const deferred = deferredLane(decisions, "testimonials", testimonial.id);
    const targets = decision
      ? [`entity:${decision.entityId}`]
      : mapTargets(preview, "testimonials", testimonial.id);
    rows.push({
      sourceTable: "testimonials",
      sourceId: testimonial.id,
      lane: decision
        ? "MANUAL_DECISION_MIGRATED"
        : deferred
          ? "DEFERRED"
          : "UNMAPPED",
      targets,
      reason: decision
        ? `Testimonial → entity ${decision.entityId} (apply UPDATEs testimonials.entity_id)`
        : deferred?.reason ??
          "No testimonial decision — entity link pending",
    });
  }

  for (const item of snapshot.namedListItems) {
    const id = String(item.id);
    const discarded = discardedLane(decisions, "named_list_items", id);
    const targets = mapTargets(preview, "named_list_items", id);
    const sourceHit = projectSourceLane(decisions, "named_list_items", id);
    const namedAnalysis = applied.namedListItems.find((n) => n.id === item.id);

    rows.push({
      sourceTable: "named_list_items",
      sourceId: safeSourceId(decisions, "named_list_items", id),
      lane:
        discarded?.lane ??
        sourceHit?.lane ??
        "DISCARDED",
      targets,
      reason:
        discarded?.reason ??
        (sourceHit
          ? `Named list source for project ${sourceHit.projectId}`
          : namedAnalysis?.reason ??
            "named_list_items deprecated runtime — Home via Entity/Project.showOnHome"),
      projectKind: sourceHit?.projectKind,
    });
  }

  for (const tag of snapshot.tags) {
    const usedInPieces = [
      ...applied.standalonePieces,
      ...applied.piecesInProjects,
    ].filter((p) => p.tags.includes(tag.slug));
    rows.push({
      sourceTable: "tags",
      sourceId: tag.slug,
      lane: "AUTO_MIGRATED",
      targets: usedInPieces.map((p) => `piece:${p.id}`),
      reason:
        usedInPieces.length > 0
          ? `Catalog preserved; ${usedInPieces.length} piece_tags reference(s)`
          : "Catalog preserved; unused in migrated pieces",
    });
  }

  for (const item of snapshot.uiListItems) {
    const targets = mapTargets(preview, "ui_list_items", item.id);
    const sourceHit = projectSourceLane(decisions, "ui_list_items", item.id);
    const discarded = discardedLane(decisions, "ui_list_items", item.id);

    let lane: MigrationLane | "UNMAPPED";
    let reason: string;
    if (discarded) {
      lane = "DISCARDED";
      reason = discarded.reason;
    } else if (sourceHit || targets.length) {
      lane = sourceHit?.lane ?? "MANUAL_DECISION_MIGRATED";
      reason = sourceHit
        ? `ui_list_item source for project ${sourceHit.projectId} (${localizedEs(item.title, item.id)})`
        : `Migrated to ${targets.join(", ")}`;
    } else {
      lane = "DISCARDED";
      reason =
        "ui_list_item not used as project source — deprecated list surface (Home via Entity/Project flags)";
    }

    rows.push({
      sourceTable: "ui_list_items",
      sourceId: item.id,
      lane,
      targets,
      reason,
      projectKind: sourceHit?.projectKind,
    });
  }

  return rows;
}

export function assertCoverageComplete(rows: LegacyCoverageRow[]): void {
  const byTable: Record<string, number> = {};
  for (const row of rows) {
    byTable[row.sourceTable] = (byTable[row.sourceTable] ?? 0) + 1;
  }

  const problems: string[] = [];
  for (const [table, expected] of Object.entries(EXPECTED_COVERAGE_COUNTS)) {
    const actual = byTable[table] ?? 0;
    if (actual !== expected) {
      problems.push(`${table}: expected ${expected}, got ${actual}`);
    }
  }

  const unmapped = rows.filter((r) => r.lane === "UNMAPPED");
  if (unmapped.length) {
    problems.push(
      `UNMAPPED=${unmapped.length}: ` +
        unmapped
          .slice(0, 20)
          .map((r) => `${r.sourceTable}:${r.sourceId}`)
          .join(", "),
    );
  }

  if (problems.length) {
    throw new Error(
      "[migrate-v2] Coverage incomplete:\n" +
        problems.map((p) => `  - ${p}`).join("\n"),
    );
  }
}

function renderCoverageMarkdown(rows: LegacyCoverageRow[]): string {
  const byTable: Record<string, number> = {};
  for (const row of rows) {
    byTable[row.sourceTable] = (byTable[row.sourceTable] ?? 0) + 1;
  }
  const unmapped = rows.filter((r) => r.lane === "UNMAPPED").length;
  const additions = migrationDecisions.tagCatalogAdditions;

  const lines: string[] = [
    "# Content Model V2 — Legacy coverage",
    "",
    `Generado: ${new Date().toISOString()}`,
    "",
    `Total filas: ${rows.length}`,
    `UNMAPPED: ${unmapped}`,
    "",
    "## Tag catalog note",
    "",
    `- Legacy PRE-APPLY tags = **${EXPECTED_COVERAGE_COUNTS.tags}** (coverage 9/9)`,
    `- V2 catalog additions (manifest, not legacy sources) = **${additions.length}**: ${additions.map((a) => `\`${a.slug}\``).join(", ")}`,
    `- POST-APPLY expected tags = **${EXPECTED_COVERAGE_COUNTS.tags + additions.length}**`,
    `- 9 → 11 after apply is intentional catalog growth, not corruption`,
    "",
    "## Counts by source table",
    "",
    "| table | count | expected |",
    "|-------|------:|---------:|",
  ];

  for (const [table, expected] of Object.entries(EXPECTED_COVERAGE_COUNTS)) {
    const actual = byTable[table] ?? 0;
    lines.push(`| ${table} | ${actual} | ${expected} |`);
  }

  lines.push(
    "",
    "| sourceTable | sourceId | lane | targets | reason | projectKind |",
    "|-------------|----------|------|---------|--------|-------------|",
  );

  for (const row of rows) {
    lines.push(
      `| ${row.sourceTable} | ${row.sourceId} | ${row.lane} | ${row.targets.join("; ") || "—"} | ${row.reason.replace(/\|/g, "\\|")} | ${row.projectKind ?? "—"} |`,
    );
  }

  lines.push("");
  return lines.join("\n");
}

export function writeCoverageReport(
  path: string,
  applied: DecisionApplicationResult,
  snapshot: LegacySnapshot,
  decisions: DecisionManifest = migrationDecisions,
): { mdPath: string; jsonPath: string; rows: LegacyCoverageRow[] } {
  const coverage = generateLegacyCoverage(applied, snapshot, decisions);
  assertCoverageComplete(coverage);

  const mdPath = resolve(path);
  const jsonPath = mdPath.replace(/\.md$/i, ".json");

  mkdirSync(dirname(mdPath), { recursive: true });
  writeFileSync(mdPath, renderCoverageMarkdown(coverage), "utf8");
  writeFileSync(jsonPath, JSON.stringify(coverage, null, 2), "utf8");

  return { mdPath, jsonPath, rows: coverage };
}

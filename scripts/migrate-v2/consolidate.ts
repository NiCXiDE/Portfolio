import { slugify } from "../../src/lib/slug";
import { normalizeLabel } from "./load-legacy";
import type {
  DryRunReport,
  EntityRelationReview,
  LegacySnapshot,
  MigrationMapEntry,
  ProposedEntity,
  ProposedPiece,
  ProposedProject,
  RecordAnalysis,
} from "./types";

function projectDedupeKey(project: ProposedProject): string {
  return project.id;
}

/** Merge projects from ui_projects and graphic_items without duplicating. */
export function consolidateProjects(
  uiProjects: ProposedProject[],
  graphicProjects: ProposedProject[],
  namedList: LegacySnapshot["namedListItems"],
): ProposedProject[] {
  const byId = new Map<string, ProposedProject>();

  const aliasToId = new Map<string, string>();
  for (const item of namedList) {
    if (item.kind === "past_project" || item.kind === "current_project") {
      aliasToId.set(normalizeLabel(item.label), normalizeLabel(item.label));
    }
  }

  // Known merges: juegos-provinciales, expedicion-polo only in graphic
  const mergeIntoGraphic = new Set(["juegos-provinciales", "expedicion-polo"]);

  for (const p of uiProjects) {
    byId.set(projectDedupeKey(p), { ...p });
  }

  for (const gp of graphicProjects) {
    const existing = byId.get(gp.id);
    if (existing) {
      byId.set(gp.id, {
        ...existing,
        legacySources: [...new Set([...existing.legacySources, ...gp.legacySources])],
        pieces: [...new Set([...existing.pieces, ...gp.pieces])],
        entities: mergeRelations(existing.entities, gp.entities),
        areas: [...new Set([...existing.areas, ...gp.areas])],
        notes: [...(existing.notes ?? []), ...(gp.notes ?? [])],
      });
    } else if (mergeIntoGraphic.has(gp.id) || !findUiDuplicate(gp, uiProjects)) {
      byId.set(gp.id, { ...gp });
    }
  }

  // Link ui projects to graphic event names via named list labels
  for (const [id, project] of byId) {
    const norm = normalizeLabel(project.name);
    for (const gp of graphicProjects) {
      if (normalizeLabel(gp.name) === norm && id !== gp.id) {
        const merged = byId.get(id)!;
        byId.set(id, {
          ...merged,
          legacySources: [...new Set([...merged.legacySources, ...gp.legacySources])],
          pieces: [...new Set([...merged.pieces, ...gp.pieces])],
          areas: [...new Set([...merged.areas, ...gp.areas])],
          notes: [
            ...(merged.notes ?? []),
            `Consolidado con graphic project ${gp.id}`,
          ],
        });
        byId.delete(gp.id);
      }
    }
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function findUiDuplicate(
  graphicProject: ProposedProject,
  uiProjects: ProposedProject[],
): boolean {
  const gNorm = normalizeLabel(graphicProject.name);
  return uiProjects.some((u) => normalizeLabel(u.name) === gNorm);
}

function mergeRelations(
  a: ProposedProject["entities"],
  b: ProposedProject["entities"],
): ProposedProject["entities"] {
  const map = new Map<string, (typeof a)[number]>();
  for (const r of [...a, ...b]) {
    const key = `${r.entityId}:${r.relationRole}`;
    if (!map.has(key)) map.set(key, r);
  }
  return [...map.values()];
}

export function buildMigrationMapPreview(
  records: RecordAnalysis[],
  consolidatedProjects: ProposedProject[],
  standalonePieces: ProposedPiece[],
  piecesInProjects: ProposedPiece[],
  entities: ProposedEntity[],
): MigrationMapEntry[] {
  const entries: MigrationMapEntry[] = [];

  for (const e of entities) {
    entries.push({
      sourceTable: "brands",
      sourceId: e.id,
      targetType: "entity",
      targetId: e.id,
    });
  }

  for (const r of records) {
    entries.push(...r.migrationMappings);
  }

  for (const p of consolidatedProjects) {
    if (!entries.some((e) => e.targetType === "project" && e.targetId === p.id)) {
      entries.push({
        sourceTable: p.legacySources[0]?.split(":")[0] ?? "unknown",
        sourceId: p.legacySources[0]?.split(":")[1] ?? p.id,
        targetType: "project",
        targetId: p.id,
      });
    }
  }

  return dedupeMappings(entries);
}

function dedupeMappings(entries: MigrationMapEntry[]): MigrationMapEntry[] {
  const seen = new Set<string>();
  const out: MigrationMapEntry[] = [];
  for (const e of entries) {
    const key = `${e.sourceTable}:${e.sourceId}:${e.targetType}:${e.targetId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

export function collectHumanDecisions(
  records: RecordAnalysis[],
  entities: ProposedEntity[],
  relationReviews: EntityRelationReview[],
  namedList: DryRunReport["namedListItems"],
  testimonials: DryRunReport["testimonials"],
  manuals: DryRunReport["brandManuals"],
): string[] {
  const decisions = new Set<string>();

  for (const e of entities.filter((x) => x.requiresHumanDecision)) {
    decisions.add(`Entity "${e.name}" (${e.id}): confirmar type=${e.type}`);
  }

  for (const r of records.filter((x) => x.requiresHumanDecision)) {
    decisions.add(
      `${r.sourceTable}:${r.legacyId} — ${r.title}: ${r.reason}`,
    );
  }

  for (const rel of relationReviews) {
    decisions.add(
      `Relación ${rel.projectName} ↔ ${rel.entityName}: rol ${rel.suggestedRole} (${rel.legacyEvidence})`,
    );
  }

  for (const n of namedList.filter((x) => x.requiresHumanDecision)) {
    decisions.add(`named_list_items #${n.id} "${n.label}": ${n.reason}`);
  }

  for (const t of testimonials.filter((x) => x.requiresHumanDecision)) {
    decisions.add(`testimonial ${t.id}: ${t.reason}`);
  }

  for (const m of manuals.filter((x) => x.requiresHumanDecision)) {
    decisions.add(`brand_manual ${m.id}: elegir alternativa ${m.recommendation} (${m.recommendationReason})`);
  }

  return [...decisions].sort();
}

export function countConfidence(records: RecordAnalysis[]): {
  alta: number;
  media: number;
  baja: number;
} {
  const counts = { alta: 0, media: 0, baja: 0 };
  for (const r of records) {
    counts[r.confidence]++;
  }
  return counts;
}

/**
 * Storage-aligned resource counts (Proposed metrics).
 * - projectResources → rows in `project_resources`
 * - pieceResources → rows in `piece_resources` (`kind: piece_resource` only)
 * - pieceSrcPaths → materialize on `pieces.src_path` (`kind: piece_src`; not table rows)
 */
export function countResources(
  projects: ProposedProject[],
  standalonePieces: ProposedPiece[],
  piecesInProjects: ProposedPiece[],
): {
  projectResources: number;
  pieceResources: number;
  pieceSrcPaths: number;
} {
  let projectResources = 0;
  let pieceResources = 0;
  let pieceSrcPaths = 0;

  for (const p of projects) {
    projectResources += p.resources.filter((r) => r.kind === "project_resource").length;
  }

  for (const piece of [...standalonePieces, ...piecesInProjects]) {
    pieceResources += piece.resources.filter(
      (r) => r.kind === "piece_resource",
    ).length;
    pieceSrcPaths += piece.resources.filter((r) => r.kind === "piece_src").length;
  }

  return { projectResources, pieceResources, pieceSrcPaths };
}

export function enrichEntityWorkCounts(
  entities: ProposedEntity[],
  projects: ProposedProject[],
): ProposedEntity[] {
  return entities.map((e) => {
    const relatedProjects = projects.filter((p) =>
      p.entities.some((rel) => rel.entityId === e.id),
    );
    return {
      ...e,
      relatedLegacy: [
        ...e.relatedLegacy,
        ...(relatedProjects.length
          ? [`projects_vinculados:${relatedProjects.length}`]
          : []),
      ],
      pageEnabledReason:
        relatedProjects.length >= 2
          ? `${e.pageEnabledReason} ${relatedProjects.length} projects propuestos.`
          : e.pageEnabledReason,
    };
  });
}

export function slugCollisions(projects: ProposedProject[]): string[] {
  const bySlug = new Map<string, string[]>();
  for (const p of projects) {
    const slug = p.slug || slugify(p.name);
    const list = bySlug.get(slug) ?? [];
    list.push(p.id);
    bySlug.set(slug, list);
  }
  return [...bySlug.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([slug, ids]) => `slug "${slug}" → ${ids.join(", ")}`);
}

/**
 * Apply Phase 3B human decision manifest over classifier baseline.
 * Pure / dry-run only — no DB writes.
 */
import { slugify } from "../../src/lib/slug";
import {
  PIECE_CATEGORIES,
  PROJECT_CONTEXTS,
  RELATION_ROLES,
  fingerprintSourceId,
  migrationDecisions,
  type DecisionManifest,
  type MigrationLane,
  type PieceDecision,
  type ProjectDecision,
} from "./decisions";
import { galleryPaths } from "./load-legacy";
import type {
  LegacySnapshot,
  MigrationMapEntry,
  NamedListAnalysis,
  ProposedEntity,
  ProposedOrigin,
  ProposedPiece,
  ProposedProject,
  ProposedRelation,
  ProposedResource,
  TestimonialAnalysis,
} from "./types";

/* -------------------------------------------------------------------------- */
/* Public types                                                               */
/* -------------------------------------------------------------------------- */

export type ProposedPieceEntity = {
  pieceId: string;
  entityId: string;
  entityName: string;
  relationRole: string;
  sortOrder: number;
  isPrimary: boolean;
};

export type DecisionApplicationResult = {
  proposedEntities: ProposedEntity[];
  proposedProjects: ProposedProject[];
  standalonePieces: ProposedPiece[];
  piecesInProjects: ProposedPiece[];
  proposedPieceEntities: ProposedPieceEntity[];
  testimonials: TestimonialAnalysis[];
  namedListItems: NamedListAnalysis[];
  migrationMapPreview: MigrationMapEntry[];
  discarded: typeof migrationDecisions.discarded;
  deferred: typeof migrationDecisions.deferred;
  laneCounts: Record<MigrationLane, number>;
  validationErrors: string[];
  humanDecisionNotes: string[];
};

export type ClassifierBaseline = {
  entities: ProposedEntity[];
  projects: ProposedProject[];
  standalonePieces: ProposedPiece[];
  piecesInProjects: ProposedPiece[];
  testimonials: TestimonialAnalysis[];
  namedListItems: NamedListAnalysis[];
};

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const FORBIDDEN_ALIASES = ["athenas", "inspector"] as const;

/** Deferred ids that must never appear as proposed entity/project ids. */
const DEFERRED_BLOCKED_IDS = new Set([
  "athenas",
  "inspector",
  "fiserv",
  "cloronor-landing",
]);

/** Discarded entity/project targets that must not be proposed. */
const DISCARDED_TARGET_IDS = new Set([
  "bind",
  "cloronor-store",
  "labcom",
  "fablab",
  "nsxide",
  "entity-labcom",
  "entity-fablab",
  "entity-nsxide",
]);

const PIECE_CATEGORY_SET = new Set<string>(PIECE_CATEGORIES);
const PROJECT_CONTEXT_SET = new Set<string>(PROJECT_CONTEXTS);
const RELATION_ROLE_SET = new Set<string>(RELATION_ROLES);

const FINGERPRINT_NOTE =
  "source_id fingerprint avoids accidental plaintext; not a cryptographic secret store";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Stable source ref for migration map / legacySources; fingerprints confidential ids. */
export function safeSourceRef(
  table: string,
  id: string,
  confidential?: boolean,
): string {
  const sourceId = confidential ? fingerprintSourceId(id) : id;
  return `${table}:${sourceId}`;
}

/**
 * Returns an error message if `text` contains a forbidden alias (substring,
 * case-insensitive). Returns null when clean.
 */
export function assertNoForbiddenAliases(
  text: string,
  context: string,
): string | null {
  const lower = text.toLowerCase();
  for (const alias of FORBIDDEN_ALIASES) {
    if (lower.includes(alias)) {
      return `${context}: forbidden alias "${alias}" in "${text}"`;
    }
  }
  return null;
}

function emptyLaneCounts(): Record<MigrationLane, number> {
  return {
    AUTO_MIGRATED: 0,
    MANUAL_DECISION_MIGRATED: 0,
    DEFERRED: 0,
    DISCARDED: 0,
  };
}

function indexById<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

function mergeResources(
  a: ProposedResource[],
  b: ProposedResource[],
): ProposedResource[] {
  const seen = new Set<string>();
  const out: ProposedResource[] = [];
  for (const r of [...a, ...b]) {
    const key = `${r.kind}:${r.path}:${r.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

function rolesWithoutUxUi(
  roles: ProjectDecision["roles"],
): string[] {
  return roles.filter((r) => r !== ("ux-ui" as never));
}

function pieceFromGraphicItem(
  item: LegacySnapshot["graphicItems"][number],
): ProposedPiece {
  const gallery = galleryPaths(item);
  return {
    id: item.id,
    title: item.alt || item.id,
    category: "other",
    origin: "other",
    tags: [...(item.tags ?? [])],
    resources: [
      { id: `${item.id}-src`, path: item.srcPath, kind: "piece_src" },
      ...gallery.map((path, i) => ({
        id: `${item.id}-g-${i}`,
        path,
        kind: "piece_resource" as const,
      })),
    ],
    confidence: "alta",
  };
}

function collectBaselinePieces(
  baseline: ClassifierBaseline,
): Map<string, ProposedPiece> {
  const byId = new Map<string, ProposedPiece>();
  for (const p of [
    ...baseline.standalonePieces,
    ...baseline.piecesInProjects,
  ]) {
    const existing = byId.get(p.id);
    if (existing) {
      byId.set(p.id, {
        ...existing,
        resources: mergeResources(existing.resources, p.resources),
        tags: [...new Set([...existing.tags, ...p.tags])],
      });
    } else {
      byId.set(p.id, { ...p });
    }
  }
  return byId;
}

function findPieceForDecision(
  legacyId: string,
  pieceById: Map<string, ProposedPiece>,
  snapshot: LegacySnapshot,
): ProposedPiece | null {
  const direct = pieceById.get(legacyId);
  if (direct) return { ...direct };

  // Event classifiers emit `${id}-cover` / deliverables — inherit resources.
  const related = [...pieceById.values()].filter(
    (p) =>
      p.id === legacyId ||
      p.id.startsWith(`${legacyId}-`) ||
      p.projectId === legacyId,
  );
  if (related.length > 0) {
    const resources = related.reduce<ProposedResource[]>(
      (acc, p) => mergeResources(acc, p.resources),
      [],
    );
    const tags = [...new Set(related.flatMap((p) => p.tags))];
    return {
      id: legacyId,
      title: related[0]!.title.replace(/\s*—\s*portada$/, "") || legacyId,
      category: related[0]!.category,
      origin: related[0]!.origin,
      tags,
      resources,
      confidence: "alta",
    };
  }

  const graphic = snapshot.graphicItems.find((g) => g.id === legacyId);
  if (graphic) return pieceFromGraphicItem(graphic);

  return null;
}

function applyPieceDecision(
  base: ProposedPiece,
  decision: PieceDecision,
): ProposedPiece {
  return {
    ...base,
    id: decision.legacyGraphicItemId,
    category: decision.category as ProposedPiece["category"],
    origin: decision.origin as ProposedOrigin,
    projectId: decision.projectId ?? undefined,
    published: decision.published,
    tags: decision.tags ? [...decision.tags] : base.tags,
    lane: "MANUAL_DECISION_MIGRATED",
    entityLinks: decision.entityLinks?.map((l) => ({
      entityId: l.entityId,
      relationRole: l.relationRole,
      isPrimary: l.isPrimary,
    })),
    confidence: "alta",
  };
}

function buildEntityNameMap(
  decisions: DecisionManifest,
): Map<string, string> {
  return new Map(decisions.entities.map((e) => [e.id, e.name]));
}

function discardedIdSet(decisions: DecisionManifest): Set<string> {
  const ids = new Set<string>(DISCARDED_TARGET_IDS);
  for (const d of decisions.discarded) {
    ids.add(d.id);
    if (d.legacyRef?.id) ids.add(d.legacyRef.id);
    const labelSlug = slugify(d.label);
    if (labelSlug) ids.add(labelSlug);
  }
  return ids;
}

function deferredIdSet(decisions: DecisionManifest): Set<string> {
  const ids = new Set<string>(DEFERRED_BLOCKED_IDS);
  for (const d of decisions.deferred) {
    ids.add(d.id);
  }
  return ids;
}

function validateResult(
  result: Omit<
    DecisionApplicationResult,
    "validationErrors" | "laneCounts" | "humanDecisionNotes"
  > & {
    humanDecisionNotes: string[];
  },
  decisions: DecisionManifest,
): string[] {
  const errors: string[] = [];
  const discarded = discardedIdSet(decisions);
  const deferred = deferredIdSet(decisions);

  for (const project of result.proposedProjects) {
    if (!project.context || !PROJECT_CONTEXT_SET.has(project.context)) {
      errors.push(
        `project ${project.id}: invalid or missing context "${project.context ?? ""}"`,
      );
    }
    if (Array.isArray(project.roles)) {
      for (const role of project.roles) {
        if (role === "ux-ui") {
          errors.push(`project ${project.id}: role "ux-ui" is forbidden`);
        }
      }
    }
    if (discarded.has(project.id)) {
      errors.push(`project ${project.id}: matches discarded target`);
    }
    if (deferred.has(project.id) || DEFERRED_BLOCKED_IDS.has(project.id)) {
      errors.push(`project ${project.id}: matches deferred / blocked id`);
    }
    for (const field of [project.id, project.slug, project.name]) {
      const err = assertNoForbiddenAliases(field, `project ${project.id}`);
      if (err) errors.push(err);
    }
    if (project.notes) {
      for (const note of project.notes) {
        const err = assertNoForbiddenAliases(note, `project ${project.id} notes`);
        if (err) errors.push(err);
      }
    }
    if (project.confidential) {
      for (const field of [project.id, project.slug, project.name]) {
        const err = assertNoForbiddenAliases(
          field,
          `confidential project ${project.id}`,
        );
        if (err) errors.push(err);
      }
    }
    const decision = decisions.projects.find((p) => p.id === project.id);
    if (decision && decision.published === false && project.published !== false) {
      errors.push(
        `project ${project.id}: published=false in decisions but proposed published=${String(project.published)}`,
      );
    }
  }

  for (const entity of result.proposedEntities) {
    if (discarded.has(entity.id)) {
      errors.push(`entity ${entity.id}: matches discarded target`);
    }
    if (deferred.has(entity.id) || DEFERRED_BLOCKED_IDS.has(entity.id)) {
      errors.push(`entity ${entity.id}: matches deferred / blocked id`);
    }
    for (const field of [entity.id, entity.slug, entity.name]) {
      const err = assertNoForbiddenAliases(field, `entity ${entity.id}`);
      if (err) errors.push(err);
    }
    if (entity.confidential) {
      for (const field of [entity.id, entity.slug, entity.name]) {
        const err = assertNoForbiddenAliases(
          field,
          `confidential entity ${entity.id}`,
        );
        if (err) errors.push(err);
      }
    }
  }

  for (const piece of [
    ...result.standalonePieces,
    ...result.piecesInProjects,
  ]) {
    if (!PIECE_CATEGORY_SET.has(piece.category)) {
      errors.push(
        `piece ${piece.id}: category "${piece.category}" not in PIECE_CATEGORIES`,
      );
    }
  }

  for (const link of result.proposedPieceEntities) {
    if (!RELATION_ROLE_SET.has(link.relationRole)) {
      errors.push(
        `piece_entity ${link.pieceId}→${link.entityId}: relationRole "${link.relationRole}" invalid`,
      );
    }
  }

  for (const project of result.proposedProjects) {
    for (const rel of project.entities) {
      if (!RELATION_ROLE_SET.has(rel.relationRole)) {
        errors.push(
          `project ${project.id} relation ${rel.entityId}: relationRole "${rel.relationRole}" invalid`,
        );
      }
    }
  }

  for (const entry of result.migrationMapPreview) {
    // Confidential fingerprints are sha256:… — only check plaintext sourceIds.
    if (!entry.sourceId.startsWith("sha256:")) {
      const err = assertNoForbiddenAliases(
        entry.sourceId,
        `migrationMap ${entry.sourceTable}:${entry.targetId}`,
      );
      if (err) errors.push(err);
    }
    // Target ids that are themselves deferred markers must not be proposed
    // as live entity/project destinations.
    if (entry.targetType === "entity" || entry.targetType === "project") {
      const errId = assertNoForbiddenAliases(
        entry.targetId,
        `migrationMap target ${entry.targetType}`,
      );
      if (errId) errors.push(errId);
    }
  }

  return errors;
}

function countLanes(
  entities: ProposedEntity[],
  projects: ProposedProject[],
  pieces: ProposedPiece[],
  decisions: DecisionManifest,
): Record<MigrationLane, number> {
  const counts = emptyLaneCounts();

  const bump = (lane: MigrationLane | string | undefined) => {
    const key = (lane ?? "AUTO_MIGRATED") as MigrationLane;
    if (key in counts) counts[key] += 1;
    else counts.AUTO_MIGRATED += 1;
  };

  for (const e of entities) bump(e.lane);
  for (const p of projects) bump(p.lane);
  for (const piece of pieces) bump(piece.lane);

  counts.DISCARDED += decisions.discarded.length;
  counts.DEFERRED += decisions.deferred.length;

  return counts;
}

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

export function applyDecisionManifest(
  baseline: ClassifierBaseline,
  snapshot: LegacySnapshot,
  decisions: DecisionManifest = migrationDecisions,
): DecisionApplicationResult {
  const baselineProjects = indexById(baseline.projects);
  const baselineEntities = indexById(baseline.entities);
  const pieceById = collectBaselinePieces(baseline);
  const entityNames = buildEntityNameMap(decisions);
  const discarded = discardedIdSet(decisions);
  const deferred = deferredIdSet(decisions);
  const humanDecisionNotes: string[] = [];
  const resourceOnlyNotes: string[] = [];

  /* —— Entities (ONLY decisions.entities) —— */
  const proposedEntities: ProposedEntity[] = decisions.entities.map((d) => {
    const baselineBrand = baselineEntities.get(d.id);
    const brandRow = snapshot.brands.find(
      (b) => b.id === (d.logoFromBrandId ?? d.id),
    );
    humanDecisionNotes.push(`MANUAL entity ${d.id}`);
    return {
      id: d.id,
      slug: slugify(d.name) || d.id,
      name: d.name,
      type: d.type,
      typeSource: "known" as const,
      logoPath: brandRow?.logoPath ?? baselineBrand?.logoPath ?? null,
      href: brandRow?.href ?? baselineBrand?.href ?? null,
      legacyRelationCount: baselineBrand?.legacyRelationCount ?? 0,
      relatedLegacy: baselineBrand?.relatedLegacy ?? [],
      pageEnabledSuggested: d.pageEnabled,
      pageEnabledReason: d.pageEnabled
        ? "Decisión humana (pageEnabled=true)."
        : "Decisión humana (pageEnabled=false).",
      requiresHumanDecision: false,
      confidence: "alta" as const,
      visible: d.visible,
      pageEnabled: d.pageEnabled,
      showOnHome: d.showOnHome,
      lane: d.lane,
      confidential: d.confidential,
    };
  });

  const proposedEntityIds = new Set(proposedEntities.map((e) => e.id));

  /* —— Pieces (decisions win) —— */
  const pieceDecisionById = new Map(
    decisions.pieces.map((p) => [p.legacyGraphicItemId, p]),
  );
  const discardedPieceIds = new Set<string>();
  for (const d of decisions.discarded) {
    if (d.kind === "piece" || d.kind === "authorship") {
      discardedPieceIds.add(d.id);
      if (d.legacyRef?.id) discardedPieceIds.add(d.legacyRef.id);
    }
  }

  const finalPieces = new Map<string, ProposedPiece>();

  for (const decision of decisions.pieces) {
    const legacyId = decision.legacyGraphicItemId;

    if (decision.discard || decision.asProjectResourceOnly) {
      discardedPieceIds.add(legacyId);
      if (decision.asProjectResourceOnly) {
        resourceOnlyNotes.push(
          `RESOURCE_ONLY piece ${legacyId} → project ${decision.asProjectResourceOnly.projectId}`,
        );
        humanDecisionNotes.push(
          `DISCARDED piece ${legacyId} (resource-only)`,
        );
      } else {
        humanDecisionNotes.push(`DISCARDED piece ${legacyId}`);
      }
      continue;
    }

    const base =
      findPieceForDecision(legacyId, pieceById, snapshot) ??
      ({
        id: legacyId,
        title: legacyId,
        category: decision.category as ProposedPiece["category"],
        origin: decision.origin as ProposedOrigin,
        tags: decision.tags ?? [],
        resources: [],
        confidence: "alta" as const,
      } satisfies ProposedPiece);

    const applied = applyPieceDecision(base, decision);
    // Never attach discarded entities as piece links
    if (applied.entityLinks) {
      applied.entityLinks = applied.entityLinks.filter(
        (l) =>
          proposedEntityIds.has(l.entityId) &&
          !discarded.has(l.entityId) &&
          !DISCARDED_TARGET_IDS.has(l.entityId),
      );
    }
    finalPieces.set(legacyId, applied);
    humanDecisionNotes.push(`MANUAL piece ${legacyId}`);
  }

  // AUTO pieces from baseline not covered by decisions
  const decidedProjectIds = new Set(decisions.projects.map((p) => p.id));

  for (const [id, piece] of pieceById) {
    if (finalPieces.has(id)) continue;
    if (pieceDecisionById.has(id)) continue;
    if (discardedPieceIds.has(id)) continue;
    if (discarded.has(id)) continue;

    // Skip synthetic event deliverable pieces when parent has a decision
    const parentMatch = [...pieceDecisionById.keys()].find(
      (legacyId) => id.startsWith(`${legacyId}-`),
    );
    if (parentMatch) continue;

    let projectId = piece.projectId;
    if (projectId && !decidedProjectIds.has(projectId)) {
      // Drop pieces bound only to discarded / non-decision projects
      if (discarded.has(projectId) || deferred.has(projectId)) {
        continue;
      }
      projectId = undefined;
    }

    // Do not promote discarded entity targets (labcom/fablab/nsxide) as entities;
    // piece may remain standalone without those links.
    finalPieces.set(id, {
      ...piece,
      projectId,
      lane: "AUTO_MIGRATED",
      entityLinks: undefined,
      confidence: piece.confidence,
    });
  }

  /* —— Projects (ONLY decisions.projects) —— */
  const proposedProjects: ProposedProject[] = decisions.projects.map(
    (d: ProjectDecision) => {
      const baselineProject = baselineProjects.get(d.id);
      const pieceIdsFromDecision = new Set<string>(d.pieceIds ?? []);
      for (const [pieceId, piece] of finalPieces) {
        if (piece.projectId === d.id) pieceIdsFromDecision.add(pieceId);
      }

      const entities: ProposedRelation[] = d.entities.map((rel) => ({
        entityId: rel.entityId,
        entityName: entityNames.get(rel.entityId) ?? rel.entityId,
        relationRole: rel.relationRole,
        evidence: "decision-manifest",
        confidence: "alta",
        requiresReview: false,
      }));

      const legacySources = (d.sources ?? []).map((s) =>
        safeSourceRef(s.table, s.id, s.confidential),
      );

      humanDecisionNotes.push(
        d.confidential
          ? `MANUAL project ${d.id} (confidential)`
          : `MANUAL project ${d.id}`,
      );

      return {
        id: d.id,
        slug: slugify(d.title.es) || d.id,
        name: d.title.es,
        areas: [...d.areas],
        type: d.type,
        status: d.status,
        roles: rolesWithoutUxUi(d.roles),
        entities,
        pieces: [...pieceIdsFromDecision],
        resources: baselineProject?.resources
          ? [...baselineProject.resources]
          : [],
        legacySources,
        confidence: "alta" as const,
        notes: undefined,
        context: d.context,
        published: d.published,
        showOnHome: d.showOnHome,
        lane: d.lane,
        confidential: d.confidential,
      };
    },
  );

  const proposedProjectIds = new Set(proposedProjects.map((p) => p.id));

  // Detach / drop pieces whose projectId is not in final projects
  for (const [id, piece] of finalPieces) {
    if (piece.projectId && !proposedProjectIds.has(piece.projectId)) {
      if (discarded.has(piece.projectId) || deferred.has(piece.projectId)) {
        finalPieces.delete(id);
      } else {
        finalPieces.set(id, { ...piece, projectId: undefined });
      }
    }
  }

  // Remove any leftover proposals that target discarded/deferred entity brands
  // (pieces themselves may remain; entity creation already skipped).
  for (const blocked of ["labcom", "fablab", "nsxide"]) {
    // If somehow an AUTO piece still carries projectId === blocked, drop link
    for (const [id, piece] of finalPieces) {
      if (piece.projectId === blocked) {
        finalPieces.set(id, { ...piece, projectId: undefined });
      }
    }
  }

  const standalonePieces: ProposedPiece[] = [];
  const piecesInProjects: ProposedPiece[] = [];
  for (const piece of finalPieces.values()) {
    if (piece.projectId && proposedProjectIds.has(piece.projectId)) {
      piecesInProjects.push(piece);
    } else {
      standalonePieces.push({ ...piece, projectId: undefined });
    }
  }

  /* —— piece_entities —— */
  const proposedPieceEntities: ProposedPieceEntity[] = [];
  for (const piece of [...standalonePieces, ...piecesInProjects]) {
    const links = piece.entityLinks ?? [];
    links.forEach((link, index) => {
      if (!proposedEntityIds.has(link.entityId)) return;
      if (discarded.has(link.entityId)) return;
      const anyPrimary = links.some((l) => l.isPrimary === true);
      proposedPieceEntities.push({
        pieceId: piece.id,
        entityId: link.entityId,
        entityName: entityNames.get(link.entityId) ?? link.entityId,
        relationRole: link.relationRole,
        sortOrder: index,
        isPrimary:
          link.isPrimary === true || (!anyPrimary && index === 0),
      });
    });
  }

  /* —— Discarded / deferred notes —— */
  for (const d of decisions.discarded) {
    humanDecisionNotes.push(`DISCARDED ${d.id}`);
  }
  for (const d of decisions.deferred) {
    // Avoid sensitive plaintext in labels/ids for confidential deferred items
    const safeKey =
      d.id === "athenas" || d.id === "inspector"
        ? `[deferred-confidential:${fingerprintSourceId(d.id).slice(0, 18)}]`
        : d.id === "fiserv"
          ? "[deferred:fiserv-label]"
          : d.id;
    humanDecisionNotes.push(`DEFERRED ${safeKey}`);
  }
  humanDecisionNotes.push(...resourceOnlyNotes);
  humanDecisionNotes.push(FINGERPRINT_NOTE);

  /* —— Named lists: NOT runtime source —— */
  const namedListItems: NamedListAnalysis[] = baseline.namedListItems.map(
    (item) => ({
      ...item,
      classification: "home_text_only",
      proposedTarget: "DISCARDED:named_list_runtime",
      homeReplacement: "Entity/Project.showOnHome",
      confidence: "alta",
      requiresHumanDecision: false,
      reason:
        "named_list_items DEPRECATED post-cutover; not a runtime source. Home = Entity/Project.showOnHome + published + status.",
    }),
  );

  /* —— Testimonials —— */
  const testimonialDecisionById = new Map(
    decisions.testimonials.map((t) => [t.id, t]),
  );
  const testimonials: TestimonialAnalysis[] = baseline.testimonials.map(
    (t) => {
      const decision = testimonialDecisionById.get(t.id);
      if (!decision) {
        return {
          ...t,
          requiresHumanDecision: true,
        };
      }
      const entityName = entityNames.get(decision.entityId) ?? null;
      humanDecisionNotes.push(`MANUAL testimonial ${t.id} → ${decision.entityId}`);
      return {
        ...t,
        proposedEntityId: decision.entityId,
        proposedEntityName: entityName,
        confidence: "alta",
        requiresHumanDecision: false,
        reason: `Decisión humana: testimonial ${t.id} → entity ${decision.entityId}.`,
      };
    },
  );

  /* —— Migration map —— */
  const migrationMapPreview: MigrationMapEntry[] = [];

  for (const entity of proposedEntities) {
    const decision = decisions.entities.find((e) => e.id === entity.id);
    const sourceId = decision?.logoFromBrandId ?? entity.id;
    const fromBrand = snapshot.brands.some((b) => b.id === sourceId);
    migrationMapPreview.push({
      sourceTable: fromBrand ? "brands" : "decision_manifest",
      sourceId,
      targetType: "entity",
      targetId: entity.id,
      notes: entity.confidential ? FINGERPRINT_NOTE : undefined,
    });
  }

  for (const project of proposedProjects) {
    const decision = decisions.projects.find((p) => p.id === project.id);
    if (decision?.sources?.length) {
      for (const source of decision.sources) {
        migrationMapPreview.push({
          sourceTable: source.table,
          sourceId: source.confidential
            ? fingerprintSourceId(source.id)
            : source.id,
          targetType: "project",
          targetId: project.id,
          notes: source.confidential ? FINGERPRINT_NOTE : undefined,
        });
      }
    } else {
      migrationMapPreview.push({
        sourceTable: "decision_manifest",
        sourceId: project.id,
        targetType: "project",
        targetId: project.id,
      });
    }
  }

  for (const piece of [...standalonePieces, ...piecesInProjects]) {
    const decision = pieceDecisionById.get(piece.id);
    migrationMapPreview.push({
      sourceTable: "graphic_items",
      sourceId: piece.id,
      targetType: "piece",
      targetId: piece.id,
      notes: decision
        ? `lane=${decision.lane}`
        : "AUTO_MIGRATED from classifier baseline",
    });
  }

  // Strip any accidental deferred/discarded targets from map
  const filteredMap = migrationMapPreview.filter((entry) => {
    if (entry.targetType === "entity" || entry.targetType === "project") {
      if (discarded.has(entry.targetId) || deferred.has(entry.targetId)) {
        return false;
      }
      if (DEFERRED_BLOCKED_IDS.has(entry.targetId)) return false;
      if (DISCARDED_TARGET_IDS.has(entry.targetId)) return false;
    }
    return true;
  });

  const partial = {
    proposedEntities,
    proposedProjects,
    standalonePieces,
    piecesInProjects,
    proposedPieceEntities,
    testimonials,
    namedListItems,
    migrationMapPreview: filteredMap,
    discarded: decisions.discarded,
    deferred: decisions.deferred.map((d) => ({
      ...d,
      label:
        d.id === "athenas" || d.id === "inspector"
          ? "[deferred-confidential]"
          : d.id === "fiserv"
            ? "[deferred:fiserv-label]"
            : d.label,
    })),
    humanDecisionNotes: dedupeNotes(humanDecisionNotes),
  };

  const validationErrors = validateResult(partial, decisions);
  const laneCounts = countLanes(
    proposedEntities,
    proposedProjects,
    [...standalonePieces, ...piecesInProjects],
    decisions,
  );

  return {
    ...partial,
    laneCounts,
    validationErrors,
  };
}

function dedupeNotes(notes: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const n of notes) {
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

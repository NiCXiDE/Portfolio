import { config as loadEnv } from "dotenv";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import type { DataSource, QueryRunner } from "typeorm";
import { createDataSource, portfolioLegacyEntities } from "../../src/db/data-source";
import { slugify } from "../../src/lib/slug";
import type { DecisionApplicationResult } from "./apply-decisions";
import { buildProposedPlan } from "./build-proposed";
import {
  migrationDecisions,
  type TagCatalogAddition,
} from "./decisions";
import { galleryPaths, localizedEs } from "./load-legacy";
import {
  assertCanonicalTestimonials,
  assertLegacyBaseline,
  assertV2Empty,
  countTables,
  formatCounts,
  LEGACY_BASELINE,
  LEGACY_TABLES,
  V2_TABLES,
} from "./safety";
import type { ProposedEntity, ProposedPiece, ProposedProject, LegacySnapshot } from "./types";

loadEnv({ path: resolve(process.cwd(), ".env") });

/** Rehearsal TEMP DB — exact whitelist for --apply until live apply is authorized. */
export const REHEARSAL_DATABASE = "portfolio_v2_apply_test";

export type ApplyOptions = {
  /** Rehearsal apply (portfolio_v2_apply_test); logged only — guards always run. */
  rehearsal?: boolean;
};

export type DatabaseTargetInfo = {
  databaseUrlDefined: boolean;
  databaseNameOverride: string | null;
  effectiveDatabase: string;
};

/**
 * Resolve effective DB name the same way the migrator will connect.
 * Explicit DATABASE_NAME wins over DATABASE_URL pathname (rehearsal targeting).
 */
export function resolveDatabaseTarget(): DatabaseTargetInfo {
  const databaseUrlDefined = Boolean(process.env.DATABASE_URL?.trim());
  const databaseNameOverride = process.env.DATABASE_NAME?.trim() || null;

  let fromUrl: string | null = null;
  if (databaseUrlDefined && process.env.DATABASE_URL) {
    try {
      fromUrl = new URL(process.env.DATABASE_URL).pathname.replace(/^\//, "") || null;
    } catch {
      throw new Error("[migrate-v2] ABORT: DATABASE_URL is set but not a valid URL");
    }
  }

  const effectiveDatabase =
    databaseNameOverride ?? fromUrl ?? "portfolio";

  return {
    databaseUrlDefined,
    databaseNameOverride,
    effectiveDatabase,
  };
}

export function resolveDatabaseName(): string {
  return resolveDatabaseTarget().effectiveDatabase;
}

export function logDatabaseTarget(info: DatabaseTargetInfo = resolveDatabaseTarget()): void {
  console.log(`DATABASE_URL defined: ${info.databaseUrlDefined}`);
  console.log(
    `DATABASE_NAME override: ${info.databaseNameOverride ?? "(unset)"}`,
  );
  console.log(`database=${info.effectiveDatabase}`);
}

/**
 * --apply (rehearsal phase): ONLY portfolio_v2_apply_test + V2_REHEARSAL_APPROVED=1.
 * Any other database aborts before transaction/writes.
 */
export function assertApplyGuards(database: string): void {
  logDatabaseTarget();

  if (database !== REHEARSAL_DATABASE) {
    throw new Error(
      `[migrate-v2] ABORT: --apply whitelist is exclusively "${REHEARSAL_DATABASE}" ` +
        `(effective database="${database}"). Live portfolio apply is not authorized.`,
    );
  }

  if (process.env.V2_REHEARSAL_APPROVED !== "1") {
    throw new Error(
      `[migrate-v2] ABORT: database ${REHEARSAL_DATABASE} requires V2_REHEARSAL_APPROVED=1`,
    );
  }
}

function boolToTinyint(value: boolean | undefined, defaultValue = false): number {
  return (value ?? defaultValue) ? 1 : 0;
}

function projectRoles(project: ProposedProject): string[] {
  return Array.isArray(project.roles) ? project.roles : [];
}

function pieceSrcPath(piece: ProposedPiece, snapshot: LegacySnapshot): string {
  const graphic = snapshot.graphicItems.find((g) => g.id === piece.id);
  const srcResource = piece.resources.find((r) => r.kind === "piece_src");
  return graphic?.srcPath ?? srcResource?.path ?? "";
}

function pieceAlt(piece: ProposedPiece, snapshot: LegacySnapshot): string {
  const graphic = snapshot.graphicItems.find((g) => g.id === piece.id);
  return graphic?.alt?.trim() || piece.title || piece.id;
}

function pieceTitleJson(
  piece: ProposedPiece,
  snapshot: LegacySnapshot,
): { es: string; en: string } {
  const graphic = snapshot.graphicItems.find((g) => g.id === piece.id);
  if (graphic?.title) {
    return {
      es: localizedEs(graphic.title, piece.title),
      en: graphic.title.en?.trim() || localizedEs(graphic.title, piece.title),
    };
  }
  return { es: piece.title, en: piece.title };
}

async function insertEntities(
  qr: QueryRunner,
  entities: ProposedEntity[],
): Promise<void> {
  for (const entity of entities) {
    await qr.query(
      `INSERT INTO entities (
        id, slug, name, type, logo_path, href,
        visible, page_enabled, show_on_home, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        entity.id,
        entity.slug,
        entity.name,
        entity.type,
        entity.logoPath,
        entity.href,
        boolToTinyint(entity.visible, false),
        boolToTinyint(entity.pageEnabled ?? entity.pageEnabledSuggested, false),
        boolToTinyint(entity.showOnHome, false),
      ],
    );
  }
}

async function insertProjects(
  qr: QueryRunner,
  projects: ProposedProject[],
): Promise<void> {
  for (const project of projects) {
    if (!project.context) {
      throw new Error(`[migrate-v2] project ${project.id} missing required context`);
    }
    await qr.query(
      `INSERT INTO projects (
        id, slug, title, status, type, context,
        published, show_on_home, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        project.id,
        project.slug,
        JSON.stringify({ es: project.name, en: project.name }),
        project.status,
        project.type,
        project.context,
        boolToTinyint(project.published, false),
        boolToTinyint(project.showOnHome, false),
      ],
    );
  }
}

async function insertProjectAreas(
  qr: QueryRunner,
  projects: ProposedProject[],
): Promise<void> {
  for (const project of projects) {
    for (const area of project.areas) {
      await qr.query(
        `INSERT INTO project_areas (project_id, area) VALUES (?, ?)`,
        [project.id, area],
      );
    }
  }
}

async function insertProjectRoles(
  qr: QueryRunner,
  projects: ProposedProject[],
): Promise<void> {
  for (const project of projects) {
    for (const role of projectRoles(project)) {
      await qr.query(
        `INSERT INTO project_roles (project_id, role) VALUES (?, ?)`,
        [project.id, role],
      );
    }
  }
}

async function insertProjectEntities(
  qr: QueryRunner,
  projects: ProposedProject[],
): Promise<void> {
  for (const project of projects) {
    for (const rel of project.entities) {
      await qr.query(
        `INSERT INTO project_entities (project_id, entity_id, relation_role)
         VALUES (?, ?, ?)`,
        [project.id, rel.entityId, rel.relationRole],
      );
    }
  }
}

async function insertPieces(
  qr: QueryRunner,
  pieces: ProposedPiece[],
  snapshot: LegacySnapshot,
): Promise<void> {
  for (const piece of pieces) {
    const graphic = snapshot.graphicItems.find((g) => g.id === piece.id);
    const gallery = graphic ? galleryPaths(graphic) : [];
    const slug = slugify(piece.title) || piece.id;

    await qr.query(
      `INSERT INTO pieces (
        id, slug, title, alt, category, origin, src_path, project_id,
        published, legacy_gallery, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        piece.id,
        slug,
        JSON.stringify(pieceTitleJson(piece, snapshot)),
        pieceAlt(piece, snapshot),
        piece.category,
        piece.origin,
        pieceSrcPath(piece, snapshot),
        piece.projectId ?? null,
        boolToTinyint(piece.published ?? graphic?.published, false),
        gallery.length ? JSON.stringify(gallery) : null,
      ],
    );
  }
}

async function insertPieceResources(
  qr: QueryRunner,
  pieces: ProposedPiece[],
): Promise<void> {
  for (const piece of pieces) {
    let sortOrder = 0;
    for (const resource of piece.resources.filter((r) => r.kind === "piece_resource")) {
      await qr.query(
        `INSERT INTO piece_resources (id, piece_id, path, kind, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [randomUUID(), piece.id, resource.path, resource.kind, sortOrder],
      );
      sortOrder += 1;
    }
  }
}

async function insertProjectResources(
  qr: QueryRunner,
  projects: ProposedProject[],
): Promise<void> {
  for (const project of projects) {
    let sortOrder = 0;
    for (const resource of project.resources.filter(
      (r) => r.kind === "project_resource",
    )) {
      await qr.query(
        `INSERT INTO project_resources (id, project_id, path, kind, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [randomUUID(), project.id, resource.path, resource.kind, sortOrder],
      );
      sortOrder += 1;
    }
  }
}

async function insertPieceTags(
  qr: QueryRunner,
  pieces: ProposedPiece[],
): Promise<void> {
  for (const piece of pieces) {
    for (const tag of piece.tags) {
      await qr.query(
        `INSERT INTO piece_tags (piece_id, tag_slug) VALUES (?, ?)`,
        [piece.id, tag],
      );
    }
  }
}

function collectRequiredTagSlugs(pieces: ProposedPiece[]): string[] {
  const slugs = new Set<string>();
  for (const piece of pieces) {
    for (const tag of piece.tags) slugs.add(tag);
  }
  return [...slugs].sort();
}

/**
 * Preflight: every proposed piece_tags slug must exist in `tags`
 * OR be declared in tagCatalogAdditions. Abort before transaction.
 */
export async function assertPieceTagsCatalogReady(
  ds: DataSource,
  pieces: ProposedPiece[],
  additions: TagCatalogAddition[] = migrationDecisions.tagCatalogAdditions,
): Promise<{ existing: string[]; required: string[]; missing: string[] }> {
  const rows = (await ds.query(`SELECT slug FROM tags`)) as Array<{
    slug: string;
  }>;
  const existing = rows.map((r) => r.slug).sort();
  const allowed = new Set([
    ...existing,
    ...additions.map((a) => a.slug),
  ]);
  const required = collectRequiredTagSlugs(pieces);
  const missing = required.filter((slug) => !allowed.has(slug));

  if (missing.length) {
    throw new Error(
      "[migrate-v2] ABORT: piece_tags reference tag_slug(s) not in catalog " +
        "and not declared as V2 tagCatalogAdditions:\n" +
        missing.map((s) => `  - ${s}`).join("\n"),
    );
  }

  return { existing, required, missing };
}

/**
 * INSERT approved catalog additions (tdt, cover, …) before piece_tags.
 * Returns number of rows actually inserted in this run.
 */
async function ensureCatalogTagAdditions(
  qr: QueryRunner,
  additions: TagCatalogAddition[],
): Promise<number> {
  let inserted = 0;

  for (const tag of additions) {
    const rows = (await qr.query(
      `SELECT slug, label_es AS labelEs, label_en AS labelEn, is_nsfw AS isNsfw
       FROM tags WHERE slug = ?`,
      [tag.slug],
    )) as Array<{
      slug: string;
      labelEs: string;
      labelEn: string;
      isNsfw: number | boolean;
    }>;

    if (rows.length === 0) {
      await qr.query(
        `INSERT INTO tags (slug, label_es, label_en, is_nsfw, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [
          tag.slug,
          tag.labelEs,
          tag.labelEn,
          tag.isNsfw ? 1 : 0,
          tag.sortOrder,
        ],
      );
      inserted += 1;
      continue;
    }

    const row = rows[0];
    const rowNsfw = Boolean(row.isNsfw);
    const expectedNsfw = Boolean(tag.isNsfw);
    if (rowNsfw !== expectedNsfw) {
      throw new Error(
        `[migrate-v2] tag "${tag.slug}" exists with incompatible is_nsfw ` +
          `(found=${rowNsfw}, expected=${expectedNsfw}) — abort/rollback`,
      );
    }
    if (!row.labelEs?.trim() || !row.labelEn?.trim()) {
      throw new Error(
        `[migrate-v2] tag "${tag.slug}" exists with empty labels — abort/rollback`,
      );
    }
  }

  return inserted;
}

async function insertPieceEntities(
  qr: QueryRunner,
  applied: DecisionApplicationResult,
): Promise<void> {
  for (const link of applied.proposedPieceEntities) {
    await qr.query(
      `INSERT INTO piece_entities (
        piece_id, entity_id, relation_role, sort_order, is_primary
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        link.pieceId,
        link.entityId,
        link.relationRole,
        link.sortOrder,
        link.isPrimary ? 1 : 0,
      ],
    );
  }
}

async function insertMigrationMap(
  qr: QueryRunner,
  preview: DecisionApplicationResult["migrationMapPreview"],
): Promise<void> {
  for (const entry of preview) {
    await qr.query(
      `INSERT INTO migration_map (
        id, source_table, source_id, target_type, target_id, notes
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        entry.sourceTable,
        entry.sourceId,
        entry.targetType,
        entry.targetId,
        entry.notes ?? null,
      ],
    );
  }
}

/**
 * UPDATE only testimonials.entity_id for approved decision mappings (4 records).
 * Skips testimonials without a proposed entity (e.g. deferred).
 * Requires entity already inserted; mismatches → throw → ROLLBACK.
 * NOTE: fk_testimonials_entity still pending (schema change deferred).
 */
async function updateTestimonialEntityIds(
  qr: QueryRunner,
  applied: DecisionApplicationResult,
): Promise<void> {
  const entityIds = new Set(applied.proposedEntities.map((e) => e.id));
  const toUpdate = applied.testimonials.filter(
    (t) => Boolean(t.proposedEntityId) && !t.requiresHumanDecision,
  );

  if (toUpdate.length !== 4) {
    throw new Error(
      `[migrate-v2] expected exactly 4 approved testimonial entity updates, got ${toUpdate.length}`,
    );
  }

  for (const t of toUpdate) {
    const entityId = t.proposedEntityId!;
    if (!entityIds.has(entityId)) {
      throw new Error(
        `[migrate-v2] testimonial ${t.id}: target entity ${entityId} not in proposed entities`,
      );
    }

    const rows = (await qr.query(
      `SELECT id, entity_id AS entityId FROM testimonials WHERE id = ?`,
      [t.id],
    )) as Array<{ id: string; entityId: string | null }>;

    if (rows.length !== 1) {
      throw new Error(
        `[migrate-v2] testimonial ${t.id}: expected 1 row, found ${rows.length}`,
      );
    }

    const current = rows[0].entityId;
    if (current !== null && current !== entityId) {
      throw new Error(
        `[migrate-v2] testimonial ${t.id}: entity_id mismatch ` +
          `(current=${current}, expected=${entityId} or NULL) — abort/rollback`,
      );
    }

    await qr.query(`UPDATE testimonials SET entity_id = ? WHERE id = ?`, [
      entityId,
      t.id,
    ]);
  }
}

async function applyPlanInTransaction(
  ds: DataSource,
  applied: DecisionApplicationResult,
  snapshot: LegacySnapshot,
): Promise<{ tagsInserted: number }> {
  const allPieces = [...applied.standalonePieces, ...applied.piecesInProjects];
  const additions = migrationDecisions.tagCatalogAdditions;
  const qr = ds.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    await insertEntities(qr, applied.proposedEntities);
    /* Legacy UPDATE: testimonials.entity_id only (after entities exist). FK pending. */
    await updateTestimonialEntityIds(qr, applied);
    await insertProjects(qr, applied.proposedProjects);
    await insertProjectAreas(qr, applied.proposedProjects);
    await insertProjectRoles(qr, applied.proposedProjects);
    await insertProjectEntities(qr, applied.proposedProjects);
    await insertPieces(qr, allPieces, snapshot);
    await insertPieceResources(qr, allPieces);
    await insertProjectResources(qr, applied.proposedProjects);
    /* Catalog additions (tdt, cover) before piece_tags FK. */
    const tagsInserted = await ensureCatalogTagAdditions(qr, additions);
    await insertPieceTags(qr, allPieces);
    await insertPieceEntities(qr, applied);
    await insertMigrationMap(qr, applied.migrationMapPreview);

    await qr.commitTransaction();
    return { tagsInserted };
  } catch (err) {
    await qr.rollbackTransaction();
    throw err;
  } finally {
    await qr.release();
  }
}

export async function runContentV2Apply(
  options: ApplyOptions = {},
): Promise<void> {
  const target = resolveDatabaseTarget();
  assertApplyGuards(target.effectiveDatabase);

  const mode = options.rehearsal ? "rehearsal-apply" : "apply";
  console.log(`[migrate-v2] Fase 3C.3 — ${mode} (transactional writes to V2)`);
  console.log("[migrate-v2] source=mysql\n");

  const ds = createDataSource(false, portfolioLegacyEntities, {
    database: target.effectiveDatabase,
  });
  await ds.initialize();

  try {
    const legacyCountsBefore = await countTables(ds, LEGACY_TABLES);
    const v2CountsBefore = await countTables(ds, V2_TABLES);

    assertV2Empty(v2CountsBefore);
    assertLegacyBaseline(legacyCountsBefore);
    await assertCanonicalTestimonials(ds);

    console.log("Legacy counts (before):");
    console.log(formatCounts(legacyCountsBefore));
    console.log("\nV2 counts (before):");
    console.log(formatCounts(v2CountsBefore));

    const { applied, snapshot } = await buildProposedPlan(ds);
    const allPieces = [...applied.standalonePieces, ...applied.piecesInProjects];
    const tagPreflight = await assertPieceTagsCatalogReady(ds, allPieces);
    console.log(
      `\n[migrate-v2] Tag catalog preflight: required=${tagPreflight.required.length} ` +
        `existing=${tagPreflight.existing.length} ` +
        `additions=${migrationDecisions.tagCatalogAdditions.length} missing=0`,
    );
    console.log(
      `  PRE tags=${legacyCountsBefore.tags ?? 0}; ` +
        `V2 additions=${migrationDecisions.tagCatalogAdditions.map((t) => t.slug).join(",")}; ` +
        `POST expected=${(legacyCountsBefore.tags ?? 0) + migrationDecisions.tagCatalogAdditions.filter((a) => !tagPreflight.existing.includes(a.slug)).length}`,
    );

    const { tagsInserted } = await applyPlanInTransaction(ds, applied, snapshot);

    const legacyCountsAfter = await countTables(ds, LEGACY_TABLES);
    const v2CountsAfter = await countTables(ds, V2_TABLES);

    for (const table of Object.keys(LEGACY_BASELINE)) {
      if (table === "tags") continue;
      if ((legacyCountsBefore[table] ?? 0) !== (legacyCountsAfter[table] ?? 0)) {
        throw new Error(
          `[safety] Legacy table "${table}" count changed after apply ` +
            `(${legacyCountsBefore[table]} → ${legacyCountsAfter[table]}).`,
        );
      }
    }

    const expectedTags =
      (legacyCountsBefore.tags ?? 0) + tagsInserted;
    if ((legacyCountsAfter.tags ?? 0) !== expectedTags) {
      throw new Error(
        `[safety] tags count after apply: expected ${expectedTags} ` +
          `(PRE ${legacyCountsBefore.tags}+inserted ${tagsInserted}), ` +
          `found ${legacyCountsAfter.tags}`,
      );
    }

    console.log("\n[migrate-v2] Apply committed.");
    console.log(
      `Legacy counts (after): unchanged except tags ${legacyCountsBefore.tags} → ${legacyCountsAfter.tags} (+${tagsInserted} catalog additions)`,
    );
    console.log(formatCounts(legacyCountsAfter));
    console.log("\nV2 counts (after):");
    console.log(formatCounts(v2CountsAfter));
    console.log(
      `\n  entities: ${v2CountsAfter.entities ?? 0}, projects: ${v2CountsAfter.projects ?? 0}, pieces: ${v2CountsAfter.pieces ?? 0}`,
    );
    console.log(`  migration_map: ${v2CountsAfter.migration_map ?? 0}`);
    console.log(
      "  Writes: INSERT V2 + migration_map + tags(catalog additions only); " +
        "UPDATE testimonials.entity_id (4 canonical). No DELETE/TRUNCATE/schema.",
    );
    console.log(
      "  NOTE: fk_testimonials_entity still pending — validated manually (0 invalid refs).",
    );
  } finally {
    await ds.destroy();
  }
}

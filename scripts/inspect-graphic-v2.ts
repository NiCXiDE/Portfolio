/**
 * READ-ONLY Graphic V2 adapter inspector (Phase 4D.2).
 * Does not touch public Graphic runtime.
 *
 * Usage: npm run inspect:graphic-v2
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });
delete process.env.DATABASE_NAME;

const FORBIDDEN = [
  "syllabi",
  "microtime",
  "proxi",
  "confidential-logistics",
  "asesor-financiero",
  "aml-general",
  "aml-casinos",
  "buhoprofe",
  "labcom",
];

async function main() {
  const { getDataSource } = await import("../src/db/data-source");
  const {
    getGraphicContentV2,
    GRAPHIC_NEVER_RETURN_IDS,
  } = await import("../src/lib/content-v2/graphic");

  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  if (db !== "portfolio") throw new Error(`ABORT db=${db}`);

  const es = await getGraphicContentV2("es");
  const en = await getGraphicContentV2("en");

  const returnedIds = new Set(es.pieces.map((p) => p.id));
  const discardedLeaks = [...GRAPHIC_NEVER_RETURN_IDS].filter((id) =>
    returnedIds.has(id),
  );

  const forbiddenHits = es.pieces.flatMap((p) => {
    const blob = `${p.id} ${p.project?.id ?? ""} ${p.entity?.id ?? ""}`.toLowerCase();
    return FORBIDDEN.filter((f) => blob.includes(f)).map(
      (f) => `${p.id}:${f}`,
    );
  });

  // employer/intermediary should never appear (adapter strips them)
  const deniedRoleLeak = es.pieces.filter(
    (p) =>
      p.entity &&
      (p.entity.role === "employer" || p.entity.role === "intermediary"),
  );

  const checks = {
    pieces44: es.meta.counts.pieces === 44,
    standalone27: es.meta.counts.standalone === 27,
    projectLinked17: es.meta.counts.projectLinked === 17,
    missingMain0: es.meta.counts.missingMainImage === 0,
    discarded0: discardedLeaks.length === 0,
    forbidden0: forbiddenHits.length === 0,
    deniedRole0: deniedRoleLeak.length === 0,
    enSameCount: en.meta.counts.pieces === es.meta.counts.pieces,
    manualsGap: es.meta.manualStatus === "DETAIL_GAP",
  };

  const ok = Object.values(checks).every(Boolean);

  console.log(
    JSON.stringify(
      {
        database: db,
        checks,
        ok,
        counts: es.meta.counts,
        sections: es.sections.map((s) => ({
          id: s.id,
          label: s.label,
          n: s.items.length,
        })),
        withTags: es.meta.counts.withTags,
        withEntity: es.meta.counts.withEntity,
        withResources: es.meta.counts.withResources,
        seyierGalleryGap: es.meta.seyierGalleryGap,
        sessionsReview: es.meta.sessionsReview,
        sessionsPieceIds: es.meta.sessionsPieceIds,
        discardedLeaks,
        forbiddenHits,
      },
      null,
      2,
    ),
  );
  console.log(
    `graphic_v2_ok=${ok} pieces=${es.meta.counts.pieces} standalone=${es.meta.counts.standalone} projectLinked=${es.meta.counts.projectLinked}`,
  );

  await ds.destroy();
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

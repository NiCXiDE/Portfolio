/**
 * 4D.3C post-check — READ ONLY
 */
import { config as loadEnv } from "dotenv";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });
delete process.env.DATABASE_NAME;

const pub = (p: string) =>
  existsSync(resolve(process.cwd(), "public", p.replace(/^\//, "")));

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

  const manual = await ds.query(
    `SELECT id, category, project_id, src_path, published FROM pieces WHERE id=?`,
    ["citf-manual-2025"],
  );
  const manualTag = await ds.query(
    `SELECT * FROM piece_tags WHERE piece_id=? AND tag_slug=?`,
    ["citf-manual-2025", "manual"],
  );
  const manualPdf = await ds.query(
    `SELECT id, path, kind FROM piece_resources WHERE piece_id=?`,
    ["citf-manual-2025"],
  );
  const seyierPieces = await ds.query(
    `SELECT id, src_path FROM pieces WHERE project_id=? ORDER BY sort_order, id`,
    ["seyier-visual-identity"],
  );
  const tagCount = (await ds.query(`SELECT COUNT(*) AS c FROM tags`))[0].c;
  const tagManual = await ds.query(`SELECT slug FROM tags WHERE slug=?`, [
    "manual",
  ]);

  const orphanTags = await ds.query(
    `SELECT pt.piece_id, pt.tag_slug FROM piece_tags pt
     LEFT JOIN pieces p ON p.id = pt.piece_id
     LEFT JOIN tags t ON t.slug = pt.tag_slug
     WHERE p.id IS NULL OR t.slug IS NULL`,
  );
  const orphanResources = await ds.query(
    `SELECT pr.id, pr.piece_id FROM piece_resources pr
     LEFT JOIN pieces p ON p.id = pr.piece_id
     WHERE p.id IS NULL`,
  );
  const orphanEntities = await ds.query(
    `SELECT pe.piece_id, pe.entity_id FROM piece_entities pe
     LEFT JOIN pieces p ON p.id = pe.piece_id
     LEFT JOIN entities e ON e.id = pe.entity_id
     WHERE p.id IS NULL OR e.id IS NULL`,
  );

  const mapsManual = await ds.query(
    `SELECT source_table, source_id, target_type, target_id
     FROM migration_map WHERE source_table='brand_manuals' AND source_id='citf'
     ORDER BY target_type, target_id`,
  );
  const mapsSeyier = await ds.query(
    `SELECT source_table, source_id, target_type, target_id
     FROM migration_map WHERE source_table='graphic_items' AND source_id='seyier'
     ORDER BY target_type, target_id`,
  );
  const brandManualStill = await ds.query(
    `SELECT id, cover_path, pdf_path FROM brand_manuals WHERE id=?`,
    ["citf"],
  );
  const giSeyier = await ds.query(
    `SELECT id, src_path FROM graphic_items WHERE id=?`,
    ["seyier"],
  );

  const es = await getGraphicContentV2("es");
  const returnedIds = new Set(es.pieces.map((p) => p.id));
  const discardedLeaks = [...GRAPHIC_NEVER_RETURN_IDS].filter((id) =>
    returnedIds.has(id),
  );
  const forbidden = [
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
  const forbiddenHits = es.pieces.flatMap((p) => {
    const blob = `${p.id} ${p.project?.id ?? ""} ${p.entity?.id ?? ""}`.toLowerCase();
    return forbidden
      .filter((f) => blob.includes(f))
      .map((f) => `${p.id}:${f}`);
  });

  const coverPath = manual[0]?.src_path as string | undefined;
  const pdfPath = manualPdf[0]?.path as string | undefined;
  const seyierAssetsOk = (seyierPieces as Array<{ src_path: string }>).every(
    (p) => pub(p.src_path),
  );

  const checks = {
    manualCount1: (manual as unknown[]).length === 1,
    manualParent: manual[0]?.project_id === "citf-identity-2025",
    manualCategory: manual[0]?.category === "visual-identity",
    manualTag: (manualTag as unknown[]).length === 1,
    coverResolvable: Boolean(coverPath && pub(coverPath)),
    pdfResolvable: Boolean(pdfPath && pub(pdfPath)),
    seyier4: (seyierPieces as unknown[]).length === 4,
    seyierNew: ["seyier-inicio", "seyier-portada", "seyier-overlay"].every(
      (id) =>
        (seyierPieces as Array<{ id: string }>).some((p) => p.id === id),
    ),
    seyierAssetsOk,
    tags12: Number(tagCount) === 12,
    tagManualExists: (tagManual as unknown[]).length === 1,
    adapterRegular47: es.meta.counts.pieces === 47,
    adapterManuals1: es.meta.counts.manuals === 1 && es.manuals.length === 1,
    adapterConceptual48:
      es.meta.counts.pieces + es.meta.counts.manuals === 48,
    manualNotInSections: !es.sections
      .flatMap((s) => s.items)
      .some((i) => i.id === "citf-manual-2025"),
    missingMain0: es.meta.counts.missingMainImage === 0,
    orphans0:
      (orphanTags as unknown[]).length === 0 &&
      (orphanResources as unknown[]).length === 0 &&
      (orphanEntities as unknown[]).length === 0,
    discarded0: discardedLeaks.length === 0,
    forbidden0: forbiddenHits.length === 0,
    legacyManualIntact: (brandManualStill as unknown[]).length === 1,
    legacySeyierIntact: (giSeyier as unknown[]).length === 1,
    mapManualHasProject: (
      mapsManual as Array<{ target_type: string; target_id: string }>
    ).some(
      (m) => m.target_type === "project" && m.target_id === "citf-identity-2025",
    ),
    mapManualHasPiece: (
      mapsManual as Array<{ target_type: string; target_id: string }>
    ).some((m) => m.target_id === "citf-manual-2025"),
    mapManualHasResource: (
      mapsManual as Array<{ target_type: string; target_id: string }>
    ).some((m) => m.target_type === "resource"),
    mapSeyierHasLogo: (
      mapsSeyier as Array<{ target_type: string; target_id: string }>
    ).some((m) => m.target_id === "seyier"),
    mapSeyierHasThree: ["seyier-inicio", "seyier-portada", "seyier-overlay"].every(
      (id) =>
        (
          mapsSeyier as Array<{ target_type: string; target_id: string }>
        ).some((m) => m.target_id === id),
    ),
    manualStatusPresent: es.meta.manualStatus === "PRESENT",
    seyierGapClosed: es.meta.seyierGalleryGap === false,
  };

  const ok = Object.values(checks).every(Boolean);
  const out = {
    database: db,
    checks,
    ok,
    manual,
    manualTag,
    manualPdf,
    seyierPieces,
    mapsManual,
    mapsSeyier,
    adapter: {
      pieces: es.meta.counts.pieces,
      manuals: es.meta.counts.manuals,
      conceptual: es.meta.counts.pieces + es.meta.counts.manuals,
      manualStatus: es.meta.manualStatus,
      seyierGalleryGap: es.meta.seyierGalleryGap,
    },
    orphans: { orphanTags, orphanResources, orphanEntities },
    privacy: { discardedLeaks, forbiddenHits },
    tags: tagCount,
  };

  writeFileSync(
    resolve("reports/_4d3c-postcheck.json"),
    JSON.stringify(out, null, 2),
    "utf8",
  );
  console.log(JSON.stringify({ ok, checks, adapter: out.adapter, tags: tagCount }, null, 2));
  await ds.destroy();
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

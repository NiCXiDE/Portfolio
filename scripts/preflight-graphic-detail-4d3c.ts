/**
 * 4D.3C preflight — READ ONLY
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
  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  if (db !== "portfolio") throw new Error(`ABORT db=${db}`);

  const brandManual = (
    await ds.query(
      `SELECT id, cover_path, pdf_path, title, year, meta, brand_id, published
       FROM brand_manuals WHERE id = ?`,
      ["citf"],
    )
  )[0];

  const gallery = (
    await ds.query(
      `SELECT gallery_paths FROM graphic_items WHERE id = ?`,
      ["seyier"],
    )
  )[0];

  const report = {
    database: db,
    projectCitf: (
      await ds.query(`SELECT id FROM projects WHERE id = ?`, [
        "citf-identity-2025",
      ])
    ).length,
    pieceManualExists: (
      await ds.query(`SELECT id FROM pieces WHERE id = ?`, ["citf-manual-2025"])
    ).length,
    brandManual,
    coverExists: pub("/assets/grafico/brand-manuals/citf-manual-2025-cover.png"),
    pdfExists: pub("/assets/grafico/brand-manuals/citf-manual-2025.pdf"),
    projectSeyier: (
      await ds.query(`SELECT id FROM projects WHERE id = ?`, [
        "seyier-visual-identity",
      ])
    ).length,
    pieceSeyier: (
      await ds.query(`SELECT id, title, src_path FROM pieces WHERE id = ?`, [
        "seyier",
      ])
    )[0],
    gallery,
    assets: {
      inicio: pub("/assets/grafico/logos/seyier/inicio.png"),
      portada: pub("/assets/grafico/logos/seyier/portada-fondo.png"),
      overlay: pub("/assets/grafico/logos/seyier/overlay-ejemplo.png"),
    },
    candidateNewIds: await ds.query(
      `SELECT id FROM pieces WHERE id IN (?,?,?,?,?,?)`,
      [
        "seyier-inicio",
        "seyier-portada",
        "seyier-overlay",
        "seyier-screen-1",
        "seyier-screen-2",
        "seyier-screen-3",
      ],
    ),
    tagManual: await ds.query(`SELECT slug FROM tags WHERE slug = ?`, [
      "manual",
    ]),
    tags: await ds.query(`SELECT slug, label_es, label_en, sort_order FROM tags ORDER BY sort_order, slug`),
    pieceResKinds: await ds.query(
      `SELECT id, piece_id, path, kind FROM piece_resources`,
    ),
    publicPieces: (
      await ds.query(`SELECT COUNT(*) AS c FROM pieces WHERE published = 1`)
    )[0],
    tagCount: (await ds.query(`SELECT COUNT(*) AS c FROM tags`))[0],
    seyierMaps: await ds.query(
      `SELECT source_table, source_id, target_type, target_id, notes
       FROM migration_map WHERE source_id = 'seyier' OR target_id LIKE '%seyier%'`,
    ),
    citfMaps: await ds.query(
      `SELECT source_table, source_id, target_type, target_id, notes
       FROM migration_map
       WHERE source_table = 'brand_manuals' OR source_id IN ('citf','itf','banner-cluster')
          OR target_id IN ('citf-identity-2025','itf','banner-cluster')`,
    ),
    pieceEntitiesSeyier: await ds.query(
      `SELECT * FROM piece_entities WHERE piece_id = 'seyier'`,
    ),
    pieceEntitiesCitf: await ds.query(
      `SELECT * FROM piece_entities WHERE piece_id IN ('itf','banner-cluster')`,
    ),
    samplePieceCols: await ds.query(`SHOW COLUMNS FROM pieces`),
  };

  const abortReasons: string[] = [];
  if (report.projectCitf !== 1) abortReasons.push("citf project missing");
  if (report.pieceManualExists !== 0)
    abortReasons.push("citf-manual-2025 already exists");
  if (!brandManual) abortReasons.push("brand_manuals citf missing");
  if (!report.coverExists) abortReasons.push("cover missing");
  if (!report.pdfExists) abortReasons.push("pdf missing");
  if (report.projectSeyier !== 1) abortReasons.push("seyier project missing");
  if (!report.pieceSeyier) abortReasons.push("seyier piece missing");
  if (!report.assets.inicio || !report.assets.portada || !report.assets.overlay)
    abortReasons.push("seyier assets missing");
  if ((report.candidateNewIds as unknown[]).length > 0)
    abortReasons.push("new seyier pieces already exist");
  if ((report.tagManual as unknown[]).length > 0)
    abortReasons.push("tag manual already exists");

  const out = {
    ...report,
    abort: abortReasons.length > 0,
    abortReasons,
    ok: abortReasons.length === 0,
  };

  writeFileSync(
    resolve("reports/_4d3c-preflight.json"),
    JSON.stringify(out, null, 2),
    "utf8",
  );
  console.log(
    JSON.stringify(
      {
        ok: out.ok,
        abortReasons,
        publicPieces: out.publicPieces,
        tagCount: out.tagCount,
        tagManualMissing: (report.tagManual as unknown[]).length === 0,
        galleryLabels: brandManual ? "see file" : null,
      },
      null,
      2,
    ),
  );
  await ds.destroy();
  if (!out.ok) process.exit(2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

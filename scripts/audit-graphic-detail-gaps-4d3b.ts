/**
 * READ-ONLY audit: Graphic detail gaps (Phase 4D.3B).
 * No DB writes. Writes reports/_graphic-detail-gaps-4d3b-live.json
 */
import { config as loadEnv } from "dotenv";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });
delete process.env.DATABASE_NAME;

const ASSETS = {
  manualCover: "/assets/grafico/brand-manuals/citf-manual-2025-cover.png",
  manualPdf: "/assets/grafico/brand-manuals/citf-manual-2025.pdf",
  seyierMain: "/assets/grafico/logos/seyier.svg",
  seyierGallery: [
    "/assets/grafico/logos/seyier/inicio.png",
    "/assets/grafico/logos/seyier/portada-fondo.png",
    "/assets/grafico/logos/seyier/overlay-ejemplo.png",
  ],
};

function publicExists(assetPath: string): boolean {
  return existsSync(resolve(process.cwd(), "public", assetPath.replace(/^\//, "")));
}

async function main() {
  const { getDataSource } = await import("../src/db/data-source");
  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  if (db !== "portfolio") throw new Error(`ABORT db=${db}`);

  const brandManual = await ds.query(
    `SELECT id, cover_path, pdf_path, title, year, brand_id, published, sort_order
     FROM brand_manuals WHERE id = ?`,
    ["citf"],
  );

  const projectCitf = await ds.query(
    `SELECT id, slug, title, type, context, status, published
     FROM projects WHERE id = ?`,
    ["citf-identity-2025"],
  );

  const piecesCitf = await ds.query(
    `SELECT id, slug, title, category, origin, project_id, src_path, published,
            legacy_section, legacy_gallery
     FROM pieces WHERE project_id = ? ORDER BY id`,
    ["citf-identity-2025"],
  );

  const projectResCitf = await ds.query(
    `SELECT id, project_id, path, kind, sort_order, media_asset_id
     FROM project_resources WHERE project_id = ?`,
    ["citf-identity-2025"],
  );

  const citfPieceIds = (piecesCitf as Array<{ id: string }>).map((p) => p.id);
  const pieceResCitf =
    citfPieceIds.length === 0
      ? []
      : await ds.query(
          `SELECT id, piece_id, path, kind, sort_order, media_asset_id
           FROM piece_resources WHERE piece_id IN (${citfPieceIds.map(() => "?").join(",")})`,
          citfPieceIds,
        );

  const mapCitf = await ds.query(
    `SELECT source_table, source_id, target_type, target_id, notes
     FROM migration_map
     WHERE source_table = 'brand_manuals'
        OR source_id IN ('citf', 'itf', 'banner-cluster')
        OR target_id IN ('citf-identity-2025', 'itf', 'banner-cluster', 'citf')
        OR target_id LIKE 'citf%'
     ORDER BY source_table, source_id, target_type, target_id`,
  );

  const manualishPieces = await ds.query(
    `SELECT id, title, category, project_id, src_path, published
     FROM pieces
     WHERE category = 'manual'
        OR id LIKE '%manual%'
        OR CAST(title AS CHAR) LIKE '%anual%'
        OR CAST(title AS CHAR) LIKE '%Manual%'
     ORDER BY id`,
  );

  const projectSeyier = await ds.query(
    `SELECT id, slug, title, type, context, status, published
     FROM projects WHERE id = ?`,
    ["seyier-visual-identity"],
  );

  const piecesSeyier = await ds.query(
    `SELECT id, slug, title, category, origin, project_id, src_path, published,
            legacy_section, legacy_gallery
     FROM pieces WHERE id = ? OR project_id = ? ORDER BY id`,
    ["seyier", "seyier-visual-identity"],
  );

  const projectResSeyier = await ds.query(
    `SELECT id, project_id, path, kind, sort_order
     FROM project_resources WHERE project_id = ?`,
    ["seyier-visual-identity"],
  );

  const pieceResSeyier = await ds.query(
    `SELECT id, piece_id, path, kind, sort_order
     FROM piece_resources WHERE piece_id = ? OR piece_id LIKE 'seyier%'`,
    ["seyier"],
  );

  const mapSeyier = await ds.query(
    `SELECT source_table, source_id, target_type, target_id, notes
     FROM migration_map
     WHERE source_id = 'seyier' OR target_id LIKE '%seyier%'
     ORDER BY target_type, target_id`,
  );

  const giSeyier = await ds.query(
    `SELECT id, src_path, gallery_paths, related_src_path, brand_id, published, section
     FROM graphic_items WHERE id = ?`,
    ["seyier"],
  );

  const counts = await ds.query(`
    SELECT 'piece_resources' AS t, COUNT(*) AS c FROM piece_resources
    UNION ALL SELECT 'project_resources', COUNT(*) FROM project_resources
    UNION ALL SELECT 'pieces', COUNT(*) FROM pieces
    UNION ALL SELECT 'brand_manuals', COUNT(*) FROM brand_manuals
  `);

  const report = {
    database: db,
    auditedAt: new Date().toISOString(),
    assetsPhysical: {
      manualCover: {
        path: ASSETS.manualCover,
        exists: publicExists(ASSETS.manualCover),
      },
      manualPdf: {
        path: ASSETS.manualPdf,
        exists: publicExists(ASSETS.manualPdf),
      },
      seyierMain: {
        path: ASSETS.seyierMain,
        exists: publicExists(ASSETS.seyierMain),
      },
      seyierGallery: ASSETS.seyierGallery.map((path) => ({
        path,
        exists: publicExists(path),
      })),
    },
    manual: {
      legacy: brandManual,
      project: projectCitf,
      piecesOnProject: piecesCitf,
      projectResources: projectResCitf,
      pieceResources: pieceResCitf,
      migrationMap: mapCitf,
      manualishPieces,
      pieceForManualExists: (manualishPieces as unknown[]).length > 0,
    },
    seyier: {
      legacyGraphicItem: giSeyier,
      project: projectSeyier,
      pieces: piecesSeyier,
      projectResources: projectResSeyier,
      pieceResources: pieceResSeyier,
      migrationMap: mapSeyier,
    },
    counts,
  };

  const out = resolve(process.cwd(), "reports/_graphic-detail-gaps-4d3b-live.json");
  writeFileSync(out, JSON.stringify(report, null, 2), "utf8");
  console.log("wrote", out);
  console.log(
    JSON.stringify(
      {
        database: db,
        manualPieceExists: report.manual.pieceForManualExists,
        citfPieces: (piecesCitf as Array<{ id: string }>).map((p) => p.id),
        citfProjectResources: (projectResCitf as unknown[]).length,
        citfPieceResources: (pieceResCitf as unknown[]).length,
        seyierPieces: (piecesSeyier as Array<{ id: string }>).map((p) => p.id),
        seyierPieceResources: (pieceResSeyier as unknown[]).length,
        assetsOk: Object.values(report.assetsPhysical)
          .flatMap((v) => (Array.isArray(v) ? v : [v]))
          .every((a: { exists: boolean }) => a.exists),
        counts,
      },
      null,
      2,
    ),
  );

  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

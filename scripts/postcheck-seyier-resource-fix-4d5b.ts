/**
 * 4D.5B post-check — READ ONLY (run after approved write).
 */
import { config as loadEnv } from "dotenv";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });
delete process.env.DATABASE_NAME;

const PATHS = [
  "/assets/grafico/logos/seyier/inicio.png",
  "/assets/grafico/logos/seyier/portada-fondo.png",
  "/assets/grafico/logos/seyier/overlay-ejemplo.png",
] as const;

const RESOURCE_IDS = [
  "4d5b1001-5e91-4001-8001-000000000001",
  "4d5b1001-5e91-4001-8001-000000000002",
  "4d5b1001-5e91-4001-8001-000000000003",
] as const;

const pub = (p: string) =>
  existsSync(resolve(process.cwd(), "public", p.replace(/^\//, "")));

async function main() {
  const { getDataSource } = await import("../src/db/data-source");
  const {
    getGraphicContentV2,
  } = await import("../src/lib/content-v2/graphic");

  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  if (db !== "portfolio") throw new Error(`ABORT db=${db}`);

  const seyierPieces = await ds.query(
    `SELECT id FROM pieces WHERE project_id=? ORDER BY sort_order, id`,
    ["seyier-visual-identity"],
  );
  const siblingsGone = await ds.query(
    `SELECT id FROM pieces WHERE id IN (?,?,?)`,
    ["seyier-inicio", "seyier-portada", "seyier-overlay"],
  );
  const resources = await ds.query(
    `SELECT id, path, kind, sort_order, CAST(label AS CHAR) AS label
     FROM piece_resources WHERE piece_id='seyier' ORDER BY sort_order, id`,
  );
  const maps = await ds.query(
    `SELECT target_type, target_id FROM migration_map
     WHERE source_table='graphic_items' AND source_id='seyier'
     ORDER BY target_type, target_id`,
  );
  const citf = await ds.query(
    `SELECT id FROM pieces WHERE id='citf-manual-2025'`,
  );
  const citfPdf = await ds.query(
    `SELECT path FROM piece_resources WHERE piece_id='citf-manual-2025'`,
  );

  const es = await getGraphicContentV2("es");
  const seyierPublic = es.pieces.filter(
    (p) =>
      p.id === "seyier" ||
      p.id.startsWith("seyier-") ||
      p.project?.id === "seyier-visual-identity",
  );

  const resourcePaths = (resources as Array<{ id: string; path: string }>).map(
    (r) => r.path,
  );
  const mapTypes = maps as Array<{ target_type: string; target_id: string }>;

  const checks = {
    seyierPiece1: (seyierPieces as unknown[]).length === 1,
    seyierId:
      (seyierPieces as Array<{ id: string }>)[0]?.id === "seyier",
    siblingsGone: (siblingsGone as unknown[]).length === 0,
    resources3: (resources as unknown[]).length === 3,
    resourceIds: RESOURCE_IDS.every((id) =>
      (resources as Array<{ id: string }>).some((r) => r.id === id),
    ),
    resourcePaths: PATHS.every((p) => resourcePaths.includes(p)),
    assetsOk: PATHS.every((p) => pub(p)),
    mapKeepsPieceSeyier: mapTypes.some(
      (m) => m.target_type === "piece" && m.target_id === "seyier",
    ),
    mapKeepsProject: mapTypes.some(
      (m) =>
        m.target_type === "project" &&
        m.target_id === "seyier-visual-identity",
    ),
    mapNoSiblingPieces: !mapTypes.some(
      (m) =>
        m.target_type === "piece" &&
        ["seyier-inicio", "seyier-portada", "seyier-overlay"].includes(
          m.target_id,
        ),
    ),
    mapThreeResources: RESOURCE_IDS.every((id) =>
      mapTypes.some((m) => m.target_type === "resource" && m.target_id === id),
    ),
    citfUntouched: (citf as unknown[]).length === 1,
    citfPdfOk: Boolean(
      (citfPdf as Array<{ path: string }>)[0]?.path?.endsWith(".pdf"),
    ),
    adapterRegular44: es.meta.counts.pieces === 44,
    adapterManuals1: es.meta.counts.manuals === 1,
    adapterSeyier1: seyierPublic.length === 1 && seyierPublic[0]?.id === "seyier",
    manualNotInGrid: !es.pieces.some((p) => p.id === "citf-manual-2025"),
  };

  const ok = Object.values(checks).every(Boolean);
  const out = { ok, checks, seyierPieces, resources, maps, adapter: es.meta };

  writeFileSync(
    resolve("reports/_4d5b-postcheck.json"),
    JSON.stringify(out, null, 2),
    "utf8",
  );
  console.log(JSON.stringify({ ok, checks, adapter: es.meta.counts }, null, 2));
  await ds.destroy();
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

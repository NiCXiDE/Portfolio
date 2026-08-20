/**
 * 4D.5B Seyier model fix — ONE TRANSACTION.
 * Collapse seyier-inicio / seyier-portada / seyier-overlay into piece_resources
 * of published Piece `seyier`. No legacy writes. No schema changes. No other Pieces.
 *
 * Requires:
 *   DATABASE_NAME=portfolio
 *   V2_SEYIER_RESOURCE_FIX_4D5B_APPROVED=1
 *
 * Usage (PowerShell, after human approval):
 *   $env:DATABASE_NAME='portfolio'
 *   $env:V2_SEYIER_RESOURCE_FIX_4D5B_APPROVED='1'
 *   npx tsx scripts/patch-seyier-resource-fix-4d5b.ts
 */
import { config as loadEnv } from "dotenv";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });

if (process.env.V2_SEYIER_RESOURCE_FIX_4D5B_APPROVED !== "1") {
  console.error(
    "ABORT: set V2_SEYIER_RESOURCE_FIX_4D5B_APPROVED=1 to run this writer",
  );
  process.exit(2);
}

if (process.env.DATABASE_NAME !== "portfolio") {
  console.error(
    `ABORT: DATABASE_NAME must be exactly "portfolio" (got ${JSON.stringify(process.env.DATABASE_NAME)})`,
  );
  process.exit(2);
}

const PATHS = {
  logo: "/assets/grafico/logos/seyier.svg",
  inicio: "/assets/grafico/logos/seyier/inicio.png",
  portada: "/assets/grafico/logos/seyier/portada-fondo.png",
  overlay: "/assets/grafico/logos/seyier/overlay-ejemplo.png",
} as const;

const RESOURCES = [
  {
    id: "4d5b1001-5e91-4001-8001-000000000001",
    pieceId: "seyier-inicio" as const,
    path: PATHS.inicio,
    label: { es: "Pantalla de inicio", en: "Starting screen" },
    sortOrder: 0,
    mapId: "e0082537-dd04-4a1f-a2a4-e92125bb0e9b",
  },
  {
    id: "4d5b1001-5e91-4001-8001-000000000002",
    pieceId: "seyier-portada" as const,
    path: PATHS.portada,
    label: { es: "Portada", en: "Stream cover" },
    sortOrder: 1,
    mapId: "870b1e5a-8b74-401d-9521-560abcfa8166",
  },
  {
    id: "4d5b1001-5e91-4001-8001-000000000003",
    pieceId: "seyier-overlay" as const,
    path: PATHS.overlay,
    label: { es: "Overlay", en: "Overlay example" },
    sortOrder: 2,
    mapId: "643a9b85-884c-4167-833f-fdb68f6dca84",
  },
] as const;

const SIBLINGS = RESOURCES.map((r) => r.pieceId);

async function count(
  query: (sql: string, params?: unknown[]) => Promise<unknown>,
  sql: string,
  params: unknown[] = [],
): Promise<number> {
  const rows = (await query(sql, params)) as Array<{ c: number }>;
  return Number(rows[0]?.c ?? 0);
}

async function main() {
  console.log(
    JSON.stringify({
      phase: "4D.5B",
      DATABASE_NAME: process.env.DATABASE_NAME,
      approved: process.env.V2_SEYIER_RESOURCE_FIX_4D5B_APPROVED === "1",
    }),
  );

  const { getDataSource } = await import("../src/db/data-source");
  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  console.log(`CONNECTED_DATABASE=${db}`);
  if (db !== "portfolio") throw new Error(`ABORT db=${db}`);

  const seyierN = await count(
    ds.query.bind(ds),
    `SELECT COUNT(*) AS c FROM pieces WHERE id=?`,
    ["seyier"],
  );
  if (seyierN !== 1) throw new Error(`ABORT seyier count=${seyierN}`);
  const seyier = (
    await ds.query(
      `SELECT category, project_id, published, src_path FROM pieces WHERE id=?`,
      ["seyier"],
    )
  )[0] as {
    category: string;
    project_id: string;
    published: number;
    src_path: string;
  };
  if (
    seyier.category !== "visual-identity" ||
    seyier.project_id !== "seyier-visual-identity" ||
    Number(seyier.published) !== 1 ||
    seyier.src_path !== PATHS.logo
  ) {
    throw new Error(`ABORT seyier row mismatch ${JSON.stringify(seyier)}`);
  }

  for (const r of RESOURCES) {
    const n = await count(
      ds.query.bind(ds),
      `SELECT COUNT(*) AS c FROM pieces WHERE id=?`,
      [r.pieceId],
    );
    if (n !== 1) throw new Error(`ABORT ${r.pieceId} count=${n}`);
    const row = (
      await ds.query(`SELECT src_path, project_id FROM pieces WHERE id=?`, [
        r.pieceId,
      ])
    )[0] as { src_path: string; project_id: string };
    if (row.src_path !== r.path || row.project_id !== "seyier-visual-identity") {
      throw new Error(`ABORT ${r.pieceId} path/project mismatch`);
    }
  }

  if (
    (await count(
      ds.query.bind(ds),
      `SELECT COUNT(*) AS c FROM piece_resources WHERE piece_id=?`,
      ["seyier"],
    )) !== 0
  ) {
    throw new Error("ABORT seyier already has piece_resources");
  }
  if (
    (await count(
      ds.query.bind(ds),
      `SELECT COUNT(*) AS c FROM piece_resources WHERE path IN (?,?,?)`,
      [PATHS.inicio, PATHS.portada, PATHS.overlay],
    )) !== 0
  ) {
    throw new Error("ABORT destination resource paths already exist");
  }
  if (
    (await count(
      ds.query.bind(ds),
      `SELECT COUNT(*) AS c FROM piece_resources WHERE id IN (?,?,?)`,
      RESOURCES.map((r) => r.id),
    )) !== 0
  ) {
    throw new Error("ABORT planned resource UUIDs already exist");
  }

  const extraPieceIdTables = (await ds.query(
    `SELECT TABLE_NAME AS t FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA=DATABASE() AND COLUMN_NAME='piece_id'
       AND TABLE_NAME NOT IN ('piece_entities','piece_resources','piece_tags')`,
  )) as Array<{ t: string }>;
  if (extraPieceIdTables.length) {
    throw new Error(
      `ABORT unexpected piece_id tables: ${extraPieceIdTables.map((r) => r.t).join(",")}`,
    );
  }

  for (const r of RESOURCES) {
    const n = await count(
      ds.query.bind(ds),
      `SELECT COUNT(*) AS c FROM piece_tags WHERE piece_id=?`,
      [r.pieceId],
    );
    if (n !== 0) throw new Error(`ABORT ${r.pieceId} has tags`);
    const mapN = await count(
      ds.query.bind(ds),
      `SELECT COUNT(*) AS c FROM migration_map
       WHERE id=? AND source_table='graphic_items' AND source_id='seyier'
         AND target_type='piece' AND target_id=?`,
      [r.mapId, r.pieceId],
    );
    if (mapN !== 1) throw new Error(`ABORT map ${r.pieceId} missing`);
  }

  const qr = ds.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    for (const r of RESOURCES) {
      await qr.query(
        `INSERT INTO piece_resources (id, piece_id, media_asset_id, path, kind, label, sort_order)
         VALUES (?, 'seyier', NULL, ?, 'piece_resource', CAST(? AS JSON), ?)`,
        [r.id, r.path, JSON.stringify(r.label), r.sortOrder],
      );
      await qr.query(
        `UPDATE migration_map
         SET target_type='resource', target_id=?, notes=?
         WHERE id=? AND source_table='graphic_items' AND source_id='seyier'
           AND target_type='piece' AND target_id=?`,
        [
          r.id,
          "4D.5B: gallery frame → piece_resources of seyier (EXPECTED_RESOURCE_COLLAPSE)",
          r.mapId,
          r.pieceId,
        ],
      );
      const mapOk = await count(
        qr.query.bind(qr),
        `SELECT COUNT(*) AS c FROM migration_map
         WHERE id=? AND target_type='resource' AND target_id=?`,
        [r.mapId, r.id],
      );
      if (mapOk !== 1) {
        throw new Error(`ABORT map retarget failed for ${r.pieceId}`);
      }
    }

    await qr.query(
      `DELETE FROM piece_entities WHERE piece_id IN (?,?,?)`,
      [...SIBLINGS],
    );
    await qr.query(
      `DELETE FROM piece_tags WHERE piece_id IN (?,?,?)`,
      [...SIBLINGS],
    );
    await qr.query(`DELETE FROM pieces WHERE id IN (?,?,?)`, [...SIBLINGS]);
    const remainingSiblings = await count(
      qr.query.bind(qr),
      `SELECT COUNT(*) AS c FROM pieces WHERE id IN (?,?,?)`,
      [...SIBLINGS],
    );
    if (remainingSiblings !== 0) {
      throw new Error(`ABORT siblings remaining=${remainingSiblings}`);
    }

    await qr.commitTransaction();

    const post = {
      ok: true,
      transaction: "COMMIT",
      resources: RESOURCES.map((r) => ({ id: r.id, path: r.path })),
      counts: {
        pieces: (
          await ds.query(`SELECT COUNT(*) AS c FROM pieces`)
        )[0] as { c: number },
        published: (
          await ds.query(`SELECT COUNT(*) AS c FROM pieces WHERE published=1`)
        )[0] as { c: number },
        seyierPieces: await ds.query(
          `SELECT id FROM pieces WHERE project_id='seyier-visual-identity' ORDER BY id`,
        ),
        seyierResources: await ds.query(
          `SELECT id, path, kind, sort_order FROM piece_resources WHERE piece_id='seyier' ORDER BY sort_order`,
        ),
        mapsSeyier: await ds.query(
          `SELECT target_type, target_id FROM migration_map
           WHERE source_table='graphic_items' AND source_id='seyier'
           ORDER BY target_type, target_id`,
        ),
        citfManual: (
          await ds.query(
            `SELECT id FROM pieces WHERE id='citf-manual-2025'`,
          )
        )[0],
      },
    };

    writeFileSync(
      resolve("reports/_4d5b-patch-result.json"),
      JSON.stringify(post, null, 2),
      "utf8",
    );
    console.log(JSON.stringify(post, null, 2));
  } catch (err) {
    await qr.rollbackTransaction();
    console.error("ROLLBACK", err);
    throw err;
  } finally {
    await qr.release();
    await ds.destroy();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

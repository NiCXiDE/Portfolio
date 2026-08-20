/**
 * 4D.5B preflight — READ ONLY.
 * Usage: npx tsx scripts/preflight-seyier-resource-fix-4d5b.ts
 */
import { config as loadEnv } from "dotenv";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });
delete process.env.DATABASE_NAME;

const PATHS = {
  inicio: "/assets/grafico/logos/seyier/inicio.png",
  portada: "/assets/grafico/logos/seyier/portada-fondo.png",
  overlay: "/assets/grafico/logos/seyier/overlay-ejemplo.png",
  logo: "/assets/grafico/logos/seyier.svg",
} as const;

const RESOURCE_IDS = [
  "4d5b1001-5e91-4001-8001-000000000001",
  "4d5b1001-5e91-4001-8001-000000000002",
  "4d5b1001-5e91-4001-8001-000000000003",
] as const;

const MAP_IDS = {
  inicio: "e0082537-dd04-4a1f-a2a4-e92125bb0e9b",
  portada: "870b1e5a-8b74-401d-9521-560abcfa8166",
  overlay: "643a9b85-884c-4167-833f-fdb68f6dca84",
} as const;

const SIBLINGS = ["seyier-inicio", "seyier-portada", "seyier-overlay"] as const;

const pub = (p: string) =>
  existsSync(resolve(process.cwd(), "public", p.replace(/^\//, "")));

async function main() {
  const { getDataSource } = await import("../src/db/data-source");
  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  if (db !== "portfolio") throw new Error(`ABORT db=${db}`);

  const seyier = await ds.query(
    `SELECT id, slug, title, alt, category, origin, src_path, project_id,
            published, sort_order, CAST(legacy_gallery AS CHAR) AS legacy_gallery
     FROM pieces WHERE id=?`,
    ["seyier"],
  );
  const siblings = await ds.query(
    `SELECT id, slug, title, alt, category, origin, src_path, project_id,
            published, sort_order
     FROM pieces WHERE id IN (?,?,?) ORDER BY sort_order, id`,
    [...SIBLINGS],
  );
  const seyierResources = await ds.query(
    `SELECT id, path, kind FROM piece_resources WHERE piece_id=?`,
    ["seyier"],
  );
  const pathHits = await ds.query(
    `SELECT id, piece_id, path FROM piece_resources WHERE path IN (?,?,?)`,
    [PATHS.inicio, PATHS.portada, PATHS.overlay],
  );
  const plannedIds = await ds.query(
    `SELECT id FROM piece_resources WHERE id IN (?,?,?)`,
    [...RESOURCE_IDS],
  );
  const entities = await ds.query(
    `SELECT * FROM piece_entities WHERE piece_id IN (?,?,?,?)`,
    ["seyier", ...SIBLINGS],
  );
  const tags = await ds.query(
    `SELECT * FROM piece_tags WHERE piece_id IN (?,?,?,?)`,
    ["seyier", ...SIBLINGS],
  );
  const maps = await ds.query(
    `SELECT id, source_table, source_id, target_type, target_id, notes
     FROM migration_map
     WHERE source_table='graphic_items' AND source_id='seyier'
     ORDER BY target_type, target_id`,
  );
  const citfManual = await ds.query(
    `SELECT id FROM pieces WHERE id=?`,
    ["citf-manual-2025"],
  );
  const citfPdf = await ds.query(
    `SELECT id, path FROM piece_resources WHERE piece_id=?`,
    ["citf-manual-2025"],
  );

  const pieceIdTables = (
    await ds.query(
      `SELECT TABLE_NAME AS t, COLUMN_NAME AS c
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA=DATABASE() AND COLUMN_NAME='piece_id'`,
    )
  ) as Array<{ t: string; c: string }>;

  const abortReasons: string[] = [];
  if ((seyier as unknown[]).length !== 1)
    abortReasons.push("seyier must exist exactly once");
  const s = seyier[0] as
    | {
        category: string;
        project_id: string;
        published: number;
        src_path: string;
      }
    | undefined;
  if (s) {
    if (s.category !== "visual-identity")
      abortReasons.push("seyier category mismatch");
    if (s.project_id !== "seyier-visual-identity")
      abortReasons.push("seyier project_id mismatch");
    if (Number(s.published) !== 1) abortReasons.push("seyier not published");
    if (s.src_path !== PATHS.logo) abortReasons.push("seyier src_path mismatch");
  }
  if ((siblings as unknown[]).length !== 3)
    abortReasons.push("expected exactly 3 sibling Pieces");
  const byId = new Map(
    (siblings as Array<{ id: string; src_path: string; project_id: string }>).map(
      (row) => [row.id, row],
    ),
  );
  const expectedSrc: Record<(typeof SIBLINGS)[number], string> = {
    "seyier-inicio": PATHS.inicio,
    "seyier-portada": PATHS.portada,
    "seyier-overlay": PATHS.overlay,
  };
  for (const id of SIBLINGS) {
    const row = byId.get(id);
    if (!row) abortReasons.push(`missing ${id}`);
    else {
      if (row.src_path !== expectedSrc[id])
        abortReasons.push(`${id} src_path mismatch`);
      if (row.project_id !== "seyier-visual-identity")
        abortReasons.push(`${id} project_id mismatch`);
    }
  }
  if ((seyierResources as unknown[]).length !== 0)
    abortReasons.push("seyier already has piece_resources");
  if ((pathHits as unknown[]).length !== 0)
    abortReasons.push("destination resource paths already exist");
  if ((plannedIds as unknown[]).length !== 0)
    abortReasons.push("planned resource UUIDs already exist");
  if (!pub(PATHS.inicio) || !pub(PATHS.portada) || !pub(PATHS.overlay) || !pub(PATHS.logo))
    abortReasons.push("physical assets missing");
  if ((citfManual as unknown[]).length !== 1)
    abortReasons.push("citf-manual-2025 missing");

  const mapByTarget = new Map(
    (
      maps as Array<{
        id: string;
        target_type: string;
        target_id: string;
      }>
    ).map((m) => [`${m.target_type}:${m.target_id}`, m]),
  );
  for (const [pieceId, mapId] of [
    ["seyier-inicio", MAP_IDS.inicio],
    ["seyier-portada", MAP_IDS.portada],
    ["seyier-overlay", MAP_IDS.overlay],
  ] as const) {
    const row = mapByTarget.get(`piece:${pieceId}`);
    if (!row || row.id !== mapId)
      abortReasons.push(`migration_map for ${pieceId} missing or id mismatch`);
  }
  if (!mapByTarget.get("piece:seyier"))
    abortReasons.push("historical map piece:seyier missing");
  if (!mapByTarget.get("project:seyier-visual-identity"))
    abortReasons.push("historical map project seyier missing");

  const siblingTagRows = (tags as Array<{ piece_id: string }>).filter((t) =>
    (SIBLINGS as readonly string[]).includes(t.piece_id),
  );
  if (siblingTagRows.length !== 0)
    abortReasons.push("sibling Pieces have tags to preserve");

  const unexpectedPieceIdTables = pieceIdTables
    .map((r) => r.t)
    .filter(
      (t) => !["piece_entities", "piece_resources", "piece_tags"].includes(t),
    );
  if (unexpectedPieceIdTables.length)
    abortReasons.push(
      `unexpected piece_id tables: ${unexpectedPieceIdTables.join(",")}`,
    );

  const counts = {
    pieces: Number((await ds.query(`SELECT COUNT(*) AS c FROM pieces`))[0].c),
    published: Number(
      (await ds.query(`SELECT COUNT(*) AS c FROM pieces WHERE published=1`))[0]
        .c,
    ),
    pieceResources: Number(
      (await ds.query(`SELECT COUNT(*) AS c FROM piece_resources`))[0].c,
    ),
    maps: Number(
      (await ds.query(`SELECT COUNT(*) AS c FROM migration_map`))[0].c,
    ),
  };

  const out = {
    database: db,
    ok: abortReasons.length === 0,
    abortReasons,
    seyier: seyier[0] ?? null,
    siblings,
    seyierResources,
    pathHits,
    plannedIds,
    entities,
    tags,
    maps,
    citfManual: citfManual[0] ?? null,
    citfPdf,
    pieceIdTables,
    assets: {
      inicio: pub(PATHS.inicio),
      portada: pub(PATHS.portada),
      overlay: pub(PATHS.overlay),
      logo: pub(PATHS.logo),
    },
    counts,
  };

  writeFileSync(
    resolve("reports/_4d5b-preflight.json"),
    JSON.stringify(out, null, 2),
    "utf8",
  );
  console.log(
    JSON.stringify(
      {
        ok: out.ok,
        abortReasons,
        database: db,
        counts,
        seyier: Boolean(s),
        siblings: (siblings as unknown[]).length,
      },
      null,
      2,
    ),
  );
  await ds.destroy();
  if (!out.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

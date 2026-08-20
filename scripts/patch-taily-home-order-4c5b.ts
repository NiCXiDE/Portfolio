import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });
delete process.env.DATABASE_NAME;

async function main() {
  const { getDataSource } = await import("../src/db/data-source");
  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  if (db !== "portfolio") throw new Error(`ABORT db=${db}`);

  const before = (await ds.query(
    `SELECT id, home_order FROM projects WHERE id IN ('taily','adapto-pay') ORDER BY id`,
  )) as Array<{ id: string; home_order: number | null }>;
  console.log("before", before);

  await ds.query(
    `UPDATE projects SET home_order = 11 WHERE id = 'taily' AND published = 1 AND show_on_home = 1`,
  );

  const after = (await ds.query(
    `SELECT id, status, home_order FROM projects WHERE show_on_home = 1 ORDER BY home_order ASC, id ASC`,
  )) as Array<{ id: string; status: string; home_order: number | null }>;
  console.log(
    "after",
    after.map((r) => `${r.id}:${r.home_order}:${r.status}`),
  );
  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

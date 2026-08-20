/**
 * READ-ONLY post-check for 4C.1 Home data patch.
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });
delete process.env.DATABASE_NAME;

async function main() {
  const {
    getHomeEntitiesV2,
    getHomeProjectsV2,
    getPublicTestimonialsV2,
  } = await import("../src/lib/content-v2");
  const { getDataSource } = await import("../src/db/data-source");

  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  if (db !== "portfolio") throw new Error(`ABORT: db=${db}`);

  const he = await getHomeEntitiesV2();
  const hp = await getHomeProjectsV2();
  const t = await getPublicTestimonialsV2();

  const blocked = [
    "sessions",
    "asesor-financiero",
    "aicore-inventariado",
    "aml-general",
    "aml-casinos",
    "confidential-logistics-system",
    "microtime",
    "syllabi",
    "proxi",
  ];

  const leak = hp.filter(
    (p) => p.status === "archived" || blocked.includes(p.id),
  );

  const [unpubHome] = (await ds.query(
    `SELECT id FROM projects WHERE show_on_home = 1 AND published = 0`,
  )) as [Array<{ id: string }>, unknown];

  const [forbiddenHome] = (await ds.query(
    `SELECT id FROM projects WHERE show_on_home = 1 AND id IN (?)`,
    [blocked],
  )) as [Array<{ id: string }>, unknown];

  console.log(
    JSON.stringify(
      {
        database: db,
        homeEntities: {
          count: he.length,
          order: he.map((e) => ({ id: e.id, homeOrder: e.homeOrder })),
        },
        homeProjects: {
          count: hp.length,
          completed: hp.filter((p) => p.status === "completed").length,
          ongoing: hp.filter((p) => p.status === "ongoing").length,
          ongoingIds: hp
            .filter((p) => p.status === "ongoing")
            .map((p) => p.id),
          list: hp.map((p) => ({
            id: p.id,
            status: p.status,
            homeOrder: p.homeOrder,
            showOnHome: p.showOnHome,
          })),
        },
        testimonials: t.length,
        readerForbiddenOrArchivedOnHome: leak.length,
        leakIds: leak.map((p) => p.id),
        unpublishedShowOnHomeSql: unpubHome.map((r) => r.id),
        forbiddenShowOnHomeSql: forbiddenHome.map((r) => r.id),
      },
      null,
      2,
    ),
  );

  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

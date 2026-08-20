/**
 * READ-ONLY 4E.0C — membership / hide-list / encoding audit.
 */
import { config as loadEnv } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });
delete process.env.DATABASE_NAME;

const HIDE_LABELS = [
  "Landing PUSH",
  "Landing Órbita",
  "Landing Lúdica",
  "Repuestos Carlitos",
  "Marketplace / SIMAAS",
  "B2B / PROXI",
  "Templeton Mathews",
  "Cloronor Trading",
];

async function main() {
  const { getDataSource } = await import("../src/db/data-source");
  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  if (db !== "portfolio") throw new Error(`ABORT db=${db}`);

  const projectCols = (await ds.query(`
    SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, COLUMN_COMMENT
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects'
    ORDER BY ORDINAL_POSITION
  `)) as Array<Record<string, string>>;

  const charset = (await ds.query(`
    SELECT TABLE_NAME, COLUMN_NAME, CHARACTER_SET_NAME, COLLATION_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN ('projects','ui_projects','ui_list_items')
      AND COLUMN_NAME IN ('title','summary','description','wordmark','caption')
  `)) as Array<Record<string, string>>;

  const hideCandidates = (await ds.query(`
    SELECT p.id, p.slug, p.title, p.published, p.show_on_home, p.featured,
           p.case_study_enabled, p.status, p.context, p.type, p.sort_order
    FROM projects p
    WHERE p.id IN (
      'repuestos-carlitos','simaas-marketplace','proxi',
      'templeton-digital-transformation-assessment','cloronor-trading',
      'push-visual-identity'
    )
    OR p.title LIKE '%PUSH%'
    OR p.title LIKE '%rbita%'
    OR p.title LIKE '%dica%'
    OR p.title LIKE '%Carlitos%'
    OR p.title LIKE '%SIMAAS%'
    OR p.title LIKE '%Marketplace%'
    OR p.title LIKE '%B2B%'
    OR p.title LIKE '%PROXI%'
    OR p.title LIKE '%Templeton%'
    OR p.title LIKE '%Cloronor%'
    ORDER BY p.id
  `)) as Array<Record<string, unknown>>;

  const listHex = (await ds.query(`
    SELECT id,
           CAST(title AS CHAR CHARACTER SET utf8mb4) AS title_str,
           HEX(CAST(title AS CHAR CHARACTER SET utf8mb4)) AS title_hex,
           wordmark,
           HEX(IFNULL(wordmark,'')) AS wordmark_hex,
           published, sort_order
    FROM ui_list_items
    ORDER BY sort_order, id
  `)) as Array<Record<string, unknown>>;

  const projectTitleHex = (await ds.query(`
    SELECT id,
           CAST(title AS CHAR CHARACTER SET utf8mb4) AS title_str,
           HEX(CAST(title AS CHAR CHARACTER SET utf8mb4)) AS title_hex
    FROM ui_projects
    WHERE title LIKE '%rbita%' OR title LIKE '%dica%' OR title LIKE '%Dise%'
       OR id IN ('proxi','apsmm','cms-portfolio')
    ORDER BY id
  `)) as Array<Record<string, unknown>>;

  const v2TitleHex = (await ds.query(`
    SELECT id,
           CAST(title AS CHAR CHARACTER SET utf8mb4) AS title_str
    FROM projects
    WHERE id IN (
      'repuestos-carlitos','simaas-marketplace','proxi',
      'templeton-digital-transformation-assessment','cloronor-trading',
      'orbita-l-b'
    )
  `)) as Array<Record<string, unknown>>;

  const fixtureList = JSON.parse(
    readFileSync(resolve("content/interfaces/list.json"), "utf8"),
  ) as Array<{ id: string; title: { es: string; en: string } }>;

  const out = {
    database: db,
    hideLabels: HIDE_LABELS,
    projectColumns: projectCols.map((c) => c.COLUMN_NAME),
    hasShowOnInterfaces: projectCols.some(
      (c) => c.COLUMN_NAME === "show_on_interfaces",
    ),
    membershipLikeColumns: projectCols
      .map((c) => c.COLUMN_NAME)
      .filter((n) =>
        /show_|featured|case_study|published|area/.test(n),
      ),
    charset,
    hideCandidates,
    uiListItems: listHex,
    fixtureListTitles: fixtureList.map((i) => ({
      id: i.id,
      es: i.title.es,
      en: i.title.en,
      esCodepoints: [...i.title.es].map((ch) => ch.codePointAt(0)?.toString(16)),
    })),
    uiProjectTitleSamples: projectTitleHex,
    v2TitleSamples: v2TitleHex,
  };
  console.log(JSON.stringify(out, null, 2));
  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

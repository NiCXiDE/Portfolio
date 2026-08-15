/**
 * LIVE 4C.1 — apply approved Home Entity.home_order + Project.show_on_home/home_order.
 *
 * ONLY updates those columns for explicit IDs. No mass UPDATE. No status/published changes.
 *
 * Requires:
 *   effective database = portfolio
 *   V2_HOME_DATA_PATCH_4C1_APPROVED=1
 *
 * Idempotent: re-run is safe if values already match the approved patch.
 *
 * Usage:
 *   V2_HOME_DATA_PATCH_4C1_APPROVED=1 npx tsx scripts/apply-home-data-patch-4c1.ts
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import mysql from "mysql2/promise";

loadEnv({ path: resolve(process.cwd(), ".env") });

const LIVE_DB = "portfolio";

const ENTITY_HOME_ORDER: Array<{ id: string; homeOrder: number }> = [
  { id: "aicore", homeOrder: 0 },
  { id: "apsmm", homeOrder: 1 },
  { id: "citf", homeOrder: 2 },
  { id: "ludica", homeOrder: 3 },
  { id: "orbita-l-b", homeOrder: 4 },
  { id: "push", homeOrder: 5 },
];

const PROJECT_PATCH: Array<{
  id: string;
  homeOrder: number;
  expectedStatus: "completed" | "ongoing";
}> = [
  { id: "adapto-pay", homeOrder: 0, expectedStatus: "completed" },
  { id: "casiba", homeOrder: 1, expectedStatus: "completed" },
  { id: "clearwater", homeOrder: 2, expectedStatus: "completed" },
  { id: "cloronor-trading", homeOrder: 3, expectedStatus: "completed" },
  { id: "expedicion-polo", homeOrder: 4, expectedStatus: "completed" },
  { id: "juegos-provinciales", homeOrder: 5, expectedStatus: "completed" },
  { id: "mental-training-tech-24-5", homeOrder: 6, expectedStatus: "completed" },
  { id: "omnigroup", homeOrder: 7, expectedStatus: "completed" },
  { id: "concitar", homeOrder: 8, expectedStatus: "completed" },
  { id: "repuestos-carlitos", homeOrder: 9, expectedStatus: "completed" },
  {
    id: "templeton-digital-transformation-assessment",
    homeOrder: 10,
    expectedStatus: "completed",
  },
  { id: "taily", homeOrder: 0, expectedStatus: "ongoing" },
];

const FORBIDDEN_HOME_IDS = [
  "sessions",
  "asesor-financiero",
  "aicore-inventariado",
  "aml-general",
  "aml-casinos",
  "confidential-logistics-system",
  "microtime",
  "syllabi",
  "proxi",
] as const;

function connectionConfig(database: string) {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database,
      multipleStatements: false,
    };
  }

  return {
    host: process.env.DATABASE_HOST ?? "127.0.0.1",
    port: Number(process.env.DATABASE_PORT ?? "3306"),
    user: process.env.DATABASE_USER ?? "portfolio",
    password: process.env.DATABASE_PASSWORD ?? "portfolio",
    database,
    multipleStatements: false,
  };
}

type EntityRow = {
  id: string;
  visible: number | boolean;
  show_on_home: number | boolean;
  home_order: number | null;
  page_enabled: number | boolean;
};

type ProjectRow = {
  id: string;
  published: number | boolean;
  status: string;
  show_on_home: number | boolean;
  home_order: number | null;
};

function asBool(v: number | boolean): boolean {
  return v === true || v === 1;
}

async function main() {
  // Never honor TEMP / rehearsal DB overrides for this patch.
  delete process.env.DATABASE_NAME;

  if (process.env.V2_HOME_DATA_PATCH_4C1_APPROVED !== "1") {
    throw new Error(
      `[4c1] ABORT: requires V2_HOME_DATA_PATCH_4C1_APPROVED=1`,
    );
  }

  const conn = await mysql.createConnection(connectionConfig(LIVE_DB));

  try {
    const [dbRows] = (await conn.query("SELECT DATABASE() AS db")) as [
      Array<{ db: string }>,
      unknown,
    ];
    const connectedDb = dbRows[0]?.db;
    console.log(`connected_database=${connectedDb}`);
    if (connectedDb !== LIVE_DB) {
      throw new Error(
        `[4c1] ABORT: connected database="${connectedDb}" !== "${LIVE_DB}"`,
      );
    }

    // ——— PREFLIGHT ———
    const entityIds = ENTITY_HOME_ORDER.map((e) => e.id);
    const [entityRows] = (await conn.query(
      `SELECT id, visible, show_on_home, home_order, page_enabled
       FROM entities
       WHERE id IN (?)`,
      [entityIds],
    )) as [EntityRow[], unknown];

    if (entityRows.length !== ENTITY_HOME_ORDER.length) {
      const found = new Set(entityRows.map((r) => r.id));
      const missing = entityIds.filter((id) => !found.has(id));
      throw new Error(`[4c1] ABORT: missing entities: ${missing.join(", ")}`);
    }

    const entitiesBefore = entityRows.map((r) => ({
      id: r.id,
      visible: asBool(r.visible),
      showOnHome: asBool(r.show_on_home),
      homeOrder: r.home_order,
      pageEnabled: asBool(r.page_enabled),
    }));

    for (const e of entitiesBefore) {
      if (!e.visible || !e.showOnHome) {
        throw new Error(
          `[4c1] ABORT: entity ${e.id} requires visible=true showOnHome=true ` +
            `(got visible=${e.visible} showOnHome=${e.showOnHome})`,
        );
      }
    }

    const projectIds = PROJECT_PATCH.map((p) => p.id);
    const [projectRows] = (await conn.query(
      `SELECT id, published, status, show_on_home, home_order
       FROM projects
       WHERE id IN (?)`,
      [projectIds],
    )) as [ProjectRow[], unknown];

    const byId = new Map(projectRows.map((r) => [r.id, r]));
    for (const expected of PROJECT_PATCH) {
      const rows = projectRows.filter((r) => r.id === expected.id);
      if (rows.length !== 1) {
        throw new Error(
          `[4c1] ABORT: project ${expected.id} count=${rows.length} (expected 1)`,
        );
      }
      const row = rows[0]!;
      if (!asBool(row.published)) {
        throw new Error(
          `[4c1] ABORT: project ${expected.id} published=false — will not enable Home`,
        );
      }
      if (row.status === "archived") {
        throw new Error(
          `[4c1] ABORT: project ${expected.id} status=archived`,
        );
      }
      if (row.status !== expected.expectedStatus) {
        throw new Error(
          `[4c1] ABORT: project ${expected.id} status="${row.status}" ` +
            `expected "${expected.expectedStatus}" — not auto-correcting`,
        );
      }
      // showOnHome may already be true on idempotent re-run; only abort if weird
      void byId;
    }

    if (projectRows.length !== PROJECT_PATCH.length) {
      const found = new Set(projectRows.map((r) => r.id));
      const missing = projectIds.filter((id) => !found.has(id));
      throw new Error(`[4c1] ABORT: missing projects: ${missing.join(", ")}`);
    }

    const projectsBefore = PROJECT_PATCH.map((p) => {
      const row = byId.get(p.id)!;
      return {
        id: p.id,
        published: asBool(row.published),
        status: row.status,
        showOnHome: asBool(row.show_on_home),
        homeOrder: row.home_order,
        targetHomeOrder: p.homeOrder,
      };
    });

    console.log(
      JSON.stringify(
        { phase: "preflight_ok", entitiesBefore, projectsBefore },
        null,
        2,
      ),
    );

    // ——— TRANSACTION ———
    await conn.beginTransaction();
    let entityAffected = 0;
    let projectAffected = 0;

    try {
      for (const e of ENTITY_HOME_ORDER) {
        const [result] = (await conn.query(
          `UPDATE entities SET home_order = ? WHERE id = ?`,
          [e.homeOrder, e.id],
        )) as [mysql.ResultSetHeader, unknown];
        entityAffected += result.affectedRows;
      }

      for (const p of PROJECT_PATCH) {
        const [result] = (await conn.query(
          `UPDATE projects
           SET show_on_home = 1, home_order = ?
           WHERE id = ?
             AND published = 1
             AND status = ?`,
          [p.homeOrder, p.id, p.expectedStatus],
        )) as [mysql.ResultSetHeader, unknown];
        projectAffected += result.changedRows ?? result.affectedRows;
      }

      // Pre-commit asserts
      const [entAfter] = (await conn.query(
        `SELECT id, visible, show_on_home, home_order
         FROM entities WHERE id IN (?) ORDER BY home_order ASC, id ASC`,
        [entityIds],
      )) as [EntityRow[], unknown];

      for (const e of ENTITY_HOME_ORDER) {
        const row = entAfter.find((r) => r.id === e.id);
        if (!row || row.home_order !== e.homeOrder) {
          throw new Error(
            `[4c1] ABORT pre-commit: entity ${e.id} home_order=` +
              `${row?.home_order} expected ${e.homeOrder}`,
          );
        }
        if (!asBool(row.visible) || !asBool(row.show_on_home)) {
          throw new Error(
            `[4c1] ABORT pre-commit: entity ${e.id} visibility flags changed unexpectedly`,
          );
        }
      }

      const [projAfter] = (await conn.query(
        `SELECT id, published, status, show_on_home, home_order
         FROM projects WHERE id IN (?)`,
        [projectIds],
      )) as [ProjectRow[], unknown];

      for (const p of PROJECT_PATCH) {
        const row = projAfter.find((r) => r.id === p.id);
        if (
          !row ||
          !asBool(row.show_on_home) ||
          row.home_order !== p.homeOrder ||
          !asBool(row.published) ||
          row.status !== p.expectedStatus
        ) {
          throw new Error(
            `[4c1] ABORT pre-commit: project ${p.id} final state mismatch ` +
              JSON.stringify(row),
          );
        }
      }

      const [badHome] = (await conn.query(
        `SELECT id, published, status, show_on_home
         FROM projects
         WHERE show_on_home = 1
           AND (
             published = 0
             OR status = 'archived'
             OR id IN (?)
           )`,
        [FORBIDDEN_HOME_IDS as unknown as string[]],
      )) as [ProjectRow[], unknown];

      if (badHome.length > 0) {
        throw new Error(
          `[4c1] ABORT pre-commit: forbidden/unpublished/archived on Home: ` +
            badHome.map((r) => r.id).join(", "),
        );
      }

      const [homeCount] = (await conn.query(
        `SELECT COUNT(*) AS c FROM projects WHERE show_on_home = 1 AND id IN (?)`,
        [projectIds],
      )) as [Array<{ c: number | string }>, unknown];
      if (Number(homeCount[0]?.c) !== 12) {
        throw new Error(
          `[4c1] ABORT pre-commit: expected 12 patched projects on Home, got ${homeCount[0]?.c}`,
        );
      }

      await conn.commit();
      console.log(
        JSON.stringify(
          {
            phase: "commit_ok",
            entityAffectedRows: entityAffected,
            projectAffectedRows: projectAffected,
          },
          null,
          2,
        ),
      );
    } catch (err) {
      await conn.rollback();
      console.error(`[4c1] ROLLBACK`);
      throw err;
    }

    // ——— POST SELECT (same connection) ———
    const [entitiesFinal] = (await conn.query(
      `SELECT id, home_order, visible, show_on_home
       FROM entities WHERE id IN (?) ORDER BY home_order ASC, id ASC`,
      [entityIds],
    )) as [EntityRow[], unknown];

    const [projectsFinal] = (await conn.query(
      `SELECT id, published, status, show_on_home, home_order
       FROM projects WHERE show_on_home = 1 ORDER BY status, home_order ASC, id ASC`,
    )) as [ProjectRow[], unknown];

    console.log(
      JSON.stringify(
        {
          phase: "post_select",
          entitiesFinal: entitiesFinal.map((r) => ({
            id: r.id,
            homeOrder: r.home_order,
            visible: asBool(r.visible),
            showOnHome: asBool(r.show_on_home),
          })),
          homeProjects: projectsFinal.map((r) => ({
            id: r.id,
            published: asBool(r.published),
            status: r.status,
            showOnHome: asBool(r.show_on_home),
            homeOrder: r.home_order,
          })),
          homeProjectCount: projectsFinal.length,
          completed: projectsFinal.filter((r) => r.status === "completed")
            .length,
          ongoing: projectsFinal.filter((r) => r.status === "ongoing").length,
        },
        null,
        2,
      ),
    );
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Selective legacy restore: portfolio_restore_test → portfolio (8 tables).
 * TEMPORARY — remove after migration validated.
 *
 * Requires RESTORE_LEGACY_APPROVED=1 to execute writes.
 * Without it: prints dry-run plan and exits 1 BEFORE any DB connection for writes.
 *
 * Usage (after approval):
 *   RESTORE_LEGACY_APPROVED=1 npx tsx scripts/restore-legacy-from-test.ts
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import type { QueryRunner } from "typeorm";
import { createDataSource } from "../src/db/data-source";
import { isDirectScriptRun } from "./sync-schema";

loadEnv({ path: resolve(process.cwd(), ".env") });

const SOURCE_DB = "portfolio_restore_test";

const TARGET_EMPTY_TABLES = [
  "admin_audit_logs",
  "graphic_items",
  "brand_manuals",
  "ui_projects",
  "ui_list_items",
  "testimonials",
  "named_list_items",
  "brands",
] as const;

const EXPECTED_COUNTS: Record<string, number> = {
  graphic_items: 47,
  ui_projects: 13,
  brands: 7,
  brand_manuals: 1,
  testimonials: 4,
  named_list_items: 40,
  ui_list_items: 8,
  admin_audit_logs: 2,
  entities: 0,
  projects: 0,
  pieces: 0,
  migration_map: 0,
};

const INSERT_STEPS: Array<{ label: string; sql: string }> = [
  {
    label: "brands",
    sql: `INSERT INTO brands (id, name, logo_path, href, sort_order, published, created_at, logo_asset_id)
SELECT id, name, logo_path, href, sort_order, published, created_at, logo_asset_id
FROM ${SOURCE_DB}.brands`,
  },
  {
    label: "graphic_items",
    sql: `INSERT INTO graphic_items (id, section, src_path, alt, title, year, detail, href, href_label, tags, fit, related_src_path, sort_order, published, src_asset_id, related_asset_id, gallery_paths, brand_id)
SELECT id, section, src_path, alt, title, year, detail, href, href_label, tags, fit, related_src_path, sort_order, published, src_asset_id, related_asset_id, gallery_paths, brand_id
FROM ${SOURCE_DB}.graphic_items`,
  },
  {
    label: "brand_manuals",
    sql: `INSERT INTO brand_manuals (id, cover_path, pdf_path, title, year, meta, sort_order, published, brand_id)
SELECT id, cover_path, pdf_path, title, year, meta, sort_order, published, brand_id
FROM ${SOURCE_DB}.brand_manuals`,
  },
  {
    label: "ui_projects",
    sql: `INSERT INTO ui_projects (id, category, title, meta, images, prototype_url, sort_order, published, summary, client, period, duration, cta_kind, brand_id)
SELECT id, category, title, meta, images, prototype_url, sort_order, published, summary, client, period, duration, cta_kind, brand_id
FROM ${SOURCE_DB}.ui_projects`,
  },
  {
    label: "ui_list_items",
    sql: `INSERT INTO ui_list_items (id, title, logo_path, caption, wordmark, sort_order, published)
SELECT id, title, logo_path, caption, wordmark, sort_order, published
FROM ${SOURCE_DB}.ui_list_items`,
  },
  {
    label: "testimonials",
    sql: `INSERT INTO testimonials (id, name, image_path, quote, role, company_name, company_logo_path, company_href, link_label, hidden, sort_order, company_brand_id)
SELECT id, name, image_path, quote, role, company_name, company_logo_path, company_href, link_label, hidden, sort_order, company_brand_id
FROM ${SOURCE_DB}.testimonials`,
  },
  {
    label: "named_list_items",
    sql: `INSERT INTO named_list_items (id, kind, label, sort_order, published, logo_path, created_at, brand_id)
SELECT id, kind, label, sort_order, published, logo_path, created_at, brand_id
FROM ${SOURCE_DB}.named_list_items`,
  },
  {
    label: "admin_audit_logs",
    sql: `INSERT INTO admin_audit_logs (id, user_id, username, action, entity_type, entity_id, summary, before_json, after_json, undoable, undone_at, created_at)
SELECT id, user_id, username, action, entity_type, entity_id, summary, before_json, after_json, undoable, undone_at, created_at
FROM ${SOURCE_DB}.admin_audit_logs`,
  },
];

async function countTable(qr: QueryRunner, table: string): Promise<number> {
  const rows = (await qr.query(
    `SELECT COUNT(*) AS c FROM \`${table}\``,
  )) as Array<{ c: number | string }>;
  return Number(rows[0]?.c ?? 0);
}

async function countTables(
  qr: QueryRunner,
  tables: readonly string[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const table of tables) {
    counts[table] = await countTable(qr, table);
  }
  return counts;
}

function assertTablesEmpty(
  counts: Record<string, number>,
  tables: readonly string[],
): void {
  const nonEmpty: string[] = [];
  for (const table of tables) {
    if ((counts[table] ?? 0) !== 0) {
      nonEmpty.push(`${table}: ${counts[table]}`);
    }
  }
  if (nonEmpty.length) {
    throw new Error(
      `Pre-restore check failed — target tables must be empty:\n` +
        nonEmpty.map((m) => `  - ${m}`).join("\n"),
    );
  }
}

function verifyExpectedCounts(counts: Record<string, number>): string[] {
  const mismatches: string[] = [];
  for (const [table, expected] of Object.entries(EXPECTED_COUNTS)) {
    const actual = counts[table] ?? 0;
    if (actual !== expected) {
      mismatches.push(`${table}: expected ${expected}, found ${actual}`);
    }
  }
  return mismatches;
}

function printDryRunPlan(): void {
  console.log("[restore-legacy] DRY PLAN (no writes — RESTORE_LEGACY_APPROVED not set)\n");
  console.log(`Source: ${SOURCE_DB}`);
  console.log("Target: portfolio (current DATABASE_NAME / DATABASE_URL)\n");
  console.log("Pre-check: 8 target tables must be COUNT=0");
  for (const t of TARGET_EMPTY_TABLES) console.log(`  - ${t}`);
  console.log("\nInserts (in order, INSERT…SELECT, no TRUNCATE/DELETE):");
  for (const step of INSERT_STEPS) console.log(`  ${step.label}`);
  console.log("\nPost-insert verification (within transaction, then commit OR rollback):");
  for (const [table, n] of Object.entries(EXPECTED_COUNTS)) {
    console.log(`  ${table}: ${n}`);
  }
  console.log("\nTo execute: RESTORE_LEGACY_APPROVED=1 npx tsx scripts/restore-legacy-from-test.ts");
}

export async function main(): Promise<void> {
  if (process.env.RESTORE_LEGACY_APPROVED !== "1") {
    printDryRunPlan();
    process.exitCode = 1;
    return;
  }

  const ds = createDataSource(false);
  await ds.initialize();
  const qr = ds.createQueryRunner();
  await qr.connect();

  let committed = false;

  try {
    console.log("[restore-legacy] Starting transaction…");
    await qr.startTransaction();

    console.log("[restore-legacy] Pre-check: target tables must be empty…");
    const preCounts = await countTables(qr, TARGET_EMPTY_TABLES);
    console.log(preCounts);
    assertTablesEmpty(preCounts, TARGET_EMPTY_TABLES);

    for (const step of INSERT_STEPS) {
      console.log(`[restore-legacy] Inserting ${step.label}…`);
      await qr.query(step.sql);
    }

    console.log("[restore-legacy] Verifying counts within transaction…");
    const verifyTables = Object.keys(EXPECTED_COUNTS);
    const postCounts = await countTables(qr, verifyTables);
    console.log(postCounts);

    const mismatches = verifyExpectedCounts(postCounts);
    if (mismatches.length) {
      throw new Error(
        "Post-insert count verification failed:\n" +
          mismatches.map((m) => `  - ${m}`).join("\n"),
      );
    }

    await qr.commitTransaction();
    committed = true;
    console.log("\n[restore-legacy] COMMIT successful.");
    console.log("[restore-legacy] portfolio_restore_test preserved for validation.");
  } catch (err) {
    if (qr.isTransactionActive) {
      console.error("\n[restore-legacy] ROLLBACK — transaction reverted.");
      await qr.rollbackTransaction();
    }
    console.error("[restore-legacy] FAILED:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await qr.release();
    await ds.destroy();
    if (!committed && process.env.RESTORE_LEGACY_APPROVED === "1") {
      console.error("[restore-legacy] No COMMIT was issued.");
    }
  }
}

if (isDirectScriptRun(["restore-legacy-from-test.ts"])) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
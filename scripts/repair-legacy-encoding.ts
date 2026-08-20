/**
 * Guarded legacy encoding repair — writes only with ENCODING_REPAIR_APPROVED=1.
 * Usage (dry): npx tsx scripts/repair-legacy-encoding.ts
 * Usage (apply): ENCODING_REPAIR_APPROVED=1 npx tsx scripts/repair-legacy-encoding.ts
 */
import { config as loadEnv } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { QueryRunner } from "typeorm";
import { createDataSource, portfolioLegacyEntities } from "../src/db/data-source";
import {
  assertLegacyBaseline,
  assertV2Empty,
  countTables,
  LEGACY_TABLES,
  V2_TABLES,
  type TableCounts,
} from "./migrate-v2/safety";
import {
  getJsonLeaf,
  setJsonLeaf,
  type EncodingRepairEntry,
  type EncodingRepairPlan,
} from "./migrate-v2/encoding-repair";
import { isDirectScriptRun } from "./sync-schema";

loadEnv({ path: resolve(process.cwd(), ".env") });

const PLAN_PATH = resolve(process.cwd(), "reports", "content-v2-encoding-repair-plan.json");

/** Columns that must not change on rows touched by the repair. */
const FORBIDDEN_COLUMNS: Record<string, string[]> = {
  brands: [
    "logo_path",
    "logo_asset_id",
    "href",
    "sort_order",
    "published",
    "created_at",
  ],
  graphic_items: [
    "section",
    "src_path",
    "src_asset_id",
    "year",
    "href",
    "fit",
    "related_src_path",
    "related_asset_id",
    "gallery_paths",
    "brand_id",
    "tags",
    "sort_order",
    "published",
  ],
  ui_projects: [
    "category",
    "images",
    "prototype_url",
    "client",
    "period",
    "cta_kind",
    "brand_id",
    "sort_order",
    "published",
  ],
  brand_manuals: [
    "cover_path",
    "pdf_path",
    "year",
    "brand_id",
    "sort_order",
    "published",
  ],
  testimonials: [
    "image_path",
    "company_logo_path",
    "company_href",
    "company_brand_id",
    "entity_id",
    "link_label",
    "hidden",
    "sort_order",
  ],
  named_list_items: [
    "kind",
    "logo_path",
    "brand_id",
    "sort_order",
    "published",
    "created_at",
  ],
};

function loadPlan(path = PLAN_PATH): EncodingRepairPlan {
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw) as EncodingRepairPlan;
}

function printPlanSummary(plan: EncodingRepairPlan): void {
  console.log("Encoding repair plan (read-only preview):");
  console.log(`  path: ${PLAN_PATH}`);
  console.log(`  generatedAt: ${plan.generatedAt}`);
  console.log(`  total repairs: ${plan.summary.total}`);
  console.log(`  scalar leaves: ${plan.summary.scalarLeaves}`);
  console.log(`  JSON leaves: ${plan.summary.jsonLeaves}`);
  console.log("");
  console.log("  by table:");
  for (const [table, count] of Object.entries(plan.summary.byTable).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    console.log(`    ${table}: ${count}`);
  }
  console.log("");
  console.log("Set ENCODING_REPAIR_APPROVED=1 to apply repairs (after backup).");
}

function rowKey(table: string, id: string): string {
  return `${table}:${id}`;
}

function stableValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

async function fetchRow(
  qr: QueryRunner,
  table: string,
  id: string,
): Promise<Record<string, unknown> | null> {
  const idColumn = table === "named_list_items" ? "id" : "id";
  const idParam = table === "named_list_items" ? Number(id) : id;
  const rows = (await qr.query(`SELECT * FROM \`${table}\` WHERE \`${idColumn}\` = ? LIMIT 1`, [
    idParam,
  ])) as Array<Record<string, unknown>>;
  return rows[0] ?? null;
}

function parseJsonColumn(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string") {
    return JSON.parse(value) as Record<string, unknown>;
  }
  throw new Error("[repair] Expected JSON column value");
}

function readLeaf(row: Record<string, unknown>, entry: EncodingRepairEntry): string {
  const raw = entry.jsonPath
    ? getJsonLeaf(parseJsonColumn(row[entry.column]), entry.jsonPath)
    : row[entry.column];
  if (raw === null || raw === undefined) return "";
  if (typeof raw !== "string") {
    throw new Error(
      `[repair] Expected string leaf ${entry.table}/${entry.id}/${entry.column}${entry.jsonPath ? `.${entry.jsonPath}` : ""}, got ${typeof raw}`,
    );
  }
  return raw;
}

async function snapshotForbiddenColumns(
  qr: QueryRunner,
  repairs: EncodingRepairEntry[],
): Promise<Map<string, Record<string, string>>> {
  const touched = new Map<string, EncodingRepairEntry[]>();
  for (const entry of repairs) {
    const key = rowKey(entry.table, entry.id);
    const list = touched.get(key) ?? [];
    list.push(entry);
    touched.set(key, list);
  }

  const snapshots = new Map<string, Record<string, string>>();
  for (const [key, entries] of touched) {
    const { table, id } = entries[0]!;
    const row = await fetchRow(qr, table, id);
    if (!row) throw new Error(`[repair] Row missing for snapshot: ${key}`);
    const forbidden = FORBIDDEN_COLUMNS[table] ?? [];
    const snap: Record<string, string> = {};
    for (const col of forbidden) {
      snap[col] = stableValue(row[col]);
    }
    snapshots.set(key, snap);
  }
  return snapshots;
}

async function verifyForbiddenUnchanged(
  qr: QueryRunner,
  repairs: EncodingRepairEntry[],
  before: Map<string, Record<string, string>>,
): Promise<void> {
  const seen = new Set<string>();
  for (const entry of repairs) {
    const key = rowKey(entry.table, entry.id);
    if (seen.has(key)) continue;
    seen.add(key);

    const row = await fetchRow(qr, entry.table, entry.id);
    if (!row) throw new Error(`[repair] Row missing after update: ${key}`);

    const expected = before.get(key);
    if (!expected) throw new Error(`[repair] Missing forbidden snapshot for ${key}`);

    for (const [col, prev] of Object.entries(expected)) {
      const now = stableValue(row[col]);
      if (now !== prev) {
        throw new Error(
          `[repair] Forbidden column changed on ${key}: ${col} was ${JSON.stringify(prev)}, now ${JSON.stringify(now)}`,
        );
      }
    }
  }
}

async function applyRepair(qr: QueryRunner, entry: EncodingRepairEntry): Promise<void> {
  const row = await fetchRow(qr, entry.table, entry.id);
  if (!row) {
    throw new Error(`[repair] Row not found: ${entry.table} id=${entry.id}`);
  }

  const current = readLeaf(row, entry);
  if (current !== entry.currentValueExpected) {
    throw new Error(
      `[repair] Precondition failed ${entry.table}/${entry.id}/${entry.column}${entry.jsonPath ? `.${entry.jsonPath}` : ""}: expected ${JSON.stringify(entry.currentValueExpected)}, found ${JSON.stringify(current)}`,
    );
  }

  if (entry.jsonPath) {
    const patched = setJsonLeaf(parseJsonColumn(row[entry.column]), entry.jsonPath, entry.replacementValue);
    const idParam = entry.table === "named_list_items" ? Number(entry.id) : entry.id;
    await qr.query(`UPDATE \`${entry.table}\` SET \`${entry.column}\` = ? WHERE id = ?`, [
      JSON.stringify(patched),
      idParam,
    ]);
  } else {
    const idParam = entry.table === "named_list_items" ? Number(entry.id) : entry.id;
    await qr.query(`UPDATE \`${entry.table}\` SET \`${entry.column}\` = ? WHERE id = ?`, [
      entry.replacementValue,
      idParam,
    ]);
  }
}

async function verifyReplacements(qr: QueryRunner, repairs: EncodingRepairEntry[]): Promise<void> {
  for (const entry of repairs) {
    const row = await fetchRow(qr, entry.table, entry.id);
    if (!row) throw new Error(`[repair] Row missing on verify: ${entry.table}/${entry.id}`);
    const actual = readLeaf(row, entry);
    if (actual !== entry.replacementValue) {
      throw new Error(
        `[repair] Post-update mismatch ${entry.table}/${entry.id}/${entry.column}${entry.jsonPath ? `.${entry.jsonPath}` : ""}: expected ${JSON.stringify(entry.replacementValue)}, got ${JSON.stringify(actual)}`,
      );
    }
  }
}

export async function main(): Promise<number> {
  const approved = process.env.ENCODING_REPAIR_APPROVED === "1";
  const plan = loadPlan();

  if (!approved) {
    printPlanSummary(plan);
    return 1;
  }

  const ds = createDataSource(false, portfolioLegacyEntities);
  await ds.initialize();

  const qr = ds.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  let countsBefore: TableCounts | null = null;

  try {
    countsBefore = await countTables(ds, [...LEGACY_TABLES, ...V2_TABLES]);
    assertLegacyBaseline(countsBefore);
    assertV2Empty(countsBefore);

    const forbiddenBefore = await snapshotForbiddenColumns(qr, plan.repairs);

    for (const entry of plan.repairs) {
      await applyRepair(qr, entry);
    }

    await verifyReplacements(qr, plan.repairs);
    await verifyForbiddenUnchanged(qr, plan.repairs, forbiddenBefore);

    const countsAfter = await countTables(ds, [...LEGACY_TABLES, ...V2_TABLES]);
    assertLegacyBaseline(countsAfter);
    assertV2Empty(countsAfter);

    for (const table of LEGACY_TABLES) {
      if ((countsBefore[table] ?? 0) !== (countsAfter[table] ?? 0)) {
        throw new Error(
          `[repair] Legacy row count changed for ${table}: before=${countsBefore[table]}, after=${countsAfter[table]}`,
        );
      }
    }

    await qr.commitTransaction();
    console.log(`Applied ${plan.repairs.length} encoding repairs successfully.`);
    return 0;
  } catch (err) {
    await qr.rollbackTransaction();
    throw err;
  } finally {
    await qr.release();
    await ds.destroy();
  }
}

if (isDirectScriptRun(["repair-legacy-encoding.ts"], import.meta.url)) {
  main()
    .then((code) => process.exit(code))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

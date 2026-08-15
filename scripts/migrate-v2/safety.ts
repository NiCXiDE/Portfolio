import type { DataSource } from "typeorm";

export const LEGACY_TABLES = [
  "graphic_items",
  "ui_projects",
  "brands",
  "brand_manuals",
  "testimonials",
  "named_list_items",
  "tags",
  "ui_list_items",
] as const;

export const V2_TABLES = [
  "entities",
  "projects",
  "project_areas",
  "project_roles",
  "project_entities",
  "pieces",
  "piece_entities",
  "piece_resources",
  "project_resources",
  "piece_tags",
  "migration_map",
] as const;

export type TableCounts = Record<string, number>;

export async function countTables(
  ds: DataSource,
  tables: readonly string[],
): Promise<TableCounts> {
  const counts: TableCounts = {};
  for (const table of tables) {
    const rows = (await ds.query(
      `SELECT COUNT(*) AS c FROM \`${table}\``,
    )) as Array<{ c: number | string }>;
    counts[table] = Number(rows[0]?.c ?? 0);
  }
  return counts;
}

export function countsEqual(a: TableCounts, b: TableCounts): boolean {
  for (const key of Object.keys(a)) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export function assertV2Empty(counts: TableCounts): void {
  for (const table of V2_TABLES) {
    if ((counts[table] ?? 0) !== 0) {
      throw new Error(
        `[safety] V2 table "${table}" must be empty before dry-run (found ${counts[table]}).`,
      );
    }
  }
}

/** Expected legacy row counts after backup baseline (pre-migration).
 *  testimonials: count is NOT exact — validated via CANONICAL_TESTIMONIAL_IDS. */
export const LEGACY_BASELINE: TableCounts = {
  graphic_items: 47,
  ui_projects: 13,
  brands: 7,
  brand_manuals: 1,
  named_list_items: 40,
  tags: 9,
  ui_list_items: 8,
};

/** Canonical testimonials required for migration (extra rows allowed). */
export const CANONICAL_TESTIMONIAL_IDS = [
  "facundo",
  "ezequiel",
  "joaquin",
  "matias",
] as const;

export function assertLegacyBaseline(counts: TableCounts): void {
  const mismatches: string[] = [];
  for (const [table, expected] of Object.entries(LEGACY_BASELINE)) {
    const actual = counts[table] ?? 0;
    if (actual !== expected) {
      mismatches.push(`${table}: expected ${expected}, found ${actual}`);
    }
  }
  if (mismatches.length) {
    throw new Error(
      "[safety] Legacy baseline mismatch in MySQL — dry-run aborted.\n" +
        mismatches.map((m) => `  - ${m}`).join("\n") +
        "\nRestore legacy data before running dry-run. " +
        "Use --compare-fixtures to compare against content JSON without using fixtures as input.",
    );
  }
}

/** Ensures the 4 approved testimonials exist; additional rows are ignored. */
export async function assertCanonicalTestimonials(ds: DataSource): Promise<void> {
  const rows = (await ds.query(
    `SELECT id FROM testimonials WHERE id IN (?, ?, ?, ?)`,
    [...CANONICAL_TESTIMONIAL_IDS],
  )) as Array<{ id: string }>;
  const found = new Set(rows.map((r) => r.id));
  const missing = CANONICAL_TESTIMONIAL_IDS.filter((id) => !found.has(id));
  if (missing.length) {
    throw new Error(
      "[safety] Missing canonical testimonials — aborted.\n" +
        missing.map((id) => `  - ${id}`).join("\n"),
    );
  }
}

export const RESTORE_ITERATION_EMPTY_TABLES = [
  "admin_audit_log",
  "graphic_items",
  "brand_manuals",
  "ui_projects",
  "ui_list_items",
  "testimonials",
  "named_list_items",
  "brands",
] as const;

export function assertTablesEmpty(
  counts: TableCounts,
  tables: readonly string[],
  context: string,
): void {
  const nonEmpty: string[] = [];
  for (const table of tables) {
    const n = counts[table] ?? 0;
    if (n !== 0) nonEmpty.push(`${table}: ${n}`);
  }
  if (nonEmpty.length) {
    throw new Error(
      `[safety] ${context} — expected empty tables, found rows:\n` +
        nonEmpty.map((m) => `  - ${m}`).join("\n"),
    );
  }
}

export function formatCounts(counts: TableCounts): string {
  return Object.entries(counts)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join("\n");
}

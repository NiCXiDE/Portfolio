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

export function formatCounts(counts: TableCounts): string {
  return Object.entries(counts)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join("\n");
}

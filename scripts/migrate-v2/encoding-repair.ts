import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import type { DataSource } from "typeorm";
import type { LocalizedJson } from "../../src/db/entities";
import { loadLegacySnapshot } from "./load-legacy";
import { loadLegacyFromFixtures } from "./load-fixtures";
import type { LegacySnapshot } from "./types";

export type EncodingRepairEntry = {
  table: string;
  id: string;
  column: string;
  jsonPath: string | null;
  currentValueExpected: string;
  currentHex: string | null;
  replacementValue: string;
  source: "fixtures";
  confidence: "high";
};

export type EncodingRepairPlan = {
  generatedAt: string;
  repairs: EncodingRepairEntry[];
  summary: {
    total: number;
    byTable: Record<string, number>;
    byColumn: Record<string, number>;
    scalarLeaves: number;
    jsonLeaves: number;
  };
};

type ScalarFieldSpec = { column: string; get: (row: Record<string, unknown>) => unknown };

type JsonFieldSpec = {
  column: string;
  get: (row: Record<string, unknown>) => LocalizedJson | null | undefined;
  paths: Array<keyof LocalizedJson>;
};

type TableSpec = {
  table: string;
  entityKey: keyof LegacySnapshot;
  getId: (row: Record<string, unknown>) => string;
  scalars?: ScalarFieldSpec[];
  jsonFields?: JsonFieldSpec[];
};

const TABLE_SPECS: TableSpec[] = [
  {
    table: "brands",
    entityKey: "brands",
    getId: (r) => String(r.id),
    scalars: [{ column: "name", get: (r) => r.name }],
  },
  {
    table: "graphic_items",
    entityKey: "graphicItems",
    getId: (r) => String(r.id),
    scalars: [{ column: "alt", get: (r) => r.alt }],
    jsonFields: [
      { column: "title", get: (r) => r.title as LocalizedJson | null, paths: ["es", "en"] },
      { column: "detail", get: (r) => r.detail as LocalizedJson | null, paths: ["es", "en"] },
      {
        column: "href_label",
        get: (r) => r.hrefLabel as LocalizedJson | null,
        paths: ["es", "en"],
      },
    ],
  },
  {
    table: "ui_projects",
    entityKey: "uiProjects",
    getId: (r) => String(r.id),
    jsonFields: [
      { column: "title", get: (r) => r.title as LocalizedJson, paths: ["es", "en"] },
      { column: "meta", get: (r) => r.meta as LocalizedJson, paths: ["es", "en"] },
      { column: "summary", get: (r) => r.summary as LocalizedJson | null, paths: ["es", "en"] },
      { column: "duration", get: (r) => r.duration as LocalizedJson | null, paths: ["es", "en"] },
    ],
  },
  {
    table: "brand_manuals",
    entityKey: "brandManuals",
    getId: (r) => String(r.id),
    jsonFields: [
      { column: "title", get: (r) => r.title as LocalizedJson, paths: ["es", "en"] },
      { column: "meta", get: (r) => r.meta as LocalizedJson | null, paths: ["es", "en"] },
    ],
  },
  {
    table: "testimonials",
    entityKey: "testimonials",
    getId: (r) => String(r.id),
    scalars: [
      { column: "name", get: (r) => r.name },
      { column: "company_name", get: (r) => r.companyName },
    ],
    jsonFields: [
      { column: "quote", get: (r) => r.quote as LocalizedJson, paths: ["es", "en"] },
      { column: "role", get: (r) => r.role as LocalizedJson, paths: ["es", "en"] },
    ],
  },
  {
    table: "named_list_items",
    entityKey: "namedListItems",
    getId: (r) => String(r.id),
    scalars: [{ column: "label", get: (r) => r.label }],
  },
];

/** True when mysql value differs from fixture only due to UTF-8 → latin1 corruption. */
export function isEncodingCorruption(mysqlValue: string, fixtureValue: string): boolean {
  if (mysqlValue === fixtureValue) return false;
  if (!mysqlValue.includes("?")) return false;

  let i = 0;
  let j = 0;
  while (i < mysqlValue.length && j < fixtureValue.length) {
    const mc = mysqlValue[i]!;
    const fc = fixtureValue[j]!;

    if (mc === fc) {
      i++;
      j++;
      continue;
    }

    if (mysqlValue.startsWith("???", i) && fc === "—") {
      i += 3;
      j++;
      continue;
    }

    if (mysqlValue.startsWith("??", i) && fc === "·") {
      i += 2;
      j++;
      continue;
    }

    if (mysqlValue.startsWith("??", i) && fc.charCodeAt(0) > 127) {
      i += 2;
      j++;
      continue;
    }

    if (mc === "?" && fc.charCodeAt(0) > 127) {
      i++;
      j++;
      continue;
    }

    if (mc === "?" && fc === "?") {
      i++;
      j++;
      continue;
    }

    return false;
  }

  while (i < mysqlValue.length) {
    if (mysqlValue.startsWith("???", i)) {
      i += 3;
      continue;
    }
    if (mysqlValue.startsWith("??", i)) {
      i += 2;
      continue;
    }
    if (mysqlValue[i] === "?") {
      i++;
      continue;
    }
    return false;
  }

  return j >= fixtureValue.length;
}

function stringLeaf(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  return value;
}

function buildRepairEntry(
  table: string,
  id: string,
  column: string,
  jsonPath: string | null,
  mysqlValue: string,
  fixtureValue: string,
  currentHex: string | null,
): EncodingRepairEntry {
  return {
    table,
    id,
    column,
    jsonPath,
    currentValueExpected: mysqlValue,
    currentHex,
    replacementValue: fixtureValue,
    source: "fixtures",
    confidence: "high",
  };
}

async function fetchScalarHex(
  ds: DataSource,
  table: string,
  column: string,
  id: string,
): Promise<string | null> {
  const rows = (await ds.query(
    `SELECT HEX(\`${column}\`) AS hex_value FROM \`${table}\` WHERE id = ? LIMIT 1`,
    [id],
  )) as Array<{ hex_value: string | null }>;
  const hex = rows[0]?.hex_value;
  return hex ? String(hex).toUpperCase() : null;
}

async function fetchJsonLeafHex(
  ds: DataSource,
  table: string,
  column: string,
  id: string,
  jsonPath: string,
): Promise<string | null> {
  const jsonPathExpr = `$.${jsonPath}`;
  const rows = (await ds.query(
    `SELECT HEX(JSON_UNQUOTE(JSON_EXTRACT(\`${column}\`, ?))) AS hex_value
     FROM \`${table}\` WHERE id = ? LIMIT 1`,
    [jsonPathExpr, id],
  )) as Array<{ hex_value: string | null }>;
  const hex = rows[0]?.hex_value;
  return hex ? String(hex).toUpperCase() : null;
}

function indexById<T extends Record<string, unknown>>(
  rows: T[],
  getId: (row: T) => string,
): Map<string, T> {
  const map = new Map<string, T>();
  for (const row of rows) map.set(getId(row), row);
  return map;
}

function indexNamedListById(rows: Array<Record<string, unknown>>): Map<string, Record<string, unknown>> {
  const map = new Map<string, Record<string, unknown>>();
  for (const row of rows) map.set(String(row.id), row);
  return map;
}

export async function buildEncodingRepairPlan(ds: DataSource): Promise<EncodingRepairPlan> {
  const db = await loadLegacySnapshot(ds);
  const fixtures = loadLegacyFromFixtures();
  const repairs: EncodingRepairEntry[] = [];

  for (const spec of TABLE_SPECS) {
    const dbRows = db[spec.entityKey] as Array<Record<string, unknown>>;
    const fixtureRows = fixtures[spec.entityKey] as Array<Record<string, unknown>>;

    const dbMap =
      spec.table === "named_list_items"
        ? indexNamedListById(dbRows)
        : indexById(dbRows, spec.getId);
    const fixtureMap =
      spec.table === "named_list_items"
        ? indexNamedListById(fixtureRows)
        : indexById(fixtureRows, spec.getId);

    for (const [id, dbRow] of dbMap) {
      const fixtureRow = fixtureMap.get(id);
      if (!fixtureRow) continue;

      for (const scalar of spec.scalars ?? []) {
        const mysqlValue = stringLeaf(scalar.get(dbRow));
        const fixtureValue = stringLeaf(scalar.get(fixtureRow));
        if (mysqlValue === null || fixtureValue === null) continue;
        if (!isEncodingCorruption(mysqlValue, fixtureValue)) continue;

        const currentHex = await fetchScalarHex(ds, spec.table, scalar.column, id);
        repairs.push(
          buildRepairEntry(spec.table, id, scalar.column, null, mysqlValue, fixtureValue, currentHex),
        );
      }

      for (const jsonField of spec.jsonFields ?? []) {
        const mysqlObj = jsonField.get(dbRow);
        const fixtureObj = jsonField.get(fixtureRow);
        if (!mysqlObj || !fixtureObj) continue;

        for (const path of jsonField.paths) {
          const mysqlValue = stringLeaf(mysqlObj[path]);
          const fixtureValue = stringLeaf(fixtureObj[path]);
          if (mysqlValue === null || fixtureValue === null) continue;
          if (!isEncodingCorruption(mysqlValue, fixtureValue)) continue;

          const currentHex = await fetchJsonLeafHex(ds, spec.table, jsonField.column, id, path);
          repairs.push(
            buildRepairEntry(
              spec.table,
              id,
              jsonField.column,
              path,
              mysqlValue,
              fixtureValue,
              currentHex,
            ),
          );
        }
      }
    }
  }

  repairs.sort((a, b) => {
    const ta = `${a.table}\0${a.id}\0${a.column}\0${a.jsonPath ?? ""}`;
    const tb = `${b.table}\0${b.id}\0${b.column}\0${b.jsonPath ?? ""}`;
    return ta.localeCompare(tb);
  });

  const byTable: Record<string, number> = {};
  const byColumn: Record<string, number> = {};
  let scalarLeaves = 0;
  let jsonLeaves = 0;

  for (const r of repairs) {
    byTable[r.table] = (byTable[r.table] ?? 0) + 1;
    const colKey = `${r.table}.${r.column}`;
    byColumn[colKey] = (byColumn[colKey] ?? 0) + 1;
    if (r.jsonPath) jsonLeaves++;
    else scalarLeaves++;
  }

  return {
    generatedAt: new Date().toISOString(),
    repairs,
    summary: {
      total: repairs.length,
      byTable,
      byColumn,
      scalarLeaves,
      jsonLeaves,
    },
  };
}

export function renderEncodingRepairMarkdown(plan: EncodingRepairPlan): string {
  const lines: string[] = [];
  lines.push("# Content v2 encoding repair plan");
  lines.push("");
  lines.push(`Generated: ${plan.generatedAt}`);
  lines.push("");
  lines.push("Machine-readable plan: [`content-v2-encoding-repair-plan.json`](./content-v2-encoding-repair-plan.json)");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Total repairs:** ${plan.summary.total}`);
  lines.push(`- **Scalar leaves:** ${plan.summary.scalarLeaves}`);
  lines.push(`- **JSON leaves:** ${plan.summary.jsonLeaves}`);
  lines.push("");
  lines.push("### By table");
  lines.push("");
  for (const [table, count] of Object.entries(plan.summary.byTable).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    lines.push(`- \`${table}\`: ${count}`);
  }
  lines.push("");
  lines.push("### By column");
  lines.push("");
  for (const [column, count] of Object.entries(plan.summary.byColumn).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    lines.push(`- \`${column}\`: ${count}`);
  }
  lines.push("");
  lines.push("## Notes");
  lines.push("");
  lines.push("- Each JSON object field is repaired **per leaf** (`es`, `en`), not as a whole-column replace.");
  lines.push("- Apply with `ENCODING_REPAIR_APPROVED=1 npx tsx scripts/repair-legacy-encoding.ts` after backup.");
  lines.push("- Do **not** run the repair script without explicit approval and a fresh MySQL dump.");
  lines.push("");
  return lines.join("\n");
}

export function writeEncodingRepairPlan(
  plan: EncodingRepairPlan,
  outDir = resolve(process.cwd(), "reports"),
): { jsonPath: string; mdPath: string } {
  mkdirSync(outDir, { recursive: true });
  const jsonPath = resolve(outDir, "content-v2-encoding-repair-plan.json");
  const mdPath = resolve(outDir, "content-v2-encoding-repair-plan.md");
  writeFileSync(jsonPath, JSON.stringify(plan, null, 2), "utf8");
  writeFileSync(mdPath, renderEncodingRepairMarkdown(plan), "utf8");
  return { jsonPath, mdPath };
}

export function getJsonLeaf(obj: Record<string, unknown>, jsonPath: string): unknown {
  const parts = jsonPath.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur === null || cur === undefined || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

export function setJsonLeaf(
  obj: Record<string, unknown>,
  jsonPath: string,
  value: string,
): Record<string, unknown> {
  const parts = jsonPath.split(".");
  const root = { ...obj };
  let cur: Record<string, unknown> = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!;
    const next = cur[part];
    const clone =
      next && typeof next === "object" && !Array.isArray(next)
        ? { ...(next as Record<string, unknown>) }
        : {};
    cur[part] = clone;
    cur = clone;
  }
  cur[parts[parts.length - 1]!] = value;
  return root;
}

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { LegacySnapshot } from "./types";

export type FieldDiffEntry = {
  id: string;
  changedFields: string[];
  details: Record<string, { mysql: unknown; fixtures: unknown }>;
};

export type TableDriftSummary = {
  table: string;
  mysqlCount: number;
  fixturesCount: number;
  identicalCount: number;
  onlyInMysql: string[];
  onlyInFixtures: string[];
  fieldDiffs: FieldDiffEntry[];
};

export type FixtureDriftReport = {
  generatedAt: string;
  tables: TableDriftSummary[];
};

const LIST_CAP = 50;

function normalize(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      out[key] = normalize(obj[key]);
    }
    return out;
  }
  return value;
}

function stableJson(value: unknown): string {
  return JSON.stringify(normalize(value));
}

function compareFields(
  id: string,
  mysqlRow: Record<string, unknown>,
  fixtureRow: Record<string, unknown>,
  fieldNames: string[],
): FieldDiffEntry | null {
  const changedFields: string[] = [];
  const details: Record<string, { mysql: unknown; fixtures: unknown }> = {};
  for (const field of fieldNames) {
    const mVal = normalize(mysqlRow[field]);
    const fVal = normalize(fixtureRow[field]);
    if (stableJson(mVal) !== stableJson(fVal)) {
      changedFields.push(field);
      details[field] = { mysql: mVal, fixtures: fVal };
    }
  }
  if (changedFields.length === 0) return null;
  return { id, changedFields, details };
}

function compareTable<K extends string>(
  table: string,
  dbItems: Array<Record<string, unknown>>,
  fixtureItems: Array<Record<string, unknown>>,
  getKey: (item: Record<string, unknown>) => K,
  fields: string[],
): TableDriftSummary {
  const dbMap = new Map<K, Record<string, unknown>>();
  const fixMap = new Map<K, Record<string, unknown>>();
  for (const item of dbItems) dbMap.set(getKey(item), item);
  for (const item of fixtureItems) fixMap.set(getKey(item), item);

  const allKeys = new Set([...dbMap.keys(), ...fixMap.keys()]);
  const onlyInMysql: string[] = [];
  const onlyInFixtures: string[] = [];
  const fieldDiffs: FieldDiffEntry[] = [];
  let identicalCount = 0;

  for (const key of allKeys) {
    const keyStr = String(key);
    const dbItem = dbMap.get(key);
    const fixItem = fixMap.get(key);
    if (dbItem && !fixItem) {
      onlyInMysql.push(keyStr);
    } else if (!dbItem && fixItem) {
      onlyInFixtures.push(keyStr);
    } else if (dbItem && fixItem) {
      const diff = compareFields(keyStr, dbItem, fixItem, fields);
      if (diff) fieldDiffs.push(diff);
      else identicalCount++;
    }
  }

  onlyInMysql.sort();
  onlyInFixtures.sort();
  fieldDiffs.sort((a, b) => a.id.localeCompare(b.id));

  return {
    table,
    mysqlCount: dbItems.length,
    fixturesCount: fixtureItems.length,
    identicalCount,
    onlyInMysql,
    onlyInFixtures,
    fieldDiffs,
  };
}

function asRecords<T extends object>(items: T[]): Array<Record<string, unknown>> {
  return items as Array<Record<string, unknown>>;
}

export function compareLegacySnapshots(
  db: LegacySnapshot,
  fixtures: LegacySnapshot,
): FixtureDriftReport {
  return {
    generatedAt: new Date().toISOString(),
    tables: [
      compareTable(
        "brands",
        asRecords(db.brands),
        asRecords(fixtures.brands),
        (r) => String(r.id),
        ["name", "logoPath", "href", "sortOrder", "published"],
      ),
      compareTable(
        "graphicItems",
        asRecords(db.graphicItems),
        asRecords(fixtures.graphicItems),
        (r) => String(r.id),
        [
          "brandId",
          "tags",
          "galleryPaths",
          "published",
          "sortOrder",
          "title",
          "alt",
          "detail",
          "srcPath",
          "href",
          "section",
          "year",
          "fit",
          "relatedSrcPath",
          "hrefLabel",
        ],
      ),
      compareTable(
        "uiProjects",
        asRecords(db.uiProjects),
        asRecords(fixtures.uiProjects),
        (r) => String(r.id),
        [
          "brandId",
          "images",
          "published",
          "sortOrder",
          "title",
          "meta",
          "category",
          "client",
          "summary",
          "period",
          "duration",
          "prototypeUrl",
          "ctaKind",
        ],
      ),
      compareTable(
        "brandManuals",
        asRecords(db.brandManuals),
        asRecords(fixtures.brandManuals),
        (r) => String(r.id),
        [
          "brandId",
          "published",
          "sortOrder",
          "title",
          "meta",
          "coverPath",
          "pdfPath",
          "year",
        ],
      ),
      compareTable(
        "testimonials",
        asRecords(db.testimonials),
        asRecords(fixtures.testimonials),
        (r) => String(r.id),
        [
          "companyBrandId",
          "hidden",
          "sortOrder",
          "name",
          "quote",
          "role",
          "imagePath",
          "companyName",
          "companyLogoPath",
          "companyHref",
          "linkLabel",
          "entityId",
        ],
      ),
      compareTable(
        "namedListItems",
        asRecords(db.namedListItems),
        asRecords(fixtures.namedListItems),
        (r) => `${String(r.kind)}|${String(r.label)}|${String(r.sortOrder)}`,
        ["brandId", "published", "sortOrder", "label", "kind", "logoPath"],
      ),
      compareTable(
        "tags",
        asRecords(db.tags),
        asRecords(fixtures.tags),
        (r) => String(r.slug),
        ["labelEs", "labelEn", "isNsfw", "sortOrder"],
      ),
    ],
  };
}

function capList<T>(items: T[]): { shown: T[]; more: number } {
  if (items.length <= LIST_CAP) return { shown: items, more: 0 };
  return { shown: items.slice(0, LIST_CAP), more: items.length - LIST_CAP };
}

function formatIdList(ids: string[]): string {
  if (ids.length === 0) return "—";
  const { shown, more } = capList(ids);
  const base = shown.map((id) => `\`${id}\``).join(", ");
  return more > 0 ? `${base} … +${more} more` : base;
}

function renderMarkdown(report: FixtureDriftReport): string {
  const lines: string[] = [];
  lines.push("# Content V2 — MySQL vs Fixtures Drift");
  lines.push("");
  lines.push(`Generado: ${report.generatedAt}`);
  lines.push("");

  lines.push("## A. Resumen ejecutivo");
  lines.push("");
  lines.push(
    "| Tabla | MySQL | Fixtures | Idénticos | Solo MySQL | Solo fixtures | Field diffs |",
  );
  lines.push(
    "|-------|------:|---------:|----------:|-----------:|--------------:|------------:|",
  );
  for (const t of report.tables) {
    lines.push(
      `| ${t.table} | ${t.mysqlCount} | ${t.fixturesCount} | ${t.identicalCount} | ${t.onlyInMysql.length} | ${t.onlyInFixtures.length} | ${t.fieldDiffs.length} |`,
    );
  }
  lines.push("");

  lines.push("## B. Conteos por tabla");
  lines.push("");
  for (const t of report.tables) {
    lines.push(
      `- **${t.table}**: MySQL=${t.mysqlCount}, fixtures=${t.fixturesCount}, idénticos=${t.identicalCount}`,
    );
  }
  lines.push("");

  lines.push("## C. Solo en MySQL");
  lines.push("");
  for (const t of report.tables) {
    lines.push(`### ${t.table}`);
    lines.push(formatIdList(t.onlyInMysql));
    lines.push("");
  }

  lines.push("## D. Solo en fixtures");
  lines.push("");
  for (const t of report.tables) {
    lines.push(`### ${t.table}`);
    lines.push(formatIdList(t.onlyInFixtures));
    lines.push("");
  }

  lines.push("## E. Diferencias de campos (misma clave)");
  lines.push("");
  for (const t of report.tables) {
    lines.push(`### ${t.table}`);
    if (t.fieldDiffs.length === 0) {
      lines.push("_Sin diferencias de campos._");
      lines.push("");
      continue;
    }
    const { shown, more } = capList(t.fieldDiffs);
    for (const diff of shown) {
      lines.push(`- **${diff.id}**: ${diff.changedFields.join(", ")}`);
      for (const field of diff.changedFields) {
        const d = diff.details[field];
        lines.push(
          `  - ${field}: mysql=${stableJson(d.mysql)} | fixtures=${stableJson(d.fixtures)}`,
        );
      }
    }
    if (more > 0) lines.push(`- … +${more} more`);
    lines.push("");
  }

  return lines.join("\n");
}

export function writeFixtureDriftReport(
  report: FixtureDriftReport,
  outPath?: string,
): string {
  const mdPath =
    outPath ?? resolve(process.cwd(), "reports", "content-v2-db-vs-fixtures.md");
  const outDir = dirname(mdPath);
  mkdirSync(outDir, { recursive: true });
  const jsonPath = mdPath.replace(/\.md$/i, ".json");

  writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
  writeFileSync(mdPath, renderMarkdown(report), "utf8");
  return mdPath;
}

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { DryRunReport, RecordAnalysis } from "./types";

const LIST_CAP = 50;

export type IdSetDiff = {
  same: string[];
  onlyFixtures: string[];
  onlyMysql: string[];
};

export type ClassificationDiff = {
  key: string;
  fixtures: Pick<
    RecordAnalysis,
    "classification" | "proposedDestination" | "confidence" | "requiresHumanDecision"
  >;
  mysql: Pick<
    RecordAnalysis,
    "classification" | "proposedDestination" | "confidence" | "requiresHumanDecision"
  >;
};

export type DryRunComparisonReport = {
  generatedAt: string;
  fixturesGeneratedAt: string;
  mysqlGeneratedAt: string;
  summaryCounts: {
    fixtures: DryRunReport["summary"];
    mysql: DryRunReport["summary"];
  };
  proposedEntities: IdSetDiff;
  proposedProjects: IdSetDiff;
  standalonePieces: { fixturesCount: number; mysqlCount: number; diff: IdSetDiff };
  piecesInProjects: { fixturesCount: number; mysqlCount: number; diff: IdSetDiff };
  humanDecisions: { onlyFixtures: string[]; onlyMysql: string[] };
  classificationDiffs: ClassificationDiff[];
};

function capList<T>(items: T[]): { shown: T[]; more: number } {
  if (items.length <= LIST_CAP) return { shown: items, more: 0 };
  return { shown: items.slice(0, LIST_CAP), more: items.length - LIST_CAP };
}

function formatList(items: string[]): string {
  if (items.length === 0) return "—";
  const { shown, more } = capList(items);
  const base = shown.map((id) => `\`${id}\``).join(", ");
  return more > 0 ? `${base} … +${more} more` : base;
}

function diffIdSets(fixturesIds: string[], mysqlIds: string[]): IdSetDiff {
  const fixSet = new Set(fixturesIds);
  const mysqlSet = new Set(mysqlIds);
  const same = fixturesIds.filter((id) => mysqlSet.has(id)).sort();
  const onlyFixtures = fixturesIds.filter((id) => !mysqlSet.has(id)).sort();
  const onlyMysql = mysqlIds.filter((id) => !fixSet.has(id)).sort();
  return { same, onlyFixtures, onlyMysql };
}

function recordKey(r: RecordAnalysis): string {
  return `${r.sourceTable}:${r.legacyId}`;
}

function pickClassification(r: RecordAnalysis) {
  return {
    classification: r.classification,
    proposedDestination: r.proposedDestination,
    confidence: r.confidence,
    requiresHumanDecision: r.requiresHumanDecision,
  };
}

export function compareDryRunReports(
  fixtures: DryRunReport,
  mysql: DryRunReport,
): DryRunComparisonReport {
  const fixturesRecords = new Map(
    fixtures.records.map((r) => [recordKey(r), r] as const),
  );
  const mysqlRecords = new Map(
    mysql.records.map((r) => [recordKey(r), r] as const),
  );

  const classificationDiffs: ClassificationDiff[] = [];
  for (const [key, fixRec] of fixturesRecords) {
    const mysqlRec = mysqlRecords.get(key);
    if (!mysqlRec) continue;
    const fixPick = pickClassification(fixRec);
    const mysqlPick = pickClassification(mysqlRec);
    if (JSON.stringify(fixPick) !== JSON.stringify(mysqlPick)) {
      classificationDiffs.push({ key, fixtures: fixPick, mysql: mysqlPick });
    }
  }
  classificationDiffs.sort((a, b) => a.key.localeCompare(b.key));

  const fixturesDecisions = new Set(fixtures.humanDecisions);
  const mysqlDecisions = new Set(mysql.humanDecisions);

  return {
    generatedAt: new Date().toISOString(),
    fixturesGeneratedAt: fixtures.generatedAt,
    mysqlGeneratedAt: mysql.generatedAt,
    summaryCounts: {
      fixtures: fixtures.summary,
      mysql: mysql.summary,
    },
    proposedEntities: diffIdSets(
      fixtures.proposedEntities.map((e) => e.id),
      mysql.proposedEntities.map((e) => e.id),
    ),
    proposedProjects: diffIdSets(
      fixtures.proposedProjects.map((p) => p.id),
      mysql.proposedProjects.map((p) => p.id),
    ),
    standalonePieces: {
      fixturesCount: fixtures.standalonePieces.length,
      mysqlCount: mysql.standalonePieces.length,
      diff: diffIdSets(
        fixtures.standalonePieces.map((p) => p.id),
        mysql.standalonePieces.map((p) => p.id),
      ),
    },
    piecesInProjects: {
      fixturesCount: fixtures.piecesInProjects.length,
      mysqlCount: mysql.piecesInProjects.length,
      diff: diffIdSets(
        fixtures.piecesInProjects.map((p) => p.id),
        mysql.piecesInProjects.map((p) => p.id),
      ),
    },
    humanDecisions: {
      onlyFixtures: [...fixturesDecisions]
        .filter((d) => !mysqlDecisions.has(d))
        .sort(),
      onlyMysql: [...mysqlDecisions]
        .filter((d) => !fixturesDecisions.has(d))
        .sort(),
    },
    classificationDiffs,
  };
}

function renderMarkdown(report: DryRunComparisonReport): string {
  const lines: string[] = [];
  lines.push("# Content V2 — Dry Run Fixtures vs MySQL");
  lines.push("");
  lines.push(`Generado: ${report.generatedAt}`);
  lines.push(`Fixtures report: ${report.fixturesGeneratedAt}`);
  lines.push(`MySQL report: ${report.mysqlGeneratedAt}`);
  lines.push("");

  lines.push("## A. Resumen de conteos");
  lines.push("");
  lines.push("| Métrica | Fixtures | MySQL |");
  lines.push("|---------|--------:|------:|");
  for (const key of Object.keys(report.summaryCounts.fixtures) as Array<
    keyof DryRunReport["summary"]
  >) {
    lines.push(
      `| ${key} | ${report.summaryCounts.fixtures[key]} | ${report.summaryCounts.mysql[key]} |`,
    );
  }
  lines.push("");

  lines.push("## B. proposedEntities (por id)");
  lines.push("");
  lines.push(`- Mismos: ${report.proposedEntities.same.length}`);
  lines.push(`- Solo fixtures: ${formatList(report.proposedEntities.onlyFixtures)}`);
  lines.push(`- Solo MySQL: ${formatList(report.proposedEntities.onlyMysql)}`);
  lines.push("");

  lines.push("## C. proposedProjects (por id)");
  lines.push("");
  lines.push(`- Mismos: ${report.proposedProjects.same.length}`);
  lines.push(`- Solo fixtures: ${formatList(report.proposedProjects.onlyFixtures)}`);
  lines.push(`- Solo MySQL: ${formatList(report.proposedProjects.onlyMysql)}`);
  lines.push("");

  lines.push("## D. Pieces y recursos");
  lines.push("");
  lines.push(
    `- standalonePieces: fixtures=${report.standalonePieces.fixturesCount}, mysql=${report.standalonePieces.mysqlCount}`,
  );
  lines.push(`  - solo fixtures: ${formatList(report.standalonePieces.diff.onlyFixtures)}`);
  lines.push(`  - solo MySQL: ${formatList(report.standalonePieces.diff.onlyMysql)}`);
  lines.push(
    `- piecesInProjects: fixtures=${report.piecesInProjects.fixturesCount}, mysql=${report.piecesInProjects.mysqlCount}`,
  );
  lines.push(`  - solo fixtures: ${formatList(report.piecesInProjects.diff.onlyFixtures)}`);
  lines.push(`  - solo MySQL: ${formatList(report.piecesInProjects.diff.onlyMysql)}`);
  lines.push("");

  lines.push("## E. Decisiones humanas y clasificación");
  lines.push("");
  lines.push("### humanDecisions");
  lines.push(`- Solo en fixtures: ${formatList(report.humanDecisions.onlyFixtures)}`);
  lines.push(`- Solo en MySQL: ${formatList(report.humanDecisions.onlyMysql)}`);
  lines.push("");
  lines.push(`### classificationDiffs (${report.classificationDiffs.length})`);
  if (report.classificationDiffs.length === 0) {
    lines.push("_Sin diferencias de clasificación en claves compartidas._");
  } else {
    const { shown, more } = capList(report.classificationDiffs);
    for (const diff of shown) {
      lines.push(`- **${diff.key}**`);
      lines.push(
        `  - fixtures: ${diff.fixtures.classification} → ${diff.fixtures.proposedDestination} (${diff.fixtures.confidence})`,
      );
      lines.push(
        `  - mysql: ${diff.mysql.classification} → ${diff.mysql.proposedDestination} (${diff.mysql.confidence})`,
      );
    }
    if (more > 0) lines.push(`- … +${more} more`);
  }
  lines.push("");

  return lines.join("\n");
}

export function writeDryRunComparisonReport(
  report: DryRunComparisonReport,
  outDir = resolve(process.cwd(), "reports"),
): { mdPath: string } {
  mkdirSync(outDir, { recursive: true });
  const mdPath = resolve(outDir, "content-v2-dry-run-fixtures-vs-mysql.md");
  writeFileSync(mdPath, renderMarkdown(report), "utf8");
  return { mdPath };
}

export function compareAndWriteDryRunReports(
  fixtures: DryRunReport,
  mysql: DryRunReport,
  outDir?: string,
): { mdPath: string; report: DryRunComparisonReport } {
  const report = compareDryRunReports(fixtures, mysql);
  const { mdPath } = writeDryRunComparisonReport(
    report,
    outDir ?? resolve(process.cwd(), "reports"),
  );
  return { mdPath, report };
}

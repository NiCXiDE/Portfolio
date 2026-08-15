import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { compareDryRunReports, writeDryRunComparisonReport } from "./migrate-v2/compare-dry-runs";
import {
  runContentV2Apply,
  resolveDatabaseTarget,
  REHEARSAL_DATABASE,
} from "./migrate-v2/apply-content";
import { runContentV2DryRun } from "./migrate-v2/report";
import type { DryRunReport } from "./migrate-v2/types";

loadEnv({ path: resolve(process.cwd(), ".env") });

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const apply = args.includes("--apply");
  const compareFixtures = args.includes("--compare-fixtures");

  if (!dryRun && !apply) {
    console.error(
      "Usage: tsx scripts/migrate-content-v2.ts --dry-run [--compare-fixtures] | --apply",
    );
    process.exit(1);
  }

  if (apply) {
    const target = resolveDatabaseTarget();
    const rehearsal =
      target.effectiveDatabase === REHEARSAL_DATABASE &&
      process.env.V2_REHEARSAL_APPROVED === "1";

    await runContentV2Apply({ rehearsal });
    return;
  }

  const mysqlReport = await runContentV2DryRun({ compareFixtures });

  if (compareFixtures) {
    const fixturesJsonPath = resolve(
      process.cwd(),
      "reports/content-v2-dry-run-fixtures.json",
    );
    if (!existsSync(fixturesJsonPath)) {
      console.warn(
        "[migrate-v2] WARNING: reports/content-v2-dry-run-fixtures.json missing — skipping dry-run classification comparison.",
      );
    } else {
      const fixturesReport = JSON.parse(
        readFileSync(fixturesJsonPath, "utf8"),
      ) as DryRunReport;
      const comparison = compareDryRunReports(fixturesReport, mysqlReport);
      const { mdPath } = writeDryRunComparisonReport(comparison);
      console.log(
        `[migrate-v2] Fixtures vs MySQL dry-run comparison: ${mdPath}`,
      );
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

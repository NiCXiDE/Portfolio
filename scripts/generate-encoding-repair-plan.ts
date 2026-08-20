/**
 * Compare MySQL legacy data vs content fixtures and emit encoding repair plan.
 * Usage: npx tsx scripts/generate-encoding-repair-plan.ts
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { createDataSource, portfolioLegacyEntities } from "../src/db/data-source";
import { isDirectScriptRun } from "./sync-schema";
import {
  buildEncodingRepairPlan,
  writeEncodingRepairPlan,
} from "./migrate-v2/encoding-repair";

loadEnv({ path: resolve(process.cwd(), ".env") });

export async function main(): Promise<void> {
  const ds = createDataSource(false, portfolioLegacyEntities);
  await ds.initialize();

  try {
    const plan = await buildEncodingRepairPlan(ds);
    const { jsonPath, mdPath } = writeEncodingRepairPlan(plan);

    console.log("Encoding repair plan written:");
    console.log(`  JSON: ${jsonPath}`);
    console.log(`  MD:   ${mdPath}`);
    console.log("");
    console.log(`Total repairs: ${plan.summary.total}`);
    console.log(`  scalar leaves: ${plan.summary.scalarLeaves}`);
    console.log(`  JSON leaves:   ${plan.summary.jsonLeaves}`);
    console.log("");
    console.log("By table:");
    for (const [table, count] of Object.entries(plan.summary.byTable).sort(([a], [b]) =>
      a.localeCompare(b),
    )) {
      console.log(`  ${table}: ${count}`);
    }
    console.log("");
    console.log("By column:");
    for (const [column, count] of Object.entries(plan.summary.byColumn).sort(([a], [b]) =>
      a.localeCompare(b),
    )) {
      console.log(`  ${column}: ${count}`);
    }
  } finally {
    await ds.destroy();
  }
}

if (isDirectScriptRun(["generate-encoding-repair-plan.ts"], import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

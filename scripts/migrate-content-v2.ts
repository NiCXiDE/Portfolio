import { runContentV2DryRun } from "./migrate-v2/report";

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const apply = args.includes("--apply");

  if (!dryRun && !apply) {
    console.error("Usage: tsx scripts/migrate-content-v2.ts --dry-run|--apply");
    process.exit(1);
  }

  if (apply) {
    console.error(
      "[migrate-v2] --apply is NOT enabled in Fase 3A. Use --dry-run only.",
    );
    process.exit(1);
  }

  await runContentV2DryRun();
  console.log("\n--apply was NOT executed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

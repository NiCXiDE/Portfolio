/**
 * Full database reset: drops Docker volume, recreates MySQL, runs seed.
 * Requires ALLOW_DESTRUCTIVE_DB=1.
 *
 * Usage: ALLOW_DESTRUCTIVE_DB=1 npm run db:reset
 */
import { execSync } from "node:child_process";
import { requireDestructiveDbApproval, isDirectScriptRun } from "./sync-schema";

async function main() {
  requireDestructiveDbApproval("db-reset");

  const cwd = process.cwd();
  const env = { ...process.env, ALLOW_DESTRUCTIVE_DB: "1" };

  console.log("[db-reset] docker compose down -v");
  execSync("docker compose down -v", { stdio: "inherit", cwd });

  console.log("[db-reset] docker compose up -d");
  execSync("docker compose up -d", { stdio: "inherit", cwd });

  console.log("[db-reset] waiting for MySQL");
  execSync("docker compose exec -T mysql mysqladmin ping -h localhost --wait=30", {
    stdio: "inherit",
    cwd,
  });

  console.log("[db-reset] seed");
  execSync("npx tsx scripts/seed.ts", {
    stdio: "inherit",
    cwd,
    env,
  });

  console.log("[db-reset] complete.");
}

if (isDirectScriptRun(["db-reset.ts"])) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

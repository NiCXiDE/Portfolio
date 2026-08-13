/**
 * Sincroniza el schema TypeORM sin reseedea datos.
 * Uso: npx tsx scripts/sync-schema.ts
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createDataSource, portfolioLegacyEntities } from "../src/db/data-source";

loadEnv({ path: resolve(process.cwd(), ".env") });

/** @see scripts/sync-schema.ts — shared DB safety helpers for destructive scripts */
export function requireDestructiveDbApproval(scriptName: string): void {
  if (process.env.ALLOW_DESTRUCTIVE_DB === "1") return;
  throw new Error(
    `[${scriptName}] Refusing destructive DB operation. Set ALLOW_DESTRUCTIVE_DB=1 to proceed.`,
  );
}

export function isDirectScriptRun(expectedBasenames: string[]): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  const base = entry.replace(/\\/g, "/").split("/").pop();
  if (!base || !expectedBasenames.includes(base)) return false;
  try {
    return import.meta.url === pathToFileURL(resolve(entry)).href;
  } catch {
    return false;
  }
}

async function main() {
  requireDestructiveDbApproval("sync-schema");

  const ds = createDataSource(true, portfolioLegacyEntities);
  await ds.initialize();
  console.log("Schema synchronized.");
  await ds.destroy();
}

if (isDirectScriptRun(["sync-schema.ts"])) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

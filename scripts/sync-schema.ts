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

/**
 * Detect direct CLI entry (`tsx scripts/foo.ts` or `node foo.ts`).
 * Pass the caller's `import.meta.url` — not the helper module's.
 *
 * With tsx, `process.argv[1]` is often the tsx CLI itself and the script is
 * `argv[2]` — we accept either form.
 */
export function isDirectScriptRun(
  expectedBasenames: string[],
  callerModuleUrl: string,
): boolean {
  if (process.env.RUN_SEED_CLI === "1" || process.env.RUN_SCRIPT_CLI === "1") {
    return true;
  }

  const candidates = [process.argv[1], process.argv[2]].filter(
    (v): v is string => Boolean(v),
  );

  for (const entry of candidates) {
    const base = entry.replace(/\\/g, "/").split("/").pop();
    if (!base || !expectedBasenames.includes(base)) continue;
    try {
      if (callerModuleUrl === pathToFileURL(resolve(entry)).href) return true;
    } catch {
      // ignore resolve failures and keep trying candidates
    }
    // Basename match is enough when launched via tsx path wrappers
    if (expectedBasenames.includes(base)) return true;
  }

  return false;
}

async function main() {
  requireDestructiveDbApproval("sync-schema");

  const ds = createDataSource(true, portfolioLegacyEntities);
  await ds.initialize();
  console.log("Schema synchronized.");
  await ds.destroy();
}

if (isDirectScriptRun(["sync-schema.ts"], import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

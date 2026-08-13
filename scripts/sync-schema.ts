/**
 * Sincroniza el schema TypeORM sin reseedea datos.
 * Uso: npx tsx scripts/sync-schema.ts
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { createDataSource, portfolioLegacyEntities } from "../src/db/data-source";

loadEnv({ path: resolve(process.cwd(), ".env") });

async function main() {
  const ds = createDataSource(true, portfolioLegacyEntities);
  await ds.initialize();
  console.log("Schema synchronized.");
  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

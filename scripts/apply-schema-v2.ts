/**
 * Apply Content Model V2 schema additively (CREATE TABLE / safe ALTER only).
 * Usage: npm run db:apply-v2
 */
import { config as loadEnv } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import mysql from "mysql2/promise";

loadEnv({ path: resolve(process.cwd(), ".env") });

function connectionConfig() {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
      multipleStatements: true,
    };
  }

  return {
    host: process.env.DATABASE_HOST ?? "127.0.0.1",
    port: Number(process.env.DATABASE_PORT ?? "3306"),
    user: process.env.DATABASE_USER ?? "portfolio",
    password: process.env.DATABASE_PASSWORD ?? "portfolio",
    database: process.env.DATABASE_NAME ?? "portfolio",
    multipleStatements: true,
  };
}

async function main() {
  const root = resolve(process.cwd(), "db");
  const files = [
    "schema-v2.sql",
    "schema-v2-patches.sql",
    "schema-v2-fks.sql",
  ];

  const conn = await mysql.createConnection(connectionConfig());
  try {
    for (const file of files) {
      const sqlPath = resolve(root, file);
      const sql = readFileSync(sqlPath, "utf8");
      console.log(`Applying ${file} ...`);
      console.log("--- SQL preview (first 600 chars) ---");
      console.log(sql.slice(0, 600));
      console.log("--- end preview ---\n");
      await conn.query(sql);
      console.log(`${file} applied.\n`);
    }
    console.log("Schema V2 applied successfully.");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

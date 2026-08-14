/**
 * Apply Phase 3C.2 freeze schema only (context + piece_entities).
 * Usage: npm run db:apply-v2-freeze-3c2
 *
 * Does NOT run schema-v2.sql, patches, fks, or apply-schema-v2.ts.
 */
import { config as loadEnv } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import mysql from "mysql2/promise";

loadEnv({ path: resolve(process.cwd(), ".env") });

const SQL_FILE = "schema-v2-freeze-3c2-only.sql";

const V2_CONTENT_TABLES = [
  "entities",
  "projects",
  "pieces",
  "migration_map",
] as const;

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

async function countTable(
  conn: mysql.Connection,
  table: string,
): Promise<number> {
  const [rows] = (await conn.query(
    `SELECT COUNT(*) AS c FROM \`${table}\``,
  )) as [Array<{ c: number | string }>, unknown];
  return Number(rows[0]?.c ?? 0);
}

async function inspectSchema(conn: mysql.Connection): Promise<{
  contextExists: boolean;
  pieceEntitiesExists: boolean;
  fkPieceExists: boolean;
  fkEntityExists: boolean;
}> {
  const [colRows] = (await conn.query(
    `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'projects'
       AND COLUMN_NAME = 'context'`,
  )) as [Array<{ c: number | string }>, unknown];

  const [tableRows] = (await conn.query(
    `SELECT COUNT(*) AS c FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'piece_entities'`,
  )) as [Array<{ c: number | string }>, unknown];

  const [fkRows] = (await conn.query(
    `SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'piece_entities'
       AND CONSTRAINT_NAME IN ('fk_piece_entities_piece', 'fk_piece_entities_entity')`,
  )) as [Array<{ CONSTRAINT_NAME: string }>, unknown];

  const fkNames = new Set(fkRows.map((r) => r.CONSTRAINT_NAME));

  return {
    contextExists: Number(colRows[0]?.c ?? 0) > 0,
    pieceEntitiesExists: Number(tableRows[0]?.c ?? 0) > 0,
    fkPieceExists: fkNames.has("fk_piece_entities_piece"),
    fkEntityExists: fkNames.has("fk_piece_entities_entity"),
  };
}

async function main() {
  const sqlPath = resolve(process.cwd(), "db", SQL_FILE);
  const sql = readFileSync(sqlPath, "utf8");

  const conn = await mysql.createConnection(connectionConfig());

  try {
    console.log("[3c2-freeze] Pre-flight (read-only checks)\n");

    const counts: Record<string, number> = {};
    for (const table of V2_CONTENT_TABLES) {
      counts[table] = await countTable(conn, table);
    }

    console.log("V2 content counts (must be 0):");
    for (const table of V2_CONTENT_TABLES) {
      console.log(`  ${table}: ${counts[table]}`);
    }

    const nonEmpty = V2_CONTENT_TABLES.filter((t) => counts[t] !== 0);
    if (nonEmpty.length > 0) {
      throw new Error(
        `[3c2-freeze] ABORT: V2 content tables must be empty before freeze schema apply. Non-zero: ${nonEmpty.join(", ")}`,
      );
    }

    const before = await inspectSchema(conn);
    console.log("\nSchema state before apply:");
    console.log(`  projects.context: ${before.contextExists ? "EXISTS" : "missing"}`);
    console.log(
      `  piece_entities table: ${before.pieceEntitiesExists ? "EXISTS" : "missing"}`,
    );
    console.log(
      `  fk_piece_entities_piece: ${before.fkPieceExists ? "EXISTS" : "missing"}`,
    );
    console.log(
      `  fk_piece_entities_entity: ${before.fkEntityExists ? "EXISTS" : "missing"}`,
    );

    const wouldRun: string[] = [];
    if (!before.contextExists) {
      wouldRun.push(
        "ALTER TABLE projects ADD COLUMN context VARCHAR(32) NOT NULL AFTER type",
      );
    }
    if (!before.pieceEntitiesExists) {
      wouldRun.push("CREATE TABLE piece_entities (...)");
    }
    if (!before.fkPieceExists) {
      wouldRun.push(
        "ALTER TABLE piece_entities ADD CONSTRAINT fk_piece_entities_piece ... ON DELETE CASCADE",
      );
    }
    if (!before.fkEntityExists) {
      wouldRun.push(
        "ALTER TABLE piece_entities ADD CONSTRAINT fk_piece_entities_entity ... ON DELETE RESTRICT",
      );
    }

    console.log("\nDDL with effect on current state:");
    if (wouldRun.length === 0) {
      console.log("  (none — schema already fully applied; rerun is no-op)");
    } else {
      for (const ddl of wouldRun) console.log(`  - ${ddl}`);
    }

    console.log(`\n[3c2-freeze] Applying ${SQL_FILE} ...`);
    await conn.query(sql);

    const after = await inspectSchema(conn);
    console.log("\nSchema state after apply:");
    console.log(`  projects.context: ${after.contextExists ? "EXISTS" : "missing"}`);
    console.log(
      `  piece_entities table: ${after.pieceEntitiesExists ? "EXISTS" : "missing"}`,
    );
    console.log(
      `  fk_piece_entities_piece: ${after.fkPieceExists ? "EXISTS" : "missing"}`,
    );
    console.log(
      `  fk_piece_entities_entity: ${after.fkEntityExists ? "EXISTS" : "missing"}`,
    );

    const countsAfter: Record<string, number> = {};
    for (const table of V2_CONTENT_TABLES) {
      countsAfter[table] = await countTable(conn, table);
    }
    console.log("\nV2 content counts (after, must remain 0):");
    for (const table of V2_CONTENT_TABLES) {
      console.log(`  ${table}: ${countsAfter[table]}`);
    }

    const nonEmptyAfter = V2_CONTENT_TABLES.filter(
      (t) => countsAfter[t] !== 0,
    );
    if (nonEmptyAfter.length > 0) {
      throw new Error(
        `[3c2-freeze] Post-apply sanity failed: unexpected rows in ${nonEmptyAfter.join(", ")}`,
      );
    }

    console.log("\n[3c2-freeze] Schema freeze applied successfully.");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Rehearsal ONLY: add fk_testimonials_entity on portfolio_v2_apply_test.
 *
 * Requires:
 *   DATABASE_NAME=portfolio_v2_apply_test
 *   V2_FK_TESTIMONIALS_REHEARSAL_APPROVED=1
 *
 * Does NOT touch live portfolio. Does NOT run content apply.
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import mysql from "mysql2/promise";

loadEnv({ path: resolve(process.cwd(), ".env") });

const TEMP_DB = "portfolio_v2_apply_test";

function connectionConfig(database: string) {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database,
      multipleStatements: false,
    };
  }

  return {
    host: process.env.DATABASE_HOST ?? "127.0.0.1",
    port: Number(process.env.DATABASE_PORT ?? "3306"),
    user: process.env.DATABASE_USER ?? "portfolio",
    password: process.env.DATABASE_PASSWORD ?? "portfolio",
    database,
    multipleStatements: false,
  };
}

async function main() {
  const override = process.env.DATABASE_NAME?.trim() || null;
  const effective = override ?? "portfolio";

  console.log(`DATABASE_NAME override: ${override ?? "(unset)"}`);
  console.log(`database=${effective}`);

  if (effective !== TEMP_DB) {
    throw new Error(
      `[fk-rehearsal] ABORT: effective database must be "${TEMP_DB}" (got "${effective}")`,
    );
  }

  if (process.env.V2_FK_TESTIMONIALS_REHEARSAL_APPROVED !== "1") {
    throw new Error(
      `[fk-rehearsal] ABORT: requires V2_FK_TESTIMONIALS_REHEARSAL_APPROVED=1`,
    );
  }

  const conn = await mysql.createConnection(connectionConfig(effective));

  try {
    const [dbRows] = (await conn.query("SELECT DATABASE() AS db")) as [
      Array<{ db: string }>,
      unknown,
    ];
    const connectedDb = dbRows[0]?.db;
    console.log(`connected_database=${connectedDb}`);
    if (connectedDb !== TEMP_DB) {
      throw new Error(
        `[fk-rehearsal] ABORT: connected database="${connectedDb}" !== "${TEMP_DB}"`,
      );
    }

    const [fkBefore] = (await conn.query(
      `SELECT COUNT(*) AS c FROM information_schema.TABLE_CONSTRAINTS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'testimonials'
         AND CONSTRAINT_NAME = 'fk_testimonials_entity'
         AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
    )) as [Array<{ c: number | string }>, unknown];
    const fkExists = Number(fkBefore[0]?.c ?? 0);
    console.log(`precheck_fk_exists=${fkExists}`);
    if (fkExists !== 0) {
      throw new Error(
        `[fk-rehearsal] ABORT: fk_testimonials_entity FOREIGN KEY already exists`,
      );
    }

    const [childCol] = (await conn.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, CHARACTER_SET_NAME, COLLATION_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'testimonials'
         AND COLUMN_NAME = 'entity_id'`,
    )) as [Array<Record<string, unknown>>, unknown];
    const [parentCol] = (await conn.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, CHARACTER_SET_NAME, COLLATION_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'entities'
         AND COLUMN_NAME = 'id'`,
    )) as [Array<Record<string, unknown>>, unknown];

    if (!childCol[0]) {
      throw new Error(`[fk-rehearsal] ABORT: testimonials.entity_id missing`);
    }
    if (!parentCol[0]) {
      throw new Error(`[fk-rehearsal] ABORT: entities.id missing`);
    }

    console.log(
      `precheck_child=${JSON.stringify(childCol[0])}`,
    );
    console.log(
      `precheck_parent=${JSON.stringify(parentCol[0])}`,
    );

    if (String(childCol[0].COLUMN_TYPE) !== String(parentCol[0].COLUMN_TYPE)) {
      throw new Error(
        `[fk-rehearsal] ABORT: type mismatch child=${childCol[0].COLUMN_TYPE} parent=${parentCol[0].COLUMN_TYPE}`,
      );
    }

    const [invalid] = (await conn.query(
      `SELECT COUNT(*) AS c
       FROM testimonials t
       LEFT JOIN entities e ON e.id = t.entity_id
       WHERE t.entity_id IS NOT NULL AND e.id IS NULL`,
    )) as [Array<{ c: number | string }>, unknown];
    const invalidRefs = Number(invalid[0]?.c ?? 0);
    console.log(`precheck_invalid_refs=${invalidRefs}`);
    if (invalidRefs !== 0) {
      throw new Error(
        `[fk-rehearsal] ABORT: ${invalidRefs} testimonials.entity_id point to missing entities`,
      );
    }

    console.log("[fk-rehearsal] Executing ADD CONSTRAINT fk_testimonials_entity …");
    await conn.query(
      `ALTER TABLE testimonials
       ADD CONSTRAINT fk_testimonials_entity
       FOREIGN KEY (entity_id)
       REFERENCES entities (id)
       ON DELETE SET NULL`,
    );
    console.log("[fk-rehearsal] ALTER committed.");

    const [fkAfter] = (await conn.query(
      `SELECT rc.CONSTRAINT_NAME, rc.DELETE_RULE, rc.UPDATE_RULE,
              kcu.COLUMN_NAME, kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME
       FROM information_schema.REFERENTIAL_CONSTRAINTS rc
       JOIN information_schema.KEY_COLUMN_USAGE kcu
         ON rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
        AND rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
        AND rc.TABLE_NAME = kcu.TABLE_NAME
       WHERE rc.CONSTRAINT_SCHEMA = DATABASE()
         AND rc.TABLE_NAME = 'testimonials'
         AND rc.CONSTRAINT_NAME = 'fk_testimonials_entity'`,
    )) as [Array<Record<string, unknown>>, unknown];

    console.log(`postcheck_fk=${JSON.stringify(fkAfter)}`);
    if (!fkAfter.length) {
      throw new Error(`[fk-rehearsal] ABORT: FK missing after ALTER`);
    }
    if (fkAfter[0].DELETE_RULE !== "SET NULL") {
      throw new Error(
        `[fk-rehearsal] ABORT: DELETE_RULE=${fkAfter[0].DELETE_RULE} expected SET NULL`,
      );
    }
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

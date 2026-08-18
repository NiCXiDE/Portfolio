const mysql = require("mysql2/promise");

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DATABASE_HOST ?? "127.0.0.1",
    port: Number(process.env.DATABASE_PORT ?? "3306"),
    user: process.env.DATABASE_USER ?? "portfolio",
    password: process.env.DATABASE_PASSWORD ?? "portfolio",
    database: process.env.DATABASE_NAME ?? "portfolio",
  });

  try {
    const [rows] = await conn.query("SELECT COUNT(*) AS n FROM admin_users");
    const n = Number(rows[0]?.n ?? 0);
    process.exitCode = n > 0 ? 0 : 2;
  } catch {
    process.exitCode = 2;
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

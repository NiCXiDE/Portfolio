/**
 * Reset local admin password (dev).
 *
 * Usage:
 *   npx tsx scripts/reset-admin-password.ts
 *   npx tsx scripts/reset-admin-password.ts "MiNuevaClave123"
 *
 * Default password if none is passed: PortfolioTemp2026!
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { hashSync } from "bcryptjs";
import { createDataSource } from "../src/db/data-source";
import { AdminUserEntity } from "../src/db/entities";

loadEnv({ path: resolve(process.cwd(), ".env") });

async function main() {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password =
    process.argv[2]?.trim() ||
    process.env.ADMIN_BOOTSTRAP_PASSWORD ||
    "PortfolioTemp2026!";

  if (password.length < 10) {
    console.error("La contraseña debe tener al menos 10 caracteres.");
    process.exit(1);
  }

  const ds = createDataSource(false);
  await ds.initialize();
  const repo = ds.getRepository(AdminUserEntity);
  const user = await repo.findOneBy({ username });
  if (!user) {
    console.error(`No existe el usuario "${username}". Corré npm run db:seed.`);
    await ds.destroy();
    process.exit(1);
  }

  user.passwordHash = hashSync(password, 12);
  user.mustChangePassword = true;
  await repo.save(user);
  await ds.destroy();

  console.log(`OK — usuario "${username}" actualizado.`);
  console.log(`Contraseña temporal: ${password}`);
  console.log("Al entrar te va a pedir cambiarla (mustChangePassword=true).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

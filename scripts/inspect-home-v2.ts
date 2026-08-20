/**
 * READ-ONLY shadow inspector for HomeContentV2 adapter (4C.2).
 * Does not touch UI or DB writes.
 *
 * Usage: npm run inspect:home-v2
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });
delete process.env.DATABASE_NAME;

const FORBIDDEN_HOME_IDS = [
  "sessions",
  "asesor-financiero",
  "aicore-inventariado",
  "aml-general",
  "aml-casinos",
  "confidential-logistics-system",
  "microtime",
  "syllabi",
  "proxi",
] as const;

function dupIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const dups: string[] = [];
  for (const id of ids) {
    if (seen.has(id)) dups.push(id);
    seen.add(id);
  }
  return dups;
}

function inventedEntityHrefs(hrefs: Array<string | null>): string[] {
  return hrefs.filter(
    (h): h is string =>
      typeof h === "string" &&
      (h.includes("/entidades/") ||
        h.startsWith("/marcas/") ||
        h.includes("/marcas/")),
  );
}

async function main() {
  const { getHomeContentV2 } = await import("../src/lib/content-v2");
  const { getDataSource } = await import("../src/db/data-source");

  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  console.log(`database=${db}`);
  if (db !== "portfolio") {
    throw new Error(`ABORT: expected portfolio, got ${db}`);
  }

  const locales = ["es", "en"] as const;
  const report: Record<string, unknown> = { database: db };

  for (const locale of locales) {
    const home = await getHomeContentV2(locale);
    const entityIds = home.entities.map((e) => e.id);
    const pastIds = home.pastProjects.map((p) => p.id);
    const currentIds = home.currentProjects.map((p) => p.id);
    const testimonialIds = home.testimonials.map((t) => t.id);

    const allProjectIds = [...pastIds, ...currentIds];
    const forbidden = allProjectIds.filter((id) =>
      (FORBIDDEN_HOME_IDS as readonly string[]).includes(id),
    );
    const confidentialEntityLeak = home.entities.filter((e) =>
      e.id.startsWith("confidential-"),
    );
    const archived = [
      ...home.pastProjects,
      ...home.currentProjects,
    ].filter((p) => (p.status as string) === "archived");

    const brokenHrefs = inventedEntityHrefs([
      ...home.entities.map((e) => e.href),
      ...home.pastProjects.map((p) => p.href),
      ...home.currentProjects.map((p) => p.href),
      ...home.testimonials.map((t) => t.organization.href),
    ]);

    report[locale] = {
      entities: {
        count: home.entities.length,
        order: home.entities.map((e) => ({
          id: e.id,
          homeOrder: e.homeOrder,
          href: e.href,
          hasLogo: Boolean(e.logoUrl),
        })),
        duplicateIds: dupIds(entityIds),
      },
      pastProjects: {
        count: home.pastProjects.length,
        order: home.pastProjects.map((p) => ({
          id: p.id,
          homeOrder: p.homeOrder,
          status: p.status,
        })),
        duplicateIds: dupIds(pastIds),
      },
      currentProjects: {
        count: home.currentProjects.length,
        order: home.currentProjects.map((p) => ({
          id: p.id,
          homeOrder: p.homeOrder,
          status: p.status,
        })),
        duplicateIds: dupIds(currentIds),
        exactCurrent: currentIds,
      },
      testimonials: {
        count: home.testimonials.length,
        ids: testimonialIds,
        duplicateIds: dupIds(testimonialIds),
      },
      checks: {
        unpublishedImpossibleViaReaders: true,
        archivedOnHome: archived.length,
        forbiddenProjectIds: forbidden,
        confidentialEntityLeaks: confidentialEntityLeak.map((e) => e.id),
        inventedEntityOrMarcasHrefs: brokenHrefs,
      },
    };
  }

  console.log(JSON.stringify(report, null, 2));

  const es = report.es as {
    entities: { count: number };
    pastProjects: { count: number };
    currentProjects: { count: number; exactCurrent: string[] };
    testimonials: { count: number };
    checks: {
      archivedOnHome: number;
      forbiddenProjectIds: string[];
      confidentialEntityLeaks: string[];
      inventedEntityOrMarcasHrefs: string[];
    };
  };

  const ok =
    es.entities.count === 6 &&
    es.pastProjects.count === 11 &&
    es.currentProjects.count === 1 &&
    es.currentProjects.exactCurrent[0] === "taily" &&
    es.testimonials.count === 4 &&
    es.checks.archivedOnHome === 0 &&
    es.checks.forbiddenProjectIds.length === 0 &&
    es.checks.confidentialEntityLeaks.length === 0 &&
    es.checks.inventedEntityOrMarcasHrefs.length === 0;

  console.log(`shadow_ok=${ok}`);
  if (!ok) process.exit(1);

  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

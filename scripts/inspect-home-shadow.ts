/**
 * READ-ONLY Home shadow validation (4C.3).
 * Compares legacy Home vs HomeContentV2 via HomeShadowSnapshot.
 * Does NOT run inside public Home requests.
 *
 * Usage: npm run inspect:home-shadow
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });
delete process.env.DATABASE_NAME;

async function main() {
  const { loadPortfolioContent } = await import("../src/lib/content");
  const { getHomeContentV2 } = await import("../src/lib/content-v2");
  const {
    compareHomeShadows,
    normalizeHomeContentV2,
    normalizeLegacyHome,
  } = await import("../src/lib/content-v2/home-shadow");
  const { getDataSource } = await import("../src/db/data-source");

  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  console.log(`database=${db}`);
  if (db !== "portfolio") {
    throw new Error(`ABORT: expected portfolio, got ${db}`);
  }

  // Isolated inspector load — not part of public Home request path.
  const legacyContent = await loadPortfolioContent();

  const locales = ["es", "en"] as const;
  const summary: Record<string, unknown> = { database: db };

  let allOk = true;

  for (const locale of locales) {
    const legacySnap = normalizeLegacyHome(
      {
        companies: legacyContent.companies,
        pastProjects: legacyContent.pastProjects,
        currentProjects: legacyContent.currentProjects,
        testimonials: legacyContent.testimonials,
      },
      locale,
    );
    const v2Home = await getHomeContentV2(locale);
    const v2Snap = normalizeHomeContentV2(v2Home);
    const report = compareHomeShadows(legacySnap, v2Snap);

    allOk = allOk && report.shadowOk;

    summary[`shadow_${locale}_ok`] = report.shadowOk;
    summary[locale] = {
      legacy: report.legacyCounts,
      v2: report.v2Counts,
      expectedDifferences: report.expected.length,
      unexpectedDifferences: report.unexpected.length,
      unexpected: report.unexpected.map((d) => ({
        kind: d.kind,
        surface: d.surface,
        key: d.key,
        detail: d.detail,
      })),
      expectedKinds: Object.fromEntries(
        [
          "EXPECTED_REMOVED_ENTITY",
          "EXPECTED_REMOVED_PROJECT",
          "EXPECTED_SECTION_CHANGE",
          "EXPECTED_NO_INTERNAL_HREF",
          "EXPECTED_MODEL_RENAME",
          "EXPECTED_COUNT_DELTA",
        ].map((k) => [
          k,
          report.expected.filter((d) => d.kind === k).length,
        ]),
      ),
      linkMatrix: report.linkMatrix,
      v2Current: v2Snap.currentProjects.map((p) => p.key),
      templetonInPast: v2Snap.pastProjects.some(
        (p) => p.key === "templeton-digital-transformation-assessment",
      ),
      concitarPast: v2Snap.pastProjects.some((p) => p.key === "concitar"),
      repuestosPast: v2Snap.pastProjects.some(
        (p) => p.key === "repuestos-carlitos",
      ),
    };
  }

  summary.shadow_ok = allOk;
  console.log(JSON.stringify(summary, null, 2));
  console.log(`shadow_es_ok=${summary.shadow_es_ok}`);
  console.log(`shadow_en_ok=${summary.shadow_en_ok}`);
  console.log(`shadow_ok=${allOk}`);

  await ds.destroy();
  if (!allOk) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * READ-ONLY Graphic shadow inspector (Phase 4D.3).
 *
 * Compares legacy Graphic runtime vs getGraphicContentV2.
 * Does NOT touch public Graphic requests / feature flags.
 *
 * Usage: npm run inspect:graphic-shadow
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";

loadEnv({ path: resolve(process.cwd(), ".env") });
delete process.env.DATABASE_NAME;

async function runLocale(locale: "es" | "en") {
  const { loadPortfolioContent } = await import("../src/lib/content");
  const { getGraphicContentV2 } = await import("../src/lib/content-v2/graphic");
  const {
    normalizeLegacyGraphicSnapshot,
    compareGraphicContentShadows,
  } = await import("../src/lib/content-v2/graphic-shadow");

  const legacyContent = await loadPortfolioContent({ homeLists: "omit" });
  const legacy = normalizeLegacyGraphicSnapshot(legacyContent, locale);
  const graphicV2 = await getGraphicContentV2(locale);
  const report = compareGraphicContentShadows({ legacy, graphicV2 });
  return report;
}

async function main() {
  const { getDataSource } = await import("../src/db/data-source");
  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  if (db !== "portfolio") throw new Error(`ABORT db=${db}`);

  const es = await runLocale("es");
  const en = await runLocale("en");

  const summary = {
    database: db,
    LEGACY: {
      graphic_items: es.legacy.graphicItems,
      manuals: es.legacy.manuals,
      bySection: es.legacy.bySection,
    },
    V2: {
      pieces: es.v2.pieces,
      manuals: es.v2.manuals,
      standalone: es.v2.standalone,
      projectLinked: es.v2.projectLinked,
      byCategory: es.v2.byCategory,
    },
    MATCHED_SURVIVING: es.surviving,
    EXPECTED_DISCARDED: es.expectedDiscarded,
    UNEXPECTED_MISSING: es.unexpectedMissing,
    UNEXPECTED_DUPLICATE: es.unexpectedDuplicate,
    DETAIL_GAPS: {
      CITF_manual: es.detailGaps.manualCitf
        ? "EXPECTED_DETAIL_GAP_MANUAL"
        : "RESOLVED",
      Seyier_gallery: es.detailGaps.seyierGallery
        ? "EXPECTED_DETAIL_GAP_GALLERY"
        : "RESOLVED_RESOURCE_COLLAPSE",
    },
    results: es.results,
    sessions: es.sessions,
    privacy: es.privacy,
    taxonomy: es.taxonomy,
    detailCapability: es.detailCapability,
    order: es.order,
    filterReadiness: es.filterReadiness,
    expectedDiffCount: es.expectedDiffCount,
    unexpectedDiffCount: es.unexpectedDiffCount,
    readiness: es.readiness,
    recommendation: es.recommendation,
    recommendationNote: es.recommendationNote,
    shadow_es_ok: es.shadowOk,
    shadow_en_ok: en.shadowOk,
    shadow_ok: es.shadowOk && en.shadowOk,
  };

  const outPath = resolve(
    process.cwd(),
    "reports/_graphic-shadow-4d3-live.json",
  );
  writeFileSync(
    outPath,
    JSON.stringify({ summary, rowsEs: es.rows, rowsEn: en.rows }, null, 2),
    "utf8",
  );

  console.log(JSON.stringify(summary, null, 2));
  console.log(`wrote ${outPath}`);
  console.log(
    `shadow_ok=${summary.shadow_ok} es=${summary.shadow_es_ok} en=${summary.shadow_en_ok} surviving=${summary.MATCHED_SURVIVING} discarded=${summary.EXPECTED_DISCARDED} missing=${summary.UNEXPECTED_MISSING}`,
  );

  await ds.destroy();
  if (!summary.shadow_ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

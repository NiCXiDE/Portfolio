/**
 * Graphic flag + cutover inspector (Phase 4D.4 / 4D.6).
 * Validates unset/v2/legacy/invalid resolver modes in-process.
 *
 * Usage: npm run inspect:graphic-flag
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";

loadEnv({ path: resolve(process.cwd(), ".env") });
delete process.env.DATABASE_NAME;

const FORBIDDEN = [
  "syllabi",
  "microtime",
  "proxi",
  "confidential-logistics",
  "asesor-financiero",
  "aml-general",
  "aml-casinos",
  "buhoprofe",
  "labcom",
];

async function loadWith(sourceEnv: string | undefined) {
  if (sourceEnv === undefined) delete process.env.GRAPHIC_CONTENT_SOURCE;
  else process.env.GRAPHIC_CONTENT_SOURCE = sourceEnv;

  const { getGraphicContentSource } = await import(
    "../src/lib/content-v2/graphic-source"
  );
  const { getGraphicContentV2, GRAPHIC_NEVER_RETURN_IDS } = await import(
    "../src/lib/content-v2/graphic"
  );
  const {
    loadPortfolioContentForLocale,
    getLastGraphicLoadTrace,
    getLastHomeLoadTrace,
    resetPortfolioLoadTrace,
  } = await import("../src/lib/content-v2/home-runtime");

  resetPortfolioLoadTrace();
  const source = getGraphicContentSource();
  const content = await loadPortfolioContentForLocale("es");
  const graphicTrace = getLastGraphicLoadTrace();
  const homeTrace = getLastHomeLoadTrace();
  const graphicV2 = source === "v2" ? await getGraphicContentV2("es") : null;

  const regular =
    content.logos.length +
    content.covers.length +
    content.personal.length +
    content.illustration.length +
    content.banners.length +
    content.eventos.length;
  const manuals = content.brandManuals.length;
  const seyierCount = content.logos.filter((l) => l.id === "seyier").length;
  const seyierResources =
    graphicV2?.pieces.find((p) => p.id === "seyier")?.resourceCount ?? null;
  const manual = content.brandManuals.find((m) => m.id === "citf-manual-2025");

  const doubleRead =
    graphicTrace?.loaders.includes("legacy-graphic") &&
    graphicTrace?.loaders.includes("v2-graphic");

  const returnedIds = new Set(graphicV2?.pieces.map((p) => p.id) ?? []);
  const discardedLeaks = [...GRAPHIC_NEVER_RETURN_IDS].filter((id) =>
    returnedIds.has(id),
  );
  const forbiddenHits =
    graphicV2?.pieces.flatMap((p) => {
      const blob = `${p.id} ${p.project?.id ?? ""} ${p.entity?.id ?? ""}`.toLowerCase();
      return FORBIDDEN.filter((f) => blob.includes(f)).map(
        (f) => `${p.id}:${f}`,
      );
    }) ?? [];

  return {
    env: sourceEnv ?? "(unset)",
    source,
    graphicTrace,
    homeTrace,
    presentation: content.graphicPresentation,
    counts: { regular, manuals, seyierCount, seyierResources },
    manual: manual
      ? { id: manual.id, cover: manual.cover, pdf: manual.pdf, year: manual.year }
      : null,
    noDoubleRead: !doubleRead,
    privacy: {
      discardedLeaks,
      forbiddenHits,
      manualInGrid: content.logos.some((l) => l.id === "citf-manual-2025"),
    },
    sessionsReview: graphicV2?.meta.sessionsReview ?? null,
  };
}

async function main() {
  const { getDataSource } = await import("../src/db/data-source");
  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  if (db !== "portfolio") throw new Error(`ABORT db=${db}`);

  const original = process.env.GRAPHIC_CONTENT_SOURCE;

  const unset = await loadWith(undefined);
  const explicitV2 = await loadWith("v2");
  const legacy = await loadWith("legacy");
  const invalid = await loadWith("invalid");

  if (original === undefined) delete process.env.GRAPHIC_CONTENT_SOURCE;
  else process.env.GRAPHIC_CONTENT_SOURCE = original;

  const v2Canonical = (row: typeof unset) =>
    row.source === "v2" &&
    row.presentation === "v2" &&
    row.counts.regular === 44 &&
    row.counts.manuals === 1 &&
    row.counts.seyierCount === 1 &&
    row.counts.seyierResources === 3 &&
    row.noDoubleRead &&
    row.graphicTrace?.loaders.join(",") === "v2-graphic" &&
    Boolean(row.manual?.pdf) &&
    Boolean(row.manual?.cover) &&
    !row.privacy.manualInGrid &&
    row.privacy.discardedLeaks.length === 0 &&
    row.privacy.forbiddenHits.length === 0 &&
    row.sessionsReview === "CURRENT_PUBLIC_SAFE";

  const checks = {
    unsetIsV2: unset.source === "v2",
    unsetCanonical: v2Canonical(unset),
    explicitV2Same:
      explicitV2.source === "v2" && v2Canonical(explicitV2),
    legacyIsLegacy: legacy.source === "legacy",
    legacyLoaders:
      legacy.graphicTrace?.loaders.join(",") === "legacy-graphic",
    legacyNoV2Loader: !legacy.graphicTrace?.loaders.includes("v2-graphic"),
    legacyNoDoubleRead: legacy.noDoubleRead,
    invalidIsLegacy: invalid.source === "legacy",
    invalidLoaders:
      invalid.graphicTrace?.loaders.join(",") === "legacy-graphic",
    homeDefaultV2: unset.homeTrace?.source === "v2",
  };

  const ok = Object.values(checks).every(Boolean);
  const out = {
    database: db,
    unset,
    explicitV2,
    legacy,
    invalid,
    checks,
    ok,
  };

  writeFileSync(
    resolve("reports/_graphic-flag-4d6-live.json"),
    JSON.stringify(out, null, 2),
    "utf8",
  );
  console.log(JSON.stringify(out, null, 2));
  console.log(
    `graphic_flag_ok=${ok} unset=${unset.source} legacy=${legacy.source} invalid=${invalid.source} regular=${unset.counts.regular}`,
  );

  await ds.destroy();
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

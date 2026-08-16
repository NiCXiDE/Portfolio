/**
 * READ-ONLY Graphic flag inspector (Phase 4D.4).
 *
 * Usage:
 *   npm run inspect:graphic-flag
 *   GRAPHIC_CONTENT_SOURCE=v2 npm run inspect:graphic-flag
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";

loadEnv({ path: resolve(process.cwd(), ".env") });
// Allow shell GRAPHIC_CONTENT_SOURCE / DATABASE_NAME to win over .env for this inspect.
if (process.env.GRAPHIC_CONTENT_SOURCE_FORCE != null) {
  process.env.GRAPHIC_CONTENT_SOURCE = process.env.GRAPHIC_CONTENT_SOURCE_FORCE;
}

async function main() {
  const { getGraphicContentSource } = await import(
    "../src/lib/content-v2/graphic-source"
  );
  const {
    loadPortfolioContentForLocale,
    getLastGraphicLoadTrace,
    getLastHomeLoadTrace,
    resetPortfolioLoadTrace,
  } = await import("../src/lib/content-v2/home-runtime");
  const { getDataSource } = await import("../src/db/data-source");

  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  if (db !== "portfolio") throw new Error(`ABORT db=${db}`);

  resetPortfolioLoadTrace();
  const source = getGraphicContentSource();
  const content = await loadPortfolioContentForLocale("es");
  const graphicTrace = getLastGraphicLoadTrace();
  const homeTrace = getLastHomeLoadTrace();

  const regular =
    content.logos.length +
    content.covers.length +
    content.personal.length +
    content.illustration.length +
    content.banners.length +
    content.eventos.length;
  const manuals = content.brandManuals.length;
  const seyierIds = ["seyier", "seyier-inicio", "seyier-portada", "seyier-overlay"];
  const seyierCount = content.logos.filter((l) =>
    seyierIds.includes(l.id),
  ).length;
  const manual = content.brandManuals.find((m) => m.id === "citf-manual-2025");

  const doubleRead =
    graphicTrace?.loaders.includes("legacy-graphic") &&
    graphicTrace?.loaders.includes("v2-graphic");

  const checks = {
    sourceMatchesEnv: source === getGraphicContentSource(),
    presentation: content.graphicPresentation === (source === "v2" ? "v2" : "legacy"),
    noDoubleRead: !doubleRead,
    ...(source === "v2"
      ? {
          regular47: regular === 47,
          manuals1: manuals === 1,
          seyier4: seyierCount === 4,
          manualPdf: Boolean(manual?.pdf),
          manualCover: Boolean(manual?.cover),
          loadersV2Only: graphicTrace?.loaders.join(",") === "v2-graphic",
          homeStillDefault: homeTrace?.source === "v2" || homeTrace?.source === "legacy",
        }
      : {
          loadersLegacyOnly:
            graphicTrace?.loaders.join(",") === "legacy-graphic",
          hasLegacyManuals: manuals >= 1,
        }),
  };

  const ok = Object.values(checks).every(Boolean);
  const out = {
    database: db,
    GRAPHIC_CONTENT_SOURCE: process.env.GRAPHIC_CONTENT_SOURCE ?? null,
    source,
    graphicTrace,
    homeTrace,
    counts: { regular, manuals, seyierCount },
    manual: manual
      ? { id: manual.id, cover: manual.cover, pdf: manual.pdf, year: manual.year }
      : null,
    checks,
    ok,
  };

  writeFileSync(
    resolve("reports/_graphic-flag-4d4-live.json"),
    JSON.stringify(out, null, 2),
    "utf8",
  );
  console.log(JSON.stringify(out, null, 2));
  console.log(
    `graphic_flag_ok=${ok} source=${source} regular=${regular} manuals=${manuals} seyier=${seyierCount}`,
  );

  await ds.destroy();
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

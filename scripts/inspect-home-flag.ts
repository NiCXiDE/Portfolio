/**
 * READ-ONLY inspector for Home content source flag (4C.4).
 * Does not start the Next server; loads locale content in-process.
 *
 * Usage:
 *   npm run inspect:home-flag
 *   HOME_CONTENT_SOURCE=v2 npm run inspect:home-flag
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });
delete process.env.DATABASE_NAME;

const FORBIDDEN = [
  "sessions",
  "asesor-financiero",
  "aicore-inventariado",
  "aml-general",
  "aml-casinos",
  "confidential-logistics-system",
  "microtime",
  "syllabi",
  "proxi",
];

async function runOnce(label: string, sourceEnv: string | undefined) {
  if (sourceEnv === undefined) {
    delete process.env.HOME_CONTENT_SOURCE;
  } else {
    process.env.HOME_CONTENT_SOURCE = sourceEnv;
  }

  // Fresh module state for flag + trace (tsx may cache — re-import after env set)
  const { getHomeContentSource } = await import("../src/lib/content-v2/home-source");
  const {
    getLastHomeLoadTrace,
    loadPortfolioContentForLocale,
    resetHomeLoadTrace,
  } = await import("../src/lib/content-v2/home-runtime");

  resetHomeLoadTrace();
  const resolved = getHomeContentSource();
  const content = await loadPortfolioContentForLocale("es");
  const trace = getLastHomeLoadTrace();

  const labels = [
    ...content.companies.map((c) => c.label),
    ...content.pastProjects.map((p) => p.label),
    ...content.currentProjects.map((p) => p.label),
  ].join(" ").toLowerCase();

  const forbiddenHit = FORBIDDEN.filter((id) =>
    [...content.pastProjects, ...content.currentProjects].some((p) =>
      String(p.brandId ?? p.label)
        .toLowerCase()
        .includes(id),
    ),
  );

  // Synthetic check: V2 brandIds are entity ids on companies
  const companyIds = content.companies
    .map((c) => c.brandId)
    .filter(Boolean);

  return {
    label,
    env: sourceEnv ?? "(unset)",
    resolvedSource: resolved,
    trace,
    counts: {
      companies: content.companies.length,
      past: content.pastProjects.length,
      current: content.currentProjects.length,
      testimonials: content.testimonials.length,
    },
    pastLabels: content.pastProjects.map((p) => p.label),
    currentLabels: content.currentProjects.map((p) => p.label),
    companyBrandIds: companyIds,
    inventedEntidades: content.companies.some((c) =>
      (c.hubHref ?? "").includes("/entidades"),
    ),
    forbiddenAliasInLabels: FORBIDDEN.some((f) => labels.includes(f.replace(/-/g, " "))),
    forbiddenProjectHints: forbiddenHit,
  };
}

async function main() {
  const { getDataSource } = await import("../src/db/data-source");
  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  if (db !== "portfolio") throw new Error(`ABORT db=${db}`);

  const original = process.env.HOME_CONTENT_SOURCE;

  const legacy = await runOnce("legacy-branch", "legacy");
  const unset = await runOnce("unset-branch", undefined);
  const v2 = await runOnce("v2-branch", "v2");
  const invalid = await runOnce("invalid-branch", "nope");

  // restore
  if (original === undefined) delete process.env.HOME_CONTENT_SOURCE;
  else process.env.HOME_CONTENT_SOURCE = original;

  const report = {
    database: db,
    legacy,
    unset,
    v2,
    invalid,
    checks: {
      legacyLoadersOk:
        legacy.trace?.loaders.join(",") === "legacy-full" &&
        !legacy.trace.loaders.includes("v2-home"),
      v2LoadersOk:
        v2.trace?.loaders.includes("v2-home") === true &&
        v2.trace.loaders.includes("legacy-shell") === true &&
        !v2.trace.loaders.includes("legacy-full"),
      unsetIsV2: unset.resolvedSource === "v2",
      unsetLoadersMatchV2:
        unset.trace?.loaders.join(",") === "legacy-shell,v2-home",
      invalidIsLegacy: invalid.resolvedSource === "legacy",
      v2CountsOk:
        v2.counts.companies === 6 &&
        v2.counts.past === 12 &&
        v2.counts.current === 0 &&
        v2.counts.testimonials === 4,
      v2HasTaily: v2.pastLabels.some((l) => /taily/i.test(l)),
      noInventedEntidades: !v2.inventedEntidades,
      privacyHintsEmpty: v2.forbiddenProjectHints.length === 0,
    },
  };

  const ok = Object.values(report.checks).every(Boolean);
  console.log(JSON.stringify(report, null, 2));
  console.log(`home_flag_ok=${ok}`);
  await ds.destroy();
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

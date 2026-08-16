/**
 * 4C.6 — Home cutover inspector (in-process).
 * Validates default=v2 without HOME_CONTENT_SOURCE, plus legacy rollback.
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

async function loadWith(
  sourceEnv: string | undefined,
): Promise<{
  env: string;
  resolved: string;
  trace: unknown;
  presentation: string | undefined;
  speeds: { company: number; featured: number };
  counts: {
    entities: number;
    featured: number;
    current: number;
    testimonials: number;
  };
  labels: string[];
  anyEntityHref: boolean;
  anyProjectHref: boolean;
  hasTaily: boolean;
  hasConcitar: boolean;
  hasCarlitos: boolean;
  hasTempleton: boolean;
  sectionHasCurrent: boolean;
  forbiddenHits: string[];
}> {
  if (sourceEnv === undefined) delete process.env.HOME_CONTENT_SOURCE;
  else process.env.HOME_CONTENT_SOURCE = sourceEnv;

  const { getHomeContentSource } = await import(
    "../src/lib/content-v2/home-source"
  );
  const {
    getLastHomeLoadTrace,
    loadPortfolioContentForLocale,
    resetHomeLoadTrace,
  } = await import("../src/lib/content-v2/home-runtime");

  resetHomeLoadTrace();
  const resolved = getHomeContentSource();
  const content = await loadPortfolioContentForLocale("es");
  const trace = getLastHomeLoadTrace();
  const labels = content.pastProjects.map((p) => p.label);
  const blob = [
    ...content.companies.map((c) => c.label),
    ...labels,
    ...content.currentProjects.map((p) => p.label),
  ]
    .join(" ")
    .toLowerCase();

  const forbiddenHits = FORBIDDEN.filter(
    (id) =>
      blob.includes(id.replace(/-/g, " ")) ||
      blob.includes(id) ||
      [...content.pastProjects, ...content.currentProjects].some((p) =>
        String(p.brandId ?? p.label).toLowerCase().includes(id),
      ),
  );

  return {
    env: sourceEnv ?? "(unset)",
    resolved,
    trace,
    presentation: content.homeProjectsPresentation,
    speeds: {
      company: content.settings.homeLayout.marquees.company.speed,
      featured: content.settings.homeLayout.marquees.past_project.speed,
    },
    counts: {
      entities: content.companies.length,
      featured: content.pastProjects.length,
      current: content.currentProjects.length,
      testimonials: content.testimonials.length,
    },
    labels,
    anyEntityHref: content.companies.some((c) => Boolean(c.hubHref)),
    anyProjectHref: content.pastProjects.some((p) => Boolean(p.hubHref)),
    hasTaily: labels.some((l) => /taily/i.test(l)),
    hasConcitar: labels.some((l) => /concitar/i.test(l)),
    hasCarlitos: labels.some((l) => /carlitos/i.test(l)),
    hasTempleton: labels.some((l) => /templeton|autodiagnóstico|autodiagnostico|digital/i.test(l)),
    sectionHasCurrent: content.settings.homeLayout.sectionOrder.includes(
      "current_projects",
    ),
    forbiddenHits,
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

  const unset = await loadWith(undefined);
  const explicitV2 = await loadWith("v2");
  const legacy = await loadWith("legacy");
  const invalid = await loadWith("nope");

  if (original === undefined) delete process.env.HOME_CONTENT_SOURCE;
  else process.env.HOME_CONTENT_SOURCE = original;

  const checks = {
    unsetIsV2: unset.resolved === "v2",
    unsetLoaders:
      (unset.trace as { loaders?: string[] } | null)?.loaders?.join(",") ===
      "legacy-shell,v2-home",
    unsetNoLegacyFull: !(
      (unset.trace as { loaders?: string[] } | null)?.loaders ?? []
    ).includes("legacy-full"),
    explicitV2Same: explicitV2.resolved === "v2",
    legacyIsLegacy: legacy.resolved === "legacy",
    legacyLoaders:
      (legacy.trace as { loaders?: string[] } | null)?.loaders?.join(",") ===
      "legacy-full",
    invalidIsLegacy: invalid.resolved === "legacy",
    countsOk:
      unset.counts.entities === 6 &&
      unset.counts.featured === 12 &&
      unset.counts.current === 0 &&
      unset.counts.testimonials === 4,
    projectsPresent:
      unset.hasTaily &&
      unset.hasConcitar &&
      unset.hasCarlitos &&
      unset.hasTempleton,
    noCurrentSection: unset.sectionHasCurrent === false,
    speed100: unset.speeds.company === 100 && unset.speeds.featured === 100,
    noMarqueeHrefs: !unset.anyEntityHref && !unset.anyProjectHref,
    privacyOk: unset.forbiddenHits.length === 0,
    presentationFeatured: unset.presentation === "featured",
  };

  const ok = Object.values(checks).every(Boolean);
  console.log(
    JSON.stringify(
      { database: db, unset, explicitV2, legacy, invalid, checks, ok },
      null,
      2,
    ),
  );
  await ds.destroy();
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

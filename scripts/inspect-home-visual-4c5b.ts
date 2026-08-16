/**
 * 4C.5B — READ-ONLY Home V2 presentation smoke (in-process).
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });
delete process.env.DATABASE_NAME;
process.env.HOME_CONTENT_SOURCE = "v2";
process.env.HOME_CONTENT_LOAD_TRACE = "1";

async function main() {
  const {
    loadPortfolioContentForLocale,
    getLastHomeLoadTrace,
    resetHomeLoadTrace,
  } = await import("../src/lib/content-v2/home-runtime");
  const { getHomeContentSource } = await import("../src/lib/content-v2/home-source");
  const { getDataSource } = await import("../src/db/data-source");

  console.log("flag", getHomeContentSource());

  for (const locale of ["es", "en"] as const) {
    resetHomeLoadTrace();
    const c = await loadPortfolioContentForLocale(locale);
    const t = getLastHomeLoadTrace();
    console.log(
      JSON.stringify(
        {
          locale,
          trace: t,
          presentation: c.homeProjectsPresentation,
          sectionOrder: c.settings.homeLayout.sectionOrder,
          speeds: {
            company: c.settings.homeLayout.marquees.company.speed,
            past: c.settings.homeLayout.marquees.past_project.speed,
          },
          companies: c.companies.length,
          featured: c.pastProjects.length,
          current: c.currentProjects.length,
          testimonials: c.testimonials.length,
          anyCompanyHref: c.companies.some((x) => Boolean(x.hubHref)),
          anyProjectHref: c.pastProjects.some((x) => Boolean(x.hubHref)),
          hasTaily: c.pastProjects.some((p) => /taily/i.test(p.label)),
          featuredLabels: c.pastProjects.map((p) => p.label),
        },
        null,
        2,
      ),
    );
  }

  // Confirm default path resolves v2 when unset (4C.6)
  delete process.env.HOME_CONTENT_SOURCE;
  console.log("default_after_unset", getHomeContentSource());

  await (await getDataSource()).destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

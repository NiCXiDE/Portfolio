/**
 * Locale portfolio loader with Home-only V2 branch (Phase 4C.4 / 4C.5B).
 * Branches BEFORE querying Home lists — no legacy+V2 double-read for marquees.
 */
import type { Locale } from "@/i18n/config";
import {
  loadPortfolioContent,
  type PortfolioContent,
} from "@/lib/content";
import type { HomeLayoutConfig } from "@/lib/home-layout";
import { getHomeContentV2 } from "./home";
import { getHomeContentSource, type HomeContentSource } from "./home-source";
import { mapHomeContentV2ToCurrentUI } from "./home-ui";

/** Presentational marquee speed for Home V2 Entities + Featured Projects. */
export const HOME_V2_MARQUEE_SPEED_PX_S = 100;

export type HomeLoadTrace = {
  source: HomeContentSource;
  loaders: Array<"legacy-full" | "legacy-shell" | "v2-home">;
};

let lastTrace: HomeLoadTrace | null = null;

/** Test/inspector only — not logged in production paths. */
export function getLastHomeLoadTrace(): HomeLoadTrace | null {
  return lastTrace;
}

export function resetHomeLoadTrace(): void {
  lastTrace = null;
}

function recordTrace(trace: HomeLoadTrace): void {
  lastTrace = trace;
  if (process.env.HOME_CONTENT_LOAD_TRACE === "1") {
    console.info(`[home-load] source=${trace.source} loaders=${trace.loaders.join(",")}`);
  }
}

/** Home V2 layout: one Featured Projects section; Current section not rendered. */
export function applyHomeV2PresentationLayout(
  layout: HomeLayoutConfig,
): HomeLayoutConfig {
  const sectionOrder = layout.sectionOrder.filter(
    (id) => id !== "current_projects",
  );
  if (!sectionOrder.includes("past_projects")) {
    const companiesIdx = sectionOrder.indexOf("companies");
    const insertAt = companiesIdx >= 0 ? companiesIdx + 1 : sectionOrder.length;
    sectionOrder.splice(insertAt, 0, "past_projects");
  }

  return {
    sectionOrder,
    marquees: {
      company: {
        ...layout.marquees.company,
        speed: HOME_V2_MARQUEE_SPEED_PX_S,
      },
      past_project: {
        ...layout.marquees.past_project,
        speed: HOME_V2_MARQUEE_SPEED_PX_S,
      },
      current_project: layout.marquees.current_project,
    },
  };
}

/**
 * Content for `[locale]/layout` → LayerShell.
 * Home marquees/testimonials follow HOME_CONTENT_SOURCE;
 * Graphic/Interfaces/bio/settings always use legacy shell tables.
 */
export async function loadPortfolioContentForLocale(
  locale: Locale,
): Promise<PortfolioContent> {
  const source = getHomeContentSource();

  if (source === "v2") {
    const [shell, homeV2] = await Promise.all([
      loadPortfolioContent({ homeLists: "omit" }),
      getHomeContentV2(locale),
    ]);
    recordTrace({ source: "v2", loaders: ["legacy-shell", "v2-home"] });
    const ui = mapHomeContentV2ToCurrentUI(homeV2);
    return {
      ...shell,
      companies: ui.companies,
      pastProjects: ui.pastProjects,
      currentProjects: ui.currentProjects,
      testimonials: ui.testimonials,
      homeProjectsPresentation: ui.homeProjectsPresentation,
      settings: {
        ...shell.settings,
        homeLayout: applyHomeV2PresentationLayout(shell.settings.homeLayout),
      },
    };
  }

  const full = await loadPortfolioContent({ homeLists: "include" });
  recordTrace({ source: "legacy", loaders: ["legacy-full"] });
  return {
    ...full,
    homeProjectsPresentation: "legacy-split",
  };
}

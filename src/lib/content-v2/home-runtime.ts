/**
 * Locale portfolio loader with Home-only V2 branch (Phase 4C.4).
 * Branches BEFORE querying Home lists — no legacy+V2 double-read for marquees.
 */
import type { Locale } from "@/i18n/config";
import {
  loadPortfolioContent,
  type PortfolioContent,
} from "@/lib/content";
import { getHomeContentV2 } from "./home";
import { getHomeContentSource, type HomeContentSource } from "./home-source";
import { mapHomeContentV2ToCurrentUI } from "./home-ui";

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
    };
  }

  const full = await loadPortfolioContent({ homeLists: "include" });
  recordTrace({ source: "legacy", loaders: ["legacy-full"] });
  return full;
}

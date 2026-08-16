/**
 * Locale portfolio loader with Home + Graphic source flags (4C.6 / 4D.4).
 *
 * Branches BEFORE querying each domain — no legacy+V2 double-read for
 * Home marquees or Graphic lists/manuals.
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
import { getGraphicContentV2 } from "./graphic";
import {
  getGraphicContentSource,
  type GraphicContentSource,
} from "./graphic-source";
import { mapGraphicContentV2ToCurrentUI } from "./graphic-ui";

/** Presentational marquee speed for Home V2 Entities + Featured Projects. */
export const HOME_V2_MARQUEE_SPEED_PX_S = 100;

export type HomeLoadTrace = {
  source: HomeContentSource;
  loaders: Array<"legacy-full" | "legacy-shell" | "v2-home">;
};

export type GraphicLoadTrace = {
  source: GraphicContentSource;
  loaders: Array<"legacy-graphic" | "v2-graphic">;
};

export type PortfolioLoadTrace = {
  home: HomeLoadTrace;
  graphic: GraphicLoadTrace;
};

let lastHomeTrace: HomeLoadTrace | null = null;
let lastGraphicTrace: GraphicLoadTrace | null = null;
let lastPortfolioTrace: PortfolioLoadTrace | null = null;

/** Test/inspector only — not logged in production paths. */
export function getLastHomeLoadTrace(): HomeLoadTrace | null {
  return lastHomeTrace;
}

export function getLastGraphicLoadTrace(): GraphicLoadTrace | null {
  return lastGraphicTrace;
}

export function getLastPortfolioLoadTrace(): PortfolioLoadTrace | null {
  return lastPortfolioTrace;
}

export function resetHomeLoadTrace(): void {
  lastHomeTrace = null;
}

export function resetGraphicLoadTrace(): void {
  lastGraphicTrace = null;
}

export function resetPortfolioLoadTrace(): void {
  lastHomeTrace = null;
  lastGraphicTrace = null;
  lastPortfolioTrace = null;
}

function recordHomeTrace(trace: HomeLoadTrace): void {
  lastHomeTrace = trace;
  if (process.env.HOME_CONTENT_LOAD_TRACE === "1") {
    console.info(
      `[home-load] source=${trace.source} loaders=${trace.loaders.join(",")}`,
    );
  }
}

function recordGraphicTrace(trace: GraphicLoadTrace): void {
  lastGraphicTrace = trace;
  if (process.env.GRAPHIC_CONTENT_LOAD_TRACE === "1") {
    console.info(
      `[graphic-load] source=${trace.source} loaders=${trace.loaders.join(",")}`,
    );
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
 * Content for `[locale]/layout` → LayerShell and Graphic section pages.
 * Home follows HOME_CONTENT_SOURCE; Graphic follows GRAPHIC_CONTENT_SOURCE.
 */
export async function loadPortfolioContentForLocale(
  locale: Locale,
): Promise<PortfolioContent> {
  const homeSource = getHomeContentSource();
  const graphicSource = getGraphicContentSource();

  const omitHome = homeSource === "v2";
  const omitGraphic = graphicSource === "v2";

  const [shell, homeV2, graphicV2] = await Promise.all([
    loadPortfolioContent({
      homeLists: omitHome ? "omit" : "include",
      graphicLists: omitGraphic ? "omit" : "include",
    }),
    omitHome ? getHomeContentV2(locale) : Promise.resolve(null),
    omitGraphic ? getGraphicContentV2(locale) : Promise.resolve(null),
  ]);

  let result: PortfolioContent = {
    ...shell,
    graphicPresentation: omitGraphic ? "v2" : (shell.graphicPresentation ?? "legacy"),
    homeProjectsPresentation: omitHome
      ? undefined
      : "legacy-split",
  };

  if (graphicV2) {
    const ui = mapGraphicContentV2ToCurrentUI(graphicV2);
    result = {
      ...result,
      covers: ui.covers,
      logos: ui.logos,
      personal: ui.personal,
      illustration: ui.illustration,
      banners: ui.banners,
      eventos: ui.eventos,
      brandManuals: ui.brandManuals,
      graphicPresentation: ui.graphicPresentation,
    };
  }

  if (homeV2) {
    const ui = mapHomeContentV2ToCurrentUI(homeV2);
    result = {
      ...result,
      companies: ui.companies,
      pastProjects: ui.pastProjects,
      currentProjects: ui.currentProjects,
      testimonials: ui.testimonials,
      homeProjectsPresentation: ui.homeProjectsPresentation,
      settings: {
        ...result.settings,
        homeLayout: applyHomeV2PresentationLayout(result.settings.homeLayout),
      },
    };
  }

  const homeTrace: HomeLoadTrace = {
    source: homeSource,
    loaders: omitHome
      ? ["legacy-shell", "v2-home"]
      : ["legacy-full"],
  };
  const graphicTrace: GraphicLoadTrace = {
    source: graphicSource,
    loaders: omitGraphic ? ["v2-graphic"] : ["legacy-graphic"],
  };

  // When home is legacy but shell still ran (with or without graphic omit),
  // home loaders stay legacy-full / equivalent — home lists came from shell.
  if (!omitHome && omitGraphic) {
    homeTrace.loaders = ["legacy-full"];
  }

  recordHomeTrace(homeTrace);
  recordGraphicTrace(graphicTrace);
  lastPortfolioTrace = { home: homeTrace, graphic: graphicTrace };

  return result;
}

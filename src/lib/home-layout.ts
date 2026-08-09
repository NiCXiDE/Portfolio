import type { NamedListKind } from "@/db/entities";

export type MarqueeDisplayMode = "name" | "logo" | "both";
export type MarqueeDirection = "left" | "right";

export type MarqueeSectionConfig = {
  /** Number of parallel scrolling rows (1–n) */
  lines: number;
  direction: MarqueeDirection;
  /** Scroll speed in px/s */
  speed: number;
  displayMode: MarqueeDisplayMode;
};

export type HomeSectionId =
  | "companies"
  | "past_projects"
  | "current_projects"
  | "testimonials";

export type HomeLayoutConfig = {
  sectionOrder: HomeSectionId[];
  marquees: Record<NamedListKind, MarqueeSectionConfig>;
};

export const HOME_SECTION_IDS: HomeSectionId[] = [
  "companies",
  "past_projects",
  "current_projects",
  "testimonials",
];

export const HOME_SECTION_LABELS: Record<HomeSectionId, string> = {
  companies: "Empresas / instituciones",
  past_projects: "Proyectos pasados",
  current_projects: "Proyectos actuales",
  testimonials: "Testimonios",
};

export const KIND_TO_SECTION: Record<NamedListKind, HomeSectionId> = {
  company: "companies",
  past_project: "past_projects",
  current_project: "current_projects",
};

export const SECTION_TO_KIND: Partial<
  Record<HomeSectionId, NamedListKind>
> = {
  companies: "company",
  past_projects: "past_project",
  current_projects: "current_project",
};

const defaultMarquee = (
  direction: MarqueeDirection,
  speed: number,
): MarqueeSectionConfig => ({
  lines: 1,
  direction,
  speed,
  displayMode: "name",
});

export const DEFAULT_HOME_LAYOUT: HomeLayoutConfig = {
  sectionOrder: [...HOME_SECTION_IDS],
  marquees: {
    company: defaultMarquee("left", 36),
    past_project: defaultMarquee("right", 32),
    current_project: defaultMarquee("left", 28),
  },
};

function clampLines(n: unknown): number {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v) || v < 1) return 1;
  return Math.min(v, 12);
}

function clampSpeed(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v) || v < 8) return 8;
  return Math.min(v, 200);
}

function asDirection(v: unknown): MarqueeDirection {
  return v === "right" ? "right" : "left";
}

function asDisplayMode(v: unknown): MarqueeDisplayMode {
  if (v === "logo" || v === "both") return v;
  return "name";
}

function normalizeMarquee(
  raw: Partial<MarqueeSectionConfig> | null | undefined,
  fallback: MarqueeSectionConfig,
): MarqueeSectionConfig {
  return {
    lines: clampLines(raw?.lines ?? fallback.lines),
    direction: asDirection(raw?.direction ?? fallback.direction),
    speed: clampSpeed(raw?.speed ?? fallback.speed),
    displayMode: asDisplayMode(raw?.displayMode ?? fallback.displayMode),
  };
}

export function normalizeHomeLayout(
  raw: Partial<HomeLayoutConfig> | null | undefined,
): HomeLayoutConfig {
  const orderRaw = Array.isArray(raw?.sectionOrder) ? raw.sectionOrder : [];
  const seen = new Set<HomeSectionId>();
  const sectionOrder: HomeSectionId[] = [];
  for (const id of orderRaw) {
    if (
      HOME_SECTION_IDS.includes(id as HomeSectionId) &&
      !seen.has(id as HomeSectionId)
    ) {
      seen.add(id as HomeSectionId);
      sectionOrder.push(id as HomeSectionId);
    }
  }
  for (const id of HOME_SECTION_IDS) {
    if (!seen.has(id)) sectionOrder.push(id);
  }

  const m = (raw?.marquees ?? {}) as Partial<
    Record<keyof HomeLayoutConfig["marquees"], Partial<MarqueeSectionConfig>>
  >;
  return {
    sectionOrder,
    marquees: {
      company: normalizeMarquee(m.company, DEFAULT_HOME_LAYOUT.marquees.company),
      past_project: normalizeMarquee(
        m.past_project,
        DEFAULT_HOME_LAYOUT.marquees.past_project,
      ),
      current_project: normalizeMarquee(
        m.current_project,
        DEFAULT_HOME_LAYOUT.marquees.current_project,
      ),
    },
  };
}

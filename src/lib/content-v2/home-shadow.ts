/**
 * Home shadow comparison (Phase 4C.3).
 *
 * READ-ONLY semantic snapshots for legacy Home vs HomeContentV2.
 * Not wired to public Home requests — inspectors/tests only.
 */
import type { Locale } from "@/i18n/config";
import type {
  NamedListItemContent,
  TestimonialContent,
} from "@/lib/content";
import { t } from "@/lib/content";
import type { HomeContentV2 } from "./home";

export type ShadowHrefKind = "internal" | "external" | "none";
export type ShadowSection = "past" | "current";

export type HomeShadowEntity = {
  key: string;
  displayName: string;
  order: number;
  hasLogo: boolean;
  clickable: boolean;
  hrefKind: ShadowHrefKind;
  /** When true, Entity page may exist later — not a current href. */
  futureEntityPageUnavailable: boolean;
};

export type HomeShadowProject = {
  key: string;
  displayName: string;
  section: ShadowSection;
  order: number;
  clickable: boolean;
  hrefKind: ShadowHrefKind;
  /** Covers / project detail URLs not required by current marquee UI. */
  coverRequired: false;
  projectRouteRequired: false;
};

export type HomeShadowTestimonial = {
  key: string;
  displayName: string;
  organization: string;
  hasAvatar: boolean;
  order: number;
  hasOrgLink: boolean;
  quoteLen: number;
  roleLen: number;
};

export type HomeShadowSnapshot = {
  locale: Locale;
  entities: HomeShadowEntity[];
  pastProjects: HomeShadowProject[];
  currentProjects: HomeShadowProject[];
  testimonials: HomeShadowTestimonial[];
};

export type ShadowDiffKind =
  | "EXPECTED_REMOVED_ENTITY"
  | "EXPECTED_REMOVED_PROJECT"
  | "EXPECTED_SECTION_CHANGE"
  | "EXPECTED_NO_INTERNAL_HREF"
  | "EXPECTED_MODEL_RENAME"
  | "EXPECTED_COUNT_DELTA"
  | "UNEXPECTED";

export type ShadowDiff = {
  kind: ShadowDiffKind;
  surface:
    | "entities"
    | "pastProjects"
    | "currentProjects"
    | "testimonials"
    | "model"
    | "counts";
  key: string;
  detail: string;
};

export type HomeShadowReport = {
  locale: Locale;
  legacyCounts: {
    entities: number;
    pastProjects: number;
    currentProjects: number;
    testimonials: number;
  };
  v2Counts: {
    entities: number;
    pastProjects: number;
    currentProjects: number;
    testimonials: number;
  };
  expected: ShadowDiff[];
  unexpected: ShadowDiff[];
  shadowOk: boolean;
  linkMatrix: Array<{
    item: string;
    legacyClickable: boolean;
    legacyHrefKind: ShadowHrefKind;
    v2Clickable: boolean;
    v2HrefKind: ShadowHrefKind;
    action4c4: string;
  }>;
};

/** Minimal legacy Home slice — avoids depending on full PortfolioContent. */
export type LegacyHomeSlice = {
  companies: NamedListItemContent[];
  pastProjects: NamedListItemContent[];
  currentProjects: NamedListItemContent[];
  testimonials: TestimonialContent[];
};

/** Canonical Home Entities that survive cutover. */
export const EXPECTED_V2_ENTITY_KEYS = [
  "aicore",
  "apsmm",
  "citf",
  "ludica",
  "orbita-l-b",
  "push",
] as const;

/** Projects expected on V2 Home (section from status, not this list). */
export const EXPECTED_V2_PROJECT_KEYS = [
  "adapto-pay",
  "casiba",
  "clearwater",
  "cloronor-trading",
  "expedicion-polo",
  "juegos-provinciales",
  "mental-training-tech-24-5",
  "omnigroup",
  "concitar",
  "repuestos-carlitos",
  "templeton-digital-transformation-assessment",
  "taily",
] as const;

/** Legacy current → V2 past (status=completed). */
export const EXPECTED_SECTION_CHANGES: Record<
  string,
  { from: ShadowSection; to: ShadowSection }
> = {
  concitar: { from: "current", to: "past" },
  "repuestos-carlitos": { from: "current", to: "past" },
};

/**
 * Legacy project display labels (normalized) → V2 project id.
 * Templeton spelling variant included.
 */
export const LEGACY_PROJECT_LABEL_TO_KEY: Record<string, string> = {
  "adapto pay": "adapto-pay",
  "asesor financiero": "asesor-financiero",
  athenas: "__discard_athenas__",
  casiba: "casiba",
  clearwater: "clearwater",
  cloronor: "cloronor-trading",
  "expedicion polo": "expedicion-polo",
  "expedición polo": "expedicion-polo",
  "fiserv.": "__discard_fiserv__",
  fiserv: "__discard_fiserv__",
  inspector: "__discard_inspector__",
  "juegos provinciales tecnologicos": "juegos-provinciales",
  "juegos provinciales tecnológicos": "juegos-provinciales",
  "la estacion": "__discard_la_estacion__",
  "la estación": "__discard_la_estacion__",
  "mental tech training": "mental-training-tech-24-5",
  "omni group": "omnigroup",
  proxi: "proxi",
  simaas: "simaas-marketplace",
  "templeton & matthews": "templeton-digital-transformation-assessment",
  "templeton & mathews": "templeton-digital-transformation-assessment",
  concitar: "concitar",
  microtime: "microtime",
  "repuestos carlitos": "repuestos-carlitos",
  sessions: "sessions",
  syllabi: "syllabi",
  taily: "taily",
};

/** Removals approved in 4C.0 / 4C.0B / 4C.1 (not on V2 Home). */
export const EXPECTED_REMOVED_PROJECT_KEYS = new Set<string>([
  "__discard_athenas__",
  "__discard_fiserv__",
  "__discard_inspector__",
  "__discard_la_estacion__",
  "asesor-financiero",
  "proxi",
  "simaas-marketplace",
  "microtime",
  "sessions",
  "syllabi",
]);

function normLabel(label: string): string {
  return label
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function hrefKindFromLegacyHub(hubHref: string | null | undefined): ShadowHrefKind {
  if (!hubHref) return "none";
  const v = hubHref.trim();
  if (!v) return "none";
  if (/^https?:\/\//i.test(v)) return "external";
  if (v.startsWith("/")) return "internal";
  return "none";
}

function hrefKindFromV2(href: string | null | undefined): ShadowHrefKind {
  if (!href) return "none";
  if (/^https?:\/\//i.test(href.trim())) return "external";
  if (href.trim().startsWith("/")) return "internal";
  return "none";
}

/** Map legacy company chip → canonical entity key, or null if marquee-only discard. */
export function resolveLegacyCompanyKey(
  item: NamedListItemContent,
): string | null {
  if (item.brandId && (EXPECTED_V2_ENTITY_KEYS as readonly string[]).includes(item.brandId)) {
    return item.brandId;
  }
  const label = normLabel(item.label);
  if (label.includes("aicore")) return "aicore";
  if (
    label.includes("apsmm") ||
    label.includes("asociacion de profesionales de salud") ||
    label.includes("asociación de profesionales de salud")
  ) {
    return "apsmm";
  }
  if (label.includes("citf") || label.includes("cluster de innovacion") || label.includes("clúster de innovación") || label.includes("cluster de innovación")) {
    return "citf";
  }
  if (label.includes("ludica") || label.includes("lúdica")) return "ludica";
  if (label.includes("orbita") || label.includes("órbita")) return "orbita-l-b";
  if (label.includes("push")) return "push";
  return null;
}

export function resolveLegacyProjectKey(label: string): string {
  const n = normLabel(label);
  if (LEGACY_PROJECT_LABEL_TO_KEY[n]) return LEGACY_PROJECT_LABEL_TO_KEY[n]!;
  // accent-stripped fallback already in normLabel
  if (n.includes("templeton")) {
    return "templeton-digital-transformation-assessment";
  }
  if (n.includes("expedicion")) return "expedicion-polo";
  if (n.includes("juegos provinciales")) return "juegos-provinciales";
  return `__unmapped_${n.replace(/[^a-z0-9]+/g, "_")}__`;
}

function projectChip(
  key: string,
  displayName: string,
  section: ShadowSection,
  order: number,
  clickable: boolean,
  hrefKind: ShadowHrefKind,
): HomeShadowProject {
  return {
    key,
    displayName,
    section,
    order,
    clickable,
    hrefKind,
    coverRequired: false,
    projectRouteRequired: false,
  };
}

export function normalizeLegacyHome(
  slice: LegacyHomeSlice,
  locale: Locale,
): HomeShadowSnapshot {
  const entities: HomeShadowEntity[] = slice.companies.map((item, order) => {
    const key =
      resolveLegacyCompanyKey(item) ?? `legacy-company:${item.id}`;
    const kind = hrefKindFromLegacyHub(item.hubHref);
    return {
      key,
      displayName: item.label,
      order,
      hasLogo: Boolean(item.logo),
      clickable: kind !== "none",
      hrefKind: kind,
      futureEntityPageUnavailable: false,
    };
  });

  const pastProjects = slice.pastProjects.map((item, order) => {
    const key = resolveLegacyProjectKey(item.label);
    const kind = hrefKindFromLegacyHub(item.hubHref);
    return projectChip(key, item.label, "past", order, kind !== "none", kind);
  });

  const currentProjects = slice.currentProjects.map((item, order) => {
    const key = resolveLegacyProjectKey(item.label);
    const kind = hrefKindFromLegacyHub(item.hubHref);
    return projectChip(
      key,
      item.label,
      "current",
      order,
      kind !== "none",
      kind,
    );
  });

  const testimonials: HomeShadowTestimonial[] = slice.testimonials
    .filter((row) => !row.hidden)
    .map((row, order) => {
      const quote = t(row.quote, locale);
      const role = t(row.role, locale);
      return {
        key: row.id,
        displayName: row.name,
        organization: row.company.name,
        hasAvatar: Boolean(row.image),
        order,
        hasOrgLink: Boolean(row.company.href),
        quoteLen: quote.trim().length,
        roleLen: role.trim().length,
      };
    });

  return {
    locale,
    entities,
    pastProjects,
    currentProjects,
    testimonials,
  };
}

export function normalizeHomeContentV2(
  home: HomeContentV2,
): HomeShadowSnapshot {
  const entities: HomeShadowEntity[] = home.entities.map((item, order) => {
    const kind = hrefKindFromV2(item.href);
    return {
      key: item.id,
      displayName: item.label,
      order: item.homeOrder ?? order,
      hasLogo: Boolean(item.logoUrl),
      clickable: kind !== "none",
      hrefKind: kind,
      // pageEnabled alone never invents /entidades — treat missing href as unavailable page
      futureEntityPageUnavailable: kind === "none",
    };
  });

  // Prefer declared homeOrder for order field
  entities.sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));

  const pastProjects = home.pastProjects.map((item, i) =>
    projectChip(
      item.id,
      item.label,
      "past",
      item.homeOrder ?? i,
      hrefKindFromV2(item.href) !== "none",
      hrefKindFromV2(item.href),
    ),
  );
  pastProjects.sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));

  const currentProjects = home.currentProjects.map((item, i) =>
    projectChip(
      item.id,
      item.label,
      "current",
      item.homeOrder ?? i,
      hrefKindFromV2(item.href) !== "none",
      hrefKindFromV2(item.href),
    ),
  );
  currentProjects.sort(
    (a, b) => a.order - b.order || a.key.localeCompare(b.key),
  );

  const testimonials: HomeShadowTestimonial[] = home.testimonials.map(
    (row, order) => ({
      key: row.id,
      displayName: row.name,
      organization: row.organization.name,
      hasAvatar: Boolean(row.imageUrl),
      order: row.sortOrder ?? order,
      hasOrgLink: Boolean(row.organization.href),
      quoteLen: row.quote.trim().length,
      roleLen: row.role.trim().length,
    }),
  );
  testimonials.sort(
    (a, b) => a.order - b.order || a.key.localeCompare(b.key),
  );

  return {
    locale: home.locale,
    entities,
    pastProjects,
    currentProjects,
    testimonials,
  };
}

function modelRenameDiffs(): ShadowDiff[] {
  return [
    {
      kind: "EXPECTED_MODEL_RENAME",
      surface: "model",
      key: "logo→logoUrl",
      detail: "InfiniteMarquee logo field maps from HomeEntity/Project logoUrl in 4C.4",
    },
    {
      kind: "EXPECTED_MODEL_RENAME",
      surface: "model",
      key: "hubHref→href",
      detail: "Legacy internal /marcas hubHref is not invented in V2; use external href or null",
    },
    {
      kind: "EXPECTED_MODEL_RENAME",
      surface: "model",
      key: "company→organization",
      detail: "Testimonial company block maps from organization in HomeContentV2",
    },
    {
      kind: "EXPECTED_MODEL_RENAME",
      surface: "model",
      key: "image→imageUrl",
      detail: "Testimonial image maps from imageUrl",
    },
  ];
}

function allProjects(snap: HomeShadowSnapshot): HomeShadowProject[] {
  return [...snap.pastProjects, ...snap.currentProjects];
}

/**
 * Compare legacy vs V2 Home shadows.
 * Approved differences are EXPECTED_*; anything else is UNEXPECTED.
 */
export function compareHomeShadows(
  legacy: HomeShadowSnapshot,
  v2: HomeShadowSnapshot,
): HomeShadowReport {
  const expected: ShadowDiff[] = [...modelRenameDiffs()];
  const unexpected: ShadowDiff[] = [];

  expected.push({
    kind: "EXPECTED_COUNT_DELTA",
    surface: "counts",
    key: "entities",
    detail: `legacy=${legacy.entities.length} v2=${v2.entities.length} (18→6 approved)`,
  });
  expected.push({
    kind: "EXPECTED_COUNT_DELTA",
    surface: "counts",
    key: "pastProjects",
    detail: `legacy=${legacy.pastProjects.length} v2=${v2.pastProjects.length}`,
  });
  expected.push({
    kind: "EXPECTED_COUNT_DELTA",
    surface: "counts",
    key: "currentProjects",
    detail: `legacy=${legacy.currentProjects.length} v2=${v2.currentProjects.length}`,
  });

  // ——— Entities ———
  const legacyEntityByKey = new Map<string, HomeShadowEntity[]>();
  for (const e of legacy.entities) {
    const list = legacyEntityByKey.get(e.key) ?? [];
    list.push(e);
    legacyEntityByKey.set(e.key, list);
  }

  for (const [key, items] of legacyEntityByKey) {
    const isSurvivor = (EXPECTED_V2_ENTITY_KEYS as readonly string[]).includes(
      key,
    );
    if (!isSurvivor) {
      for (const item of items) {
        expected.push({
          kind: "EXPECTED_REMOVED_ENTITY",
          surface: "entities",
          key: item.key,
          detail: `legacy marquee-only chip "${item.displayName}" not a Home Entity`,
        });
      }
      continue;
    }
    const v2Item = v2.entities.find((e) => e.key === key);
    if (!v2Item) {
      unexpected.push({
        kind: "UNEXPECTED",
        surface: "entities",
        key,
        detail: "expected V2 Home Entity missing",
      });
      continue;
    }
    const legacyItem = items[0]!;
    if (legacyItem.hasLogo !== v2Item.hasLogo) {
      // V2 gaining a logo where legacy chip had none is acceptable for survivors
      if (legacyItem.hasLogo && !v2Item.hasLogo) {
        unexpected.push({
          kind: "UNEXPECTED",
          surface: "entities",
          key,
          detail: "logo present in legacy, missing in V2",
        });
      } else {
        expected.push({
          kind: "EXPECTED_MODEL_RENAME",
          surface: "entities",
          key: `${key}:logo`,
          detail: "V2 Entity logo available where legacy chip lacked brand logo",
        });
      }
    }
    if (
      legacyItem.hrefKind === "internal" &&
      v2Item.hrefKind !== "internal"
    ) {
      expected.push({
        kind: "EXPECTED_NO_INTERNAL_HREF",
        surface: "entities",
        key,
        detail: `legacy ${legacyItem.hrefKind} → v2 ${v2Item.hrefKind} (no /marcas|/entidades invent)`,
      });
    } else if (legacyItem.clickable && !v2Item.clickable) {
      expected.push({
        kind: "EXPECTED_NO_INTERNAL_HREF",
        surface: "entities",
        key,
        detail: "legacy clickable hub dropped; V2 has no safe href yet",
      });
    }
  }

  for (const key of EXPECTED_V2_ENTITY_KEYS) {
    if (!v2.entities.some((e) => e.key === key)) {
      unexpected.push({
        kind: "UNEXPECTED",
        surface: "entities",
        key,
        detail: "required V2 entity absent from snapshot",
      });
    }
  }

  for (const e of v2.entities) {
    if (!(EXPECTED_V2_ENTITY_KEYS as readonly string[]).includes(e.key)) {
      unexpected.push({
        kind: "UNEXPECTED",
        surface: "entities",
        key: e.key,
        detail: "unexpected extra V2 Home entity",
      });
    }
  }

  // ——— Projects ———
  const legacyProjects = allProjects(legacy);
  const v2Projects = allProjects(v2);
  const v2ByKey = new Map(v2Projects.map((p) => [p.key, p]));
  const legacyByKey = new Map<string, HomeShadowProject>();
  for (const p of legacyProjects) {
    // last write wins if duplicate keys (shouldn't); prefer first
    if (!legacyByKey.has(p.key)) legacyByKey.set(p.key, p);
  }

  for (const [key, lp] of legacyByKey) {
    const vp = v2ByKey.get(key);
    if (!vp) {
      if (
        EXPECTED_REMOVED_PROJECT_KEYS.has(key) ||
        key.startsWith("__discard_")
      ) {
        expected.push({
          kind: "EXPECTED_REMOVED_PROJECT",
          surface:
            lp.section === "past" ? "pastProjects" : "currentProjects",
          key,
          detail: `legacy "${lp.displayName}" not on V2 Home`,
        });
      } else {
        unexpected.push({
          kind: "UNEXPECTED",
          surface:
            lp.section === "past" ? "pastProjects" : "currentProjects",
          key,
          detail: `legacy project missing from V2 Home without whitelist: ${lp.displayName}`,
        });
      }
      continue;
    }

    const change = EXPECTED_SECTION_CHANGES[key];
    if (lp.section !== vp.section) {
      if (
        change &&
        change.from === lp.section &&
        change.to === vp.section
      ) {
        expected.push({
          kind: "EXPECTED_SECTION_CHANGE",
          surface: "pastProjects",
          key,
          detail: `${lp.section} → ${vp.section} (status-driven)`,
        });
      } else {
        unexpected.push({
          kind: "UNEXPECTED",
          surface: "pastProjects",
          key,
          detail: `unexpected section change ${lp.section} → ${vp.section}`,
        });
      }
    }

    if (lp.hrefKind === "internal" && vp.hrefKind !== "internal") {
      expected.push({
        kind: "EXPECTED_NO_INTERNAL_HREF",
        surface:
          vp.section === "past" ? "pastProjects" : "currentProjects",
        key,
        detail: "project marquee does not invent internal project routes",
      });
    }
  }

  for (const vp of v2Projects) {
    if (!(EXPECTED_V2_PROJECT_KEYS as readonly string[]).includes(vp.key)) {
      unexpected.push({
        kind: "UNEXPECTED",
        surface:
          vp.section === "past" ? "pastProjects" : "currentProjects",
        key: vp.key,
        detail: "unexpected extra V2 Home project",
      });
    }
    if (!legacyByKey.has(vp.key)) {
      unexpected.push({
        kind: "UNEXPECTED",
        surface:
          vp.section === "past" ? "pastProjects" : "currentProjects",
        key: vp.key,
        detail: "V2 Home project with no legacy counterpart",
      });
    }
  }

  // Hard invariants
  const v2CurrentKeys = v2.currentProjects.map((p) => p.key);
  if (v2CurrentKeys.length !== 1 || v2CurrentKeys[0] !== "taily") {
    unexpected.push({
      kind: "UNEXPECTED",
      surface: "currentProjects",
      key: "current-set",
      detail: `expected only taily, got [${v2CurrentKeys.join(", ")}]`,
    });
  }
  for (const mustPast of ["concitar", "repuestos-carlitos"] as const) {
    const p = v2.pastProjects.find((x) => x.key === mustPast);
    if (!p) {
      unexpected.push({
        kind: "UNEXPECTED",
        surface: "pastProjects",
        key: mustPast,
        detail: "must appear in V2 past",
      });
    }
  }
  if (
    !v2.pastProjects.some(
      (p) => p.key === "templeton-digital-transformation-assessment",
    )
  ) {
    unexpected.push({
      kind: "UNEXPECTED",
      surface: "pastProjects",
      key: "templeton-digital-transformation-assessment",
      detail: "Templeton mapping missing on V2 past",
    });
  } else {
    const legT = legacyByKey.get("templeton-digital-transformation-assessment");
    if (!legT) {
      unexpected.push({
        kind: "UNEXPECTED",
        surface: "pastProjects",
        key: "templeton-digital-transformation-assessment",
        detail: "legacy Templeton chip failed to resolve to V2 key",
      });
    }
  }

  // ——— Testimonials ———
  const legT = new Map(legacy.testimonials.map((x) => [x.key, x]));
  const v2T = new Map(v2.testimonials.map((x) => [x.key, x]));

  if (legacy.testimonials.length !== 4 || v2.testimonials.length !== 4) {
    unexpected.push({
      kind: "UNEXPECTED",
      surface: "testimonials",
      key: "count",
      detail: `expected 4/4, legacy=${legacy.testimonials.length} v2=${v2.testimonials.length}`,
    });
  }

  for (const [key, lt] of legT) {
    const vt = v2T.get(key);
    if (!vt) {
      unexpected.push({
        kind: "UNEXPECTED",
        surface: "testimonials",
        key,
        detail: "testimonial missing in V2",
      });
      continue;
    }
    if (lt.displayName !== vt.displayName) {
      unexpected.push({
        kind: "UNEXPECTED",
        surface: "testimonials",
        key,
        detail: `name mismatch legacy="${lt.displayName}" v2="${vt.displayName}"`,
      });
    }
    if (lt.hasAvatar !== vt.hasAvatar) {
      unexpected.push({
        kind: "UNEXPECTED",
        surface: "testimonials",
        key,
        detail: "avatar presence mismatch",
      });
    }
    if (lt.quoteLen === 0 || vt.quoteLen === 0) {
      unexpected.push({
        kind: "UNEXPECTED",
        surface: "testimonials",
        key,
        detail: "empty quote after locale resolve",
      });
    }
    if (!vt.organization.trim()) {
      unexpected.push({
        kind: "UNEXPECTED",
        surface: "testimonials",
        key,
        detail: "V2 organization empty",
      });
    }
  }

  const legOrder = legacy.testimonials.map((x) => x.key).join(",");
  const v2Order = v2.testimonials.map((x) => x.key).join(",");
  if (legOrder !== v2Order) {
    unexpected.push({
      kind: "UNEXPECTED",
      surface: "testimonials",
      key: "order",
      detail: `sequence mismatch legacy=[${legOrder}] v2=[${v2Order}]`,
    });
  }

  for (const key of v2T.keys()) {
    if (!legT.has(key)) {
      unexpected.push({
        kind: "UNEXPECTED",
        surface: "testimonials",
        key,
        detail: "extra V2 testimonial",
      });
    }
  }

  // Link matrix for survivor entities
  const linkMatrix = EXPECTED_V2_ENTITY_KEYS.map((key) => {
    const leg = legacyEntityByKey.get(key)?.[0];
    const vv = v2.entities.find((e) => e.key === key);
    const legacyClickable = Boolean(leg?.clickable);
    const legacyHrefKind = leg?.hrefKind ?? "none";
    const v2Clickable = Boolean(vv?.clickable);
    const v2HrefKind = vv?.hrefKind ?? "none";
    let action4c4 =
      "map logo→logoUrl; hubHref→href (external only) or null";
    if (v2HrefKind === "none") {
      action4c4 +=
        "; no /entidades until routes exist (futureEntityPageUnavailable)";
    }
    if (legacyHrefKind === "internal" && v2HrefKind !== "internal") {
      action4c4 += "; drop internal /marcas link for this chip";
    }
    return {
      item: key,
      legacyClickable,
      legacyHrefKind,
      v2Clickable,
      v2HrefKind,
      action4c4,
    };
  });

  return {
    locale: v2.locale,
    legacyCounts: {
      entities: legacy.entities.length,
      pastProjects: legacy.pastProjects.length,
      currentProjects: legacy.currentProjects.length,
      testimonials: legacy.testimonials.length,
    },
    v2Counts: {
      entities: v2.entities.length,
      pastProjects: v2.pastProjects.length,
      currentProjects: v2.currentProjects.length,
      testimonials: v2.testimonials.length,
    },
    expected,
    unexpected,
    shadowOk: unexpected.length === 0,
    linkMatrix,
  };
}

/** Design-only note for 4C.4 (not implemented). */
export const HOME_CONTENT_SOURCE_FLAG_DESIGN = {
  envName: "HOME_CONTENT_SOURCE",
  values: ["legacy", "v2"] as const,
  default: "legacy" as const,
  scope: "home-only",
  resolution: "server-side",
  notes: [
    "Do not expose via public query params",
    "Default legacy until visual cutover approved",
    "Bio/settings/brands may remain legacy even when marquees use V2",
  ],
};

export const HOME_UI_MAPPING_4C4 = [
  {
    currentProp: "companies[].label",
    v2Source: "entities[].label",
    mapping: "direct",
  },
  {
    currentProp: "companies[].logo",
    v2Source: "entities[].logoUrl",
    mapping: "rename",
  },
  {
    currentProp: "companies[].hubHref",
    v2Source: "entities[].href",
    mapping:
      "external → <a>; null → plain chip; never invent /marcas or /entidades",
  },
  {
    currentProp: "pastProjects / currentProjects",
    v2Source: "pastProjects / currentProjects",
    mapping: "already split by status in getHomeContentV2",
  },
  {
    currentProp: "projects[].label",
    v2Source: "projects[].label|title",
    mapping: "direct localized string",
  },
  {
    currentProp: "projects[].logo / hubHref",
    v2Source: "coverUrl / href",
    mapping: "NOT_REQUIRED_FOR_CURRENT_HOME (text chips)",
  },
  {
    currentProp: "testimonials[].image",
    v2Source: "testimonials[].imageUrl",
    mapping: "rename",
  },
  {
    currentProp: "testimonials[].company",
    v2Source: "testimonials[].organization",
    mapping: "rename fields logo→logoUrl",
  },
] as const;

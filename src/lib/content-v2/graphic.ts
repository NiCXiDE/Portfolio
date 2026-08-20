/**
 * Graphic Content V2 adapter (Phase 4D.2).
 *
 * Maps public Pieces into a Graphic-shaped payload for a future cutover.
 * NOT wired to public Graphic pages — inspectors/tests only.
 */
import type { Locale } from "@/i18n/config";
import type {
  PieceCategory,
  PieceOrigin,
  ProjectEntityRelationRole,
} from "@/db/entities-v2";
import {
  getPublicPieceBySlugV2,
  getPublicPiecesV2,
} from "./pieces";
import { pickLocalized } from "./map";
import type {
  PublicPieceFilters,
  PublicPieceResource,
  PublicPieceSummary,
  PublicSortMode,
} from "./types";

export type GraphicSectionIdV2 =
  | "visual-identity"
  | "illustration-artwork"
  | "campaigns-communication"
  | "print"
  | "other";

/** Section labels aligned with current Graphic UI vocabulary (not content copy). */
export const GRAPHIC_SECTION_LABELS: Record<
  GraphicSectionIdV2,
  { es: string; en: string }
> = {
  "visual-identity": {
    es: "Logotipos/Wordmarks",
    en: "Logos/Wordmarks",
  },
  "illustration-artwork": {
    es: "Ilustración y artwork",
    en: "Illustration & artwork",
  },
  "campaigns-communication": {
    es: "Eventos",
    en: "Events",
  },
  print: {
    es: "Banners / print",
    en: "Banners / print",
  },
  other: {
    es: "Otros",
    en: "Other",
  },
};

/** Roles allowed as public organizational context on Graphic. */
export const GRAPHIC_PUBLIC_ENTITY_ROLES: ReadonlySet<ProjectEntityRelationRole> =
  new Set(["client", "brand-owner", "responsible", "collaborator"]);

export const GRAPHIC_DENIED_ENTITY_ROLES: ReadonlySet<ProjectEntityRelationRole> =
  new Set(["employer", "intermediary"]);

/** Known discarded / non-public Pieces — never surface in Graphic adapter. */
export const GRAPHIC_NEVER_RETURN_IDS = new Set([
  "buhoprofe",
  "microtime",
  "labcom",
]);

export type GraphicSortMode = Extract<
  PublicSortMode,
  "az" | "za" | "newest" | "oldest" | "default"
>;

export type GraphicPieceFiltersV2 = {
  category?: PieceCategory;
  tag?: string;
  entityId?: string;
  projectId?: string;
  /** Future UI: one active filter at a time — enforced by callers, not DB. */
  sort?: GraphicSortMode;
};

export type GraphicProjectContextV2 = {
  id: string;
  slug: string;
  title: string;
};

export type GraphicEntityContextV2 = {
  id: string;
  name: string;
  role: ProjectEntityRelationRole;
};

export type GraphicPieceItemV2 = {
  id: string;
  slug: string | null;
  title: string;
  alt: string;
  category: PieceCategory;
  origin: PieceOrigin | null;
  tags: Array<{ slug: string; label: string; isNsfw: boolean }>;
  /** Main list/thumbnail image — never invented. */
  imageUrl: string | null;
  fit: "cover" | "contain" | null;
  year: string | null;
  detail: string | null;
  href: string | null;
  hrefLabel: string | null;
  project: GraphicProjectContextV2 | null;
  entity: GraphicEntityContextV2 | null;
  resourceCount: number;
  sortOrder: number;
};

export type GraphicSectionV2 = {
  id: GraphicSectionIdV2;
  label: string;
  items: GraphicPieceItemV2[];
};

export type GraphicManualV2 = {
  id: string;
  slug: string | null;
  title: string;
  year: string | null;
  detail: string | null;
  coverUrl: string | null;
  pdfUrl: string | null;
  projectId: string | null;
  entityId: string | null;
};

/** Tag that routes a visual-identity Piece into Graphic manuals[] (not sections). */
export const MANUAL_TAG_SLUG = "manual";

export function isManualTaggedPiece(
  piece: Pick<PublicPieceSummary, "tags">,
): boolean {
  return piece.tags.some((t) => t.slug === MANUAL_TAG_SLUG);
}

/** PDF for manuals: prefer .pdf path/url, else first resource (CITF model). */
export function resolveManualPdfUrl(
  piece: Pick<PublicPieceSummary, "resources">,
): string | null {
  const ranked = [...piece.resources].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const byExt = ranked.find((r) => {
    const u = (r.url ?? r.path ?? "").toLowerCase();
    return u.endsWith(".pdf");
  });
  if (byExt) return byExt.url ?? byExt.path ?? null;
  const first = ranked[0];
  return first?.url ?? first?.path ?? null;
}

export type GraphicPieceDetailV2 = GraphicPieceItemV2 & {
  resources: Array<{
    id: string;
    url: string | null;
    kind: string | null;
    label: string | null;
    sortOrder: number;
  }>;
  /** Gallery = piece_resources only (no legacy reconstruction). */
  gallery: Array<{
    id: string;
    url: string | null;
    label: string | null;
  }>;
};

export type GraphicContentV2 = {
  locale: Locale;
  sections: GraphicSectionV2[];
  /** Regular Graphic pieces only — excludes tag=`manual` (those live in manuals[]). */
  pieces: GraphicPieceItemV2[];
  /** Pieces tagged `manual` (category remains visual-identity). */
  manuals: GraphicManualV2[];
  meta: {
    counts: {
      /** Regular pieces (not manuals). */
      pieces: number;
      manuals: number;
      standalone: number;
      projectLinked: number;
      missingMainImage: number;
      withTags: number;
      withEntity: number;
      withResources: number;
      byCategory: Record<string, number>;
    };
    manualStatus: "PRESENT" | "DETAIL_GAP";
    seyierGalleryGap: boolean;
    sessionsReview: "CURRENT_PUBLIC_SAFE" | "NEEDS_REVIEW" | "ABSENT";
    sessionsPieceIds: string[];
  };
};

const SECTION_ORDER: GraphicSectionIdV2[] = [
  "visual-identity",
  "illustration-artwork",
  "campaigns-communication",
  "print",
  "other",
];

export function categoryToSectionId(
  category: PieceCategory,
): GraphicSectionIdV2 {
  switch (category) {
    case "visual-identity":
    case "illustration-artwork":
    case "campaigns-communication":
    case "print":
    case "other":
      return category;
    default:
      return "other";
  }
}

/**
 * Main image rule:
 * 1. Piece.srcUrl when non-empty
 * 2. else first resource with kind hint cover/thumb/primary/main
 * 3. else null
 * Resources are never all promoted to cover.
 */
export function resolvePieceMainImage(
  piece: Pick<PublicPieceSummary, "srcUrl" | "resources">,
): string | null {
  const src = piece.srcUrl?.trim();
  if (src) return src;

  const prioritized = [...piece.resources].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  for (const r of prioritized) {
    const kind = (r.kind ?? "").toLowerCase();
    if (
      kind.includes("cover") ||
      kind.includes("thumb") ||
      kind.includes("primary") ||
      kind.includes("main")
    ) {
      const url = r.url?.trim();
      if (url) return url;
    }
  }
  return null;
}

export function resolveSafeEntityContext(
  piece: PublicPieceSummary,
): GraphicEntityContextV2 | null {
  const candidates = piece.entities.filter((link) => {
    if (!link.entity) return false;
    if (GRAPHIC_DENIED_ENTITY_ROLES.has(link.relationRole)) return false;
    if (!GRAPHIC_PUBLIC_ENTITY_ROLES.has(link.relationRole)) return false;
    return true;
  });

  if (!candidates.length) return null;

  candidates.sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.entityId.localeCompare(b.entityId);
  });

  const chosen = candidates[0]!;
  const name =
    chosen.entity!.shortName?.trim() || chosen.entity!.name.trim();
  if (!name) return null;

  return {
    id: chosen.entity!.id,
    name,
    role: chosen.relationRole,
  };
}

function mapPieceItem(
  piece: PublicPieceSummary,
  locale: Locale,
): GraphicPieceItemV2 | null {
  if (GRAPHIC_NEVER_RETURN_IDS.has(piece.id)) return null;
  if (
    [...GRAPHIC_NEVER_RETURN_IDS].some(
      (id) => piece.id === id || piece.id.startsWith(`${id}-`),
    )
  ) {
    return null;
  }

  const title =
    pickLocalized(piece.title, locale).trim() ||
    piece.alt.trim() ||
    piece.id;

  return {
    id: piece.id,
    slug: piece.slug,
    title,
    alt: piece.alt,
    category: piece.category,
    origin: piece.origin,
    tags: piece.tags.map((t) => ({
      slug: t.slug,
      label: locale === "en" ? t.labelEn || t.labelEs : t.labelEs || t.labelEn,
      isNsfw: t.isNsfw,
    })),
    imageUrl: resolvePieceMainImage(piece),
    fit: piece.fit,
    year: piece.year,
    detail: pickLocalized(piece.detail, locale).trim() || null,
    href: piece.href,
    hrefLabel: pickLocalized(piece.hrefLabel, locale).trim() || null,
    project: piece.project
      ? {
          id: piece.project.id,
          slug: piece.project.slug,
          title: pickLocalized(piece.project.title, locale) || piece.project.id,
        }
      : null,
    entity: resolveSafeEntityContext(piece),
    resourceCount: piece.resources.length,
    sortOrder: piece.sortOrder,
  };
}

function mapDetail(
  piece: PublicPieceSummary,
  locale: Locale,
): GraphicPieceDetailV2 | null {
  const item = mapPieceItem(piece, locale);
  if (!item) return null;

  const resources = [...piece.resources]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((r: PublicPieceResource) => ({
      id: r.id,
      url: r.url,
      kind: r.kind,
      label: pickLocalized(r.label, locale).trim() || null,
      sortOrder: r.sortOrder,
    }));

  return {
    ...item,
    resources,
    gallery: resources
      .filter((r) => Boolean(r.url))
      .map((r) => ({
        id: r.id,
        url: r.url,
        label: r.label,
      })),
  };
}

function buildSessionsReview(pieces: GraphicPieceItemV2[]): {
  sessionsReview: GraphicContentV2["meta"]["sessionsReview"];
  sessionsPieceIds: string[];
} {
  const sessions = pieces.filter(
    (p) =>
      p.id === "sessions" ||
      p.project?.id === "sessions" ||
      p.id.startsWith("sessions-"),
  );
  if (!sessions.length) {
    return { sessionsReview: "ABSENT", sessionsPieceIds: [] };
  }

  // Safe if visible pieces only expose allowed entity roles (or null entity).
  const unsafe = sessions.some((p) => {
    // Adapter already stripped denied roles; NEEDS_REVIEW if we cannot name safely
    // and project is sessions but label looks empty — otherwise CURRENT_PUBLIC_SAFE.
    return !p.title.trim();
  });

  return {
    sessionsReview: unsafe ? "NEEDS_REVIEW" : "CURRENT_PUBLIC_SAFE",
    sessionsPieceIds: sessions.map((p) => p.id),
  };
}

function mapManualItem(
  piece: PublicPieceSummary,
  locale: Locale,
): GraphicManualV2 | null {
  if (GRAPHIC_NEVER_RETURN_IDS.has(piece.id)) return null;
  const title =
    pickLocalized(piece.title, locale).trim() ||
    piece.alt.trim() ||
    piece.id;
  const entity = resolveSafeEntityContext(piece);
  return {
    id: piece.id,
    slug: piece.slug,
    title,
    year: piece.year,
    detail: pickLocalized(piece.detail, locale).trim() || null,
    coverUrl: resolvePieceMainImage(piece),
    pdfUrl: resolveManualPdfUrl(piece),
    projectId: piece.projectId ?? piece.project?.id ?? null,
    entityId: entity?.id ?? null,
  };
}

/** Pure assembly — unit-test friendly. */
export function buildGraphicContentV2(
  locale: Locale,
  publicPieces: PublicPieceSummary[],
): GraphicContentV2 {
  const manualSources = publicPieces.filter(isManualTaggedPiece);
  const regularSources = publicPieces.filter((p) => !isManualTaggedPiece(p));

  const items = regularSources
    .map((p) => mapPieceItem(p, locale))
    .filter((p): p is GraphicPieceItemV2 => p != null);

  const manuals = manualSources
    .map((p) => mapManualItem(p, locale))
    .filter((m): m is GraphicManualV2 => m != null);

  const byCategory: Record<string, number> = {};
  for (const item of items) {
    byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
  }

  const sections: GraphicSectionV2[] = SECTION_ORDER.map((id) => ({
    id,
    label: GRAPHIC_SECTION_LABELS[id][locale],
    items: items.filter((p) => categoryToSectionId(p.category) === id),
  })).filter((s) => s.items.length > 0 || s.id !== "other");

  // Drop empty "other" only; keep other sections even if empty? Prefer non-empty only.
  const nonEmptySections = sections.filter((s) => s.items.length > 0);

  // Seyier gap closed when principal Piece has 3 gallery piece_resources (4D.5B).
  const seyierPiece = publicPieces.find((p) => p.id === "seyier");
  const seyierGalleryResources = (seyierPiece?.resources ?? []).filter((r) =>
    Boolean((r.path ?? r.url ?? "").trim()),
  );
  const seyierGalleryGap = Boolean(
    seyierPiece && seyierGalleryResources.length < 3,
  );

  const { sessionsReview, sessionsPieceIds } = buildSessionsReview(items);

  return {
    locale,
    sections: nonEmptySections,
    pieces: items,
    manuals,
    meta: {
      counts: {
        pieces: items.length,
        manuals: manuals.length,
        standalone: items.filter((p) => !p.project).length,
        projectLinked: items.filter((p) => Boolean(p.project)).length,
        missingMainImage: items.filter((p) => !p.imageUrl).length,
        withTags: items.filter((p) => p.tags.length > 0).length,
        withEntity: items.filter((p) => Boolean(p.entity)).length,
        withResources: items.filter((p) => p.resourceCount > 0).length,
        byCategory,
      },
      manualStatus: manuals.length > 0 ? "PRESENT" : "DETAIL_GAP",
      seyierGalleryGap,
      sessionsReview,
      sessionsPieceIds,
    },
  };
}

/**
 * Graphic V2 payload for a locale.
 * Uses only 4B public piece readers — never graphic_items.
 */
export async function getGraphicContentV2(
  locale: Locale,
  filters: GraphicPieceFiltersV2 = {},
): Promise<GraphicContentV2> {
  const pieceFilters: PublicPieceFilters = {
    category: filters.category,
    tag: filters.tag,
    entityId: filters.entityId,
    projectId: filters.projectId,
    sort: filters.sort ?? "default",
  };
  const pieces = await getPublicPiecesV2(pieceFilters);
  return buildGraphicContentV2(locale, pieces);
}

export async function getGraphicPieceDetailV2(
  locale: Locale,
  idOrSlug: string,
): Promise<GraphicPieceDetailV2 | null> {
  if (GRAPHIC_NEVER_RETURN_IDS.has(idOrSlug)) return null;

  const all = await getPublicPiecesV2();
  const byId = all.find((p) => p.id === idOrSlug);
  if (byId) return mapDetail(byId, locale);

  const bySlug = await getPublicPieceBySlugV2(idOrSlug);
  if (!bySlug) return null;
  if (GRAPHIC_NEVER_RETURN_IDS.has(bySlug.id)) return null;
  return mapDetail(bySlug, locale);
}

/** UI contract mapping notes for 4D.4 transparency (documentation helper). */
export const GRAPHIC_UI_CONTRACT_4D2 = [
  {
    uiNeed: "section",
    legacyField: "graphic_items.section",
    v2Source: "pieces.category → GraphicSectionIdV2",
    transition: "MAPPING",
  },
  {
    uiNeed: "title",
    legacyField: "title | alt",
    v2Source: "pickLocalized(title) || alt",
    transition: "DIRECT",
  },
  {
    uiNeed: "src / thumbnail",
    legacyField: "srcPath",
    v2Source: "resolvePieceMainImage(srcUrl | prioritized resource)",
    transition: "MAPPING",
  },
  {
    uiNeed: "gallery",
    legacyField: "galleryPaths",
    v2Source:
      "piece_resources → detail.gallery (Seyier gallery collapsed on principal Piece)",
    transition: "MAPPING (Seyier = EXPECTED_RESOURCE_COLLAPSE)",
  },
  {
    uiNeed: "brand / entity",
    legacyField: "brandId → /marcas",
    v2Source: "safe piece_entities (client|brand-owner|responsible|collaborator)",
    transition: "MAPPING",
  },
  {
    uiNeed: "tags",
    legacyField: "tags[]",
    v2Source: "piece_tags + catalog",
    transition: "DIRECT",
  },
  {
    uiNeed: "detail identifier",
    legacyField: "id (logos/eventos routes)",
    v2Source: "id | slug",
    transition: "MAPPING",
  },
  {
    uiNeed: "manual",
    legacyField: "brand_manuals (citf)",
    v2Source: "Piece tag=manual → manuals[] + PDF piece_resource",
    transition: "DIRECT (4D.3C)",
  },
  {
    uiNeed: "personal section",
    legacyField: "section=personal",
    v2Source: "origin=personal and/or tags (not a category)",
    transition: "MAPPING (UI later)",
  },
  {
    uiNeed: "year sort",
    legacyField: "year string",
    v2Source: "getPublicPiecesV2 sort newest|oldest",
    transition: "DIRECT",
  },
] as const;

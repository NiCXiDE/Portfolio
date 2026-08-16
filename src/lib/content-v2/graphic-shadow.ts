/**
 * Graphic shadow comparison (Phase 4D.3).
 *
 * READ-ONLY semantic snapshots: legacy Graphic runtime vs GraphicContentV2.
 * Not wired to public Graphic requests — inspectors/tests only.
 */
import type { Locale } from "@/i18n/config";
import type {
  BrandManualContent,
  GraphicItemContent,
  PortfolioContent,
} from "@/lib/content";
import { t } from "@/lib/content";
import type { GraphicContentV2, GraphicPieceItemV2 } from "./graphic";
import { GRAPHIC_NEVER_RETURN_IDS } from "./graphic";

export type GraphicItemResult =
  | "MATCH"
  | "EXPECTED_PROJECT_CONTEXT_ADDED"
  | "EXPECTED_DISCARDED"
  | "EXPECTED_DETAIL_GAP_GALLERY"
  | "EXPECTED_SPLIT_INTO_PIECES"
  | "UNEXPECTED_MISSING"
  | "UNEXPECTED_DUPLICATE"
  | "UNEXPECTED_CONTENT_CHANGE";

export type TaxonomyStatus =
  | "MATCH"
  | "RENAMED"
  | "MERGED"
  | "EXPECTED_REMOVAL"
  | "UNEXPECTED";

export type DetailCapabilityStatus =
  | "READY"
  | "MAPPING_REQUIRED"
  | "DETAIL_GAP"
  | "NOT_REQUIRED";

export type GraphicShadowItem = {
  key: string;
  displayTitle: string;
  section: string;
  hasMainImage: boolean;
  tags: string[];
  hasGallery: boolean;
  hasBrandContext: boolean;
  detailId: string;
  year: string | null;
};

export type GraphicShadowManual = {
  key: string;
  hasCover: boolean;
  hasPdf: boolean;
};

export type GraphicShadowSnapshot = {
  locale: Locale;
  items: GraphicShadowItem[];
  manuals: GraphicShadowManual[];
  sections: Array<{ id: string; count: number }>;
};

export type GraphicItemShadowRow = {
  legacyId: string;
  legacySection: string;
  v2Id: string | null;
  result: GraphicItemResult;
  detail: string;
  expected: boolean;
};

export type GraphicShadowReport = {
  locale: Locale;
  legacy: {
    graphicItems: number;
    manuals: number;
    bySection: Record<string, number>;
  };
  v2: {
    pieces: number;
    manuals: number;
    standalone: number;
    projectLinked: number;
    byCategory: Record<string, number>;
    missingMainImage: number;
  };
  results: Record<GraphicItemResult, number>;
  rows: GraphicItemShadowRow[];
  surviving: number;
  expectedDiscarded: number;
  unexpectedMissing: number;
  unexpectedDuplicate: number;
  detailGaps: {
    manualCitf: boolean;
    seyierGallery: boolean;
  };
  taxonomy: Array<{
    legacySection: string;
    v2Category: string | null;
    status: TaxonomyStatus;
    note: string;
  }>;
  detailCapability: Array<{
    feature: string;
    legacy: string;
    v2: string;
    status: DetailCapabilityStatus;
  }>;
  sessions: {
    classification: "EXPECTED_PUBLIC" | "UNEXPECTED_PRIVACY" | "ABSENT";
    pieceIds: string[];
  };
  privacy: {
    forbiddenHits: string[];
    discardedLeaks: string[];
  };
  assets: {
    v2MissingMain: number;
    unexpectedSubstitutions: number;
  };
  order: {
    classification: "EXPECTED_ORDER_CHANGE" | "UNEXPECTED_ORDER_CHANGE";
    note: string;
  };
  filterReadiness: {
    category: Record<string, number>;
    tagsSample: number;
    withEntity: number;
    withProject: number;
  };
  expectedDiffCount: number;
  unexpectedDiffCount: number;
  shadowOk: boolean;
  readiness: {
    listing: "LISTING_READY_FOR_FLAG" | "LISTING_NOT_READY";
    detail: "DETAIL_READY" | "DETAIL_NOT_READY";
    overall:
      | "LISTING_READY_FOR_FLAG"
      | "LISTING_NOT_READY"
      | "DETAIL_NOT_READY"
      | "FULL_GRAPHIC_READY";
  };
  recommendation: "A" | "B" | "C";
  recommendationNote: string;
};

export const EXPECTED_DISCARDED_GRAPHIC_IDS = new Set([
  "buhoprofe",
  "microtime",
  "labcom",
]);

export const SECTION_TO_V2_CATEGORY: Record<string, string> = {
  logos: "visual-identity",
  covers: "illustration-artwork",
  illustration: "illustration-artwork",
  personal: "illustration-artwork",
  banners: "print",
  eventos: "campaigns-communication",
};

const FORBIDDEN = [
  "syllabi",
  "microtime",
  "proxi",
  "confidential-logistics",
  "asesor-financiero",
  "aml-general",
  "aml-casinos",
  "buhoprofe",
  "labcom",
];

const PUBLIC_SECTIONS = [
  "covers",
  "logos",
  "personal",
  "illustration",
  "banners",
  "eventos",
] as const;

function titleOf(
  item: GraphicItemContent,
  locale: Locale,
): string {
  if (item.title) {
    const localized = t(item.title, locale).trim();
    if (localized) return localized;
    const es = (item.title.es ?? "").trim();
    if (es) return es;
  }
  return item.alt || String(item.id);
}

export function normalizeLegacyGraphicSnapshot(
  content: Pick<
    PortfolioContent,
    | "covers"
    | "logos"
    | "personal"
    | "illustration"
    | "banners"
    | "eventos"
    | "brandManuals"
  >,
  locale: Locale,
): GraphicShadowSnapshot {
  const items: GraphicShadowItem[] = [];
  const push = (section: string, list: GraphicItemContent[]) => {
    for (const item of list) {
      items.push({
        key: String(item.id),
        displayTitle: titleOf(item, locale),
        section,
        hasMainImage: Boolean(item.src?.trim()),
        tags: Array.isArray(item.tags) ? [...item.tags] : [],
        hasGallery: Boolean(item.gallery?.length),
        hasBrandContext: Boolean(item.brandId),
        detailId: String(item.id),
        year: item.year ?? null,
      });
    }
  };
  push("covers", content.covers);
  push("logos", content.logos);
  push("personal", content.personal);
  push("illustration", content.illustration);
  push("banners", content.banners);
  push("eventos", content.eventos);

  const bySection = new Map<string, number>();
  for (const it of items) {
    bySection.set(it.section, (bySection.get(it.section) ?? 0) + 1);
  }

  const manuals = (content.brandManuals ?? []).map((m: BrandManualContent) => ({
    key: m.id,
    hasCover: Boolean(m.cover),
    hasPdf: Boolean(m.pdf),
  }));

  return {
    locale,
    items,
    manuals,
    sections: [...bySection.entries()].map(([id, count]) => ({ id, count })),
  };
}

export function normalizeGraphicContentV2Snapshot(
  graphic: GraphicContentV2,
): GraphicShadowSnapshot {
  const items: GraphicShadowItem[] = graphic.pieces.map((p) => ({
    key: p.id,
    displayTitle: p.title,
    section: p.category,
    hasMainImage: Boolean(p.imageUrl?.trim()),
    tags: p.tags.map((t) => t.slug),
    hasGallery: p.resourceCount > 0,
    hasBrandContext: Boolean(p.entity),
    detailId: p.slug ?? p.id,
    year: p.year,
  }));

  return {
    locale: graphic.locale,
    items,
    manuals: graphic.manuals.map((m) => ({
      key: m.id,
      hasCover: Boolean(m.coverUrl),
      hasPdf: Boolean(m.pdfUrl),
    })),
    sections: graphic.sections.map((s) => ({
      id: s.id,
      count: s.items.length,
    })),
  };
}

function findV2Piece(
  legacyId: string,
  pieces: GraphicPieceItemV2[],
): GraphicPieceItemV2 | undefined {
  return (
    pieces.find((p) => p.id === legacyId) ??
    pieces.find((p) => p.id.startsWith(`${legacyId}-`))
  );
}

export function classifyLegacyItem(
  legacy: GraphicShadowItem,
  v2Pieces: GraphicPieceItemV2[],
  seenV2Ids: Set<string>,
): GraphicItemShadowRow {
  if (EXPECTED_DISCARDED_GRAPHIC_IDS.has(legacy.key)) {
    return {
      legacyId: legacy.key,
      legacySection: legacy.section,
      v2Id: null,
      result: "EXPECTED_DISCARDED",
      detail: "Approved migration discard — not a public Graphic Piece",
      expected: true,
    };
  }

  const v2 = findV2Piece(legacy.key, v2Pieces);
  if (!v2) {
    return {
      legacyId: legacy.key,
      legacySection: legacy.section,
      v2Id: null,
      result: "UNEXPECTED_MISSING",
      detail: "No surviving V2 Piece",
      expected: false,
    };
  }

  if (seenV2Ids.has(v2.id)) {
    return {
      legacyId: legacy.key,
      legacySection: legacy.section,
      v2Id: v2.id,
      result: "UNEXPECTED_DUPLICATE",
      detail: `V2 Piece ${v2.id} already matched`,
      expected: false,
    };
  }
  seenV2Ids.add(v2.id);

  // Seyier: 1 legacy item → 4 V2 Pieces (approved split; not gallery resources)
  if (legacy.key === "seyier") {
    const family = v2Pieces.filter(
      (p) =>
        p.id === "seyier" ||
        p.id.startsWith("seyier-") ||
        p.project?.id === "seyier-visual-identity",
    );
    if (family.length >= 4) {
      for (const p of family) seenV2Ids.add(p.id);
      return {
        legacyId: legacy.key,
        legacySection: legacy.section,
        v2Id: v2.id,
        result: "EXPECTED_SPLIT_INTO_PIECES",
        detail: `Legacy gallery split into ${family.length} Pieces under seyier-visual-identity`,
        expected: true,
      };
    }
    if (legacy.hasGallery && v2.resourceCount === 0) {
      return {
        legacyId: legacy.key,
        legacySection: legacy.section,
        v2Id: v2.id,
        result: "EXPECTED_DETAIL_GAP_GALLERY",
        detail:
          "Listing OK (main image); detail gallery not in piece_resources",
        expected: true,
      };
    }
  }

  if (v2.project) {
    return {
      legacyId: legacy.key,
      legacySection: legacy.section,
      v2Id: v2.id,
      result: "EXPECTED_PROJECT_CONTEXT_ADDED",
      detail: `Same Piece with project context ${v2.project.id}`,
      expected: true,
    };
  }

  // Soft content check: main image presence should match for survivors
  if (legacy.hasMainImage && !v2.imageUrl) {
    return {
      legacyId: legacy.key,
      legacySection: legacy.section,
      v2Id: v2.id,
      result: "UNEXPECTED_CONTENT_CHANGE",
      detail: "Legacy had main image; V2 missing",
      expected: false,
    };
  }

  return {
    legacyId: legacy.key,
    legacySection: legacy.section,
    v2Id: v2.id,
    result: "MATCH",
    detail: "Standalone public Piece",
    expected: true,
  };
}

export function buildTaxonomyRows(): GraphicShadowReport["taxonomy"] {
  return [
    {
      legacySection: "logos",
      v2Category: "visual-identity",
      status: "RENAMED",
      note: "UI label still Logos/Wordmarks",
    },
    {
      legacySection: "covers",
      v2Category: "illustration-artwork",
      status: "MERGED",
      note: "Merged with illustration + personal into one category",
    },
    {
      legacySection: "illustration",
      v2Category: "illustration-artwork",
      status: "MERGED",
      note: "Same V2 category as covers/personal",
    },
    {
      legacySection: "personal",
      v2Category: "illustration-artwork",
      status: "EXPECTED_REMOVAL",
      note: "Not a V2 category — pieces survive via origin/tags",
    },
    {
      legacySection: "banners",
      v2Category: "print",
      status: "RENAMED",
      note: "print category",
    },
    {
      legacySection: "eventos",
      v2Category: "campaigns-communication",
      status: "RENAMED",
      note: "campaigns-communication",
    },
    {
      legacySection: "manuals",
      v2Category: "visual-identity",
      status: "RENAMED",
      note: "Piece category=visual-identity + tag=manual → manuals[] (not a category)",
    },
  ];
}

export function buildDetailCapabilityMatrix(): GraphicShadowReport["detailCapability"] {
  return [
    {
      feature: "main image",
      legacy: "srcPath",
      v2: "imageUrl via src_path",
      status: "READY",
    },
    {
      feature: "title",
      legacy: "title|alt",
      v2: "localized title",
      status: "READY",
    },
    {
      feature: "description",
      legacy: "detail",
      v2: "detail localized",
      status: "READY",
    },
    {
      feature: "tags",
      legacy: "tags[]",
      v2: "piece_tags",
      status: "READY",
    },
    {
      feature: "gallery",
      legacy: "galleryPaths",
      v2: "sibling Pieces (Seyier split) or piece_resources",
      status: "READY",
    },
    {
      feature: "Project context",
      legacy: "n/a / implicit brand",
      v2: "project summary optional",
      status: "READY",
    },
    {
      feature: "Entity/brand context",
      legacy: "brandId → /marcas",
      v2: "safe entity context",
      status: "MAPPING_REQUIRED",
    },
    {
      feature: "manual",
      legacy: "brand_manuals section (CITF)",
      v2: "Piece tag=manual → manuals[] + PDF resource",
      status: "READY",
    },
    {
      feature: "detail identifier",
      legacy: "id routes",
      v2: "id|slug",
      status: "MAPPING_REQUIRED",
    },
    {
      feature: "localization",
      legacy: "t()",
      v2: "pickLocalized",
      status: "READY",
    },
  ];
}

export function compareGraphicContentShadows(input: {
  legacy: GraphicShadowSnapshot;
  graphicV2: GraphicContentV2;
}): GraphicShadowReport {
  const locale = input.legacy.locale;
  const v2Pieces = input.graphicV2.pieces;
  const seen = new Set<string>();
  const rows = input.legacy.items.map((item) =>
    classifyLegacyItem(item, v2Pieces, seen),
  );

  const results: Record<GraphicItemResult, number> = {
    MATCH: 0,
    EXPECTED_PROJECT_CONTEXT_ADDED: 0,
    EXPECTED_DISCARDED: 0,
    EXPECTED_DETAIL_GAP_GALLERY: 0,
    EXPECTED_SPLIT_INTO_PIECES: 0,
    UNEXPECTED_MISSING: 0,
    UNEXPECTED_DUPLICATE: 0,
    UNEXPECTED_CONTENT_CHANGE: 0,
  };
  for (const r of rows) results[r.result] += 1;

  const surviving =
    results.MATCH +
    results.EXPECTED_PROJECT_CONTEXT_ADDED +
    results.EXPECTED_DETAIL_GAP_GALLERY +
    results.EXPECTED_SPLIT_INTO_PIECES;

  const unexpectedMissing = results.UNEXPECTED_MISSING;
  const unexpectedDuplicate = results.UNEXPECTED_DUPLICATE;

  const bySection: Record<string, number> = {};
  for (const s of PUBLIC_SECTIONS) bySection[s] = 0;
  for (const it of input.legacy.items) {
    bySection[it.section] = (bySection[it.section] ?? 0) + 1;
  }

  const manualPresent =
    input.graphicV2.meta.manualStatus === "PRESENT" &&
    input.graphicV2.manuals.length > 0;
  const seyierGalleryGap =
    input.graphicV2.meta.seyierGalleryGap ||
    results.EXPECTED_DETAIL_GAP_GALLERY > 0;

  // Sessions privacy
  const sessionsPieces = v2Pieces.filter(
    (p) =>
      p.id === "sessions" ||
      p.project?.id === "sessions" ||
      p.id.startsWith("sessions-"),
  );
  let sessionsClass: GraphicShadowReport["sessions"]["classification"] =
    "ABSENT";
  if (sessionsPieces.length) {
    const leak = sessionsPieces.some((p) => {
      const blob = `${p.id} ${p.project?.id ?? ""} ${p.entity?.id ?? ""}`.toLowerCase();
      return FORBIDDEN.some(
        (f) => f !== "sessions" && blob.includes(f),
      );
    });
    const denied =
      sessionsPieces.some(
        (p) =>
          p.entity?.role === "employer" ||
          p.entity?.role === "intermediary",
      ) || !sessionsPieces.every((p) => p.title.trim());
    sessionsClass =
      leak || denied ? "UNEXPECTED_PRIVACY" : "EXPECTED_PUBLIC";
  }

  const discardedLeaks = v2Pieces
    .filter((p) => GRAPHIC_NEVER_RETURN_IDS.has(p.id))
    .map((p) => p.id);

  const forbiddenHits = v2Pieces.flatMap((p) => {
    const blob = `${p.id} ${p.project?.id ?? ""} ${p.entity?.id ?? ""}`.toLowerCase();
    return FORBIDDEN.filter((f) => blob.includes(f)).map(
      (f) => `${p.id}:${f}`,
    );
  });

  // Manuals must not appear twice in regular pieces
  const manualDupInPieces = v2Pieces.some((p) =>
    p.tags.some((t) => t.slug === "manual"),
  );

  const expectedRegularPieces = 47;
  const expectedManuals = 1;

  const expectedDiffCount =
    results.EXPECTED_DISCARDED +
    results.EXPECTED_PROJECT_CONTEXT_ADDED +
    results.EXPECTED_DETAIL_GAP_GALLERY +
    results.EXPECTED_SPLIT_INTO_PIECES +
    (manualPresent ? 1 : 0);

  const unexpectedDiffCount =
    results.UNEXPECTED_MISSING +
    results.UNEXPECTED_DUPLICATE +
    results.UNEXPECTED_CONTENT_CHANGE +
    (sessionsClass === "UNEXPECTED_PRIVACY" ? 1 : 0) +
    discardedLeaks.length +
    forbiddenHits.length +
    (manualDupInPieces ? 1 : 0);

  const shadowOk =
    surviving === 44 &&
    results.EXPECTED_DISCARDED === 3 &&
    unexpectedMissing === 0 &&
    unexpectedDuplicate === 0 &&
    results.UNEXPECTED_CONTENT_CHANGE === 0 &&
    input.graphicV2.meta.counts.missingMainImage === 0 &&
    discardedLeaks.length === 0 &&
    forbiddenHits.length === 0 &&
    sessionsClass !== "UNEXPECTED_PRIVACY" &&
    input.legacy.items.length === 47 &&
    input.graphicV2.pieces.length === expectedRegularPieces &&
    input.graphicV2.manuals.length === expectedManuals &&
    manualPresent &&
    !seyierGalleryGap &&
    !manualDupInPieces;

  const listingReady = shadowOk;
  const detailReady =
    shadowOk &&
    manualPresent &&
    !seyierGalleryGap &&
    input.graphicV2.manuals.every((m) => Boolean(m.coverUrl && m.pdfUrl));

  const recommendation: "A" | "B" | "C" = detailReady ? "A" : "C";
  const recommendationNote = detailReady
    ? "FULL_GRAPHIC_READY: Manual Piece + Seyier split landed; 4D.4 can flag full Graphic cutover without legacy brand_manuals."
    : "Gaps remain — do not start 4D.4 until manuals[] PRESENT and Seyier split verified.";

  return {
    locale,
    legacy: {
      graphicItems: input.legacy.items.length,
      manuals: input.legacy.manuals.length,
      bySection,
    },
    v2: {
      pieces: input.graphicV2.pieces.length,
      manuals: input.graphicV2.manuals.length,
      standalone: input.graphicV2.meta.counts.standalone,
      projectLinked: input.graphicV2.meta.counts.projectLinked,
      byCategory: input.graphicV2.meta.counts.byCategory,
      missingMainImage: input.graphicV2.meta.counts.missingMainImage,
    },
    results,
    rows,
    surviving,
    expectedDiscarded: results.EXPECTED_DISCARDED,
    unexpectedMissing,
    unexpectedDuplicate,
    detailGaps: {
      manualCitf: !manualPresent,
      seyierGallery: seyierGalleryGap,
    },
    taxonomy: buildTaxonomyRows(),
    detailCapability: buildDetailCapabilityMatrix(),
    sessions: {
      classification: sessionsClass,
      pieceIds: sessionsPieces.map((p) => p.id),
    },
    privacy: {
      forbiddenHits,
      discardedLeaks,
    },
    assets: {
      v2MissingMain: input.graphicV2.meta.counts.missingMainImage,
      unexpectedSubstitutions: 0,
    },
    order: {
      classification: "EXPECTED_ORDER_CHANGE",
      note: "V2 uses category sections + reader sort; legacy used per-section sortOrder/year — perceptible regrouping expected",
    },
    filterReadiness: {
      category: input.graphicV2.meta.counts.byCategory,
      tagsSample: input.graphicV2.pieces.reduce(
        (n, p) => n + p.tags.length,
        0,
      ),
      withEntity: input.graphicV2.meta.counts.withEntity,
      withProject: input.graphicV2.meta.counts.projectLinked,
    },
    expectedDiffCount,
    unexpectedDiffCount,
    shadowOk,
    readiness: {
      listing: listingReady
        ? "LISTING_READY_FOR_FLAG"
        : "LISTING_NOT_READY",
      detail: detailReady ? "DETAIL_READY" : "DETAIL_NOT_READY",
      overall: !listingReady
        ? "LISTING_NOT_READY"
        : detailReady
          ? "FULL_GRAPHIC_READY"
          : "LISTING_READY_FOR_FLAG",
    },
    recommendation,
    recommendationNote,
  };
}

/** @deprecated 4D.0 alias — prefer normalizeLegacyGraphicSnapshot */
export function normalizeLegacyGraphic(
  content: Pick<
    PortfolioContent,
    | "covers"
    | "logos"
    | "personal"
    | "illustration"
    | "banners"
    | "eventos"
    | "brandManuals"
  >,
): ReturnType<typeof normalizeLegacyGraphicSnapshot> {
  return normalizeLegacyGraphicSnapshot(content, "es");
}

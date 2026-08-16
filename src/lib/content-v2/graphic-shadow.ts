/**
 * Graphic shadow comparison (Phase 4D.0).
 *
 * READ-ONLY semantic snapshots: legacy graphic_items vs public Pieces V2.
 * Not wired to public Graphic requests — inspectors only.
 */
import type {
  BrandManualContent,
  GraphicItemContent,
  PortfolioContent,
} from "@/lib/content";
import type { PublicPieceSummary } from "./types";

export type GraphicMapStatus =
  | "MATCH"
  | "REPLACED_BY_PROJECT_PIECE"
  | "DISCARDED"
  | "BLOCKED"
  | "NEEDS_DATA_DECISION"
  | "MISSING_V2";

export type GraphicShadowItem = {
  key: string;
  section: string;
  hasSrc: boolean;
  hasGallery: boolean;
  tagCount: number;
  hasBrand: boolean;
  year: string | null;
};

export type GraphicShadowPiece = {
  key: string;
  category: string;
  origin: string | null;
  standalone: boolean;
  projectId: string | null;
  hasSrc: boolean;
  resourceCount: number;
  tagCount: number;
  entityCount: number;
  year: string | null;
};

export type GraphicItemMapping = {
  legacyId: string;
  legacySection: string;
  status: GraphicMapStatus;
  v2PieceIds: string[];
  v2ProjectId: string | null;
  detail: string;
  expected: boolean;
};

export type GraphicShadowSnapshot = {
  items: GraphicShadowItem[];
  manuals: Array<{ key: string; hasCover: boolean; hasPdf: boolean }>;
};

export type GraphicV2Snapshot = {
  pieces: GraphicShadowPiece[];
};

export type GraphicShadowReport = {
  legacyCounts: {
    graphicItems: number;
    bySection: Record<string, number>;
    manuals: number;
  };
  v2Counts: {
    publicPieces: number;
    standalone: number;
    withProject: number;
    withEntity: number;
    withTags: number;
    withResources: number;
    withSrc: number;
    byCategory: Record<string, number>;
  };
  mapping: {
    MATCH: number;
    REPLACED_BY_PROJECT_PIECE: number;
    DISCARDED: number;
    BLOCKED: number;
    NEEDS_DATA_DECISION: number;
    MISSING_V2: number;
  };
  mappings: GraphicItemMapping[];
  expected: string[];
  unexpected: string[];
  privacy: {
    forbiddenHits: string[];
    buhoprofePublic: boolean;
    unpublishedProjectPieceLeak: string[];
    sessionsPublic: boolean;
  };
  assets: {
    legacyMissingSrc: string[];
    v2MissingSrc: string[];
    legacyGalleryWithoutResources: string[];
  };
  shadowOk: boolean;
};

/** Legacy graphic items expected absent as public Pieces (migration decisions). */
export const EXPECTED_DISCARDED_GRAPHIC_IDS = new Set([
  "buhoprofe", // resource-only → Syllabi; not user's branding Piece
  "labcom", // published=false intentional (CITF-related; not public Piece)
]);

/** Legacy IDs whose Pieces belong to unpublished Projects — not public V2. */
export const EXPECTED_UNPUBLISHED_PROJECT_GRAPHIC_IDS = new Set([
  "microtime",
]);

/**
 * Known legacy→project consolidations (graphic item becomes project piece(s)).
 * Status REPLACED_BY_PROJECT_PIECE when piece(s) exist under a project.
 */
export const LEGACY_TO_PROJECT_HINTS: Record<string, string> = {
  apsmm: "apsmm",
  "expedicion-polo": "expedicion-polo",
  "juegos-provinciales": "juegos-provinciales",
  itf: "citf-identity", // may vary — resolved live
  "banner-cluster": "citf-identity",
  push: "push-identity",
  "banner-push": "push-identity",
  seyier: "seyier",
  futulab: "futulab",
  microtime: "microtime",
  sessions: "sessions",
  concitar: "concitar",
  taily: "taily",
  "twenty-twenty-two-spotify": "bass-series",
  "twenty-twenty-3": "bass-series",
  bass2k24: "bass-series",
  bass2025: "bass-series",
  bass2026: "bass-series",
};

export const SECTION_TO_V2_CATEGORY: Record<string, string> = {
  logos: "visual-identity",
  covers: "illustration-artwork",
  illustration: "illustration-artwork",
  personal: "illustration-artwork",
  banners: "print",
  eventos: "campaigns-communication",
};

export const FORBIDDEN_GRAPHIC_ALIASES = [
  "syllabi",
  "microtime",
  "proxi",
  "confidential-logistics",
  "asesor-financiero",
  "aml-general",
  "aml-casinos",
];

const PUBLIC_SECTIONS = [
  "covers",
  "logos",
  "personal",
  "illustration",
  "banners",
  "eventos",
] as const;

function itemKey(item: GraphicItemContent): string {
  return String(item.id);
}

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
): GraphicShadowSnapshot {
  const items: GraphicShadowItem[] = [];
  const push = (section: string, list: GraphicItemContent[]) => {
    for (const item of list) {
      items.push({
        key: itemKey(item),
        section,
        hasSrc: Boolean(item.src),
        hasGallery: Boolean(item.gallery?.length),
        tagCount: item.tags?.length ?? 0,
        hasBrand: Boolean(item.brandId),
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

  const manuals = (content.brandManuals ?? []).map((m: BrandManualContent) => ({
    key: m.id,
    hasCover: Boolean(m.cover),
    hasPdf: Boolean(m.pdf),
  }));

  return { items, manuals };
}

export function normalizeV2Pieces(
  pieces: PublicPieceSummary[],
): GraphicV2Snapshot {
  return {
    pieces: pieces.map((p) => ({
      key: p.id,
      category: p.category,
      origin: p.origin,
      standalone: !p.projectId,
      projectId: p.projectId,
      hasSrc: Boolean(p.srcUrl),
      resourceCount: p.resources.length,
      tagCount: p.tags.length,
      entityCount: p.entities.filter((e) => e.entity != null).length,
      year: p.year,
    })),
  };
}

/** Resolve V2 pieces that descend from a legacy graphic id. */
export function findPiecesForLegacyId(
  legacyId: string,
  allPieces: PublicPieceSummary[],
  /** Include non-public rows from raw DB for mapping diagnostics */
  allPieceRows?: Array<{
    id: string;
    projectId: string | null;
    published: boolean;
  }>,
): {
  public: PublicPieceSummary[];
  privateIds: string[];
} {
  const hint = LEGACY_TO_PROJECT_HINTS[legacyId];
  const publicHits = allPieces.filter((p) => {
    if (p.id === legacyId) return true;
    if (p.id.startsWith(`${legacyId}-`)) return true;
    if (p.projectId === legacyId) return true;
    if (hint && (p.projectId === hint || p.project?.id === hint)) return true;
    return false;
  });

  const privateIds: string[] = [];
  if (allPieceRows) {
    for (const row of allPieceRows) {
      const related =
        row.id === legacyId ||
        row.id.startsWith(`${legacyId}-`) ||
        row.projectId === legacyId ||
        (hint != null && row.projectId === hint);
      if (!related) continue;
      if (!allPieces.some((p) => p.id === row.id)) {
        privateIds.push(row.id);
      }
    }
  }

  return { public: publicHits, privateIds };
}

export function mapLegacyItem(
  legacy: GraphicShadowItem,
  publicPieces: PublicPieceSummary[],
  allPieceRows: Array<{
    id: string;
    projectId: string | null;
    published: boolean;
  }>,
): GraphicItemMapping {
  const { public: pubs, privateIds } = findPiecesForLegacyId(
    legacy.key,
    publicPieces,
    allPieceRows,
  );

  if (EXPECTED_DISCARDED_GRAPHIC_IDS.has(legacy.key)) {
    return {
      legacyId: legacy.key,
      legacySection: legacy.section,
      status: "DISCARDED",
      v2PieceIds: privateIds.length ? privateIds : pubs.map((p) => p.id),
      v2ProjectId: null,
      detail:
        legacy.key === "labcom"
          ? "Expected unpublished Piece (migration published=false)"
          : "Expected discarded (migration: not a public branding Piece)",
      expected: true,
    };
  }

  if (pubs.length > 0) {
    const projectId = pubs.find((p) => p.projectId)?.projectId ?? null;
    const status: GraphicMapStatus = projectId
      ? "REPLACED_BY_PROJECT_PIECE"
      : "MATCH";
    return {
      legacyId: legacy.key,
      legacySection: legacy.section,
      status,
      v2PieceIds: pubs.map((p) => p.id),
      v2ProjectId: projectId,
      detail:
        status === "MATCH"
          ? "Standalone public Piece"
          : `Public Piece(s) under project ${projectId}`,
      expected: true,
    };
  }

  if (privateIds.length > 0) {
    const unpublishedExpected =
      EXPECTED_UNPUBLISHED_PROJECT_GRAPHIC_IDS.has(legacy.key) ||
      privateIds.some((id) =>
        ["microtime", "sessions", "syllabi"].some((f) => id.includes(f)),
      );
    return {
      legacyId: legacy.key,
      legacySection: legacy.section,
      status: unpublishedExpected ? "DISCARDED" : "BLOCKED",
      v2PieceIds: privateIds,
      v2ProjectId: allPieceRows.find((r) => r.id === privateIds[0])?.projectId ?? null,
      detail: unpublishedExpected
        ? "Piece exists but parent Project unpublished / not public (expected)"
        : "Piece exists but not public — needs review",
      expected: unpublishedExpected,
    };
  }

  // No piece row at all
  if (LEGACY_TO_PROJECT_HINTS[legacy.key]) {
    return {
      legacyId: legacy.key,
      legacySection: legacy.section,
      status: "NEEDS_DATA_DECISION",
      v2PieceIds: [],
      v2ProjectId: LEGACY_TO_PROJECT_HINTS[legacy.key],
      detail: "Hinted project consolidation but no Piece row found",
      expected: false,
    };
  }

  return {
    legacyId: legacy.key,
    legacySection: legacy.section,
    status: "MISSING_V2",
    v2PieceIds: [],
    v2ProjectId: null,
    detail: "No V2 Piece found for legacy graphic item",
    expected: false,
  };
}

export function compareGraphicShadows(input: {
  legacy: GraphicShadowSnapshot;
  v2: GraphicV2Snapshot;
  publicPieces: PublicPieceSummary[];
  allPieceRows: Array<{
    id: string;
    projectId: string | null;
    published: boolean;
  }>;
}): GraphicShadowReport {
  const bySection: Record<string, number> = {};
  for (const s of PUBLIC_SECTIONS) bySection[s] = 0;
  for (const item of input.legacy.items) {
    bySection[item.section] = (bySection[item.section] ?? 0) + 1;
  }

  const byCategory: Record<string, number> = {};
  for (const p of input.v2.pieces) {
    byCategory[p.category] = (byCategory[p.category] ?? 0) + 1;
  }

  const mappings = input.legacy.items.map((item) =>
    mapLegacyItem(item, input.publicPieces, input.allPieceRows),
  );

  const mappingCounts = {
    MATCH: 0,
    REPLACED_BY_PROJECT_PIECE: 0,
    DISCARDED: 0,
    BLOCKED: 0,
    NEEDS_DATA_DECISION: 0,
    MISSING_V2: 0,
  };
  for (const m of mappings) mappingCounts[m.status] += 1;

  const expected: string[] = [];
  const unexpected: string[] = [];
  for (const m of mappings) {
    const line = `${m.status} ${m.legacyId} (${m.legacySection}): ${m.detail}`;
    if (m.expected) expected.push(line);
    else unexpected.push(line);
  }

  // Privacy: public piece ids/labels must not leak forbidden aliases
  const forbiddenHits: string[] = [];
  for (const p of input.publicPieces) {
    const blob = `${p.id} ${p.slug} ${p.projectId ?? ""}`.toLowerCase();
    for (const f of FORBIDDEN_GRAPHIC_ALIASES) {
      if (blob.includes(f)) forbiddenHits.push(`${p.id}:${f}`);
    }
  }

  const buhoprofePublic = input.publicPieces.some(
    (p) => p.id === "buhoprofe" || p.id.startsWith("buhoprofe-"),
  );

  const unpublishedProjectPieceLeak = input.publicPieces
    .filter((p) =>
      ["microtime", "syllabi", "proxi"].some(
        (f) =>
          p.projectId === f ||
          p.id === f ||
          p.id.startsWith(`${f}-`),
      ),
    )
    .map((p) => p.id);

  // sessions: flag separately if present — may be intentional publish; not auto-forbidden
  const sessionsPublic = input.publicPieces.some(
    (p) => p.id === "sessions" || p.projectId === "sessions",
  );

  const legacyMissingSrc = input.legacy.items
    .filter((i) => !i.hasSrc)
    .map((i) => i.key);
  const v2MissingSrc = input.v2.pieces.filter((p) => !p.hasSrc).map((p) => p.key);
  const legacyGalleryWithoutResources = mappings
    .filter((m) => {
      const leg = input.legacy.items.find((i) => i.key === m.legacyId);
      if (!leg?.hasGallery) return false;
      const pieces = input.v2.pieces.filter((p) => m.v2PieceIds.includes(p.key));
      return pieces.length > 0 && pieces.every((p) => p.resourceCount === 0);
    })
    .map((m) => m.legacyId);

  const shadowOk =
    unexpected.length === 0 &&
    forbiddenHits.length === 0 &&
    !buhoprofePublic &&
    unpublishedProjectPieceLeak.length === 0 &&
    mappingCounts.MISSING_V2 === 0 &&
    mappingCounts.BLOCKED === 0 &&
    mappingCounts.NEEDS_DATA_DECISION === 0;

  return {
    legacyCounts: {
      graphicItems: input.legacy.items.length,
      bySection,
      manuals: input.legacy.manuals.length,
    },
    v2Counts: {
      publicPieces: input.v2.pieces.length,
      standalone: input.v2.pieces.filter((p) => p.standalone).length,
      withProject: input.v2.pieces.filter((p) => !p.standalone).length,
      withEntity: input.v2.pieces.filter((p) => p.entityCount > 0).length,
      withTags: input.v2.pieces.filter((p) => p.tagCount > 0).length,
      withResources: input.v2.pieces.filter((p) => p.resourceCount > 0).length,
      withSrc: input.v2.pieces.filter((p) => p.hasSrc).length,
      byCategory,
    },
    mapping: mappingCounts,
    mappings,
    expected,
    unexpected,
    privacy: {
      forbiddenHits,
      buhoprofePublic,
      unpublishedProjectPieceLeak,
      sessionsPublic,
    },
    assets: {
      legacyMissingSrc,
      v2MissingSrc,
      legacyGalleryWithoutResources,
    },
    shadowOk,
  };
}

/**
 * Proposed public Entity exposure for Graphic (NOT implemented).
 * Prefer piece_entities client/collaborator; never employer/intermediary/confidential.
 */
export const GRAPHIC_ENTITY_CONTEXT_RULE_PROPOSAL = {
  allowRoles: ["client", "collaborator", "other"] as const,
  denyRoles: ["employer", "intermediary"] as const,
  requireEntityVisible: true,
  neverInventEntityPages: true,
  preferPieceEntitiesOverProjectEntities: true,
  note: "4D.0 proposal only — do not wire until Graphic adapter",
};

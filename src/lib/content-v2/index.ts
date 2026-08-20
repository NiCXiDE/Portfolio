/**
 * Isolated V2 public read model (Phase 4B) + Home adapter/runtime (4C.2–4C.4).
 *
 * Locale layout may use `loadPortfolioContentForLocale` when
 * HOME_CONTENT_SOURCE resolves to v2 (default after 4C.6). Explicit
 * HOME_CONTENT_SOURCE=legacy keeps Home on the legacy path. Graphic/Interfaces
 * still use legacy tables via the shell loader.
 */
export type {
  PublicEntitySummary,
  PublicPieceFilters,
  PublicPieceSummary,
  PublicProjectFilters,
  PublicProjectSummary,
  PublicSortMode,
  PublicTestimonial,
} from "./types";

export {
  isEntityPageEligible,
  isHomeEntity,
  isHomeProject,
  isPublicEntity,
  isPublicPiece,
  isPublicProject,
} from "./visibility";

export { pickLocalized } from "./map";

export {
  getHomeEntitiesV2,
  getPublicEntitiesV2,
  getPublicEntityBySlugV2,
} from "./entities";

export {
  getHomeProjectsV2,
  getPublicProjectBySlugV2,
  getPublicProjectsV2,
} from "./projects";

export { getPublicPieceBySlugV2, getPublicPiecesV2 } from "./pieces";

export { getPublicTestimonialsV2 } from "./testimonials";

export {
  buildFeaturedHomeProjectsV2,
  buildHomeContentV2,
  getHomeContentV2,
  publicExternalHref,
  splitHomeProjectsV2,
} from "./home";
export type {
  HomeContentV2,
  HomeEntityItemV2,
  HomeProjectItemV2,
  HomeTestimonialItemV2,
} from "./home";

export {
  compareHomeShadows,
  normalizeHomeContentV2,
  normalizeLegacyHome,
  resolveLegacyCompanyKey,
  resolveLegacyProjectKey,
  HOME_CONTENT_SOURCE_FLAG_DESIGN,
  HOME_UI_MAPPING_4C4,
} from "./home-shadow";
export type {
  HomeShadowReport,
  HomeShadowSnapshot,
  ShadowDiff,
} from "./home-shadow";

export {
  buildGraphicContentV2,
  categoryToSectionId,
  getGraphicContentV2,
  getGraphicPieceDetailV2,
  isManualTaggedPiece,
  resolveManualPdfUrl,
  resolvePieceMainImage,
  resolveSafeEntityContext,
  GRAPHIC_NEVER_RETURN_IDS,
  GRAPHIC_PUBLIC_ENTITY_ROLES,
  GRAPHIC_SECTION_LABELS,
  GRAPHIC_UI_CONTRACT_4D2,
  MANUAL_TAG_SLUG,
} from "./graphic";
export type {
  GraphicContentV2,
  GraphicManualV2,
  GraphicPieceDetailV2,
  GraphicPieceItemV2,
  GraphicSectionIdV2,
  GraphicSectionV2,
} from "./graphic";

export {
  buildTaxonomyRows,
  classifyLegacyItem,
  compareGraphicContentShadows,
  normalizeGraphicContentV2Snapshot,
  normalizeLegacyGraphic,
  normalizeLegacyGraphicSnapshot,
  SECTION_TO_V2_CATEGORY,
  EXPECTED_DISCARDED_GRAPHIC_IDS,
} from "./graphic-shadow";
export type {
  GraphicItemResult,
  GraphicItemShadowRow,
  GraphicShadowItem,
  GraphicShadowReport,
  GraphicShadowSnapshot,
} from "./graphic-shadow";

export { getHomeContentSource } from "./home-source";
export type { HomeContentSource } from "./home-source";

export { getGraphicContentSource } from "./graphic-source";
export type { GraphicContentSource } from "./graphic-source";

export { mapGraphicContentV2ToCurrentUI } from "./graphic-ui";
export type { GraphicUiLists } from "./graphic-ui";

export {
  loadGraphicDetailItemForLocale,
  loadGraphicSectionForLocale,
} from "./graphic-runtime";

export { mapHomeContentV2ToCurrentUI, stableNumericId } from "./home-ui";
export type { HomeUiLists } from "./home-ui";

export {
  applyHomeV2PresentationLayout,
  getLastGraphicLoadTrace,
  getLastHomeLoadTrace,
  getLastPortfolioLoadTrace,
  HOME_V2_MARQUEE_SPEED_PX_S,
  loadPortfolioContentForLocale,
  resetGraphicLoadTrace,
  resetHomeLoadTrace,
  resetPortfolioLoadTrace,
} from "./home-runtime";
export type {
  GraphicLoadTrace,
  HomeLoadTrace,
  PortfolioLoadTrace,
} from "./home-runtime";

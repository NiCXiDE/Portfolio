/**
 * Isolated V2 public read model (Phase 4B) + Home adapter (Phase 4C.2).
 *
 * `getHomeContentV2` is available but NOT wired to public pages yet —
 * legacy `src/lib/content.ts` remains the runtime source for Home.
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

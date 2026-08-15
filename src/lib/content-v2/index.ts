/**
 * Isolated V2 public read model (Phase 4B).
 *
 * NOT wired to public pages yet — legacy `src/lib/content.ts` remains the
 * runtime source for Home / Gráfico / Interfaces / marcas.
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

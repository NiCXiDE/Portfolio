/** Shared types for Content Model V2 dry-run migration (read-only). */

export type Confidence = "alta" | "media" | "baja";

export type GraphicClassification =
  | "project"
  | "piece_standalone"
  | "piece_in_project"
  | "ambiguo";

export type ProposedGraphicCategory =
  | "visual-identity"
  | "illustration-artwork"
  | "campaigns-communication"
  | "print"
  | "manual"
  | "other";

export type ProposedOrigin = "personal" | "client" | "other";

export type MigrationTargetType = "entity" | "project" | "piece" | "resource";

export type MigrationMapEntry = {
  sourceTable: string;
  sourceId: string;
  targetType: MigrationTargetType;
  targetId: string;
  notes?: string;
};

export type ProposedRelation = {
  entityId: string;
  entityName: string;
  relationRole: string;
  evidence: string;
  confidence: Confidence;
  requiresReview: boolean;
};

export type ProposedResource = {
  id: string;
  path: string;
  kind: "project_resource" | "piece_resource" | "piece_src";
  label?: string;
};

export type ProposedPiece = {
  id: string;
  title: string;
  category: ProposedGraphicCategory;
  origin: ProposedOrigin;
  projectId?: string;
  tags: string[];
  resources: ProposedResource[];
  confidence: Confidence;
  published?: boolean;
  lane?: string;
  entityLinks?: {
    entityId: string;
    relationRole: string;
    isPrimary?: boolean;
  }[];
};

export type ProposedProject = {
  id: string;
  slug: string;
  name: string;
  areas: string[];
  type: string | null;
  status: string;
  roles: string[] | "PENDIENTE DE REVISIÓN";
  entities: ProposedRelation[];
  pieces: string[];
  resources: ProposedResource[];
  legacySources: string[];
  confidence: Confidence;
  notes?: string[];
  /** Required on every project emitted by applyDecisionManifest */
  context?: string;
  published?: boolean;
  showOnHome?: boolean;
  lane?: string;
  confidential?: boolean;
};

export type ProposedEntity = {
  id: string;
  slug: string;
  name: string;
  type: string;
  typeSource: "known" | "inferred" | "other_pending";
  logoPath: string | null;
  href: string | null;
  legacyRelationCount: number;
  relatedLegacy: string[];
  pageEnabledSuggested: boolean;
  pageEnabledReason: string;
  requiresHumanDecision: boolean;
  confidence: Confidence;
  visible?: boolean;
  pageEnabled?: boolean;
  showOnHome?: boolean;
  lane?: string;
  confidential?: boolean;
};

export type RecordAnalysis = {
  sourceTable: string;
  legacyId: string;
  title: string;
  classification: string;
  proposedDestination: string;
  proposedRelations: ProposedRelation[];
  reason: string;
  confidence: Confidence;
  requiresHumanDecision: boolean;
  observations: string[];
  migrationMappings: MigrationMapEntry[];
};

export type EntityRelationReview = {
  projectId: string;
  projectName: string;
  entityId: string;
  entityName: string;
  suggestedRole: string;
  legacyEvidence: string;
  confidence: Confidence;
  requiresReview: boolean;
  issue?: string;
};

export type TagAnalysis = {
  catalogTags: Array<{ slug: string; labelEs: string; usedCount: number }>;
  unusedCatalogTags: string[];
  slugsInPiecesNotInCatalog: string[];
  possibleSemanticDuplicates: Array<{ slugs: string[]; reason: string }>;
  conservationProposal: Array<{ slug: string; action: string }>;
};

export type NamedListClassification =
  | "entity_existing"
  | "entity_candidate"
  | "project_existing"
  | "project_candidate"
  | "home_text_only"
  | "duplicate"
  | "ambiguo";

export type NamedListAnalysis = {
  id: number;
  kind: string;
  label: string;
  brandId: string | null;
  classification: NamedListClassification;
  proposedTarget: string;
  homeReplacement: string;
  confidence: Confidence;
  requiresHumanDecision: boolean;
  reason: string;
};

export type TestimonialAnalysis = {
  id: string;
  authorName: string;
  proposedEntityId: string | null;
  proposedEntityName: string | null;
  redundantAfterLink: string[];
  keepAsOverride: string[];
  confidence: Confidence;
  requiresHumanDecision: boolean;
  reason: string;
};

export type ManualAnalysis = {
  id: string;
  title: string;
  brandId: string | null;
  year: string | null;
  alternatives: Array<{ key: "A" | "B" | "C"; description: string }>;
  recommendation: "A" | "B" | "C";
  recommendationReason: string;
  confidence: Confidence;
  requiresHumanDecision: boolean;
};

export type ProposedPieceEntityLink = {
  pieceId: string;
  entityId: string;
  entityName: string;
  relationRole: string;
  sortOrder: number;
  isPrimary: boolean;
};

export type DryRunReport = {
  generatedAt: string;
  mode: "dry-run";
  source: "mysql";
  legacyCounts: Record<string, number>;
  v2CountsBefore: Record<string, number>;
  v2CountsAfter: Record<string, number>;
  migrationMapBefore: number;
  migrationMapAfter: number;
  legacyCountsUnchanged: boolean;
  v2Untouched: boolean;
  records: RecordAnalysis[];
  proposedEntities: ProposedEntity[];
  proposedProjects: ProposedProject[];
  standalonePieces: ProposedPiece[];
  piecesInProjects: ProposedPiece[];
  proposedPieceEntities: ProposedPieceEntityLink[];
  entityRelationsRequiringReview: EntityRelationReview[];
  tagAnalysis: TagAnalysis;
  namedListItems: NamedListAnalysis[];
  testimonials: TestimonialAnalysis[];
  brandManuals: ManualAnalysis[];
  graphicCategoryMapping: Record<string, ProposedGraphicCategory>;
  confidenceCounts: { alta: number; media: number; baja: number };
  humanDecisions: string[];
  migrationMapPreview: MigrationMapEntry[];
  laneCounts: {
    AUTO_MIGRATED: number;
    MANUAL_DECISION_MIGRATED: number;
    DEFERRED: number;
    DISCARDED: number;
  };
  discarded: Array<{ id: string; kind: string; label: string; reason: string }>;
  deferred: Array<{ id: string; kind: string; label: string; reason: string }>;
  summary: {
    proposedEntities: number;
    proposedProjects: number;
    standalonePieces: number;
    piecesInProjects: number;
    proposedPieceEntities: number;
    projectResources: number;
    pieceResources: number;
  };
};

export type LegacySnapshot = {
  brands: import("../../src/db/entities").BrandRow[];
  graphicItems: import("../../src/db/entities").GraphicItemRow[];
  uiProjects: import("../../src/db/entities").UiProjectRow[];
  brandManuals: import("../../src/db/entities").BrandManualRow[];
  testimonials: import("../../src/db/entities").TestimonialRow[];
  namedListItems: import("../../src/db/entities").NamedListItemRow[];
  tags: import("../../src/db/entities").TagRow[];
  uiListItems: import("../../src/db/entities").UiListItemRow[];
};

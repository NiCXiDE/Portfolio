/**
 * Public V2 read-model DTOs (Phase 4B).
 * Independent of TypeORM row types — safe for future UI consumption.
 */
import type {
  EntityType,
  PieceCategory,
  PieceOrigin,
  ProjectArea,
  ProjectContext,
  ProjectEntityRelationRole,
  ProjectRole,
  ProjectStatus,
} from "@/db/entities-v2";
import type { LocalizedJson } from "@/db/entities";

/** Localized CMS text as stored (JSON es/en). No auto-translation. */
export type PublicLocalizedText = LocalizedJson;

export type PublicEntitySummary = {
  id: string;
  slug: string;
  name: string;
  shortName: string | null;
  type: EntityType;
  logoUrl: string | null;
  href: string | null;
  description: PublicLocalizedText | null;
  /** True only when a dedicated Entity page is allowed. Readers never invent URLs. */
  pageEnabled: boolean;
  showOnHome: boolean;
  homeOrder: number | null;
};

export type PublicProjectEntityLink = {
  entityId: string;
  relationRole: ProjectEntityRelationRole;
  /** Visible entity summary only; omitted from public payload if entity not visible. */
  entity: PublicEntitySummary | null;
};

export type PublicProjectResource = {
  id: string;
  path: string | null;
  url: string | null;
  kind: string | null;
  frame: "landscape" | "portrait" | null;
  label: PublicLocalizedText | null;
  sortOrder: number;
};

export type PublicProjectSummary = {
  id: string;
  slug: string;
  title: PublicLocalizedText;
  summary: PublicLocalizedText | null;
  description: PublicLocalizedText | null;
  status: ProjectStatus;
  type: string | null;
  context: ProjectContext;
  coverUrl: string | null;
  links: Record<string, unknown>[] | null;
  featured: boolean;
  showOnHome: boolean;
  homeOrder: number | null;
  /** Partial dates — never synthesized as fake calendar dates. */
  startYear: number | null;
  startMonth: number | null;
  endYear: number | null;
  endMonth: number | null;
  dateLabel: PublicLocalizedText | null;
  areas: ProjectArea[];
  roles: ProjectRole[];
  entities: PublicProjectEntityLink[];
  resources: PublicProjectResource[];
};

export type PublicPieceResource = {
  id: string;
  path: string | null;
  url: string | null;
  kind: string | null;
  label: PublicLocalizedText | null;
  sortOrder: number;
};

export type PublicPieceTag = {
  slug: string;
  labelEs: string;
  labelEn: string;
  isNsfw: boolean;
};

export type PublicPieceEntityLink = {
  entityId: string;
  relationRole: ProjectEntityRelationRole;
  isPrimary: boolean;
  sortOrder: number;
  entity: PublicEntitySummary | null;
};

export type PublicPieceParentProject = {
  id: string;
  slug: string;
  title: PublicLocalizedText;
};

export type PublicPieceSummary = {
  id: string;
  slug: string | null;
  title: PublicLocalizedText | null;
  alt: string;
  category: PieceCategory;
  origin: PieceOrigin | null;
  srcUrl: string;
  fit: "cover" | "contain" | null;
  year: string | null;
  detail: PublicLocalizedText | null;
  href: string | null;
  hrefLabel: PublicLocalizedText | null;
  projectId: string | null;
  /** Present only when parent project is published. */
  project: PublicPieceParentProject | null;
  resources: PublicPieceResource[];
  tags: PublicPieceTag[];
  entities: PublicPieceEntityLink[];
  sortOrder: number;
};

export type PublicTestimonial = {
  id: string;
  name: string;
  imageUrl: string;
  quote: PublicLocalizedText;
  role: PublicLocalizedText;
  linkLabel: PublicLocalizedText | null;
  sortOrder: number;
  entityId: string | null;
  /** Resolved when entity is visible; otherwise null. */
  entity: PublicEntitySummary | null;
  /**
   * Legacy company_* overrides retained only when no visible Entity
   * (or as fallback fields). Prefer `entity` when present.
   */
  legacyCompany: {
    name: string;
    logoUrl: string | null;
    href: string | null;
  } | null;
};

export type PublicSortMode = "az" | "za" | "newest" | "oldest" | "home" | "default";

export type PublicProjectFilters = {
  area?: ProjectArea;
  entityId?: string;
  status?: Exclude<ProjectStatus, "archived">;
  featured?: boolean;
  showOnHome?: boolean;
  sort?: PublicSortMode;
};

export type PublicPieceFilters = {
  category?: PieceCategory;
  tag?: string;
  entityId?: string;
  projectId?: string;
  origin?: PieceOrigin;
  standaloneOnly?: boolean;
  sort?: PublicSortMode;
};

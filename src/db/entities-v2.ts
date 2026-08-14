import { EntitySchema } from "typeorm";
import type { LocalizedJson } from "./entities";

/** Portfolio entity types (table `entities`). */
export type EntityType =
  | "company"
  | "institution"
  | "association"
  | "brand"
  | "personal_brand"
  | "person"
  | "organization"
  | "collective"
  | "other";

export type ProjectStatus = "ongoing" | "completed" | "archived";

export type ProjectArea = "graphic" | "ux-ui";

/** Work context for a project (required). */
export type ProjectContext =
  | "client-work"
  | "internal-work"
  | "presale"
  | "demo"
  | "personal"
  | "other";

export type ProjectRole =
  | "ux"
  | "ui"
  | "graphic-design"
  | "branding"
  | "visual-direction"
  | "frontend"
  | "other";

export type ProjectEntityRelationRole =
  | "client"
  | "employer"
  | "collaborator"
  | "intermediary"
  | "brand-owner"
  | "responsible"
  | "other";

/** Public-facing piece categories (graphic layer). */
export type PieceCategory =
  | "visual-identity"
  | "illustration-artwork"
  | "campaigns-communication"
  | "print"
  | "other";

export type PieceOrigin = "personal" | "client" | "other";

export type MigrationMapTargetType =
  | "entity"
  | "project"
  | "piece"
  | "resource";

/** Outcomes for dry-run reports only — never stored in migration_map. */
export type MigrationReportOutcome = "skipped" | "ambiguous";

export type PortfolioEntityRow = {
  id: string;
  slug: string;
  name: string;
  shortName: string | null;
  type: EntityType;
  logoPath: string | null;
  logoAssetId: string | null;
  href: string | null;
  description: LocalizedJson | null;
  visible: boolean;
  pageEnabled: boolean;
  showOnHome: boolean;
  homeOrder: number | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectRow = {
  id: string;
  slug: string;
  title: LocalizedJson;
  summary: LocalizedJson | null;
  description: LocalizedJson | null;
  startYear: number | null;
  startMonth: number | null;
  endYear: number | null;
  endMonth: number | null;
  dateLabel: LocalizedJson | null;
  status: ProjectStatus;
  type: string | null;
  context: ProjectContext;
  coverPath: string | null;
  coverAssetId: string | null;
  links: Record<string, unknown>[] | null;
  published: boolean;
  featured: boolean;
  caseStudyEnabled: boolean;
  showOnHome: boolean;
  homeOrder: number | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectAreaRow = {
  projectId: string;
  area: ProjectArea;
};

export type ProjectRoleRow = {
  projectId: string;
  role: ProjectRole;
};

export type ProjectEntityRow = {
  projectId: string;
  entityId: string;
  relationRole: ProjectEntityRelationRole;
};

export type PieceEntityRow = {
  pieceId: string;
  entityId: string;
  relationRole: ProjectEntityRelationRole;
  sortOrder: number;
  isPrimary: boolean;
};

export type PieceRow = {
  id: string;
  /** Optional; used when the piece has its own public URL (logos, eventos). */
  slug: string | null;
  title: LocalizedJson | null;
  alt: string;
  category: PieceCategory;
  origin: PieceOrigin | null;
  srcPath: string;
  srcAssetId: string | null;
  fit: "cover" | "contain" | null;
  year: string | null;
  detail: LocalizedJson | null;
  href: string | null;
  hrefLabel: LocalizedJson | null;
  projectId: string | null;
  published: boolean;
  sortOrder: number;
  /** @deprecated Fase 9 — graphic_items.section during migration only */
  legacySection: string | null;
  /** @deprecated Fase 9 — gallery JSON during migration only */
  legacyGallery: unknown[] | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PieceResourceRow = {
  id: string;
  pieceId: string;
  mediaAssetId: string | null;
  path: string | null;
  kind: string | null;
  label: LocalizedJson | null;
  sortOrder: number;
};

export type ProjectResourceRow = {
  id: string;
  projectId: string;
  mediaAssetId: string | null;
  path: string | null;
  kind: string | null;
  frame: "landscape" | "portrait" | null;
  label: LocalizedJson | null;
  sortOrder: number;
};

export type PieceTagRow = {
  pieceId: string;
  tagSlug: string;
};

export type MigrationMapRow = {
  id: string;
  sourceTable: string;
  sourceId: string;
  targetType: MigrationMapTargetType;
  targetId: string;
  notes: string | null;
  migratedAt: Date;
};

export const PortfolioEntity = new EntitySchema<PortfolioEntityRow>({
  name: "PortfolioEntity",
  tableName: "entities",
  columns: {
    id: { type: String, primary: true, length: 64 },
    slug: { type: String, length: 128, unique: true },
    name: { type: String, length: 255 },
    shortName: {
      name: "short_name",
      type: String,
      length: 128,
      nullable: true,
    },
    type: { type: String, length: 32 },
    logoPath: {
      name: "logo_path",
      type: String,
      length: 512,
      nullable: true,
    },
    logoAssetId: {
      name: "logo_asset_id",
      type: String,
      length: 36,
      nullable: true,
    },
    href: { type: String, length: 1024, nullable: true },
    description: { type: "json", nullable: true },
    visible: { type: Boolean, default: false },
    pageEnabled: { name: "page_enabled", type: Boolean, default: false },
    showOnHome: { name: "show_on_home", type: Boolean, default: false },
    homeOrder: { name: "home_order", type: Number, nullable: true },
    sortOrder: { name: "sort_order", type: Number, default: 0 },
    createdAt: { name: "created_at", type: Date, createDate: true },
    updatedAt: { name: "updated_at", type: Date, updateDate: true },
  },
  indices: [
    { columns: ["showOnHome", "homeOrder"] },
    { columns: ["visible", "pageEnabled"] },
  ],
});

export const ProjectEntity = new EntitySchema<ProjectRow>({
  name: "Project",
  tableName: "projects",
  columns: {
    id: { type: String, primary: true, length: 64 },
    slug: { type: String, length: 128, unique: true },
    title: { type: "json" },
    summary: { type: "json", nullable: true },
    description: { type: "json", nullable: true },
    startYear: { name: "start_year", type: Number, nullable: true },
    startMonth: { name: "start_month", type: Number, nullable: true },
    endYear: { name: "end_year", type: Number, nullable: true },
    endMonth: { name: "end_month", type: Number, nullable: true },
    dateLabel: { name: "date_label", type: "json", nullable: true },
    status: { type: String, length: 16, default: "completed" },
    type: { type: String, length: 64, nullable: true },
    context: { type: String, length: 32 },
    coverPath: {
      name: "cover_path",
      type: String,
      length: 512,
      nullable: true,
    },
    coverAssetId: {
      name: "cover_asset_id",
      type: String,
      length: 36,
      nullable: true,
    },
    links: { type: "json", nullable: true },
    published: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    caseStudyEnabled: {
      name: "case_study_enabled",
      type: Boolean,
      default: false,
    },
    showOnHome: { name: "show_on_home", type: Boolean, default: false },
    homeOrder: { name: "home_order", type: Number, nullable: true },
    sortOrder: { name: "sort_order", type: Number, default: 0 },
    createdAt: { name: "created_at", type: Date, createDate: true },
    updatedAt: { name: "updated_at", type: Date, updateDate: true },
  },
  indices: [
    { columns: ["status", "published", "sortOrder"] },
    { columns: ["showOnHome", "homeOrder"] },
  ],
});

export const ProjectAreaEntity = new EntitySchema<ProjectAreaRow>({
  name: "project_areas",
  tableName: "project_areas",
  columns: {
    projectId: { name: "project_id", type: String, length: 64, primary: true },
    area: { type: String, length: 16, primary: true },
  },
});

export const ProjectRoleEntity = new EntitySchema<ProjectRoleRow>({
  name: "project_roles",
  tableName: "project_roles",
  columns: {
    projectId: { name: "project_id", type: String, length: 64, primary: true },
    role: { type: String, length: 32, primary: true },
  },
});

export const ProjectEntityLinkEntity = new EntitySchema<ProjectEntityRow>({
  name: "project_entities",
  tableName: "project_entities",
  columns: {
    projectId: { name: "project_id", type: String, length: 64, primary: true },
    entityId: { name: "entity_id", type: String, length: 64, primary: true },
    relationRole: {
      name: "relation_role",
      type: String,
      length: 32,
      primary: true,
    },
  },
  indices: [{ columns: ["entityId"] }],
});

export const PieceEntityLinkEntity = new EntitySchema<PieceEntityRow>({
  name: "piece_entities",
  tableName: "piece_entities",
  columns: {
    pieceId: { name: "piece_id", type: String, length: 128, primary: true },
    entityId: { name: "entity_id", type: String, length: 64, primary: true },
    relationRole: {
      name: "relation_role",
      type: String,
      length: 32,
      primary: true,
    },
    sortOrder: { name: "sort_order", type: Number, default: 0 },
    isPrimary: { name: "is_primary", type: Boolean, default: false },
  },
  indices: [{ columns: ["entityId"] }],
});

export const PieceEntity = new EntitySchema<PieceRow>({
  name: "pieces",
  tableName: "pieces",
  columns: {
    id: { type: String, primary: true, length: 128 },
    slug: { type: String, length: 128, nullable: true, unique: true },
    title: { type: "json", nullable: true },
    alt: { type: String, length: 512 },
    category: { type: String, length: 32 },
    origin: { type: String, length: 32, nullable: true },
    srcPath: { name: "src_path", type: String, length: 512 },
    srcAssetId: {
      name: "src_asset_id",
      type: String,
      length: 36,
      nullable: true,
    },
    fit: { type: String, length: 16, nullable: true },
    year: { type: String, length: 32, nullable: true },
    detail: { type: "json", nullable: true },
    href: { type: String, length: 1024, nullable: true },
    hrefLabel: { name: "href_label", type: "json", nullable: true },
    projectId: {
      name: "project_id",
      type: String,
      length: 64,
      nullable: true,
    },
    published: { type: Boolean, default: false },
    sortOrder: { name: "sort_order", type: Number, default: 0 },
    legacySection: {
      name: "legacy_section",
      type: String,
      length: 32,
      nullable: true,
    },
    legacyGallery: {
      name: "legacy_gallery",
      type: "json",
      nullable: true,
    },
    createdAt: { name: "created_at", type: Date, createDate: true },
    updatedAt: { name: "updated_at", type: Date, updateDate: true },
  },
  indices: [
    { columns: ["projectId", "published", "sortOrder"] },
    { columns: ["category", "published", "sortOrder"] },
    { columns: ["legacySection", "published"] },
  ],
});

export const PieceResourceEntity = new EntitySchema<PieceResourceRow>({
  name: "piece_resources",
  tableName: "piece_resources",
  columns: {
    id: { type: String, primary: true, length: 36 },
    pieceId: { name: "piece_id", type: String, length: 128 },
    mediaAssetId: {
      name: "media_asset_id",
      type: String,
      length: 36,
      nullable: true,
    },
    path: { type: String, length: 512, nullable: true },
    kind: { type: String, length: 32, nullable: true },
    label: { type: "json", nullable: true },
    sortOrder: { name: "sort_order", type: Number, default: 0 },
  },
  indices: [{ columns: ["pieceId", "sortOrder"] }],
});

export const ProjectResourceEntity = new EntitySchema<ProjectResourceRow>({
  name: "project_resources",
  tableName: "project_resources",
  columns: {
    id: { type: String, primary: true, length: 36 },
    projectId: { name: "project_id", type: String, length: 64 },
    mediaAssetId: {
      name: "media_asset_id",
      type: String,
      length: 36,
      nullable: true,
    },
    path: { type: String, length: 512, nullable: true },
    kind: { type: String, length: 32, nullable: true },
    frame: { type: String, length: 16, nullable: true },
    label: { type: "json", nullable: true },
    sortOrder: { name: "sort_order", type: Number, default: 0 },
  },
  indices: [{ columns: ["projectId", "sortOrder"] }],
});

export const PieceTagEntity = new EntitySchema<PieceTagRow>({
  name: "piece_tags",
  tableName: "piece_tags",
  columns: {
    pieceId: { name: "piece_id", type: String, length: 128, primary: true },
    tagSlug: { name: "tag_slug", type: String, length: 64, primary: true },
  },
});

export const MigrationMapEntity = new EntitySchema<MigrationMapRow>({
  name: "migration_map",
  tableName: "migration_map",
  columns: {
    id: { type: String, primary: true, length: 36 },
    sourceTable: { name: "source_table", type: String, length: 64 },
    sourceId: { name: "source_id", type: String, length: 128 },
    targetType: { name: "target_type", type: String, length: 32 },
    targetId: { name: "target_id", type: String, length: 128 },
    notes: { type: "text", nullable: true },
    migratedAt: { name: "migrated_at", type: Date, createDate: true },
  },
  indices: [
    {
      columns: ["sourceTable", "sourceId", "targetType", "targetId"],
      unique: true,
    },
  ],
});

export const portfolioV2Entities = [
  PortfolioEntity,
  ProjectEntity,
  ProjectAreaEntity,
  ProjectRoleEntity,
  ProjectEntityLinkEntity,
  PieceEntity,
  PieceEntityLinkEntity,
  PieceResourceEntity,
  ProjectResourceEntity,
  PieceTagEntity,
  MigrationMapEntity,
];

import { EntitySchema } from "typeorm";

/** { es, en } stored as JSON in MySQL */
export type LocalizedJson = { es: string; en: string };

export type BioRow = {
  id: string;
  photoPath: string;
  photoAlt: LocalizedJson;
  signaturePath: string;
  signatureAlt: LocalizedJson;
  cvPath: string | null;
  cvPathEn: string | null;
  text: LocalizedJson;
};

export type NamedListKind = "company" | "past_project" | "current_project";

export type NamedListItemRow = {
  id: number;
  kind: NamedListKind;
  label: string;
  logoPath: string | null;
  sortOrder: number;
  published: boolean;
  createdAt: Date;
};

export type TestimonialRow = {
  id: string;
  name: string;
  imagePath: string;
  quote: LocalizedJson;
  role: LocalizedJson;
  companyName: string;
  companyLogoPath: string | null;
  companyHref: string | null;
  linkLabel: LocalizedJson | null;
  hidden: boolean;
  sortOrder: number;
};

export type GraphicSection =
  | "covers"
  | "logos"
  | "personal"
  | "pending"
  | "illustration"
  | "banners";

export type GraphicItemRow = {
  id: string;
  section: GraphicSection;
  srcPath: string;
  alt: string;
  title: LocalizedJson | null;
  year: string | null;
  detail: LocalizedJson | null;
  href: string | null;
  hrefLabel: LocalizedJson | null;
  tags: string[] | null;
  fit: "cover" | "contain" | null;
  relatedSrcPath: string | null;
  sortOrder: number;
  published: boolean;
};

export type BrandManualRow = {
  id: string;
  coverPath: string;
  pdfPath: string;
  title: LocalizedJson;
  year: string | null;
  meta: LocalizedJson | null;
  sortOrder: number;
  published: boolean;
};

export type UiCategory =
  | "preventas"
  | "sistemas-a-medida"
  | "proyectos-personales";

export type UiProjectRow = {
  id: string;
  category: UiCategory;
  title: LocalizedJson;
  meta: LocalizedJson;
  images: string[];
  prototypeUrl: string | null;
  sortOrder: number;
  published: boolean;
};

export type UiListItemRow = {
  id: string;
  title: LocalizedJson;
  logoPath: string | null;
  caption: string | null;
  wordmark: string | null;
  sortOrder: number;
  published: boolean;
};

export type TechIconRow = {
  id: string;
  srcPath: string;
  label: string | null;
  sortOrder: number;
  published: boolean;
};

export type AdminUserRow = {
  id: number;
  username: string;
  passwordHash: string;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TagRow = {
  slug: string;
  labelEs: string;
  labelEn: string;
  isNsfw: boolean;
  sortOrder: number;
};

export type SiteSettingsRow = {
  id: string;
  email: string;
  phone: string;
  noteEs: string;
  noteEn: string;
  poweredBy: string;
  carouselIntervalMs: number;
  graphicPreviewLimit: number;
  interfacesPreviewLimit: number;
  /** Section order + marquee settings for home lists */
  homeLayout: Record<string, unknown> | null;
};

export type SocialLinkRow = {
  id: string;
  network: string;
  label: string;
  href: string;
  iconPath: string | null;
  sortOrder: number;
  published: boolean;
};

export type AuditAction = "create" | "update" | "delete" | "replace";

export type AuditEntityType =
  | "bio"
  | "site_settings"
  | "home_layout"
  | "named_list"
  | "testimonial"
  | "graphic_item"
  | "brand_manual"
  | "ui_project"
  | "ui_list_item"
  | "tag"
  | "social_link";

export type AdminAuditLogRow = {
  id: string;
  userId: number;
  username: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  summary: string;
  beforeJson: Record<string, unknown> | null;
  afterJson: Record<string, unknown> | null;
  undoable: boolean;
  undoneAt: Date | null;
  createdAt: Date;
};

export const BioEntity = new EntitySchema<BioRow>({
  name: "bio",
  tableName: "bio",
  columns: {
    id: { type: String, primary: true, length: 32 },
    photoPath: { name: "photo_path", type: String, length: 512 },
    photoAlt: { name: "photo_alt", type: "json" },
    signaturePath: { name: "signature_path", type: String, length: 512 },
    signatureAlt: { name: "signature_alt", type: "json" },
    cvPath: { name: "cv_path", type: String, length: 512, nullable: true },
    cvPathEn: {
      name: "cv_path_en",
      type: String,
      length: 512,
      nullable: true,
    },
    text: { type: "json" },
  },
});

export const NamedListItemEntity = new EntitySchema<NamedListItemRow>({
  name: "named_list_items",
  tableName: "named_list_items",
  columns: {
    id: { type: Number, primary: true, generated: true },
    kind: { type: String, length: 32 },
    label: { type: String, length: 255 },
    logoPath: {
      name: "logo_path",
      type: String,
      length: 512,
      nullable: true,
    },
    sortOrder: { name: "sort_order", type: Number },
    published: { type: Boolean, default: true },
    createdAt: { name: "created_at", type: Date, createDate: true },
  },
  indices: [{ columns: ["kind", "sortOrder"] }],
});

export const TestimonialEntity = new EntitySchema<TestimonialRow>({
  name: "testimonials",
  tableName: "testimonials",
  columns: {
    id: { type: String, primary: true, length: 64 },
    name: { type: String, length: 255 },
    imagePath: { name: "image_path", type: String, length: 512 },
    quote: { type: "json" },
    role: { type: "json" },
    companyName: { name: "company_name", type: String, length: 255 },
    companyLogoPath: {
      name: "company_logo_path",
      type: String,
      length: 512,
      nullable: true,
    },
    companyHref: {
      name: "company_href",
      type: String,
      length: 512,
      nullable: true,
    },
    linkLabel: { name: "link_label", type: "json", nullable: true },
    hidden: { type: Boolean, default: false },
    sortOrder: { name: "sort_order", type: Number },
  },
});

export const GraphicItemEntity = new EntitySchema<GraphicItemRow>({
  name: "graphic_items",
  tableName: "graphic_items",
  columns: {
    id: { type: String, primary: true, length: 128 },
    section: { type: String, length: 32 },
    srcPath: { name: "src_path", type: String, length: 512 },
    alt: { type: String, length: 512 },
    title: { type: "json", nullable: true },
    year: { type: String, length: 32, nullable: true },
    detail: { type: "json", nullable: true },
    href: { type: String, length: 1024, nullable: true },
    hrefLabel: { name: "href_label", type: "json", nullable: true },
    tags: { type: "json", nullable: true },
    fit: { type: String, length: 16, nullable: true },
    relatedSrcPath: {
      name: "related_src_path",
      type: String,
      length: 512,
      nullable: true,
    },
    sortOrder: { name: "sort_order", type: Number },
    published: { type: Boolean, default: true },
  },
  indices: [{ columns: ["section", "sortOrder"] }],
});

export const BrandManualEntity = new EntitySchema<BrandManualRow>({
  name: "brand_manuals",
  tableName: "brand_manuals",
  columns: {
    id: { type: String, primary: true, length: 64 },
    coverPath: { name: "cover_path", type: String, length: 512 },
    pdfPath: { name: "pdf_path", type: String, length: 512 },
    title: { type: "json" },
    year: { type: String, length: 32, nullable: true },
    meta: { type: "json", nullable: true },
    sortOrder: { name: "sort_order", type: Number },
    published: { type: Boolean, default: true },
  },
});

export const UiProjectEntity = new EntitySchema<UiProjectRow>({
  name: "ui_projects",
  tableName: "ui_projects",
  columns: {
    id: { type: String, primary: true, length: 64 },
    category: { type: String, length: 64 },
    title: { type: "json" },
    meta: { type: "json" },
    images: { type: "json" },
    prototypeUrl: {
      name: "prototype_url",
      type: String,
      length: 1024,
      nullable: true,
    },
    sortOrder: { name: "sort_order", type: Number },
    published: { type: Boolean, default: true },
  },
  indices: [{ columns: ["category", "sortOrder"] }],
});

export const UiListItemEntity = new EntitySchema<UiListItemRow>({
  name: "ui_list_items",
  tableName: "ui_list_items",
  columns: {
    id: { type: String, primary: true, length: 64 },
    title: { type: "json" },
    logoPath: { name: "logo_path", type: String, length: 512, nullable: true },
    caption: { type: String, length: 255, nullable: true },
    wordmark: { type: String, length: 255, nullable: true },
    sortOrder: { name: "sort_order", type: Number },
    published: { type: Boolean, default: true },
  },
});

export const TechIconEntity = new EntitySchema<TechIconRow>({
  name: "tech_icons",
  tableName: "tech_icons",
  columns: {
    id: { type: String, primary: true, length: 64 },
    srcPath: { name: "src_path", type: String, length: 512 },
    label: { type: String, length: 128, nullable: true },
    sortOrder: { name: "sort_order", type: Number },
    published: { type: Boolean, default: true },
  },
});

export const AdminUserEntity = new EntitySchema<AdminUserRow>({
  name: "admin_users",
  tableName: "admin_users",
  columns: {
    id: { type: Number, primary: true, generated: true },
    username: { type: String, length: 64, unique: true },
    passwordHash: { name: "password_hash", type: String, length: 255 },
    mustChangePassword: {
      name: "must_change_password",
      type: Boolean,
      default: true,
    },
    createdAt: { name: "created_at", type: Date, createDate: true },
    updatedAt: { name: "updated_at", type: Date, updateDate: true },
  },
});

export const TagEntity = new EntitySchema<TagRow>({
  name: "tags",
  tableName: "tags",
  columns: {
    slug: { type: String, primary: true, length: 64 },
    labelEs: { name: "label_es", type: String, length: 128 },
    labelEn: { name: "label_en", type: String, length: 128 },
    isNsfw: { name: "is_nsfw", type: Boolean, default: false },
    sortOrder: { name: "sort_order", type: Number },
  },
});

export const SiteSettingsEntity = new EntitySchema<SiteSettingsRow>({
  name: "site_settings",
  tableName: "site_settings",
  columns: {
    id: { type: String, primary: true, length: 32 },
    email: { type: String, length: 255 },
    phone: { type: String, length: 64 },
    noteEs: { name: "note_es", type: "text" },
    noteEn: { name: "note_en", type: "text" },
    poweredBy: { name: "powered_by", type: String, length: 255 },
    carouselIntervalMs: {
      name: "carousel_interval_ms",
      type: Number,
      default: 2000,
    },
    graphicPreviewLimit: {
      name: "graphic_preview_limit",
      type: Number,
      default: 7,
    },
    interfacesPreviewLimit: {
      name: "interfaces_preview_limit",
      type: Number,
      default: 7,
    },
    homeLayout: {
      name: "home_layout",
      type: "json",
      nullable: true,
    },
  },
});

export const SocialLinkEntity = new EntitySchema<SocialLinkRow>({
  name: "social_links",
  tableName: "social_links",
  columns: {
    id: { type: String, primary: true, length: 64 },
    network: { type: String, length: 64 },
    label: { type: String, length: 128 },
    href: { type: String, length: 1024 },
    iconPath: { name: "icon_path", type: String, length: 512, nullable: true },
    sortOrder: { name: "sort_order", type: Number },
    published: { type: Boolean, default: true },
  },
});

export const AdminAuditLogEntity = new EntitySchema<AdminAuditLogRow>({
  name: "admin_audit_logs",
  tableName: "admin_audit_logs",
  columns: {
    id: { type: String, primary: true, length: 36 },
    userId: { name: "user_id", type: Number },
    username: { type: String, length: 64 },
    action: { type: String, length: 16 },
    entityType: { name: "entity_type", type: String, length: 32 },
    entityId: { name: "entity_id", type: String, length: 128 },
    summary: { type: String, length: 512 },
    beforeJson: { name: "before_json", type: "json", nullable: true },
    afterJson: { name: "after_json", type: "json", nullable: true },
    undoable: { type: Boolean, default: true },
    undoneAt: { name: "undone_at", type: Date, nullable: true },
    createdAt: { name: "created_at", type: Date, createDate: true },
  },
  indices: [
    { columns: ["createdAt"] },
    { columns: ["entityType", "entityId", "createdAt"] },
    { columns: ["userId", "createdAt"] },
  ],
});

/**
 * Content Model V2 — Phase 3B decision manifest (canonical for migrator).
 * Do NOT parse Markdown; this file is the only machine source of human decisions.
 */
import { createHash } from "node:crypto";

/* -------------------------------------------------------------------------- */
/* Catalogs / unions                                                          */
/* -------------------------------------------------------------------------- */

export type MigrationLane =
  | "AUTO_MIGRATED"
  | "MANUAL_DECISION_MIGRATED"
  | "DEFERRED"
  | "DISCARDED";

export type ProjectContext =
  | "client-work"
  | "internal-work"
  | "presale"
  | "demo"
  | "personal"
  | "other";

export type ProjectStatus = "ongoing" | "completed" | "archived";

export type ProjectArea = "graphic" | "ux-ui";

export type ProjectRole =
  | "ux"
  | "ui"
  | "visual-direction"
  | "frontend"
  | "graphic-design"
  | "branding"
  | "other";

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

export type RelationRole =
  | "client"
  | "employer"
  | "collaborator"
  | "intermediary"
  | "brand-owner"
  | "responsible"
  | "other";

export type PieceCategory =
  | "visual-identity"
  | "illustration-artwork"
  | "campaigns-communication"
  | "print"
  | "other";

export type PieceOrigin = "personal" | "client" | "other";

export const MIGRATION_LANES = [
  "AUTO_MIGRATED",
  "MANUAL_DECISION_MIGRATED",
  "DEFERRED",
  "DISCARDED",
] as const satisfies readonly MigrationLane[];

export const PROJECT_CONTEXTS = [
  "client-work",
  "internal-work",
  "presale",
  "demo",
  "personal",
  "other",
] as const satisfies readonly ProjectContext[];

export const PROJECT_STATUSES = [
  "ongoing",
  "completed",
  "archived",
] as const satisfies readonly ProjectStatus[];

export const PROJECT_AREAS = [
  "graphic",
  "ux-ui",
] as const satisfies readonly ProjectArea[];

export const PROJECT_ROLES = [
  "ux",
  "ui",
  "visual-direction",
  "frontend",
  "graphic-design",
  "branding",
  "other",
] as const satisfies readonly ProjectRole[];

export const ENTITY_TYPES = [
  "company",
  "institution",
  "association",
  "brand",
  "personal_brand",
  "person",
  "organization",
  "collective",
  "other",
] as const satisfies readonly EntityType[];

export const RELATION_ROLES = [
  "client",
  "employer",
  "collaborator",
  "intermediary",
  "brand-owner",
  "responsible",
  "other",
] as const satisfies readonly RelationRole[];

export const PIECE_CATEGORIES = [
  "visual-identity",
  "illustration-artwork",
  "campaigns-communication",
  "print",
  "other",
] as const satisfies readonly PieceCategory[];

export const PIECE_ORIGINS = [
  "personal",
  "client",
  "other",
] as const satisfies readonly PieceOrigin[];

/* -------------------------------------------------------------------------- */
/* Manifest types                                                             */
/* -------------------------------------------------------------------------- */

export type EntityDecision = {
  id: string;
  name: string;
  type: EntityType;
  visible: boolean;
  pageEnabled: boolean;
  showOnHome: boolean;
  lane: MigrationLane;
  logoFromBrandId?: string;
  confidential?: boolean;
};

export type ProjectDecision = {
  id: string;
  title: { es: string; en?: string };
  type: string;
  context: ProjectContext;
  status: ProjectStatus;
  published: boolean;
  showOnHome?: boolean;
  areas: ProjectArea[];
  roles: ProjectRole[];
  entities: { entityId: string; relationRole: RelationRole }[];
  /** Legacy sources; confidential sources use fingerprint only in reports */
  sources?: { table: string; id: string; confidential?: boolean }[];
  pieceIds?: string[];
  lane: MigrationLane;
  confidential?: boolean;
};

export type PieceDecision = {
  legacyGraphicItemId: string;
  projectId: string | null;
  category: PieceCategory;
  origin: PieceOrigin;
  published?: boolean;
  entityLinks?: {
    entityId: string;
    relationRole: RelationRole;
    isPrimary?: boolean;
  }[];
  lane: MigrationLane;
  /** If true, do not create as user's branding piece (e.g. buhoprofe) */
  asProjectResourceOnly?: { projectId: string; note: string };
  discard?: boolean;
  tags?: string[];
};

export type DiscardedItem = {
  id: string;
  kind:
    | "entity"
    | "project"
    | "piece"
    | "named_list"
    | "home_label"
    | "authorship"
    | "invention"
    | "other";
  label: string;
  reason: string;
  legacyRef?: { table?: string; id?: string };
};

export type DeferredItem = {
  id: string;
  kind:
    | "project"
    | "entity"
    | "role"
    | "published"
    | "relation"
    | "validation"
    | "other";
  label: string;
  reason: string;
  relatedIds?: string[];
};

export type DecisionManifest = {
  version: 1;
  entities: EntityDecision[];
  projects: ProjectDecision[];
  pieces: PieceDecision[];
  testimonials: { id: string; entityId: string }[];
  discarded: DiscardedItem[];
  deferred: DeferredItem[];
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Deterministic fingerprint for confidential / sensitive legacy source ids. */
export function fingerprintSourceId(raw: string): string {
  return `sha256:${createHash("sha256").update(raw).digest("hex")}`;
}

const MANUAL: MigrationLane = "MANUAL_DECISION_MIGRATED";

/* -------------------------------------------------------------------------- */
/* Manifest                                                                   */
/* -------------------------------------------------------------------------- */

export const migrationDecisions: DecisionManifest = {
  version: 1,

  entities: [
    /* —— From legacy brands —— */
    {
      id: "push",
      name: "PUSH Software",
      type: "company",
      visible: true,
      pageEnabled: true,
      showOnHome: true,
      lane: MANUAL,
      logoFromBrandId: "push",
    },
    {
      id: "aicore",
      name: "AICORE IT Specialists",
      type: "company",
      visible: true,
      pageEnabled: true,
      showOnHome: true,
      lane: MANUAL,
      logoFromBrandId: "aicore",
    },
    {
      id: "citf",
      name: "Clúster de Innovación Tecnológica Formosa",
      type: "institution",
      visible: true,
      pageEnabled: true,
      showOnHome: true,
      lane: MANUAL,
      logoFromBrandId: "citf",
    },
    {
      id: "seyier",
      name: "Seyier",
      type: "personal_brand",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
      logoFromBrandId: "seyier",
    },
    {
      id: "apsmm",
      name: "APSMM",
      type: "association",
      visible: true,
      pageEnabled: false,
      showOnHome: true,
      lane: MANUAL,
      logoFromBrandId: "apsmm",
    },
    {
      id: "ludica",
      name: "Lúdica Tech",
      type: "company",
      visible: true,
      pageEnabled: false,
      showOnHome: true,
      lane: MANUAL,
      logoFromBrandId: "ludica",
    },
    {
      id: "orbita-l-b",
      name: "Órbita LΔB",
      type: "company",
      visible: true,
      pageEnabled: false,
      showOnHome: true,
      lane: MANUAL,
      logoFromBrandId: "orbita-l-b",
    },

    /* —— New commercial / product entities —— */
    {
      id: "adapto-pay",
      name: "ADAPTO PAY",
      type: "company",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
    {
      id: "clearwater",
      name: "CLEARWATER",
      type: "company",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
    {
      id: "mikrobiol",
      name: "MIKROBIOL",
      type: "company",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
    {
      id: "casiba",
      name: "CASIBA",
      type: "company",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
    {
      id: "proxi",
      name: "PROXI",
      type: "company",
      visible: false,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
    {
      id: "omnigroup",
      name: "Omnigroup",
      type: "company",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
    {
      id: "savil",
      name: "Savil",
      type: "company",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },

    /* —— Confidential / private clients (generic public-safe names only) —— */
    {
      id: "confidential-inventariado-client",
      name: "Cliente confidencial Inventariado",
      type: "other",
      visible: false,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
      confidential: true,
    },
    {
      id: "confidential-aml-client",
      name: "Cliente confidencial AML",
      type: "other",
      visible: false,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
      confidential: true,
    },
    {
      id: "confidential-asesor-client",
      name: "Cliente privado Asesor Financiero",
      type: "person",
      visible: false,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
      confidential: true,
    },
    {
      id: "confidential-sessions-client",
      name: "Cliente privado Sessions",
      type: "other",
      visible: false,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
      confidential: true,
    },
    {
      id: "confidential-logistics-client",
      name: "Cliente confidencial Logística",
      type: "other",
      visible: false,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
      confidential: true,
    },

    /* —— Graphic / institutional entities —— */
    {
      id: "futulab",
      name: "Futulab",
      type: "company",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
    {
      id: "summit-holding",
      name: "Summit Holding",
      type: "other",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
    {
      id: "magic-cell",
      name: "Magic Cell",
      type: "company",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
    {
      id: "brigado-crew",
      name: "Brigado Crew",
      type: "other",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
    {
      id: "templeton-mathews",
      name: "Templeton & Mathews",
      type: "company",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
    {
      id: "repuestos-carlitos",
      name: "Repuestos Carlitos",
      type: "company",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
    {
      id: "la-estacion",
      name: "La Estación",
      type: "company",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
    {
      id: "epica",
      name: "EPICA",
      type: "company",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
    {
      id: "gobierno-formosa",
      name: "Gobierno de Formosa",
      type: "institution",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
    {
      id: "instituto-asistencia-social",
      name: "Instituto de Asistencia Social",
      type: "institution",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
    {
      id: "red-clubes-digitales",
      name: "Red de Clubes Digitales",
      type: "organization",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
    {
      id: "secretaria-cyt-formosa",
      name: "Secretaría de Ciencia y Tecnología de Formosa",
      type: "institution",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
    {
      id: "subsecretaria-empleo-formosa",
      name: "Subsecretaría de Empleo de Formosa",
      type: "institution",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
    {
      id: "cloronor",
      name: "Cloronor",
      type: "company",
      visible: true,
      pageEnabled: false,
      showOnHome: false,
      lane: MANUAL,
    },
  ],

  projects: [
    /* —— UX/UI (3B.2) —— */
    {
      id: "aicore-inventariado",
      title: {
        es: "AICORE IT Specialists — inventariado",
        en: "AICORE IT Specialists — inventory",
      },
      type: "custom-system",
      context: "presale",
      status: "completed",
      published: true,
      areas: ["ux-ui"],
      roles: ["ux", "ui", "visual-direction"],
      entities: [
        { entityId: "aicore", relationRole: "employer" },
        {
          entityId: "confidential-inventariado-client",
          relationRole: "client",
        },
      ],
      sources: [
        { table: "ui_projects", id: "aicore-inventariado", confidential: true },
      ],
      lane: MANUAL,
      confidential: true,
    },
    {
      id: "aml-general",
      title: {
        es: "Análisis contra el Lavado de Dinero",
        en: "Anti-Money Laundering Analysis",
      },
      type: "custom-system",
      context: "client-work",
      status: "completed",
      published: true,
      areas: ["ux-ui"],
      roles: ["ux", "ui"],
      entities: [
        { entityId: "aicore", relationRole: "employer" },
        { entityId: "confidential-aml-client", relationRole: "client" },
      ],
      sources: [{ table: "ui_projects", id: "aml-general" }],
      lane: MANUAL,
      confidential: true,
    },
    {
      id: "aml-casinos",
      title: {
        es: "Análisis contra el Lavado de Dinero en Casinos Digitales",
        en: "Anti-Money Laundering Analysis for Digital Casinos",
      },
      type: "custom-system",
      context: "client-work",
      status: "completed",
      published: true,
      areas: ["ux-ui"],
      roles: ["ux", "ui"],
      entities: [
        { entityId: "aicore", relationRole: "employer" },
        { entityId: "confidential-aml-client", relationRole: "client" },
      ],
      sources: [{ table: "ui_projects", id: "aml-casinos" }],
      lane: MANUAL,
      confidential: true,
    },
    {
      id: "adapto-pay",
      title: {
        es: "Billetera Digital - ADAPTO PAY",
        en: "Digital Wallet - ADAPTO PAY",
      },
      type: "mobile-app",
      context: "presale",
      status: "completed",
      published: true,
      areas: ["ux-ui"],
      roles: ["ux", "ui"],
      entities: [
        { entityId: "adapto-pay", relationRole: "client" },
        { entityId: "aicore", relationRole: "employer" },
      ],
      sources: [{ table: "ui_projects", id: "adapto-pay" }],
      lane: MANUAL,
    },
    {
      id: "clearwater",
      title: {
        es: "Generación de Informes para compra e inversión - CLEARWATER",
        en: "Purchase & Investment Report Generation - CLEARWATER",
      },
      type: "custom-system",
      context: "presale",
      status: "completed",
      published: true,
      areas: ["ux-ui"],
      roles: ["ux", "ui"],
      entities: [
        { entityId: "clearwater", relationRole: "client" },
        { entityId: "aicore", relationRole: "employer" },
      ],
      sources: [{ table: "ui_projects", id: "clearwater" }],
      lane: MANUAL,
    },
    {
      id: "mikrobiol",
      title: {
        es: "Tienda de Insumos Medicinales - MIKROBIOL",
        en: "Medical Supplies Store - MIKROBIOL",
      },
      type: "web-app",
      context: "presale",
      status: "completed",
      published: true,
      areas: ["ux-ui"],
      roles: ["ux", "ui"],
      entities: [
        { entityId: "mikrobiol", relationRole: "client" },
        { entityId: "aicore", relationRole: "employer" },
      ],
      sources: [{ table: "ui_projects", id: "mikrobiol" }],
      lane: MANUAL,
    },
    {
      id: "casiba",
      title: {
        es: "Sistema de Gestión de Unidades de Tratamiento de Aire - CASIBA",
        en: "Air Treatment Units Management System - CASIBA",
      },
      type: "custom-system",
      context: "presale",
      status: "completed",
      published: true,
      areas: ["ux-ui"],
      roles: ["ux", "ui"],
      entities: [
        { entityId: "casiba", relationRole: "client" },
        { entityId: "aicore", relationRole: "employer" },
      ],
      sources: [{ table: "ui_projects", id: "casiba" }],
      lane: MANUAL,
    },
    {
      id: "proxi",
      title: {
        es: "Plataforma integral de ventas y pedidos B2B - PROXI",
        en: "Integrated B2B sales & orders platform - PROXI",
      },
      type: "custom-system",
      context: "presale",
      status: "completed",
      published: false,
      areas: ["ux-ui"],
      roles: ["ux", "ui"],
      entities: [
        { entityId: "proxi", relationRole: "client" },
        { entityId: "aicore", relationRole: "employer" },
      ],
      sources: [{ table: "ui_projects", id: "proxi" }],
      lane: MANUAL,
    },
    {
      id: "apsmm",
      title: {
        es: "Sistema de gestión — APSMM",
        en: "Management system — APSMM",
      },
      type: "custom-system",
      context: "presale",
      status: "completed",
      published: true,
      areas: ["ux-ui", "graphic"],
      roles: ["ux", "ui", "graphic-design"],
      entities: [
        { entityId: "apsmm", relationRole: "client" },
        { entityId: "push", relationRole: "employer" },
      ],
      sources: [
        { table: "ui_projects", id: "apsmm" },
        { table: "graphic_items", id: "apsmm" },
      ],
      pieceIds: ["apsmm"],
      lane: MANUAL,
    },
    {
      id: "omnigroup",
      title: {
        es: "Omnigroup — backoffice y tótem",
        en: "Omnigroup — backoffice and totem",
      },
      type: "custom-system",
      context: "presale",
      status: "completed",
      published: true,
      areas: ["ux-ui"],
      roles: ["ux", "ui"],
      entities: [
        { entityId: "omnigroup", relationRole: "client" },
        { entityId: "aicore", relationRole: "employer" },
      ],
      sources: [{ table: "ui_projects", id: "omnigroup" }],
      lane: MANUAL,
    },
    {
      id: "savil",
      title: { es: "Savil", en: "Savil" },
      type: "mobile-app",
      context: "presale",
      status: "completed",
      published: true,
      areas: ["ux-ui"],
      roles: ["ux", "ui"],
      entities: [{ entityId: "savil", relationRole: "client" }],
      sources: [{ table: "ui_projects", id: "savil" }],
      lane: MANUAL,
    },
    {
      id: "asesor-financiero",
      title: { es: "Asesor Financiero", en: "Financial Advisor" },
      type: "mobile-app",
      context: "presale",
      status: "completed",
      published: true,
      areas: ["ux-ui"],
      roles: ["ux", "ui"],
      entities: [
        { entityId: "confidential-asesor-client", relationRole: "client" },
      ],
      sources: [
        { table: "ui_projects", id: "asesor-financiero", confidential: true },
      ],
      lane: MANUAL,
      confidential: true,
    },
    {
      id: "cms-portfolio",
      title: {
        es: "Sistema de gestión de contenido del portfolio",
        en: "Portfolio content management system",
      },
      type: "custom-system",
      context: "personal",
      status: "ongoing",
      published: true,
      areas: ["ux-ui"],
      roles: ["ux", "ui"],
      entities: [],
      sources: [{ table: "ui_projects", id: "cms-portfolio" }],
      lane: MANUAL,
    },

    /* —— Graphic / reconstructed (3B.3–3B.5) —— */
    {
      id: "expedicion-polo",
      title: { es: "EXPEDICIÓN POLO", en: "EXPEDICIÓN POLO" },
      type: "event",
      context: "client-work",
      status: "completed",
      published: true,
      areas: ["graphic"],
      roles: ["graphic-design", "visual-direction"],
      entities: [{ entityId: "citf", relationRole: "responsible" }],
      sources: [{ table: "graphic_items", id: "expedicion-polo" }],
      pieceIds: ["expedicion-polo"],
      lane: MANUAL,
    },
    {
      id: "juegos-provinciales",
      title: {
        es: "Juegos Provinciales Tecnológicos",
        en: "Provincial Technology Games",
      },
      type: "event",
      context: "client-work",
      status: "completed",
      published: true,
      areas: ["graphic"],
      roles: ["graphic-design", "visual-direction"],
      entities: [{ entityId: "gobierno-formosa", relationRole: "client" }],
      sources: [{ table: "graphic_items", id: "juegos-provinciales" }],
      pieceIds: ["juegos-provinciales"],
      lane: MANUAL,
    },
    {
      id: "citf-identity-2025",
      title: {
        es: "Identidad visual CITF 2025",
        en: "CITF visual identity 2025",
      },
      type: "branding",
      context: "client-work",
      status: "completed",
      published: true,
      areas: ["graphic"],
      roles: ["branding", "graphic-design", "visual-direction"],
      entities: [{ entityId: "citf", relationRole: "brand-owner" }],
      sources: [
        { table: "graphic_items", id: "itf" },
        { table: "graphic_items", id: "banner-cluster" },
        { table: "brand_manuals", id: "citf" },
      ],
      pieceIds: ["itf", "banner-cluster"],
      lane: MANUAL,
    },
    {
      id: "seyier-visual-identity",
      title: {
        es: "Identidad visual Seyier",
        en: "Seyier visual identity",
      },
      type: "branding",
      context: "other",
      status: "completed",
      published: true,
      areas: ["graphic"],
      roles: ["branding", "graphic-design", "visual-direction"],
      entities: [{ entityId: "seyier", relationRole: "brand-owner" }],
      sources: [{ table: "graphic_items", id: "seyier" }],
      pieceIds: ["seyier"],
      lane: MANUAL,
    },
    {
      id: "push-visual-identity",
      title: {
        es: "Identidad visual PUSH",
        en: "PUSH visual identity",
      },
      type: "branding",
      context: "internal-work",
      status: "ongoing",
      published: true,
      areas: ["graphic"],
      roles: ["branding", "graphic-design", "visual-direction"],
      entities: [{ entityId: "push", relationRole: "brand-owner" }],
      sources: [
        { table: "graphic_items", id: "push" },
        { table: "graphic_items", id: "banner-push" },
      ],
      pieceIds: ["push", "banner-push"],
      lane: MANUAL,
    },
    {
      id: "futulab-visual-identity",
      title: {
        es: "Identidad visual Futulab",
        en: "Futulab visual identity",
      },
      type: "branding",
      context: "client-work",
      status: "ongoing",
      published: true,
      areas: ["graphic"],
      roles: ["branding", "graphic-design", "visual-direction"],
      entities: [{ entityId: "futulab", relationRole: "brand-owner" }],
      sources: [{ table: "graphic_items", id: "futulab" }],
      pieceIds: ["futulab"],
      lane: MANUAL,
    },
    {
      id: "bass-series",
      title: { es: "Bass Series", en: "Bass Series" },
      type: "other",
      context: "personal",
      status: "ongoing",
      published: true,
      areas: ["graphic"],
      roles: ["graphic-design"],
      entities: [],
      sources: [
        { table: "graphic_items", id: "twenty-twenty-two-spotify" },
        { table: "graphic_items", id: "twenty-twenty-3" },
        { table: "graphic_items", id: "bass2k24" },
        { table: "graphic_items", id: "bass2025" },
        { table: "graphic_items", id: "bass2026" },
      ],
      pieceIds: [
        "twenty-twenty-two-spotify",
        "twenty-twenty-3",
        "bass2k24",
        "bass2025",
        "bass2026",
      ],
      lane: MANUAL,
    },
    {
      id: "syllabi",
      title: { es: "Syllabi", en: "Syllabi" },
      type: "web-app",
      context: "other",
      status: "completed",
      published: false,
      areas: ["ux-ui"],
      roles: ["ux", "ui"],
      entities: [],
      sources: [{ table: "named_list_items", id: "syllabi" }],
      lane: MANUAL,
    },
    {
      id: "microtime",
      title: { es: "MICROTIME", en: "MICROTIME" },
      type: "custom-system",
      context: "internal-work",
      status: "ongoing",
      published: false,
      areas: ["ux-ui", "graphic"],
      roles: ["ui", "graphic-design"],
      entities: [{ entityId: "push", relationRole: "employer" }],
      sources: [
        { table: "named_list_items", id: "microtime" },
        { table: "graphic_items", id: "microtime" },
      ],
      pieceIds: ["microtime"],
      lane: MANUAL,
    },
    {
      id: "sessions",
      title: { es: "Sessions", en: "Sessions" },
      type: "custom-system",
      context: "client-work",
      status: "completed",
      published: true,
      areas: ["ux-ui", "graphic"],
      roles: ["ux", "ui", "graphic-design"],
      entities: [
        { entityId: "push", relationRole: "employer" },
        { entityId: "confidential-sessions-client", relationRole: "client" },
      ],
      sources: [
        { table: "named_list_items", id: "sessions" },
        { table: "graphic_items", id: "sessions" },
      ],
      pieceIds: ["sessions"],
      lane: MANUAL,
      confidential: true,
    },
    {
      id: "concitar",
      title: { es: "Concitar", en: "Concitar" },
      type: "web-app",
      context: "internal-work",
      status: "completed",
      published: true,
      areas: ["ux-ui", "graphic"],
      roles: ["ux", "ui", "graphic-design"],
      entities: [{ entityId: "push", relationRole: "employer" }],
      sources: [
        { table: "named_list_items", id: "concitar" },
        { table: "graphic_items", id: "concitar" },
      ],
      pieceIds: ["concitar"],
      lane: MANUAL,
    },
    {
      id: "taily",
      title: { es: "Taily", en: "Taily" },
      type: "mobile-app",
      context: "internal-work",
      status: "ongoing",
      published: true,
      areas: ["ux-ui", "graphic"],
      roles: ["ux", "ui", "graphic-design"],
      entities: [{ entityId: "push", relationRole: "employer" }],
      sources: [
        { table: "named_list_items", id: "taily" },
        { table: "graphic_items", id: "taily" },
      ],
      pieceIds: ["taily"],
      lane: MANUAL,
    },
    {
      id: "simaas-marketplace",
      title: {
        es: "Marketplace de Frutas y Verduras",
        en: "Fruit & Vegetable Marketplace",
      },
      type: "web-app",
      context: "presale",
      status: "completed",
      published: true,
      areas: ["ux-ui"],
      roles: ["ux", "ui"],
      entities: [{ entityId: "orbita-l-b", relationRole: "intermediary" }],
      sources: [{ table: "ui_list_items", id: "simaas" }],
      lane: MANUAL,
    },
    {
      id: "templeton-digital-transformation-assessment",
      title: {
        es: "Sistema de Autodiagnóstico Transformación Digital",
        en: "Digital Transformation Self-Assessment System",
      },
      type: "custom-system",
      context: "presale",
      status: "completed",
      published: true,
      areas: ["ux-ui"],
      roles: ["ux", "ui"],
      entities: [
        { entityId: "templeton-mathews", relationRole: "client" },
        { entityId: "aicore", relationRole: "intermediary" },
      ],
      sources: [{ table: "ui_list_items", id: "templeton" }],
      lane: MANUAL,
    },
    {
      id: "confidential-logistics-system",
      title: {
        es: "Sistema de logística (confidencial)",
        en: "Logistics system (confidential)",
      },
      type: "custom-system",
      context: "client-work",
      status: "completed",
      published: false,
      areas: ["ux-ui"],
      roles: [],
      entities: [
        { entityId: "aicore", relationRole: "employer" },
        {
          entityId: "confidential-logistics-client",
          relationRole: "client",
        },
      ],
      sources: [
        {
          table: "ui_projects",
          id: "confidential-logistics-system",
          confidential: true,
        },
      ],
      lane: MANUAL,
      confidential: true,
    },
    {
      id: "repuestos-carlitos",
      title: {
        es: "Landing & Tienda - Repuestos Carlitos",
        en: "Landing & Store - Repuestos Carlitos",
      },
      type: "web-app",
      context: "client-work",
      status: "completed",
      published: true,
      areas: ["ux-ui", "graphic"],
      roles: ["ux", "ui", "graphic-design"],
      entities: [
        { entityId: "push", relationRole: "employer" },
        { entityId: "repuestos-carlitos", relationRole: "client" },
      ],
      sources: [{ table: "ui_list_items", id: "carlitos" }],
      lane: MANUAL,
    },
    {
      id: "mental-training-tech-24-5",
      title: {
        es: "Mental Training Tech 24.5",
        en: "Mental Training Tech 24.5",
      },
      type: "mobile-app",
      context: "presale",
      status: "completed",
      published: true,
      areas: ["ux-ui"],
      roles: [],
      entities: [{ entityId: "aicore", relationRole: "employer" }],
      sources: [
        { table: "named_list_items", id: "mental-training-tech-24-5" },
      ],
      lane: MANUAL,
    },
    {
      id: "cloronor-trading",
      title: {
        es: "Cloronor — Plataforma de inversión",
        en: "Cloronor — Investment platform",
      },
      type: "web-app",
      context: "presale",
      status: "completed",
      published: true,
      areas: ["ux-ui"],
      roles: ["ux", "ui"],
      entities: [
        { entityId: "cloronor", relationRole: "client" },
        { entityId: "aicore", relationRole: "intermediary" },
      ],
      sources: [{ table: "ui_list_items", id: "cloronor-trading" }],
      lane: MANUAL,
    },
  ],

  pieces: [
    /* —— Relocated into projects —— */
    {
      legacyGraphicItemId: "itf",
      projectId: "citf-identity-2025",
      category: "visual-identity",
      origin: "client",
      lane: MANUAL,
      entityLinks: [
        { entityId: "citf", relationRole: "brand-owner", isPrimary: true },
      ],
    },
    {
      legacyGraphicItemId: "banner-cluster",
      projectId: "citf-identity-2025",
      category: "print",
      origin: "client",
      tags: ["impreso"],
      lane: MANUAL,
      entityLinks: [
        { entityId: "citf", relationRole: "brand-owner", isPrimary: true },
      ],
    },
    {
      legacyGraphicItemId: "push",
      projectId: "push-visual-identity",
      category: "visual-identity",
      origin: "other",
      lane: MANUAL,
      entityLinks: [
        { entityId: "push", relationRole: "brand-owner", isPrimary: true },
      ],
    },
    {
      legacyGraphicItemId: "banner-push",
      projectId: "push-visual-identity",
      category: "print",
      origin: "other",
      tags: ["impreso"],
      lane: MANUAL,
      entityLinks: [
        { entityId: "push", relationRole: "brand-owner", isPrimary: true },
      ],
    },
    {
      legacyGraphicItemId: "futulab",
      projectId: "futulab-visual-identity",
      category: "visual-identity",
      origin: "client",
      lane: MANUAL,
      entityLinks: [
        { entityId: "futulab", relationRole: "brand-owner", isPrimary: true },
      ],
    },
    {
      legacyGraphicItemId: "apsmm",
      projectId: "apsmm",
      category: "visual-identity",
      origin: "client",
      lane: MANUAL,
      entityLinks: [
        { entityId: "apsmm", relationRole: "client", isPrimary: true },
      ],
    },
    {
      legacyGraphicItemId: "seyier",
      projectId: "seyier-visual-identity",
      category: "visual-identity",
      origin: "other",
      tags: ["vector"],
      lane: MANUAL,
      entityLinks: [
        { entityId: "seyier", relationRole: "brand-owner", isPrimary: true },
      ],
    },
    {
      legacyGraphicItemId: "expedicion-polo",
      projectId: "expedicion-polo",
      category: "campaigns-communication",
      origin: "client",
      tags: ["evento"],
      lane: MANUAL,
      entityLinks: [
        { entityId: "citf", relationRole: "responsible", isPrimary: true },
      ],
    },
    {
      legacyGraphicItemId: "juegos-provinciales",
      projectId: "juegos-provinciales",
      category: "campaigns-communication",
      origin: "client",
      tags: ["evento"],
      lane: MANUAL,
      entityLinks: [
        {
          entityId: "gobierno-formosa",
          relationRole: "client",
          isPrimary: true,
        },
      ],
    },
    {
      legacyGraphicItemId: "microtime",
      projectId: "microtime",
      category: "visual-identity",
      origin: "other",
      tags: ["vector"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "sessions",
      projectId: "sessions",
      category: "visual-identity",
      origin: "client",
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "concitar",
      projectId: "concitar",
      category: "visual-identity",
      origin: "other",
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "taily",
      projectId: "taily",
      category: "visual-identity",
      origin: "other",
      lane: MANUAL,
    },

    /* —— Bass series —— */
    {
      legacyGraphicItemId: "twenty-twenty-two-spotify",
      projectId: "bass-series",
      category: "illustration-artwork",
      origin: "personal",
      tags: ["bass-series", "cover"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "twenty-twenty-3",
      projectId: "bass-series",
      category: "illustration-artwork",
      origin: "personal",
      tags: ["bass-series", "cover"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "bass2k24",
      projectId: "bass-series",
      category: "illustration-artwork",
      origin: "personal",
      tags: ["bass-series", "cover"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "bass2025",
      projectId: "bass-series",
      category: "illustration-artwork",
      origin: "personal",
      tags: ["bass-series", "cover"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "bass2026",
      projectId: "bass-series",
      category: "illustration-artwork",
      origin: "personal",
      tags: ["bass-series", "cover"],
      lane: MANUAL,
    },

    /* —— Standalone with entity links —— */
    {
      legacyGraphicItemId: "fablab",
      projectId: null,
      category: "visual-identity",
      origin: "client",
      lane: MANUAL,
      entityLinks: [
        { entityId: "citf", relationRole: "responsible", isPrimary: true },
      ],
    },
    {
      legacyGraphicItemId: "labcom",
      projectId: null,
      category: "visual-identity",
      origin: "client",
      published: false,
      lane: MANUAL,
      entityLinks: [
        { entityId: "citf", relationRole: "responsible", isPrimary: true },
      ],
    },
    {
      legacyGraphicItemId: "summit-holding",
      projectId: null,
      category: "visual-identity",
      origin: "client",
      tags: ["vector"],
      lane: MANUAL,
      entityLinks: [
        {
          entityId: "summit-holding",
          relationRole: "brand-owner",
          isPrimary: true,
        },
      ],
    },
    {
      legacyGraphicItemId: "magic-cell",
      projectId: null,
      category: "visual-identity",
      origin: "client",
      tags: ["vector"],
      lane: MANUAL,
      entityLinks: [
        {
          entityId: "magic-cell",
          relationRole: "brand-owner",
          isPrimary: true,
        },
      ],
    },
    {
      legacyGraphicItemId: "brigado-crew",
      projectId: null,
      category: "campaigns-communication",
      origin: "client",
      lane: MANUAL,
      entityLinks: [
        {
          entityId: "brigado-crew",
          relationRole: "brand-owner",
          isPrimary: true,
        },
      ],
    },
    {
      legacyGraphicItemId: "banner-samsung",
      projectId: null,
      category: "print",
      origin: "client",
      tags: ["impreso"],
      lane: MANUAL,
      entityLinks: [
        { entityId: "citf", relationRole: "responsible", isPrimary: true },
        { entityId: "red-clubes-digitales", relationRole: "other" },
      ],
    },
    {
      legacyGraphicItemId: "banner-alfaj-metro",
      projectId: null,
      category: "print",
      origin: "client",
      tags: ["impreso"],
      lane: MANUAL,
      entityLinks: [
        { entityId: "citf", relationRole: "responsible", isPrimary: true },
      ],
    },

    /* —— TDT / personal tags —— */
    {
      legacyGraphicItemId: "tdt",
      projectId: null,
      category: "visual-identity",
      origin: "personal",
      tags: ["tdt", "vector"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "nick-tdt-beach",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      tags: ["tdt", "pixel-art"],
      lane: MANUAL,
    },

    /* —— Personal / fan / covers standalone —— */
    {
      legacyGraphicItemId: "mantis",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "marauda-type-logo-ayala",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      tags: ["vector", "fan-art"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "banana-thinking",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "demon-no-scape",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "grime-marauda",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      tags: ["grime"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "grime-pawn",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      tags: ["grime"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "nicoide-not-impostor",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      tags: ["fan-art", "pixel-art"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "nicoide-geometry-dash",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      tags: ["fan-art"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "we-are-barely-world",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      tags: ["fan-art"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "sad-machine-makenix",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      tags: ["fan-art"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "kadaver-jez-ebel",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      tags: ["fan-art", "cover"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "ive-no-idea",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      tags: ["fan-art", "cover"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "barely-alive",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      tags: ["fan-art", "cover"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "speeditious",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      tags: ["cover"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "rockcito",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      tags: ["cover"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "cover-emoji",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      tags: ["cover"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "reggaeton",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      tags: ["cover"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "odyssey-plant-head",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      tags: ["nsfw"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "penguin-knife",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      tags: ["vector", "tattoo"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "maxi-boo",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      tags: ["fan-art"],
      lane: MANUAL,
    },
    {
      legacyGraphicItemId: "ux-and-x",
      projectId: null,
      category: "illustration-artwork",
      origin: "personal",
      lane: MANUAL,
    },

    /* —— Discarded as branding authorship; contextual resource only —— */
    {
      legacyGraphicItemId: "buhoprofe",
      projectId: null,
      category: "visual-identity",
      origin: "other",
      discard: true,
      asProjectResourceOnly: {
        projectId: "syllabi",
        note: "Solo vectorización contextual; no crear Piece de branding del usuario",
      },
      lane: "DISCARDED",
    },
  ],

  testimonials: [
    { id: "facundo", entityId: "push" },
    { id: "ezequiel", entityId: "aicore" },
    { id: "joaquin", entityId: "ludica" },
    { id: "matias", entityId: "orbita-l-b" },
  ],

  discarded: [
    {
      id: "bind",
      kind: "entity",
      label: "bind",
      reason: "No migrar Entity; label home sin decisión de entidad",
      legacyRef: { table: "named_list_items", id: "bind" },
    },
    {
      id: "ministerio-economia",
      kind: "home_label",
      label: "Ministerio de Economia, Hacienda y Finanzas",
      reason: "No migrar Entity ni label como entidad estructural",
    },
    {
      id: "cloronor-store",
      kind: "project",
      label: "Cloronor store",
      reason: "No crear Project store; trading migrado aparte; landing diferida",
    },
    {
      id: "named-list-runtime",
      kind: "named_list",
      label: "named_list runtime Home",
      reason:
        "named_list_items DEPRECATED post-cutover; Home = Entity/Project.showOnHome + published + status",
    },
    {
      id: "entity-labcom",
      kind: "entity",
      label: "Labcom",
      reason: "Piece standalone → CITF via piece_entities; no Entity Labcom",
    },
    {
      id: "entity-fablab",
      kind: "entity",
      label: "FabLab",
      reason: "Piece standalone → CITF; no Entity ni Project FabLab",
    },
    {
      id: "entity-nsxide",
      kind: "entity",
      label: "NSXIDE",
      reason: "Alias/tag de Bass Series; no Entity",
    },
    {
      id: "buhoprofe-branding-authorship",
      kind: "authorship",
      label: "buhoprofe branding",
      reason:
        "No Piece de branding del usuario; solo ProjectResource contextual de Syllabi",
      legacyRef: { table: "graphic_items", id: "buhoprofe" },
    },
    {
      id: "invent-citf-2026",
      kind: "invention",
      label: "Identidad / manual CITF 2026",
      reason: "No inventar identidad 2026",
    },
    {
      id: "invent-push-2027",
      kind: "invention",
      label: "Manual / identidad PUSH 2027",
      reason: "No inventar identidad futura",
    },
  ],

  deferred: [
    {
      id: "cloronor-landing",
      kind: "project",
      label: "Cloronor landing",
      reason: "Landing Cloronor pendiente de modelado; trading ya en manifest",
      relatedIds: ["cloronor", "cloronor-trading"],
    },
    {
      id: "athenas",
      kind: "project",
      label: "[deferred-confidential]",
      reason: "Fuente confidencial deferred; no crear Entity/Project público",
    },
    {
      id: "inspector",
      kind: "project",
      label: "[deferred-confidential]",
      reason: "Fuente confidencial deferred; no crear Entity/Project público",
    },
    {
      id: "fiserv",
      kind: "entity",
      label: "[deferred:fiserv-label]",
      reason: "Entity vs Project ambiguo hasta confirmación humana",
    },
    {
      id: "microtime-published",
      kind: "published",
      label: "Microtime published",
      reason: "published=false temporal hasta autorización",
      relatedIds: ["microtime"],
    },
    {
      id: "proxi-published",
      kind: "published",
      label: "Proxi published",
      reason: "published=false hasta revisión contractual",
      relatedIds: ["proxi"],
    },
    {
      id: "syllabi-published",
      kind: "published",
      label: "Syllabi published",
      reason: "published=false hasta autorización de publicación",
      relatedIds: ["syllabi"],
    },
    {
      id: "microtime-ux-role",
      kind: "role",
      label: "Microtime UX role",
      reason: "Rol UX pendiente; no inferir",
      relatedIds: ["microtime"],
    },
    {
      id: "juegos-client-validation",
      kind: "validation",
      label: "Juegos Provinciales client",
      reason:
        "Relación Gobierno de Formosa → client es provisional; validar en Admin",
      relatedIds: ["juegos-provinciales", "gobierno-formosa"],
    },
    {
      id: "second-simaas",
      kind: "project",
      label: "Segundo SIMAAS (eventos/foros)",
      reason: "No crear segundo Project SIMAAS aún",
      relatedIds: ["simaas-marketplace"],
    },
    {
      id: "simaas-aicore-later",
      kind: "relation",
      label: "SIMAAS ↔ AICORE",
      reason: "No modelar AICORE en SIMAAS en esta etapa",
      relatedIds: ["simaas-marketplace", "aicore"],
    },
    {
      id: "orbita-case-by-case",
      kind: "relation",
      label: "Órbita relations",
      reason: "Relaciones Órbita case-by-case; no resolver client automáticamente",
      relatedIds: ["orbita-l-b"],
    },
    {
      id: "logistics-personal-roles",
      kind: "role",
      label: "Confidential logistics UX/UI roles",
      reason: "Roles personales no inferir; dejar vacío hasta decisión",
      relatedIds: ["confidential-logistics-system"],
    },
  ],
};

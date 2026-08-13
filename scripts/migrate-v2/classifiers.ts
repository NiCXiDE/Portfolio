import { slugify } from "../../src/lib/slug";
import type {
  BrandRow,
  BrandManualRow,
  GraphicItemRow,
  NamedListItemRow,
  TagRow,
  TestimonialRow,
  UiProjectRow,
} from "../../src/db/entities";
import {
  galleryPaths,
  localizedEs,
  normalizeLabel,
  uiImagePaths,
} from "./load-legacy";
import type {
  Confidence,
  EntityRelationReview,
  LegacySnapshot,
  ManualAnalysis,
  MigrationMapEntry,
  NamedListAnalysis,
  NamedListClassification,
  ProposedEntity,
  ProposedGraphicCategory,
  ProposedOrigin,
  ProposedPiece,
  ProposedProject,
  ProposedRelation,
  ProposedResource,
  RecordAnalysis,
  TagAnalysis,
  TestimonialAnalysis,
} from "./types";

/** Human-approved brand → entity.type */
const KNOWN_BRAND_ENTITY_TYPES: Record<string, string> = {
  push: "company",
  aicore: "company",
  citf: "institution",
  seyier: "personal_brand",
};

const ROLE_KEYWORDS: Array<{ pattern: RegExp; role: string }> = [
  { pattern: /\bux\s*\/\s*ui\b|\bux-ui\b|\bui\/ux\b/i, role: "ux-ui" },
  { pattern: /\bvisual direction\b|\bdirecci[oó]n visual\b/i, role: "visual-direction" },
  { pattern: /\bfrontend\b|\bfront-end\b/i, role: "frontend" },
  { pattern: /\bbranding\b|\bidentidad\b|\bmarca\b/i, role: "branding" },
  { pattern: /\bgraphic design\b|\bdiseño gr[aá]fico\b/i, role: "graphic-design" },
  { pattern: /\bux\b|\bexperiencia de usuario\b/i, role: "ux" },
  { pattern: /\bui\b|\binterfaz\b|\binterface\b/i, role: "ui" },
];

function brandNameById(brands: BrandRow[], id: string | null): string | null {
  if (!id) return null;
  return brands.find((b) => b.id === id)?.name ?? id;
}

function countBrandRelations(
  brandId: string,
  snapshot: LegacySnapshot,
): { total: number; sources: string[] } {
  const sources: string[] = [];
  const gi = snapshot.graphicItems.filter((g) => g.brandId === brandId).length;
  if (gi) sources.push(`graphic_items:${gi}`);
  const ui = snapshot.uiProjects.filter((u) => u.brandId === brandId).length;
  if (ui) sources.push(`ui_projects:${ui}`);
  const bm = snapshot.brandManuals.filter((m) => m.brandId === brandId).length;
  if (bm) sources.push(`brand_manuals:${bm}`);
  const nl = snapshot.namedListItems.filter((n) => n.brandId === brandId).length;
  if (nl) sources.push(`named_list_items:${nl}`);
  const te = snapshot.testimonials.filter((t) => t.companyBrandId === brandId).length;
  if (te) sources.push(`testimonials:${te}`);
  return {
    total: gi + ui + bm + nl + te,
    sources,
  };
}

function inferBrandEntityType(brand: BrandRow): {
  type: string;
  source: "known" | "inferred" | "other_pending";
  confidence: Confidence;
  requiresHumanDecision: boolean;
  reason: string;
} {
  const known = KNOWN_BRAND_ENTITY_TYPES[brand.id];
  if (known) {
    return {
      type: known,
      source: "known",
      confidence: "alta",
      requiresHumanDecision: false,
      reason: "Decisión humana preaprobada.",
    };
  }

  const name = brand.name.toLowerCase();
  if (brand.id === "apsmm" || name.includes("asociación")) {
    return {
      type: "association",
      source: "inferred",
      confidence: "media",
      requiresHumanDecision: true,
      reason: "Nombre sugiere asociación; no hay decisión explícita registrada.",
    };
  }
  if (name.includes("tech") || name.includes("software") || brand.href) {
    return {
      type: "company",
      source: "inferred",
      confidence: "media",
      requiresHumanDecision: true,
      reason: "Nombre/sitio sugieren empresa; requiere confirmación.",
    };
  }

  return {
    type: "other",
    source: "other_pending",
    confidence: "baja",
    requiresHumanDecision: true,
    reason: "Sin evidencia suficiente para inferir tipo; proponer other en reporte.",
  };
}

export function classifyBrands(snapshot: LegacySnapshot): {
  entities: ProposedEntity[];
  records: RecordAnalysis[];
} {
  const entities: ProposedEntity[] = [];
  const records: RecordAnalysis[] = [];

  for (const brand of snapshot.brands) {
    const inferred = inferBrandEntityType(brand);
    const rel = countBrandRelations(brand.id, snapshot);
    const pageEnabledSuggested =
      Boolean(brand.href && brand.logoPath && rel.total >= 2);
    const pageEnabledReason = pageEnabledSuggested
      ? "Tiene logo, URL y múltiples relaciones legacy."
      : "pageEnabled debe decidirse manualmente; entidad puede existir sin página pública.";

    const entity: ProposedEntity = {
      id: brand.id,
      slug: slugify(brand.name),
      name: brand.name,
      type: inferred.type,
      typeSource: inferred.source,
      logoPath: brand.logoPath,
      href: brand.href,
      legacyRelationCount: rel.total,
      relatedLegacy: rel.sources,
      pageEnabledSuggested,
      pageEnabledReason,
      requiresHumanDecision: inferred.requiresHumanDecision,
      confidence: inferred.confidence,
    };
    entities.push(entity);

    records.push({
      sourceTable: "brands",
      legacyId: brand.id,
      title: brand.name,
      classification: "Entity candidata",
      proposedDestination: `entities:${brand.id}`,
      proposedRelations: [],
      reason: inferred.reason,
      confidence: inferred.confidence,
      requiresHumanDecision: inferred.requiresHumanDecision,
      observations: [
        `type sugerido: ${inferred.type}`,
        `slug sugerido: ${entity.slug}`,
        `logo: ${brand.logoPath ?? "—"}`,
        `web: ${brand.href ?? "—"}`,
        `relaciones legacy: ${rel.total} (${rel.sources.join(", ") || "ninguna"})`,
        `pageEnabled sugerido: ${pageEnabledSuggested ? "sí (solo propuesta)" : "no (solo propuesta)"}`,
      ],
      migrationMappings: [
        {
          sourceTable: "brands",
          sourceId: brand.id,
          targetType: "entity",
          targetId: brand.id,
        },
      ],
    });
  }

  return { entities, records };
}

function inferUiRoles(project: UiProjectRow): {
  roles: string[] | "PENDIENTE DE REVISIÓN";
  evidence: string[];
} {
  const text = [
    localizedEs(project.title),
    localizedEs(project.meta),
    localizedEs(project.summary),
    project.client ?? "",
    project.category,
  ].join(" ");

  const found = new Set<string>();
  const evidence: string[] = [];
  for (const { pattern, role } of ROLE_KEYWORDS) {
    if (pattern.test(text)) {
      found.add(role);
      evidence.push(`Coincidencia "${pattern.source}" → ${role}`);
    }
  }

  if (found.size === 0) {
    return { roles: "PENDIENTE DE REVISIÓN", evidence: ["Sin evidencia textual de rol UX/UI/branding/etc."] };
  }
  return { roles: [...found], evidence };
}

function inferUiProjectStatus(
  project: UiProjectRow,
  namedList: NamedListItemRow[],
): { status: string; confidence: Confidence; reason: string } {
  const title = normalizeLabel(localizedEs(project.title));
  const client = normalizeLabel(project.client ?? "");

  for (const item of namedList.filter((n) => n.kind === "current_project")) {
    if (
      normalizeLabel(item.label) === title ||
      normalizeLabel(item.label) === client
    ) {
      return {
        status: "ongoing",
        confidence: "alta",
        reason: `Coincide con named_list_items current_project "${item.label}".`,
      };
    }
  }
  for (const item of namedList.filter((n) => n.kind === "past_project")) {
    if (
      normalizeLabel(item.label) === title ||
      normalizeLabel(item.label) === client
    ) {
      return {
        status: "completed",
        confidence: "alta",
        reason: `Coincide con named_list_items past_project "${item.label}".`,
      };
    }
  }

  if (project.category === "proyectos-personales") {
    return {
      status: "ongoing",
      confidence: "media",
      reason: "Categoría proyectos-personales; sin match en home lists.",
    };
  }
  if (project.category === "preventas") {
    return {
      status: "archived",
      confidence: "media",
      reason: "Preventa; probablemente no activa.",
    };
  }
  return {
    status: "completed",
    confidence: "media",
    reason: "Sin match en named_list; default completed para sistemas entregados.",
  };
}

function inferUiProjectType(category: UiProjectRow["category"]): string | null {
  switch (category) {
    case "preventas":
      return "presale";
    case "sistemas-a-medida":
      return "custom-system";
    case "apps-mobile":
      return "mobile-app";
    case "proyectos-personales":
      return "personal";
    case "system-design":
      return "system-design";
    default:
      return null;
  }
}

function buildUiEntityRelations(
  project: UiProjectRow,
  brands: BrandRow[],
): { relations: ProposedRelation[]; ambiguities: string[] } {
  const relations: ProposedRelation[] = [];
  const ambiguities: string[] = [];
  const meta = localizedEs(project.meta);
  const client = project.client?.trim() ?? "";
  const brandId = project.brandId;
  const brandName = brandNameById(brands, brandId);

  const mentionsAicore =
    /aicore|@aicore/i.test(meta) ||
    /aicore/i.test(client) ||
    brandId === "aicore";

  if (client && client.toLowerCase() !== "personal" && client.toLowerCase() !== "demo") {
    const clientNorm = normalizeLabel(client);
    const brandNorm = brandName ? normalizeLabel(brandName) : "";
    const clientBrand = brands.find(
      (b) =>
        normalizeLabel(b.name) === clientNorm ||
        b.id === clientNorm.replace(/\s+/g, "-"),
    );

    if (clientBrand) {
      relations.push({
        entityId: clientBrand.id,
        entityName: clientBrand.name,
        relationRole: "client",
        evidence: `ui_projects.client="${client}"`,
        confidence: "alta",
        requiresReview: false,
      });
    } else if (mentionsAicore && !/aicore/i.test(client)) {
      relations.push({
        entityId: "pending-entity",
        entityName: client,
        relationRole: "client",
        evidence: `ui_projects.client="${client}" (cliente final)`,
        confidence: "media",
        requiresReview: true,
      });
    } else {
      relations.push({
        entityId: "pending-entity",
        entityName: client,
        relationRole: "client",
        evidence: `ui_projects.client="${client}"`,
        confidence: "media",
        requiresReview: true,
      });
    }

    if (brandId && brandNorm && clientNorm !== brandNorm) {
      ambiguities.push(
        `client textual ("${client}") y brandId ("${brandName}") representan organizaciones distintas.`,
      );
      if (mentionsAicore && brandId === null) {
        relations.push({
          entityId: "aicore",
          entityName: "AICORE IT Specialists",
          relationRole: "collaborator",
          evidence: `meta menciona colaboración AICORE; client="${client}" es cliente final`,
          confidence: "alta",
          requiresReview: true,
        });
      } else if (brandId) {
        relations.push({
          entityId: brandId,
          entityName: brandName ?? brandId,
          relationRole: mentionsAicore ? "collaborator" : "other",
          evidence: `brandId=${brandId} con client distinto`,
          confidence: "media",
          requiresReview: true,
        });
      }
    }
  } else if (brandId) {
    relations.push({
      entityId: brandId,
      entityName: brandName ?? brandId,
      relationRole: client.toLowerCase() === "personal" ? "other" : "client",
      evidence: `brandId=${brandId}`,
      confidence: "media",
      requiresReview: client.toLowerCase() === "personal",
    });
  }

  if (mentionsAicore && !relations.some((r) => r.entityId === "aicore")) {
    relations.push({
      entityId: "aicore",
      entityName: "AICORE IT Specialists",
      relationRole: "collaborator",
      evidence: meta || client,
      confidence: "alta",
      requiresReview: Boolean(client && !/aicore/i.test(client)),
    });
  }

  return { relations, ambiguities };
}

export function classifyUiProjects(snapshot: LegacySnapshot): {
  projects: ProposedProject[];
  records: RecordAnalysis[];
  relationReviews: EntityRelationReview[];
} {
  const projects: ProposedProject[] = [];
  const records: RecordAnalysis[] = [];
  const relationReviews: EntityRelationReview[] = [];

  for (const project of snapshot.uiProjects) {
    const title = localizedEs(project.title, project.id);
    const slug = slugify(title || project.id);
    const roleInfo = inferUiRoles(project);
    const statusInfo = inferUiProjectStatus(project, snapshot.namedListItems);
    const { relations, ambiguities } = buildUiEntityRelations(
      project,
      snapshot.brands,
    );
    const images = uiImagePaths(project.images ?? []);
    const resources: ProposedResource[] = images.map((path, i) => ({
      id: `${project.id}-screen-${i + 1}`,
      path,
      kind: "project_resource",
      label: `Screenshot ${i + 1}`,
    }));

    const requiresReview =
      roleInfo.roles === "PENDIENTE DE REVISIÓN" ||
      ambiguities.length > 0 ||
      relations.some((r) => r.requiresReview);

    const confidence: Confidence =
      ambiguities.length > 0 || requiresReview ? "media" : "alta";

    const proposed: ProposedProject = {
      id: project.id,
      slug,
      name: title,
      areas: ["ux-ui"],
      type: inferUiProjectType(project.category),
      status: statusInfo.status,
      roles: roleInfo.roles,
      entities: relations,
      pieces: [],
      resources,
      legacySources: [`ui_projects:${project.id}`],
      confidence,
      notes: [...ambiguities, ...roleInfo.evidence],
    };
    projects.push(proposed);

    for (const rel of relations.filter((r) => r.requiresReview)) {
      relationReviews.push({
        projectId: project.id,
        projectName: title,
        entityId: rel.entityId,
        entityName: rel.entityName,
        suggestedRole: rel.relationRole,
        legacyEvidence: rel.evidence,
        confidence: rel.confidence,
        requiresReview: true,
        issue: ambiguities[0],
      });
    }

    records.push({
      sourceTable: "ui_projects",
      legacyId: project.id,
      title,
      classification: "Project (ux-ui)",
      proposedDestination: `projects:${project.id}`,
      proposedRelations: relations,
      reason: "ui_projects son candidatos fuertes a Project con area ux-ui.",
      confidence,
      requiresHumanDecision: requiresReview,
      observations: [
        `slug: ${slug}`,
        `status: ${statusInfo.status} (${statusInfo.reason})`,
        `type: ${proposed.type ?? "—"}`,
        `area: ux-ui`,
        `roles: ${Array.isArray(roleInfo.roles) ? roleInfo.roles.join(", ") : roleInfo.roles}`,
        `client: ${project.client ?? "—"}`,
        `brandId: ${project.brandId ?? "—"}`,
        `resources (screenshots): ${resources.length} → project_resources (NO pieces)`,
        ...ambiguities,
      ],
      migrationMappings: [
        {
          sourceTable: "ui_projects",
          sourceId: project.id,
          targetType: "project",
          targetId: project.id,
        },
        ...resources.map((r) => ({
          sourceTable: "ui_projects",
          sourceId: project.id,
          targetType: "resource" as const,
          targetId: r.id,
          notes: "project_resource",
        })),
      ],
    });
  }

  return { projects, records, relationReviews };
}

function graphicCategoryFromSection(
  section: GraphicItemRow["section"],
): ProposedGraphicCategory {
  switch (section) {
    case "logos":
      return "visual-identity";
    case "covers":
    case "illustration":
    case "personal":
      return "illustration-artwork";
    case "banners":
      return "print";
    case "eventos":
      return "campaigns-communication";
    default:
      return "other";
  }
}

function graphicOrigin(
  section: GraphicItemRow["section"],
  brandId: string | null,
): ProposedOrigin {
  if (section === "personal") return "personal";
  if (brandId || section === "logos" || section === "banners") return "client";
  return "other";
}

function pieceIdFromGraphic(id: string, suffix?: string): string {
  return suffix ? `${id}-${suffix}` : id;
}

function buildEventProject(
  item: GraphicItemRow,
  brands: BrandRow[],
): {
  project: ProposedProject;
  pieces: ProposedPiece[];
  classification: string;
  confidence: Confidence;
  requiresReview: boolean;
  observations: string[];
  mappings: MigrationMapEntry[];
} {
  const title = item.alt || item.id;
  const gallery = galleryPaths(item);
  const relations: ProposedRelation[] = [];

  if (item.brandId) {
    relations.push({
      entityId: item.brandId,
      entityName: brandNameById(brands, item.brandId) ?? item.brandId,
      relationRole: item.id === "expedicion-polo" ? "client" : "other",
      evidence: `graphic_items.brandId=${item.brandId}`,
      confidence: item.id === "expedicion-polo" ? "media" : "baja",
      requiresReview: true,
    });
  }

  if (item.id === "juegos-provinciales") {
    relations.push({
      entityId: "pending-gobierno-formosa",
      entityName: "Gobierno de Formosa",
      relationRole: "client",
      evidence: localizedEs(item.detail) || "detail menciona Gobierno de Formosa",
      confidence: "media",
      requiresReview: true,
    });
  }

  const pieces: ProposedPiece[] = [
    {
      id: pieceIdFromGraphic(item.id, "cover"),
      title: `${title} — portada`,
      category: "campaigns-communication",
      origin: "client",
      projectId: item.id,
      tags: item.tags ?? ["evento"],
      resources: [
        { id: `${item.id}-src`, path: item.srcPath, kind: "piece_src" },
        ...(item.relatedSrcPath
          ? [{ id: `${item.id}-related`, path: item.relatedSrcPath, kind: "piece_resource" as const }]
          : []),
      ],
      confidence: "alta",
    },
    ...gallery.map((path, i) => ({
      id: pieceIdFromGraphic(item.id, `deliverable-${i + 1}`),
      title: `${title} — entregable ${i + 1}`,
      category: "campaigns-communication" as ProposedGraphicCategory,
      origin: "client" as ProposedOrigin,
      projectId: item.id,
      tags: item.tags ?? ["evento"],
      resources: [{ id: `${item.id}-g-${i}`, path, kind: "piece_src" as const }],
      confidence: "alta" as Confidence,
    })),
  ];

  const project: ProposedProject = {
    id: item.id,
    slug: slugify(title),
    name: title,
    areas: ["graphic"],
    type: "event",
    status: "completed",
    roles: "PENDIENTE DE REVISIÓN",
    entities: relations,
    pieces: pieces.map((p) => p.id),
    resources: [],
    legacySources: [`graphic_items:${item.id}`],
    confidence: "alta",
    notes: [
      "section=eventos → Project.type=event (regla fuerte aprobada).",
      `Galería con ${gallery.length} recursos → pieces/resources, no Project por galería sola.`,
    ],
  };

  const mappings: MigrationMapEntry[] = [
    {
      sourceTable: "graphic_items",
      sourceId: item.id,
      targetType: "project",
      targetId: item.id,
    },
    ...pieces.flatMap((p) => [
      {
        sourceTable: "graphic_items",
        sourceId: item.id,
        targetType: "piece" as const,
        targetId: p.id,
      },
      ...p.resources.map((r) => ({
        sourceTable: "graphic_items",
        sourceId: item.id,
        targetType: "resource" as const,
        targetId: r.id,
      })),
    ]),
  ];

  return {
    project,
    pieces,
    classification: "A. Project (+ Pieces)",
    confidence: "alta",
    requiresReview: relations.some((r) => r.requiresReview),
    observations: project.notes ?? [],
    mappings,
  };
}

function buildSeyierIdentityProject(item: GraphicItemRow): {
  project: ProposedProject;
  pieces: ProposedPiece[];
  mappings: MigrationMapEntry[];
} {
  const gallery = galleryPaths(item);
  const pieces: ProposedPiece[] = [
    {
      id: "seyier-logo",
      title: "Seyier — logotipo",
      category: "visual-identity",
      origin: "client",
      projectId: "seyier-visual-identity",
      tags: item.tags ?? ["vector"],
      resources: [{ id: "seyier-logo-src", path: item.srcPath, kind: "piece_src" }],
      confidence: "alta",
    },
    ...gallery.map((path, i) => ({
      id: `seyier-screen-${i + 1}`,
      title: `Seyier — pantalla ${i + 1}`,
      category: "visual-identity" as ProposedGraphicCategory,
      origin: "client" as ProposedOrigin,
      projectId: "seyier-visual-identity",
      tags: ["vector"],
      resources: [{ id: `seyier-g-${i}`, path, kind: "piece_src" as const }],
      confidence: "alta" as Confidence,
    })),
  ];

  const project: ProposedProject = {
    id: "seyier-visual-identity",
    slug: "seyier-identidad-visual",
    name: "Seyier — identidad visual",
    areas: ["graphic"],
    type: "visual-identity",
    status: "completed",
    roles: "PENDIENTE DE REVISIÓN",
    entities: [
      {
        entityId: "seyier",
        entityName: "Seyier",
        relationRole: "brand-owner",
        evidence: "brandId=seyier + detail de marca streamer",
        confidence: "alta",
        requiresReview: false,
      },
    ],
    pieces: pieces.map((p) => p.id),
    resources: [],
    legacySources: [`graphic_items:${item.id}`],
    confidence: "alta",
    notes: ["Proyecto de identidad visual completo (logo + pantallas)."],
  };

  const mappings: MigrationMapEntry[] = [
    {
      sourceTable: "graphic_items",
      sourceId: item.id,
      targetType: "project",
      targetId: project.id,
    },
    ...pieces.flatMap((p) => [
      {
        sourceTable: "graphic_items",
        sourceId: item.id,
        targetType: "piece" as const,
        targetId: p.id,
      },
    ]),
  ];

  return { project, pieces, mappings };
}

function buildStandalonePiece(
  item: GraphicItemRow,
  brands: BrandRow[],
): {
  piece: ProposedPiece;
  classification: string;
  confidence: Confidence;
  requiresReview: boolean;
  reason: string;
  observations: string[];
  mappings: MigrationMapEntry[];
} {
  const category = graphicCategoryFromSection(item.section);
  const origin = graphicOrigin(item.section, item.brandId);
  const tags = [...(item.tags ?? [])];
  if (item.section === "covers") tags.push("cover");
  if (item.section === "personal" && tags.includes("fan-art")) {
    /* keep */
  }

  const gallery = galleryPaths(item);
  const resources: ProposedResource[] = [
    { id: `${item.id}-src`, path: item.srcPath, kind: "piece_src" },
    ...gallery.map((path, i) => ({
      id: `${item.id}-g-${i}`,
      path,
      kind: "piece_resource" as const,
    })),
  ];

  const piece: ProposedPiece = {
    id: item.id,
    title: item.alt || item.id,
    category,
    origin,
    tags: [...new Set(tags)],
    resources,
    confidence:
      item.section === "personal" || item.section === "covers" ? "alta" : "media",
  };

  let classification = "B. Piece sin Project";
  let requiresReview = false;
  let reason = "Entregable aislado sin hub de proyecto profesional.";
  const observations: string[] = [];

  if (item.section === "logos" && item.brandId) {
    observations.push(
      `brandId=${item.brandId} (${brandNameById(brands, item.brandId)}); considerar vincular Entity sin crear Project artificial.`,
    );
    requiresReview = item.id !== "push";
  }

  if (item.section === "logos" && item.id === "push") {
    requiresReview = true;
    observations.push(
      "Logo PUSH podría vincularse a Entity push o a futuro Project de identidad; mantener como Piece por ahora.",
    );
  }

  if (gallery.length > 0 && item.section !== "covers") {
    classification = "D. Ambiguo (galería sin Project)";
    requiresReview = true;
    reason =
      "Tiene galería pero no cumple reglas fuertes de Project; no inferir Project automáticamente.";
    piece.confidence = "baja";
  }

  return {
    piece,
    classification,
    confidence: piece.confidence,
    requiresReview,
    reason,
    observations,
    mappings: [
      {
        sourceTable: "graphic_items",
        sourceId: item.id,
        targetType: "piece",
        targetId: item.id,
      },
      ...resources.map((r) => ({
        sourceTable: "graphic_items",
        sourceId: item.id,
        targetType: "resource" as const,
        targetId: r.id,
      })),
    ],
  };
}

export function classifyGraphicItems(snapshot: LegacySnapshot): {
  projects: ProposedProject[];
  standalonePieces: ProposedPiece[];
  piecesInProjects: ProposedPiece[];
  records: RecordAnalysis[];
  relationReviews: EntityRelationReview[];
  categoryMapping: Record<string, ProposedGraphicCategory>;
} {
  const projects: ProposedProject[] = [];
  const standalonePieces: ProposedPiece[] = [];
  const piecesInProjects: ProposedPiece[] = [];
  const records: RecordAnalysis[] = [];
  const relationReviews: EntityRelationReview[] = [];
  const categoryMapping: Record<string, ProposedGraphicCategory> = {};

  for (const item of snapshot.graphicItems) {
    categoryMapping[item.section] = graphicCategoryFromSection(item.section);
    const gallery = galleryPaths(item);
    const title = item.alt || item.id;

    if (item.section === "eventos") {
      const built = buildEventProject(item, snapshot.brands);
      projects.push(built.project);
      piecesInProjects.push(...built.pieces);
      for (const rel of built.project.entities.filter((r) => r.requiresReview)) {
        relationReviews.push({
          projectId: built.project.id,
          projectName: built.project.name,
          entityId: rel.entityId,
          entityName: rel.entityName,
          suggestedRole: rel.relationRole,
          legacyEvidence: rel.evidence,
          confidence: rel.confidence,
          requiresReview: true,
        });
      }
      records.push({
        sourceTable: "graphic_items",
        legacyId: item.id,
        title,
        classification: built.classification,
        proposedDestination: `projects:${item.id}`,
        proposedRelations: built.project.entities,
        reason: "section=eventos → candidato fuerte a Project.type=event.",
        confidence: built.confidence,
        requiresHumanDecision: built.requiresReview,
        observations: [
          `section: ${item.section}`,
          `tags: ${JSON.stringify(item.tags ?? [])}`,
          `brandId: ${item.brandId ?? "—"}`,
          `src: ${item.srcPath}`,
          `gallery count: ${gallery.length}`,
          `categoría gráfica propuesta: campaigns-communication / Project.type=event`,
          `origin: client`,
          ...built.observations,
        ],
        migrationMappings: built.mappings,
      });
      continue;
    }

    if (item.id === "seyier" && item.section === "logos") {
      const built = buildSeyierIdentityProject(item);
      projects.push(built.project);
      piecesInProjects.push(...built.pieces);
      records.push({
        sourceTable: "graphic_items",
        legacyId: item.id,
        title,
        classification: "A. Project (identidad visual)",
        proposedDestination: `projects:${built.project.id}`,
        proposedRelations: built.project.entities,
        reason: "Seyier completo → Project de identidad visual con Pieces.",
        confidence: "alta",
        requiresHumanDecision: false,
        observations: [
          `section: logos`,
          `brandId: seyier`,
          `gallery count: ${gallery.length}`,
          `Pieces propuestas: ${built.pieces.length}`,
        ],
        migrationMappings: built.mappings,
      });
      continue;
    }

    const standalone = buildStandalonePiece(item, snapshot.brands);
    standalonePieces.push(standalone.piece);
    records.push({
      sourceTable: "graphic_items",
      legacyId: item.id,
      title,
      classification: standalone.classification,
      proposedDestination: `pieces:${item.id}`,
      proposedRelations: item.brandId
        ? [
            {
              entityId: item.brandId,
              entityName: brandNameById(snapshot.brands, item.brandId) ?? item.brandId,
              relationRole: "other",
              evidence: `graphic_items.brandId=${item.brandId}`,
              confidence: "media",
              requiresReview: true,
            },
          ]
        : [],
      reason: standalone.reason,
      confidence: standalone.confidence,
      requiresHumanDecision: standalone.requiresReview,
      observations: [
        `section: ${item.section}`,
        `tags: ${JSON.stringify(item.tags ?? [])}`,
        `brandId: ${item.brandId ?? "—"}`,
        `src: ${item.srcPath}`,
        `gallery count: ${gallery.length}`,
        `categoría gráfica: ${standalone.piece.category}`,
        `origin: ${standalone.piece.origin}`,
        `tags propuestos: ${standalone.piece.tags.join(", ") || "—"}`,
        ...standalone.observations,
      ],
      migrationMappings: standalone.mappings,
    });
  }

  return {
    projects,
    standalonePieces,
    piecesInProjects,
    records,
    relationReviews,
    categoryMapping,
  };
}

export function classifyBrandManuals(
  snapshot: LegacySnapshot,
): { manuals: ManualAnalysis[]; records: RecordAnalysis[] } {
  const manuals: ManualAnalysis[] = [];
  const records: RecordAnalysis[] = [];

  for (const manual of snapshot.brandManuals) {
    const title = localizedEs(manual.title, manual.id);
    const analysis: ManualAnalysis = {
      id: manual.id,
      title,
      brandId: manual.brandId,
      year: manual.year,
      alternatives: [
        {
          key: "A",
          description:
            "Piece (category=manual) dentro de Project de identidad CITF existente (p.ej. itf logo / cluster).",
        },
        {
          key: "B",
          description: `Project nuevo de identidad "Manual de Marca CITF ${manual.year ?? "?"}" con Piece manual.`,
        },
        {
          key: "C",
          description: "Piece manual independiente sin Project.",
        },
      ],
      recommendation: "B",
      recommendationReason:
        "Permite distinguir manuales por año (2025 vs futuro 2026) sin inventar datos del 2026.",
      confidence: "media",
      requiresHumanDecision: true,
    };
    manuals.push(analysis);

    records.push({
      sourceTable: "brand_manuals",
      legacyId: manual.id,
      title,
      classification: "Piece manual (alternativas A/B/C)",
      proposedDestination: `projects:citf-manual-${manual.year ?? "unknown"}`,
      proposedRelations: manual.brandId
        ? [
            {
              entityId: manual.brandId,
              entityName:
                brandNameById(snapshot.brands, manual.brandId) ?? manual.brandId,
              relationRole: "brand-owner",
              evidence: `brand_manuals.brandId=${manual.brandId}`,
              confidence: "alta",
              requiresReview: false,
            },
          ]
        : [],
      reason: analysis.recommendationReason,
      confidence: analysis.confidence,
      requiresHumanDecision: true,
      observations: analysis.alternatives.map(
        (a) => `${a.key}: ${a.description}`,
      ),
      migrationMappings: [
        {
          sourceTable: "brand_manuals",
          sourceId: manual.id,
          targetType: "project",
          targetId: `citf-manual-${manual.year ?? "unknown"}`,
          notes: "Recomendación B — pendiente confirmación humana",
        },
        {
          sourceTable: "brand_manuals",
          sourceId: manual.id,
          targetType: "piece",
          targetId: `${manual.id}-manual`,
        },
      ],
    });
  }

  return { manuals, records };
}

export function classifyTags(snapshot: LegacySnapshot): TagAnalysis {
  const usedCounts = new Map<string, number>();
  for (const item of snapshot.graphicItems) {
    for (const tag of item.tags ?? []) {
      usedCounts.set(tag, (usedCounts.get(tag) ?? 0) + 1);
    }
  }

  const catalogTags = snapshot.tags.map((t) => ({
    slug: t.slug,
    labelEs: t.labelEs,
    usedCount: usedCounts.get(t.slug) ?? 0,
  }));

  const unusedCatalogTags = catalogTags
    .filter((t) => t.usedCount === 0)
    .map((t) => t.slug);

  const catalogSlugs = new Set(snapshot.tags.map((t) => t.slug));
  const slugsInPiecesNotInCatalog = [...usedCounts.keys()].filter(
    (s) => !catalogSlugs.has(s),
  );

  const conservationProposal: TagAnalysis["conservationProposal"] =
    snapshot.tags.map((t: TagRow) => ({
      slug: t.slug,
      action:
        (usedCounts.get(t.slug) ?? 0) > 0
          ? "conservar → piece_tags"
          : "conservar en catálogo (sin uso actual)",
    }));

  if (slugsInPiecesNotInCatalog.includes("evento")) {
    conservationProposal.push({
      slug: "evento",
      action: "usado en piezas; no es categoría final — mapear a Project.type=event",
    });
  }

  return {
    catalogTags,
    unusedCatalogTags,
    slugsInPiecesNotInCatalog,
    possibleSemanticDuplicates: [],
    conservationProposal,
  };
}

export function classifyNamedListItems(
  snapshot: LegacySnapshot,
  proposedProjects: ProposedProject[],
  proposedEntities: ProposedEntity[],
): NamedListAnalysis[] {
  const projectByLabel = new Map<string, ProposedProject>();
  for (const p of proposedProjects) {
    projectByLabel.set(normalizeLabel(p.name), p);
  }

  const entityByLabel = new Map<string, ProposedEntity>();
  for (const e of proposedEntities) {
    entityByLabel.set(normalizeLabel(e.name), e);
  }
  for (const b of snapshot.brands) {
    entityByLabel.set(normalizeLabel(b.name), {
      id: b.id,
      slug: slugify(b.name),
      name: b.name,
      type: KNOWN_BRAND_ENTITY_TYPES[b.id] ?? "other",
      typeSource: KNOWN_BRAND_ENTITY_TYPES[b.id] ? "known" : "other_pending",
      logoPath: b.logoPath,
      href: b.href,
      legacyRelationCount: 0,
      relatedLegacy: [],
      pageEnabledSuggested: false,
      pageEnabledReason: "",
      requiresHumanDecision: false,
      confidence: "alta",
    });
  }

  return snapshot.namedListItems.map((item) => {
    const norm = normalizeLabel(item.label);
    let classification: NamedListClassification = "ambiguo";
    let proposedTarget = "—";
    let homeReplacement = "—";
    let confidence: Confidence = "baja";
    let requiresHumanDecision = true;
    let reason = "";

    if (item.kind === "company") {
      if (item.brandId) {
        classification = "entity_existing";
        proposedTarget = `entities:${item.brandId}`;
        homeReplacement = "Entity.showOnHome + homeOrder";
        confidence = "alta";
        requiresHumanDecision = false;
        reason = "Empresa con brand existente; no duplicar fila.";
      } else if (entityByLabel.has(norm)) {
        classification = "entity_candidate";
        proposedTarget = `entities:${entityByLabel.get(norm)!.id}`;
        homeReplacement = "Entity.showOnHome + homeOrder";
        confidence = "media";
        reason = "Nombre coincide con brand/entity; sin brandId en listado.";
      } else {
        classification = "home_text_only";
        proposedTarget = "nueva Entity o texto";
        homeReplacement = "Entity.showOnHome (si se crea) o mantener listado";
        reason = "Organización solo en home list; no está en brands.";
      }
    } else if (item.kind === "current_project") {
      const match = projectByLabel.get(norm);
      if (match) {
        classification = "project_existing";
        proposedTarget = `projects:${match.id}`;
        homeReplacement = "Project.showOnHome + status=ongoing";
        confidence = "alta";
        requiresHumanDecision = false;
        reason = "Coincide con Project propuesto.";
      } else {
        classification = "project_candidate";
        proposedTarget = `projects:${slugify(item.label)} (nuevo?)`;
        homeReplacement = "Project.showOnHome + status=ongoing";
        confidence = "media";
        reason = "Proyecto actual en home sin registro ui/graphic equivalente.";
      }
    } else if (item.kind === "past_project") {
      const match = projectByLabel.get(norm);
      if (match) {
        classification = "project_existing";
        proposedTarget = `projects:${match.id}`;
        homeReplacement = "Project.showOnHome + status=completed";
        confidence = "alta";
        requiresHumanDecision = false;
        reason = "Coincide con Project propuesto (past).";
      } else {
        classification = "project_candidate";
        proposedTarget = `projects:${slugify(item.label)} (nuevo?)`;
        homeReplacement = "Project.showOnHome + status=completed";
        confidence = "media";
        reason = "Proyecto anterior en home sin fuente legacy directa.";
      }
    }

    return {
      id: item.id,
      kind: item.kind,
      label: item.label,
      brandId: item.brandId,
      classification,
      proposedTarget,
      homeReplacement,
      confidence,
      requiresHumanDecision,
      reason,
    };
  });
}

export function classifyTestimonials(
  snapshot: LegacySnapshot,
): TestimonialAnalysis[] {
  return snapshot.testimonials.map((t: TestimonialRow) => {
    const entityId = t.companyBrandId;
    const entityName = entityId
      ? brandNameById(snapshot.brands, entityId)
      : null;

    const redundantAfterLink: string[] = [];
    const keepAsOverride: string[] = [];

    if (entityId) {
      redundantAfterLink.push("company_brand_id (reemplazado por entity_id)");
      if (t.companyName && entityName && t.companyName !== entityName) {
        keepAsOverride.push(
          `company_name ("${t.companyName}") — distinto del nombre Entity`,
        );
      } else {
        redundantAfterLink.push("company_name (si coincide con Entity.name)");
      }
      if (t.companyLogoPath) {
        keepAsOverride.push("company_logo_path — override si difiere del logo Entity");
      }
      if (t.companyHref) {
        keepAsOverride.push("company_href — override de URL pública");
      }
    }

    return {
      id: t.id,
      authorName: t.name,
      proposedEntityId: entityId,
      proposedEntityName: entityName,
      redundantAfterLink,
      keepAsOverride,
      confidence: entityId ? "alta" : "baja",
      requiresHumanDecision: !entityId,
      reason: entityId
        ? "company_brand_id mapea inequívocamente a Entity existente."
        : "Sin brand vinculado; no crear Person Entity para el autor.",
    };
  });
}

export function sectionCategoryMapping(): Record<string, string> {
  return {
    eventos: "→ Project.type=event (NO categoría gráfica final)",
    personal: "→ Piece.origin=personal (NO categoría)",
    covers: "→ illustration-artwork + tag cover",
    logos: "→ visual-identity (Piece) o Project si identidad completa",
    banners: "→ print / campaigns-communication",
    illustration: "→ illustration-artwork",
    "fan-art": "→ tag (en personal/covers)",
    manual: "→ Piece/entregable bajo identidad visual",
  };
}

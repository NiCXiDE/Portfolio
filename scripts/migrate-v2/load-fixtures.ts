import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type {
  BrandManualRow,
  BrandRow,
  GraphicItemRow,
  GraphicSection,
  LocalizedJson,
  NamedListItemRow,
  NamedListKind,
  TagRow,
  TestimonialRow,
  UiListItemRow,
  UiProjectRow,
} from "../../src/db/entities";
import { slugifyBrand } from "../../src/lib/brands";
import { normalizeUiSlides } from "../../src/lib/ui-slides";
import type { LegacySnapshot } from "./types";

type Localized = LocalizedJson;

function readJson<T>(relativePath: string): T {
  const full = resolve(process.cwd(), relativePath);
  return JSON.parse(readFileSync(full, "utf8")) as T;
}

function seedNamed(
  kind: NamedListKind,
  labels: string[],
  brandByName: Map<string, string>,
): NamedListItemRow[] {
  return labels.map((label, sortOrder) => ({
    id: sortOrder + 1,
    kind,
    label,
    logoPath: null,
    brandId: brandByName.get(label.toLowerCase()) ?? null,
    sortOrder,
    published: true,
    createdAt: new Date(),
  }));
}

function seedGraphics(
  section: GraphicSection,
  items: Array<Record<string, unknown>>,
): GraphicItemRow[] {
  return items.map((raw, sortOrder) => ({
    id: String(raw.id),
    section,
    srcPath: String(raw.src),
    srcAssetId: null,
    alt: String(raw.alt ?? ""),
    title: (raw.title as Localized | undefined) ?? null,
    year: raw.year ? String(raw.year) : null,
    detail:
      ((raw.detail as Localized | undefined) ??
        (raw.usage as Localized | undefined)) ??
      null,
    href: raw.href ? String(raw.href) : null,
    hrefLabel: (raw.hrefLabel as Localized | undefined) ?? null,
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : null,
    fit: (raw.fit as "cover" | "contain" | undefined) ?? null,
    relatedSrcPath: raw.relatedSrc ? String(raw.relatedSrc) : null,
    relatedAssetId: null,
    galleryPaths: (() => {
      const g = raw.gallery;
      if (!Array.isArray(g) || g.length === 0) return null;
      const items = g
        .map((entry) => {
          if (typeof entry === "string") return entry;
          if (entry && typeof entry === "object" && "src" in entry) {
            const obj = entry as Record<string, unknown>;
            const src = typeof obj.src === "string" ? obj.src : null;
            if (!src) return null;
            const frame =
              typeof obj.frame === "string" ? obj.frame : undefined;
            const label =
              typeof obj.label === "object" && obj.label !== null
                ? obj.label
                : undefined;
            return { src, frame, label };
          }
          return null;
        })
        .filter(Boolean);
      return items.length ? items : null;
    })(),
    brandId: raw.brandId ? String(raw.brandId) : null,
    sortOrder,
    published: section !== "pending",
  }));
}

/** Load legacy-shaped data from content/ JSON when MySQL legacy tables are empty. */
export function loadLegacyFromFixtures(): LegacySnapshot {
  const defaultTags: TagRow[] = [
    { slug: "nsfw", labelEs: "NSFW", labelEn: "NSFW", isNsfw: true, sortOrder: 0 },
    {
      slug: "pixel-art",
      labelEs: "Pixel art",
      labelEn: "Pixel art",
      isNsfw: false,
      sortOrder: 1,
    },
    {
      slug: "vector",
      labelEs: "Vector",
      labelEn: "Vector",
      isNsfw: false,
      sortOrder: 2,
    },
    {
      slug: "fan-art",
      labelEs: "Fan art",
      labelEn: "Fan art",
      isNsfw: false,
      sortOrder: 3,
    },
    {
      slug: "grime",
      labelEs: "Grime",
      labelEn: "Grime",
      isNsfw: false,
      sortOrder: 4,
    },
    {
      slug: "tattoo",
      labelEs: "Tattoo",
      labelEn: "Tattoo",
      isNsfw: false,
      sortOrder: 5,
    },
    {
      slug: "bass-series",
      labelEs: "Bass series",
      labelEn: "Bass series",
      isNsfw: false,
      sortOrder: 6,
    },
    {
      slug: "impreso",
      labelEs: "Impreso",
      labelEn: "Printed",
      isNsfw: false,
      sortOrder: 7,
    },
    {
      slug: "evento",
      labelEs: "Evento",
      labelEn: "Event",
      isNsfw: false,
      sortOrder: 8,
    },
  ];

  const companies = readJson<string[]>("content/home/companies.json");
  const pastProjects = readJson<string[]>("content/home/past-projects.json");
  const currentProjects = readJson<string[]>(
    "content/home/current-projects.json",
  );

  const testimonials = readJson<
    Array<{
      id: string;
      hidden?: boolean;
      name: string;
      image: string;
      quote: Localized;
      role: Localized;
      company: { logo: string; href: string; name: string };
    }>
  >("content/home/testimonials.json");

  const brandRows: BrandRow[] = [];
  const brandByName = new Map<string, string>();
  const preferredIds: Record<string, string> = {
    "push software": "push",
    "aicore it specialists": "aicore",
    "lúdica tech": "ludica",
    "ludica tech": "ludica",
    "órbita lδb": "orbita-l-b",
    "orbita lδb": "orbita-l-b",
    "orbita lab": "orbita-l-b",
    "clúster de innovación tecnológica formosa": "citf",
    "cluster de innovacion tecnologica formosa": "citf",
  };

  for (const item of testimonials) {
    const key = item.company.name.toLowerCase();
    if (brandByName.has(key)) continue;
    const id = preferredIds[key] ?? slugifyBrand(item.company.name);
    brandByName.set(key, id);
    brandRows.push({
      id,
      name: item.company.name,
      logoPath: item.company.logo,
      logoAssetId: null,
      href: item.company.href,
      sortOrder: brandRows.length,
      published: true,
      createdAt: new Date(),
    });
  }

  const portfolioBrands: Array<{
    id: string;
    name: string;
    logoPath: string | null;
    href: string | null;
  }> = [
    {
      id: "apsmm",
      name: "APSMM",
      logoPath: "/assets/grafico/logos/apsmm.png",
      href: null,
    },
    {
      id: "seyier",
      name: "Seyier",
      logoPath: "/assets/grafico/logos/seyier.svg",
      href: null,
    },
    {
      id: "citf",
      name: "Clúster de Innovación Tecnológica Formosa",
      logoPath: "/assets/grafico/logos/vector-52.svg",
      href: null,
    },
  ];

  for (const b of portfolioBrands) {
    if (brandRows.some((r) => r.id === b.id)) continue;
    brandRows.push({
      id: b.id,
      name: b.name,
      logoPath: b.logoPath,
      logoAssetId: null,
      href: b.href,
      sortOrder: brandRows.length,
      published: true,
      createdAt: new Date(),
    });
  }

  brandByName.set("clúster de innovación tecnológica formosa", "citf");
  brandByName.set("apsmm", "apsmm");
  brandByName.set("seyier", "seyier");

  const namedListItems: NamedListItemRow[] = [
    ...seedNamed("company", companies, brandByName),
    ...seedNamed("past_project", pastProjects, brandByName),
    ...seedNamed("current_project", currentProjects, brandByName),
  ].map((row, index) => ({ ...row, id: index + 1 }));

  const testimonialRows: TestimonialRow[] = testimonials.map(
    (item, sortOrder) => ({
      id: item.id,
      name: item.name,
      imagePath: item.image,
      quote: item.quote,
      role: item.role,
      companyName: item.company.name,
      companyLogoPath: item.company.logo,
      companyHref: item.company.href,
      companyBrandId:
        brandByName.get(item.company.name.toLowerCase()) ?? null,
      entityId: null,
      linkLabel: null,
      hidden: Boolean(item.hidden),
      sortOrder,
    }),
  );

  const graphicSources: Array<[GraphicSection, string]> = [
    ["covers", "content/grafico/covers.json"],
    ["logos", "content/grafico/logos.json"],
    ["personal", "content/grafico/personal.json"],
    // pending stays in inbox workflow — not part of V2 content migration inventory
    ["illustration", "content/grafico/illustration.json"],
    ["banners", "content/grafico/banners.json"],
    ["eventos", "content/grafico/eventos.json"],
  ];

  const graphicItems = graphicSources.flatMap(([section, path]) =>
    seedGraphics(section, readJson(path)),
  );

  const manuals = readJson<
    Array<{
      id: string;
      cover: string;
      pdf: string;
      title: Localized;
      year?: string;
      meta?: Localized;
      brandId?: string | null;
    }>
  >("content/grafico/brand-manuals.json");

  const brandManuals: BrandManualRow[] = manuals.map((item, sortOrder) => ({
    id: item.id,
    coverPath: item.cover,
    pdfPath: item.pdf,
    title: item.title,
    year: item.year ?? null,
    meta: item.meta ?? null,
    brandId: item.brandId ? String(item.brandId) : null,
    sortOrder,
    published: true,
  }));

  const uiProjects = readJson<
    Array<{
      id: string;
      category: UiProjectRow["category"];
      title: Localized;
      meta: Localized;
      images: unknown;
      prototypeUrl: string | null;
      summary?: Localized | null;
      client?: string | null;
      period?: Localized | null;
      duration?: Localized | null;
      ctaKind?: UiProjectRow["ctaKind"];
      brandId?: string | null;
    }>
  >("content/interfaces/projects.json");

  const uiProjectRows: UiProjectRow[] = uiProjects.map((item, sortOrder) => ({
    id: item.id,
    category: item.category,
    title: item.title,
    meta: item.meta,
    images: normalizeUiSlides(item.images),
    prototypeUrl: item.prototypeUrl,
    summary: item.summary ?? null,
    client: item.client ?? null,
    period: item.period ?? null,
    duration: item.duration ?? null,
    ctaKind: item.ctaKind ?? null,
    brandId: item.brandId ? String(item.brandId) : null,
    sortOrder,
    published: true,
  }));

  const uiListRaw = readJson<
    Array<{
      id: string;
      title: Localized;
      logo?: string;
      caption?: string;
      wordmark?: string;
    }>
  >("content/interfaces/list.json");
  const uiListItems: UiListItemRow[] = uiListRaw.map((item, sortOrder) => ({
    id: item.id,
    title: item.title,
    logoPath: item.logo ?? null,
    caption: item.caption ?? null,
    wordmark: item.wordmark ?? null,
    sortOrder,
    published: true,
  }));

  return {
    brands: brandRows,
    graphicItems,
    uiProjects: uiProjectRows,
    brandManuals,
    testimonials: testimonialRows,
    namedListItems,
    tags: defaultTags,
    uiListItems,
  };
}

export function fixtureLegacyCounts(snapshot: LegacySnapshot): Record<string, number> {
  return {
    graphic_items: snapshot.graphicItems.length,
    ui_projects: snapshot.uiProjects.length,
    brands: snapshot.brands.length,
    brand_manuals: snapshot.brandManuals.length,
    testimonials: snapshot.testimonials.length,
    named_list_items: snapshot.namedListItems.length,
    tags: snapshot.tags.length,
    ui_list_items: snapshot.uiListItems.length,
  };
}

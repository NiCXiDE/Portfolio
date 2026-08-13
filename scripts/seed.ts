import { config as loadEnv } from "dotenv";
import { hashSync } from "bcryptjs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createDataSource, portfolioLegacyEntities } from "../src/db/data-source";
import {
  AdminUserEntity,
  AdminAuditLogEntity,
  BioEntity,
  BrandEntity,
  BrandManualEntity,
  GraphicItemEntity,
  InboxItemEntity,
  MediaAssetEntity,
  NamedListItemEntity,
  SiteSettingsEntity,
  SocialLinkEntity,
  TagEntity,
  TechIconEntity,
  TestimonialEntity,
  UiListItemEntity,
  UiProjectEntity,
  type BioRow,
  type BrandManualRow,
  type BrandRow,
  type GraphicItemRow,
  type GraphicSection,
  type LocalizedJson,
  type NamedListItemRow,
  type NamedListKind,
  type SiteSettingsRow,
  type SocialLinkRow,
  type TagRow,
  type TechIconRow,
  type TestimonialRow,
  type UiListItemRow,
  type UiProjectRow,
} from "../src/db/entities";
import { slugifyBrand } from "../src/lib/brands";
import { normalizeUiSlides } from "../src/lib/ui-slides";
import { requireDestructiveDbApproval, isDirectScriptRun } from "./sync-schema";

loadEnv({ path: resolve(process.cwd(), ".env") });

type Localized = LocalizedJson;

function readJson<T>(relativePath: string): T {
  const full = resolve(process.cwd(), relativePath);
  return JSON.parse(readFileSync(full, "utf8")) as T;
}

async function clearAll(ds: ReturnType<typeof createDataSource>) {
  await ds.getRepository(AdminAuditLogEntity).clear();
  await ds.getRepository(GraphicItemEntity).clear();
  await ds.getRepository(BrandManualEntity).clear();
  await ds.getRepository(UiProjectEntity).clear();
  await ds.getRepository(UiListItemEntity).clear();
  await ds.getRepository(TestimonialEntity).clear();
  await ds.getRepository(NamedListItemEntity).clear();
  await ds.getRepository(BrandEntity).clear();
  await ds.getRepository(MediaAssetEntity).clear();
  await ds.getRepository(InboxItemEntity).clear();
  await ds.getRepository(TechIconEntity).clear();
  await ds.getRepository(BioEntity).clear();
  await ds.getRepository(SocialLinkEntity).clear();
  await ds.getRepository(TagEntity).clear();
  await ds.getRepository(SiteSettingsEntity).clear();
  await ds.getRepository(AdminUserEntity).clear();
}

function seedNamed(
  kind: NamedListKind,
  labels: string[],
  brandByName: Map<string, string>,
): Omit<NamedListItemRow, "id">[] {
  return labels.map((label, sortOrder) => ({
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
    href:
      raw.href === undefined || raw.href === null ? null : String(raw.href),
    hrefLabel: (raw.hrefLabel as Localized | undefined) ?? null,
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : null,
    fit: raw.fit === "cover" || raw.fit === "contain" ? raw.fit : null,
    relatedSrcPath:
      raw.relatedSrc === undefined || raw.relatedSrc === null
        ? null
        : String(raw.relatedSrc),
    relatedAssetId: null,
    galleryPaths: (() => {
      const rawGallery = Array.isArray(raw.gallery)
        ? raw.gallery
        : Array.isArray(raw.galleryPaths)
          ? raw.galleryPaths
          : null;
      if (!rawGallery) return null;
      const items = rawGallery
        .map((g) => {
          if (typeof g === "string") {
            const src = String(g).trim();
            return src ? { src } : null;
          }
          if (g && typeof g === "object") {
            const obj = g as Record<string, unknown>;
            const srcVal = obj.src ?? obj.path;
            if (typeof srcVal !== "string") return null;
            const src = srcVal.trim();
            if (!src) return null;
            const frame =
              typeof obj.frame === "string" ? obj.frame : undefined;
            const label =
              typeof obj.label === "object" && obj.label !== null
                ? (obj.label as unknown)
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
    // pending stays in DB but unpublished from public grids via section filter
    published: section !== "pending" ? true : false,
  }));
}

export async function main() {
  requireDestructiveDbApproval("seed");

  const ds = createDataSource(true, portfolioLegacyEntities);
  await ds.initialize();

  console.log("Connected. Synchronizing schema & seeding…");
  await clearAll(ds);

  const bootstrapPassword =
    process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "PortfolioTemp2026!";

  await ds.getRepository(AdminUserEntity).save({
    username: "admin",
    passwordHash: hashSync(bootstrapPassword, 12),
    mustChangePassword: true,
  });

  const settings: SiteSettingsRow = {
    id: "main",
    email: "nicoayala.design@gmail.com",
    phone: "+54 9 370 434-2174",
    noteEs: "señales de humo o gritame por la calle también sirve",
    noteEn: "smoke signals or yelling at me on the street also works",
    poweredBy: "POWERED BY PUSH",
    carouselIntervalMs: 2000,
    graphicPreviewLimit: 5,
    interfacesPreviewLimit: 3,
    homeLayout: null,
  };
  await ds.getRepository(SiteSettingsEntity).save(settings);

  const socials: SocialLinkRow[] = [
    {
      id: "x",
      network: "x",
      label: "@nicoasinormal",
      href: "https://x.com/nicoasinormal",
      iconPath: "/assets/shared/x.svg",
      sortOrder: 0,
      published: true,
    },
    {
      id: "instagram",
      network: "instagram",
      label: "@nicxayala",
      href: "https://www.instagram.com/nicxayala",
      iconPath: "/assets/shared/instagram.svg",
      sortOrder: 1,
      published: true,
    },
    {
      id: "linkedin",
      network: "linkedin",
      label: "@nicoayala-design",
      href: "https://www.linkedin.com/in/nicoayala-design",
      iconPath: "/assets/shared/linkedin.svg",
      sortOrder: 2,
      published: true,
    },
  ];
  await ds.getRepository(SocialLinkEntity).save(socials);

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
  await ds.getRepository(TagEntity).save(defaultTags);

  const bioJson = readJson<{
    photo: string;
    photoAlt: Localized;
    signature: string;
    signatureAlt: Localized;
    cv: string;
    cvEn?: string;
    text: Localized;
  }>("content/home/bio.json");

  const bio: BioRow = {
    id: "main",
    photoPath: bioJson.photo,
    photoAlt: bioJson.photoAlt,
    signaturePath: bioJson.signature,
    signatureAlt: bioJson.signatureAlt,
    cvPath: bioJson.cv,
    cvPathEn: bioJson.cvEn ?? null,
    text: bioJson.text,
  };
  await ds.getRepository(BioEntity).save(bio);

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
    "órbita lΔb": "orbita",
    "orbita lab": "orbita",
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
  brandByName.set(
    "clúster de innovación tecnológica formosa",
    "citf",
  );
  await ds.getRepository(BrandEntity).save(brandRows);

  await ds.getRepository(NamedListItemEntity).save([
    ...seedNamed("company", companies, brandByName),
    ...seedNamed("past_project", pastProjects, brandByName),
    ...seedNamed("current_project", currentProjects, brandByName),
  ]);

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
  await ds.getRepository(TestimonialEntity).save(testimonialRows);

  const graphicSources: Array<[GraphicSection, string]> = [
    ["covers", "content/grafico/covers.json"],
    ["logos", "content/grafico/logos.json"],
    ["personal", "content/grafico/personal.json"],
    ["pending", "content/grafico/pending.json"],
    ["illustration", "content/grafico/illustration.json"],
    ["banners", "content/grafico/banners.json"],
    ["eventos", "content/grafico/eventos.json"],
  ];

  const graphicRows = graphicSources.flatMap(([section, path]) =>
    seedGraphics(section, readJson(path)),
  );
  await ds.getRepository(GraphicItemEntity).save(graphicRows);

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

  const manualRows: BrandManualRow[] = manuals.map((item, sortOrder) => ({
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
  await ds.getRepository(BrandManualEntity).save(manualRows);

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
  await ds.getRepository(UiProjectEntity).save(uiProjectRows);

  const uiList = readJson<
    Array<{
      id: string;
      title: Localized;
      logo?: string;
      caption?: string;
      wordmark?: string;
    }>
  >("content/interfaces/list.json");

  const uiListRows: UiListItemRow[] = uiList.map((item, sortOrder) => ({
    id: item.id,
    title: item.title,
    logoPath: item.logo ?? null,
    caption: item.caption ?? null,
    wordmark: item.wordmark ?? null,
    sortOrder,
    published: true,
  }));
  await ds.getRepository(UiListItemEntity).save(uiListRows);

  const techIcons = readJson<
    Array<{ id: string; src: string; label?: string }>
  >("content/home/tech-icons.json");

  if (techIcons.length) {
    const techRows: TechIconRow[] = techIcons.map((item, sortOrder) => ({
      id: item.id,
      srcPath: item.src,
      label: item.label ?? null,
      sortOrder,
      published: true,
    }));
    await ds.getRepository(TechIconEntity).save(techRows);
  }

  console.log("Seed complete:");
  console.log(`  brands: ${brandRows.length}`);
  console.log(`  graphic_items: ${graphicRows.length}`);
  console.log(`  testimonials: ${testimonials.length}`);
  console.log(`  ui_projects: ${uiProjects.length}`);
  console.log(`  admin user: admin / ${bootstrapPassword} (must change)`);
  console.log(`  tags: ${defaultTags.length}`);

  await ds.destroy();
}

if (isDirectScriptRun(["seed.ts"])) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

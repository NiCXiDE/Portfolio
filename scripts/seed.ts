import { config as loadEnv } from "dotenv";
import { hashSync } from "bcryptjs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createDataSource } from "../src/db/data-source";
import {
  AdminUserEntity,
  BioEntity,
  BrandManualEntity,
  GraphicItemEntity,
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

loadEnv({ path: resolve(process.cwd(), ".env") });

type Localized = LocalizedJson;

function readJson<T>(relativePath: string): T {
  const full = resolve(process.cwd(), relativePath);
  return JSON.parse(readFileSync(full, "utf8")) as T;
}

async function clearAll(ds: ReturnType<typeof createDataSource>) {
  await ds.getRepository(GraphicItemEntity).clear();
  await ds.getRepository(BrandManualEntity).clear();
  await ds.getRepository(UiProjectEntity).clear();
  await ds.getRepository(UiListItemEntity).clear();
  await ds.getRepository(TestimonialEntity).clear();
  await ds.getRepository(NamedListItemEntity).clear();
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
): Omit<NamedListItemRow, "id">[] {
  return labels.map((label, sortOrder) => ({
    kind,
    label,
    sortOrder,
    published: true,
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
    sortOrder,
    // pending stays in DB but unpublished from public grids via section filter
    published: section !== "pending" ? true : false,
  }));
}

async function main() {
  const ds = createDataSource(true);
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
    email: "nicoayala.desing@gmail.com",
    phone: "+54 9 370 434-2174",
    noteEs: "señales de humo o gritame por la calle también sirve",
    noteEn: "smoke signals or yelling at me on the street also works",
    poweredBy: "POWERED BY PUSH",
    carouselIntervalMs: 2000,
    graphicPreviewLimit: 7,
    interfacesPreviewLimit: 7,
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
  ];
  await ds.getRepository(TagEntity).save(defaultTags);

  const bioJson = readJson<{
    photo: string;
    photoAlt: Localized;
    signature: string;
    signatureAlt: Localized;
    cv: string;
    text: Localized;
  }>("content/home/bio.json");

  const bio: BioRow = {
    id: "main",
    photoPath: bioJson.photo,
    photoAlt: bioJson.photoAlt,
    signaturePath: bioJson.signature,
    signatureAlt: bioJson.signatureAlt,
    cvPath: bioJson.cv,
    text: bioJson.text,
  };
  await ds.getRepository(BioEntity).save(bio);

  const companies = readJson<string[]>("content/home/companies.json");
  const pastProjects = readJson<string[]>("content/home/past-projects.json");
  const currentProjects = readJson<string[]>(
    "content/home/current-projects.json",
  );
  await ds.getRepository(NamedListItemEntity).save([
    ...seedNamed("company", companies),
    ...seedNamed("past_project", pastProjects),
    ...seedNamed("current_project", currentProjects),
  ]);

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
    }>
  >("content/grafico/brand-manuals.json");

  const manualRows: BrandManualRow[] = manuals.map((item, sortOrder) => ({
    id: item.id,
    coverPath: item.cover,
    pdfPath: item.pdf,
    title: item.title,
    year: item.year ?? null,
    meta: item.meta ?? null,
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
      images: string[];
      prototypeUrl: string | null;
    }>
  >("content/interfaces/projects.json");

  const uiProjectRows: UiProjectRow[] = uiProjects.map((item, sortOrder) => ({
    id: item.id,
    category: item.category,
    title: item.title,
    meta: item.meta,
    images: item.images,
    prototypeUrl: item.prototypeUrl,
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
  console.log(`  graphic_items: ${graphicRows.length}`);
  console.log(`  testimonials: ${testimonials.length}`);
  console.log(`  ui_projects: ${uiProjects.length}`);
  console.log(`  admin user: admin / ${bootstrapPassword} (must change)`);
  console.log(`  tags: ${defaultTags.length}`);

  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

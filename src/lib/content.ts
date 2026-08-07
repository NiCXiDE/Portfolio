import { getDataSource } from "@/db/data-source";
import {
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
  type GraphicItemRow,
  type GraphicSection,
  type LocalizedJson,
  type NamedListItemRow,
  type SocialLinkRow,
  type TagRow,
} from "@/db/entities";
import { mediaUrl, mediaUrls } from "@/lib/media";
import type { Locale } from "@/i18n/config";

export type LocalizedString = LocalizedJson;

export function t(value: LocalizedString, locale: Locale): string {
  return value[locale] ?? value.es;
}

export type BioContent = {
  photo: string;
  photoAlt: LocalizedString;
  signature: string;
  signatureAlt: LocalizedString;
  cv: string;
  text: LocalizedString;
};

export type TestimonialContent = {
  id: string;
  hidden?: boolean;
  name: string;
  image: string;
  quote: LocalizedString;
  role: LocalizedString;
  company: {
    logo: string | null;
    href: string | null;
    name: string;
    linkLabel: LocalizedString | null;
  };
};

export type GraphicItemContent = {
  id: string;
  src: string;
  alt: string;
  title?: LocalizedString;
  year?: string;
  detail?: LocalizedString;
  usage?: LocalizedString;
  href: string | null;
  hrefLabel?: LocalizedString;
  tags?: string[];
  fit?: "cover" | "contain";
  relatedSrc?: string | null;
};

export type BrandManualContent = {
  id: string;
  cover: string;
  pdf: string;
  title: LocalizedString;
  year?: string;
  meta?: LocalizedString;
};

export type UiProjectContent = {
  id: string;
  category: "preventas" | "sistemas-a-medida" | "proyectos-personales";
  title: LocalizedString;
  meta: LocalizedString;
  images: string[];
  prototypeUrl: string | null;
};

export type UiListItemContent = {
  id: string;
  title: LocalizedString;
  logo?: string;
  caption?: string;
  wordmark?: string;
};

export type TechIconContent = {
  id: string;
  src: string;
  label?: string;
};

export type SocialLinkContent = {
  id: string;
  network: string;
  label: string;
  href: string;
  icon: string | null;
};

export type SiteSettingsContent = {
  email: string;
  phone: string;
  note: LocalizedString;
  poweredBy: string;
  carouselIntervalMs: number;
  graphicPreviewLimit: number;
  interfacesPreviewLimit: number;
};

export type PortfolioContent = {
  bio: BioContent;
  techIcons: TechIconContent[];
  companies: string[];
  pastProjects: string[];
  currentProjects: string[];
  testimonials: TestimonialContent[];
  covers: GraphicItemContent[];
  logos: GraphicItemContent[];
  personal: GraphicItemContent[];
  /** Always empty on public load — pending is admin-only */
  pending: GraphicItemContent[];
  brandManuals: BrandManualContent[];
  illustration: GraphicItemContent[];
  banners: GraphicItemContent[];
  uiProjects: UiProjectContent[];
  uiList: UiListItemContent[];
  settings: SiteSettingsContent;
  socialLinks: SocialLinkContent[];
  tags: TagRow[];
};

function mapGraphic(
  row: GraphicItemRow,
  section: GraphicSection,
): GraphicItemContent {
  const detail = row.detail ?? undefined;
  const item: GraphicItemContent = {
    id: row.id,
    src: mediaUrl(row.srcPath),
    alt: row.alt,
    href: row.href,
  };

  if (row.title) item.title = row.title;
  if (row.year) item.year = row.year;
  if (row.hrefLabel) item.hrefLabel = row.hrefLabel;
  if (row.tags?.length) item.tags = row.tags;
  if (row.fit) item.fit = row.fit;
  if (row.relatedSrcPath !== undefined && row.relatedSrcPath !== null) {
    item.relatedSrc = mediaUrl(row.relatedSrcPath);
  } else if (section === "banners") {
    item.relatedSrc = null;
  }

  if (section === "covers" || section === "pending") {
    if (detail) item.usage = detail;
  } else if (detail) {
    item.detail = detail;
  }

  return item;
}

function bySection(
  rows: GraphicItemRow[],
  section: GraphicSection,
): GraphicItemContent[] {
  return rows
    .filter((r) => r.section === section && r.published)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((r) => mapGraphic(r, section));
}

const defaultSettings: SiteSettingsContent = {
  email: "nicoayala.desing@gmail.com",
  phone: "+54 9 370 434-2174",
  note: {
    es: "señales de humo o gritame por la calle también sirve",
    en: "smoke signals or yelling at me on the street also works",
  },
  poweredBy: "POWERED BY PUSH",
  carouselIntervalMs: 2000,
  graphicPreviewLimit: 7,
  interfacesPreviewLimit: 7,
};

export async function loadPortfolioContent(): Promise<PortfolioContent> {
  const ds = await getDataSource();

  const [
    bio,
    named,
    testimonials,
    graphics,
    manuals,
    uiProjects,
    uiList,
    techIcons,
    settingsRow,
    socials,
    tags,
  ] = await Promise.all([
    ds.getRepository(BioEntity).findOneByOrFail({ id: "main" }),
    ds.getRepository(NamedListItemEntity).find({
      order: { sortOrder: "ASC", id: "ASC" },
    }),
    ds.getRepository(TestimonialEntity).find({
      order: { sortOrder: "ASC", id: "ASC" },
    }),
    ds.getRepository(GraphicItemEntity).find({
      order: { sortOrder: "ASC", id: "ASC" },
    }),
    ds.getRepository(BrandManualEntity).find({
      order: { sortOrder: "ASC", id: "ASC" },
    }),
    ds.getRepository(UiProjectEntity).find({
      order: { sortOrder: "ASC", id: "ASC" },
    }),
    ds.getRepository(UiListItemEntity).find({
      order: { sortOrder: "ASC", id: "ASC" },
    }),
    ds.getRepository(TechIconEntity).find({
      order: { sortOrder: "ASC", id: "ASC" },
    }),
    ds.getRepository(SiteSettingsEntity).findOneBy({ id: "main" }),
    ds.getRepository(SocialLinkEntity).find({
      order: { sortOrder: "ASC", id: "ASC" },
    }),
    ds.getRepository(TagEntity).find({
      order: { sortOrder: "ASC", slug: "ASC" },
    }),
  ]);

  const labels = (kind: NamedListItemRow["kind"]) =>
    named
      .filter((n) => n.kind === kind && n.published)
      .map((n) => n.label);

  const settings: SiteSettingsContent = settingsRow
    ? {
        email: settingsRow.email,
        phone: settingsRow.phone,
        note: { es: settingsRow.noteEs, en: settingsRow.noteEn },
        poweredBy: settingsRow.poweredBy,
        carouselIntervalMs: settingsRow.carouselIntervalMs,
        graphicPreviewLimit: settingsRow.graphicPreviewLimit,
        interfacesPreviewLimit: settingsRow.interfacesPreviewLimit,
      }
    : defaultSettings;

  const mapSocial = (row: SocialLinkRow): SocialLinkContent => ({
    id: row.id,
    network: row.network,
    label: row.label,
    href: row.href,
    icon: row.iconPath ? mediaUrl(row.iconPath) : null,
  });

  return {
    bio: {
      photo: mediaUrl(bio.photoPath),
      photoAlt: bio.photoAlt,
      signature: mediaUrl(bio.signaturePath),
      signatureAlt: bio.signatureAlt,
      cv: mediaUrl(bio.cvPath),
      text: bio.text,
    },
    techIcons: techIcons
      .filter((icon) => icon.published)
      .map((icon) => ({
        id: icon.id,
        src: mediaUrl(icon.srcPath),
        ...(icon.label ? { label: icon.label } : {}),
      })),
    companies: labels("company"),
    pastProjects: labels("past_project"),
    currentProjects: labels("current_project"),
    testimonials: testimonials
      .filter((row) => !row.hidden)
      .map((row) => ({
        id: row.id,
        name: row.name,
        image: mediaUrl(row.imagePath),
        quote: row.quote,
        role: row.role,
        company: {
          name: row.companyName,
          logo: row.companyLogoPath ? mediaUrl(row.companyLogoPath) : null,
          href: row.companyHref,
          linkLabel: row.linkLabel,
        },
      })),
    covers: bySection(graphics, "covers"),
    logos: bySection(graphics, "logos"),
    personal: bySection(graphics, "personal"),
    pending: [],
    illustration: bySection(graphics, "illustration"),
    banners: bySection(graphics, "banners"),
    brandManuals: manuals
      .filter((m) => m.published)
      .map((m) => ({
        id: m.id,
        cover: mediaUrl(m.coverPath),
        pdf: mediaUrl(m.pdfPath),
        title: m.title,
        ...(m.year ? { year: m.year } : {}),
        ...(m.meta ? { meta: m.meta } : {}),
      })),
    uiProjects: uiProjects
      .filter((p) => p.published)
      .map((p) => ({
        id: p.id,
        category: p.category,
        title: p.title,
        meta: p.meta,
        images: mediaUrls(p.images),
        prototypeUrl: p.prototypeUrl,
      })),
    uiList: uiList
      .filter((item) => item.published)
      .map((item) => ({
        id: item.id,
        title: item.title,
        ...(item.logoPath ? { logo: mediaUrl(item.logoPath) } : {}),
        ...(item.caption ? { caption: item.caption } : {}),
        ...(item.wordmark ? { wordmark: item.wordmark } : {}),
      })),
    settings,
    socialLinks: socials.filter((s) => s.published).map(mapSocial),
    tags,
  };
}

export async function loadGraphicSection(
  section: GraphicSection,
): Promise<GraphicItemContent[]> {
  if (section === "pending") return [];
  const ds = await getDataSource();
  const rows = await ds.getRepository(GraphicItemEntity).find({
    where: { section, published: true },
    order: { sortOrder: "ASC", id: "ASC" },
  });
  return rows.map((r) => mapGraphic(r, section));
}

export const GRAPHIC_PUBLIC_SECTIONS: Exclude<GraphicSection, "pending">[] = [
  "covers",
  "logos",
  "personal",
  "illustration",
  "banners",
];

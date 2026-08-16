import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { loadPortfolioContentForLocale } from "@/lib/content-v2/home-runtime";
import { GraphicSectionView } from "@/components/layers/GraphicSectionView";
import { buildPageMetadata, graphicSectionTitle } from "@/lib/seo";

const SECTIONS = [
  "covers",
  "logos",
  "personal",
  "illustration",
  "banners",
  "eventos",
  "manuals",
] as const;

const SECTION_META_KEY = {
  covers: "covers",
  logos: "logos",
  personal: "personal",
  illustration: "illustration",
  banners: "banners",
  eventos: "eventos",
  manuals: "brandManuals",
} as const;

export function generateStaticParams() {
  return SECTIONS.map((section) => ({ section }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; section: string }>;
}): Promise<Metadata> {
  const { locale: raw, section } = await params;
  if (!isLocale(raw)) return {};
  if (!SECTIONS.includes(section as (typeof SECTIONS)[number])) return {};
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const labelKey = SECTION_META_KEY[section as keyof typeof SECTION_META_KEY];
  const label = dict.grafico[labelKey] as string;
  return buildPageMetadata({
    locale,
    title: graphicSectionTitle(locale, label),
    description: dict.meta.graphicDescription,
    pathAfterLocale: `/grafico/${section}`,
  });
}

export default async function GraphicSectionPage({
  params,
}: {
  params: Promise<{ locale: string; section: string }>;
}) {
  const { locale: raw, section } = await params;
  if (!isLocale(raw)) notFound();
  if (!SECTIONS.includes(section as (typeof SECTIONS)[number])) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const content = await loadPortfolioContentForLocale(locale);

  return (
    <GraphicSectionView
      locale={locale}
      dict={dict}
      content={content}
      section={section as (typeof SECTIONS)[number]}
    />
  );
}

import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { loadPortfolioContent } from "@/lib/content";
import { GraphicSectionView } from "@/components/layers/GraphicSectionView";

const SECTIONS = [
  "covers",
  "logos",
  "personal",
  "illustration",
  "banners",
  "manuals",
] as const;

export function generateStaticParams() {
  return SECTIONS.map((section) => ({ section }));
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
  const content = await loadPortfolioContent();

  return (
    <GraphicSectionView
      locale={locale}
      dict={dict}
      content={content}
      section={section as (typeof SECTIONS)[number]}
    />
  );
}

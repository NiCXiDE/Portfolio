import type { Metadata } from "next";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { buildPageMetadata, interfacesLayerTitle } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  return buildPageMetadata({
    locale,
    title: interfacesLayerTitle(locale),
    description: dict.meta.interfacesDescription,
    pathAfterLocale: "/interfaces",
  });
}

export default function InterfacesPage() {
  return null;
}

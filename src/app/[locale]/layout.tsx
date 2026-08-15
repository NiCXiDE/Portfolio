import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { LayerShell } from "@/components/LayerShell";
import { loadPortfolioContentForLocale } from "@/lib/content-v2/home-runtime";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const content = await loadPortfolioContentForLocale(locale);

  return (
    <LayerShell locale={locale} dict={dict} content={content}>
      {children}
    </LayerShell>
  );
}

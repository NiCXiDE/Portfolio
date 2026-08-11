import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export function absoluteUrl(path = "/") {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

/** Path after locale, e.g. "" | "/grafico" | "/grafico/covers" */
type PageMetaInput = {
  locale: Locale;
  title: string;
  description: string;
  /** Locale-relative path without locale prefix */
  pathAfterLocale?: string;
};

export function buildPageMetadata({
  locale,
  title,
  description,
  pathAfterLocale = "",
}: PageMetaInput): Metadata {
  const rest = pathAfterLocale
    ? pathAfterLocale.startsWith("/")
      ? pathAfterLocale
      : `/${pathAfterLocale}`
    : "";
  const path = `/${locale}${rest}`;
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        es: absoluteUrl(`/es${rest}`),
        en: absoluteUrl(`/en${rest}`),
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : "es_AR",
      url,
      siteName: SITE_NAME,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function homeTitle(locale: Locale) {
  return locale === "en" ? `Home — ${SITE_NAME}` : `Inicio — ${SITE_NAME}`;
}

export function graphicLayerTitle(locale: Locale) {
  const d = getDictionary(locale);
  return `${d.grafico.title} — Nico Ayala`;
}

export function interfacesLayerTitle(locale: Locale) {
  return locale === "en"
    ? `Interface Design — Nico Ayala`
    : `Diseño de Interfaces — Nico Ayala`;
}

export function graphicSectionTitle(locale: Locale, sectionLabel: string) {
  return locale === "en"
    ? `${sectionLabel} — Graphic · Nico Ayala`
    : `${sectionLabel} — Gráfico · Nico Ayala`;
}

export function interfacesCategoryTitle(locale: Locale, categoryLabel: string) {
  return `${categoryLabel} — Interfaces · Nico Ayala`;
}

export function privacyTitle(locale: Locale) {
  return locale === "en"
    ? `Privacy — ${SITE_NAME}`
    : `Privacidad — ${SITE_NAME}`;
}

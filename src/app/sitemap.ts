import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { SITE_URL } from "@/lib/site";

const GRAPHIC_SECTIONS = [
  "covers",
  "logos",
  "personal",
  "illustration",
  "banners",
  "manuals",
] as const;

const INTERFACE_CATS = [
  "preventas",
  "sistemas-a-medida",
  "proyectos-personales",
  "system-design",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    const base = `${SITE_URL}/${locale}`;
    entries.push(
      { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
      {
        url: `${base}/grafico`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${base}/interfaces`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${base}/privacidad`,
        lastModified,
        changeFrequency: "yearly",
        priority: 0.3,
      },
    );

    for (const section of GRAPHIC_SECTIONS) {
      entries.push({
        url: `${base}/grafico/${section}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
    for (const category of INTERFACE_CATS) {
      entries.push({
        url: `${base}/interfaces/${category}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return entries;
}

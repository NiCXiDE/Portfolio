import type { Locale } from "@/i18n/config";

import bio from "../../content/home/bio.json";
import techIcons from "../../content/home/tech-icons.json";
import companies from "../../content/home/companies.json";
import pastProjects from "../../content/home/past-projects.json";
import currentProjects from "../../content/home/current-projects.json";
import testimonials from "../../content/home/testimonials.json";
import covers from "../../content/grafico/covers.json";
import logos from "../../content/grafico/logos.json";
import personal from "../../content/grafico/personal.json";
import pending from "../../content/grafico/pending.json";
import brandManuals from "../../content/grafico/brand-manuals.json";
import illustration from "../../content/grafico/illustration.json";
import banners from "../../content/grafico/banners.json";
import uiProjects from "../../content/interfaces/projects.json";
import uiList from "../../content/interfaces/list.json";

export type LocalizedString = { es: string; en: string };

export function t(value: LocalizedString, locale: Locale): string {
  return value[locale] ?? value.es;
}

export const content = {
  bio,
  techIcons,
  companies,
  pastProjects,
  currentProjects,
  testimonials,
  covers,
  logos,
  personal,
  pending,
  brandManuals,
  illustration,
  banners,
  uiProjects,
  uiList,
} as const;

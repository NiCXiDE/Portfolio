/**
 * Shared mapping helpers for V2 public DTOs.
 */
import type { PortfolioEntityRow, ProjectRow } from "@/db/entities-v2";
import { mediaUrl } from "@/lib/media";
import type { PublicEntitySummary, PublicLocalizedText } from "./types";
import { isPublicEntity } from "./visibility";

export function mapLocalized(
  value: PublicLocalizedText | null | undefined,
): PublicLocalizedText | null {
  if (!value) return null;
  return {
    es: value.es ?? "",
    en: value.en ?? value.es ?? "",
  };
}

/**
 * Locale strategy (documented): LocalizedJson fields store `{ es, en }`.
 * Consumers should prefer locale key then fall back to `es` (same as legacy `t()`).
 * Readers do not auto-translate missing locales.
 */
export function pickLocalized(
  value: PublicLocalizedText | null | undefined,
  locale: "es" | "en",
): string {
  if (!value) return "";
  if (locale === "en") return value.en?.trim() || value.es?.trim() || "";
  return value.es?.trim() || value.en?.trim() || "";
}

export function mapPublicEntitySummary(
  row: PortfolioEntityRow,
): PublicEntitySummary | null {
  if (!isPublicEntity(row)) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortName: row.shortName,
    type: row.type,
    logoUrl: row.logoPath ? mediaUrl(row.logoPath) : null,
    href: row.href,
    description: mapLocalized(row.description),
    pageEnabled: row.pageEnabled === true,
    showOnHome: row.showOnHome === true,
    homeOrder: row.homeOrder,
  };
}

export function mapProjectTitle(row: ProjectRow): PublicLocalizedText {
  return mapLocalized(row.title) ?? { es: row.id, en: row.id };
}

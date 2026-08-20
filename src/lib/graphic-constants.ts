/** Inset around logo marks inside square tiles (safe area). */
export const LOGO_SAFE_INSET_PERCENT = 5;

export function isVectorRecolorPath(path: string) {
  return /\.(svg|png)$/i.test(path.split("?")[0] ?? "");
}

export function ensureVectorTag(tags: string) {
  const parts = tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (!parts.includes("vector")) parts.push("vector");
  return parts.join(", ");
}

export function logoDetailHref(
  locale: string,
  item: {
    id: string;
    gallery?: readonly string[] | string[];
    resourceCount?: number;
  },
): string | null {
  const hasLegacyGallery = Boolean(item.gallery?.length);
  const hasResources = (item.resourceCount ?? 0) > 0;
  if (!hasLegacyGallery && !hasResources) return null;
  return `/${locale}/grafico/logos/${item.id}`;
}

export type BrandRef = {
  id: string;
  name: string;
  /** URL pública / mostrable */
  logo: string | null;
  /** Ruta de storage (admin / save) */
  logoPath?: string | null;
  href: string | null;
};

export function slugifyBrand(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return base || "marca";
}

/** `@push`, `@aicore-it` — letter/number/hyphen after @ */
export const BRAND_MENTION_RE = /@([a-z0-9][a-z0-9-]{0,63})/gi;

export function collectMentionIds(text: string): string[] {
  const ids = new Set<string>();
  for (const match of text.matchAll(BRAND_MENTION_RE)) {
    ids.add(match[1].toLowerCase());
  }
  return [...ids];
}

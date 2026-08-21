/** Server-safe asset helpers (no React client boundary). */

export function isSvgAsset(src: string) {
  return /\.svg($|\?)/i.test(src);
}

/** Monochrome PNG exports tagged as vector (white on black). */
export function isVectorMaskPng(src: string) {
  return /\.png($|\?)/i.test(src);
}

/**
 * URL usable en CSS `mask-image` sin CORS.
 *
 * `mediaUrl()` puede devolver `https://{R2}/assets/...`. Los navegadores bloquean
 * máscaras cross-origin sin headers CORS; el path same-origin `/assets/...`
 * evita eso (public/ o rewrite fallback → R2).
 */
export function toSameOriginAssetPath(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/")) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.pathname.startsWith("/assets/")) {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    /* not an absolute URL */
  }
  return trimmed;
}

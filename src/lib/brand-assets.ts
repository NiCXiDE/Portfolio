/** Server-safe asset helpers (no React client boundary). */

export function isSvgAsset(src: string) {
  return /\.svg($|\?)/i.test(src);
}

/** Monochrome PNG exports tagged as vector (white on black). */
export function isVectorMaskPng(src: string) {
  return /\.png($|\?)/i.test(src);
}

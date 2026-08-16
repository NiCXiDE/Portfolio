/**
 * Graphic-only content source flag (Phase 4D.4).
 * Server-side only — never NEXT_PUBLIC_*.
 * Default remains legacy until an explicit cutover (4D.5+).
 */
export type GraphicContentSource = "legacy" | "v2";

/**
 * Resolve GRAPHIC_CONTENT_SOURCE.
 * - unset / undefined → "legacy"
 * - "legacy" → "legacy"
 * - "v2" → "v2"
 * - invalid / empty → "legacy"
 */
export function getGraphicContentSource(
  envValue: string | undefined = process.env.GRAPHIC_CONTENT_SOURCE,
): GraphicContentSource {
  if (envValue == null) return "legacy";
  const normalized = envValue.trim().toLowerCase();
  if (normalized === "v2") return "v2";
  if (normalized === "legacy") return "legacy";
  if (process.env.NODE_ENV === "development" && normalized !== "") {
    console.warn(
      `[graphic-source] invalid GRAPHIC_CONTENT_SOURCE="${envValue}" — falling back to legacy`,
    );
  }
  return "legacy";
}

/**
 * Graphic-only content source flag (Phase 4D.4 / 4D.6 cutover).
 * Server-side only — never NEXT_PUBLIC_*.
 */
export type GraphicContentSource = "legacy" | "v2";

/**
 * Resolve GRAPHIC_CONTENT_SOURCE.
 * - unset / undefined → "v2" (default after 4D.6 cutover)
 * - "v2" → "v2"
 * - "legacy" → "legacy" (explicit rollback)
 * - invalid / empty → "legacy" (safe fallback)
 */
export function getGraphicContentSource(
  envValue: string | undefined = process.env.GRAPHIC_CONTENT_SOURCE,
): GraphicContentSource {
  if (envValue == null) return "v2";
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

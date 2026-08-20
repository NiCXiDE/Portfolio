/**
 * Home-only content source flag (Phase 4C.4 / 4C.6 cutover).
 * Server-side only — never NEXT_PUBLIC_*.
 */
export type HomeContentSource = "legacy" | "v2";

/**
 * Resolve HOME_CONTENT_SOURCE.
 * - unset / undefined → "v2" (default after 4C.6 cutover)
 * - "v2" → "v2"
 * - "legacy" → "legacy" (explicit rollback)
 * - invalid / empty → "legacy" (safe fallback)
 */
export function getHomeContentSource(
  envValue: string | undefined = process.env.HOME_CONTENT_SOURCE,
): HomeContentSource {
  if (envValue == null) return "v2";
  const normalized = envValue.trim().toLowerCase();
  if (normalized === "v2") return "v2";
  if (normalized === "legacy") return "legacy";
  // Empty or unrecognized → safe rollback path
  if (process.env.NODE_ENV === "development" && normalized !== "") {
    console.warn(
      `[home-source] invalid HOME_CONTENT_SOURCE="${envValue}" — falling back to legacy`,
    );
  }
  return "legacy";
}

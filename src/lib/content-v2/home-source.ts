/**
 * Home-only content source flag (Phase 4C.4).
 * Server-side only — never NEXT_PUBLIC_*.
 */
export type HomeContentSource = "legacy" | "v2";

/**
 * Resolve HOME_CONTENT_SOURCE.
 * undefined / "legacy" / invalid → "legacy"
 * "v2" → "v2"
 */
export function getHomeContentSource(
  envValue: string | undefined = process.env.HOME_CONTENT_SOURCE,
): HomeContentSource {
  if (envValue == null) return "legacy";
  const normalized = envValue.trim().toLowerCase();
  if (normalized === "" || normalized === "legacy") return "legacy";
  if (normalized === "v2") return "v2";
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[home-source] invalid HOME_CONTENT_SOURCE="${envValue}" — falling back to legacy`,
    );
  }
  return "legacy";
}

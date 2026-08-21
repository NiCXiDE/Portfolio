/**
 * Resuelve rutas de medios almacenadas en SQL hacia URL pública.
 *
 * - Paths relativos/absolutos locales (`/assets/...`) se sirven desde Next
 *   mientras no haya base pública configurada.
 * - Con Cloudflare R2: preferí `R2_PUBLIC_URL` (o `MEDIA_BASE_URL` si lo
 *   necesitás overridear) al dominio público del bucket/CDN, sin slash final.
 *
 * Una sola implementación: `resolveMediaUrl`. El server usa `mediaUrl()`;
 * el admin client recibe la base vía contexto y reutiliza la misma función.
 */

/** Base pública de medios (CDN R2 u override). Vacía = servir desde el origen. */
export function mediaBaseUrl(): string {
  return (
    process.env.MEDIA_BASE_URL?.replace(/\/$/, "") ||
    process.env.R2_PUBLIC_URL?.replace(/\/$/, "") ||
    ""
  );
}

/**
 * Resolución pura path + base. Compatible con:
 * - `/assets/...`
 * - URLs absolutas `https://...`
 * - base vacía (fallback al path, p.ej. `public/assets`)
 */
export function resolveMediaUrl(
  path: string | null | undefined,
  base: string,
): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const normalized = path.startsWith("/") ? path : `/${path}`;
  const trimmedBase = base.replace(/\/$/, "");
  if (!trimmedBase) return normalized;
  return `${trimmedBase}${normalized}`;
}

/** Server / RSC: resuelve con la base del entorno. */
export function mediaUrl(path: string | null | undefined): string {
  return resolveMediaUrl(path, mediaBaseUrl());
}

export function mediaUrls(paths: readonly string[]): string[] {
  return paths.map((p) => mediaUrl(p));
}

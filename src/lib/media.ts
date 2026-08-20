/**
 * Resuelve rutas de medios almacenadas en SQL hacia URL pública.
 *
 * - Paths relativos/absolutos locales (`/assets/...`) se sirven desde Next
 *   mientras no haya base pública configurada.
 * - Con Cloudflare R2: preferí `R2_PUBLIC_URL` (o `MEDIA_BASE_URL` si lo
 *   necesitás overridear) al dominio público del bucket/CDN, sin slash final.
 */
export function mediaBaseUrl(): string {
  return (
    process.env.MEDIA_BASE_URL?.replace(/\/$/, "") ||
    process.env.R2_PUBLIC_URL?.replace(/\/$/, "") ||
    ""
  );
}

export function mediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const base = mediaBaseUrl();
  if (!base) return path;

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function mediaUrls(paths: readonly string[]): string[] {
  return paths.map((p) => mediaUrl(p));
}

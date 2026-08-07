/**
 * Resuelve rutas de medios almacenadas en SQL hacia URL pública.
 *
 * - Paths relativos/absolutos locales (`/assets/...`) se sirven desde Next
 *   mientras MEDIA_BASE_URL esté vacío.
 * - Con Cloudflare R2: subí los mismos keys al bucket y seteá MEDIA_BASE_URL
 *   al dominio público del CDN (sin slash final).
 */
export function mediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const base = process.env.MEDIA_BASE_URL?.replace(/\/$/, "");
  if (!base) return path;

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function mediaUrls(paths: readonly string[]): string[] {
  return paths.map((p) => mediaUrl(p));
}

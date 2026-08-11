/** Canonical site URL for metadata, robots, sitemap, and JSON-LD. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://nicoayala.com.ar"
).replace(/\/$/, "");

export const SITE_NAME = "Nico Ayala Design";

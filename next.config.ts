import type { NextConfig } from "next";

function resolveMediaHostname(): string | undefined {
  const explicit = process.env.MEDIA_HOSTNAME?.trim();
  if (explicit) return explicit;

  const base =
    process.env.MEDIA_BASE_URL?.trim() || process.env.R2_PUBLIC_URL?.trim();
  if (!base) return undefined;

  try {
    return new URL(base).hostname;
  } catch {
    return undefined;
  }
}

function resolveMediaBase(): string | undefined {
  const base =
    process.env.MEDIA_BASE_URL?.trim() || process.env.R2_PUBLIC_URL?.trim();
  if (!base) return undefined;
  return base.replace(/\/$/, "");
}

const mediaHostname = resolveMediaHostname();
const mediaBase = resolveMediaBase();

const nextConfig: NextConfig = {
  output: "standalone",
  /* Oculta el indicador de desarrollo (ícono N) en local */
  devIndicators: false,
  images: {
    remotePatterns: mediaHostname
      ? [
          {
            protocol: "https",
            hostname: mediaHostname,
          },
        ]
      : [],
  },
  serverExternalPackages: ["typeorm", "mysql2", "sharp"],
  /**
   * Fallback only after public/ and routes: proxy missing `/assets/*` to R2.
   * Lets CSS mask-image use same-origin `/assets/...` (no CORS) while files
   * that live only on R2 still resolve.
   */
  async rewrites() {
    if (!mediaBase) return [];
    return {
      fallback: [
        {
          source: "/assets/:path*",
          destination: `${mediaBase}/assets/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;

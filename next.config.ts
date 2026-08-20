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

const mediaHostname = resolveMediaHostname();

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
};

export default nextConfig;

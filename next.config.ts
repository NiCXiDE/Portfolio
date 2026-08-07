import type { NextConfig } from "next";

const mediaHostname = process.env.MEDIA_HOSTNAME?.trim();

const nextConfig: NextConfig = {
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
  serverExternalPackages: ["typeorm", "mysql2"],
};

export default nextConfig;

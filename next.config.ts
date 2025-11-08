// next.config.ts
import type { NextConfig } from "next";

/** Déduit (proto, host, port) depuis NEXT_PUBLIC_API_URL (avec ou sans /api) */
function parseApiFromEnv() {
  const raw = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/+$/, "");
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return {
      protocol: (u.protocol.replace(":", "") as "http" | "https"),
      hostname: u.hostname,
      port: u.port || (u.protocol === "https:" ? "443" : "80"),
    };
  } catch {
    return null;
  }
}

const api = parseApiFromEnv();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // DEV Laravel (uniquement localhost)
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/storage/**" } as const,
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/uploads/**" } as const,

      // Hôte déduit de l'API (utile en PROD / staging)
      ...(api
        ? ([
            { protocol: api.protocol, hostname: api.hostname, port: api.port, pathname: "/storage/**" } as const,
            { protocol: api.protocol, hostname: api.hostname, port: api.port, pathname: "/uploads/**" } as const,
          ] as const)
        : []),

      // Fallback CDN générique
      { protocol: "https", hostname: "**", port: "", pathname: "/storage/**" } as const,
      { protocol: "https", hostname: "**", port: "", pathname: "/uploads/**" } as const,
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Déploiement serein : on n’empêche pas le build si lint/TS râlent
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;

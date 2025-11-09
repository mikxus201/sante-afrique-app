// next.config.ts
import type { NextConfig } from "next";

/** Nettoie /api en fin d’URL et les / en trop */
function normalizeApi(url?: string) {
  const raw = (url || "").trim().replace(/\/+$/, "");
  return raw.replace(/\/api$/i, "");
}

const ROOT = normalizeApi(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");

function parseForImages(u: string) {
  try {
    const x = new URL(u);
    return {
      protocol: x.protocol.replace(":", "") as "http" | "https",
      hostname: x.hostname,
      port: x.port || (x.protocol === "https:" ? "443" : "80"),
    };
  } catch {
    return { protocol: "http" as const, hostname: "localhost", port: "8000" };
  }
}

const apiHost = parseForImages(ROOT);

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // Hôte du back (staging/prod)
      { protocol: apiHost.protocol, hostname: apiHost.hostname, port: apiHost.port, pathname: "/storage/**" },
      { protocol: apiHost.protocol, hostname: apiHost.hostname, port: apiHost.port, pathname: "/uploads/**" },

      // Confort dev local
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // On ne bloque PAS le build en staging si ESLint/TS râlent
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  async rewrites() {
    return [
      // Proxy API & auth Laravel
      { source: "/api/:path*", destination: `${ROOT}/api/:path*` },
      { source: "/sanctum/:path*", destination: `${ROOT}/sanctum/:path*` },
      { source: "/auth/:path*", destination: `${ROOT}/auth/:path*` },
      { source: "/login", destination: `${ROOT}/login` },
      { source: "/logout", destination: `${ROOT}/logout` },

      // Accès direct aux assets du back depuis le front
      { source: "/storage/:path*", destination: `${ROOT}/storage/:path*` },
      { source: "/uploads/:path*", destination: `${ROOT}/uploads/:path*` },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const ROOT = API.replace(/\/api$/i, '');

// On dérive host/port/protocol depuis l'URL de l'API pour les images distantes
const parsed = new URL(ROOT);
const basePattern = {
  protocol: parsed.protocol.replace(':', ''), // "http" ou "https"
  hostname: parsed.hostname,
  ...(parsed.port ? { port: parsed.port } : {}),
  pathname: '/**',
};

const nextConfig = {
  images: {
    // Autorise les images servies par ton back (quel que soit le domaine de l'API)
    remotePatterns: [
      basePattern,
      // Confort dev : hôtes locaux
      { protocol: 'http', hostname: 'localhost',  port: '8000', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1',  port: '8000', pathname: '/**' },
    ],
  },

  async rewrites() {
    return [
      // Proxy API & auth Laravel (évite CORS côté client)
      { source: '/api/:path*',     destination: `${ROOT}/api/:path*` },
      { source: '/sanctum/:path*', destination: `${ROOT}/sanctum/:path*` },
      { source: '/auth/:path*',    destination: `${ROOT}/auth/:path*` },
      { source: '/login',          destination: `${ROOT}/login` },
      { source: '/logout',         destination: `${ROOT}/logout` },

      // Option très utile si ton front est en HTTPS et le back en HTTP :
      // permet d'appeler /storage/... depuis le front (même origine),
      // Next ira chercher côté serveur vers le back sans mixed-content.
      { source: '/storage/:path*', destination: `${ROOT}/storage/:path*` },
      // Si tu utilises d'autres préfixes d'assets :
      // { source: '/uploads/:path*', destination: `${ROOT}/uploads/:path*` },
      // { source: '/images/:path*',  destination: `${ROOT}/images/:path*` },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const root = url.replace(/\/api$/i, '');
const host = (() => {
  try { return new URL(root).hostname; } catch { return '127.0.0.1'; }
})();

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: '127.0.0.1', port: '8000', pathname: '/storage/**' },
      { protocol: 'http',  hostname: 'localhost',  port: '8000', pathname: '/storage/**' },
      { protocol: 'http',  hostname: host, pathname: '/storage/**' },
      { protocol: 'https', hostname: host, pathname: '/storage/**' },
    ],
  },
};

module.exports = nextConfig;

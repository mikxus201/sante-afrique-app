// src/lib/site.ts

// Domaine public du site (défini dans .env.local en prod)
const RAW = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();

// URL de base SANS slash final
export const SITE_URL = (RAW || "http://localhost:3000").replace(/\/+$/, "");

// Nom de site (utilisé pour SEO/partages)
export const SITE_NAME = "www.santeafrique.net";

/**
 * Transforme un chemin relatif en URL absolue basée sur SITE_URL.
 * Laisse passer les URL déjà absolues.
 */
export function absUrl(path: string) {
  if (!path) return SITE_URL;
  return /^https?:\/\//i.test(path)
    ? path
    : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * URL publique d’une offre d’emploi (détail)
 * - Accepte un id numérique ou un slug string
 * - Ex: https://www.santeafrique.net/offres-emploi/123
 */
export function jobPublicUrl(idOrSlug: string | number) {
  return `${SITE_URL}/offres-emploi/${encodeURIComponent(String(idOrSlug))}`;
}

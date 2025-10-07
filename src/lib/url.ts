// src/lib/url.ts
import { headers } from "next/headers";

/**
 * Construit une URL absolue.
 * - En dev derrière ngrok, définis NEXT_PUBLIC_BASE_URL
 *   (ex: https://abc123.ngrok.io)
 */
export async function absoluteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (base) return `${base}${normalized}`;

  // Next.js 15: headers() est ASYNC
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}${normalized}`;
}

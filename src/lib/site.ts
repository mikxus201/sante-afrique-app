// src/lib/site.ts
const RAW = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "");
export const SITE_URL = RAW || "http://localhost:3000"; 

// mets ton domaine en prod ex: https://www.santeafrique.org
export const SITE_NAME = "www.santeafrique.net";

export function absUrl(path: string) {
  if (!path) return SITE_URL;
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

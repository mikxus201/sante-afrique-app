// src/lib/img.ts
const RAW_BASE =
  (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_API_URL) || "";
export const BASE: string = String(RAW_BASE).replace(/\/$/, "");

function isAbsoluteUrl(s: string): boolean {
  return /^https?:\/\//i.test(s) || s.startsWith("data:");
}

export function toImageUrl(input?: unknown): string {
  if (!input) return "/placeholder.jpg";

  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return "/placeholder.jpg";
    if (isAbsoluteUrl(s)) return s;
    const path = s.startsWith("/") ? s : `/${s}`;
    return BASE ? `${BASE}${path}` : path;
  }

  const a = input as Record<string, unknown>;
  const candidates = [
    a.thumbnail_url,
    a.cover_url,
    a.image_url,
    a.url,
    a.image,
    a.thumbnail,
    a.cover,
    a.thumb,
    a.photo,
    a.file,
    a.path,
    a.src,
  ].filter(Boolean) as string[];

  if (candidates.length > 0) return toImageUrl(String(candidates[0]));
  return "/placeholder.jpg";
}

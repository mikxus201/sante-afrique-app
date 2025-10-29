// src/lib/img.ts
const RAW_BASE =
  (typeof process !== "undefined" &&
    process.env &&
    process.env.NEXT_PUBLIC_API_URL) ||
  "";

/** En dev, si la variable n'est pas posée, on retombe sur localhost:8000 */
export const BASE: string = String(RAW_BASE || "http://localhost:8000").replace(/\/$/, "");

function isAbsoluteUrl(s: string): boolean {
  return /^https?:\/\//i.test(s) || s.startsWith("data:");
}

/**
 * toImageUrl(input) → URL absolue prête pour <Image src=...>
 * - `input` peut être une string (chemin relatif/absolu) ou un objet avec plusieurs clés candidates
 * - fallback garanti: /placeholder.jpg
 */
export function toImageUrl(input?: unknown): string {
  if (!input) return "/placeholder.jpg";

  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return "/placeholder.jpg";
    if (isAbsoluteUrl(s)) return s;

    // Accepte /storage/**, /uploads/**, etc. et préfixe avec BASE
    const path = s.startsWith("/") ? s : `/${s}`;
    return `${BASE}${path}`;
  }

  // Objet avec potentiellement plusieurs clés "image"
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
  ]
    .filter(Boolean)
    .map(String);

  if (candidates.length > 0) {
    return toImageUrl(candidates[0]); // réentrance gérée (string)
  }
  return "/placeholder.jpg";
}

/** Alias de compat si tu veux importer "pickImage" ailleurs */
export const pickImage = toImageUrl;

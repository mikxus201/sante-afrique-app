// src/lib/pickImage.ts
export function pickImage(a: any): string {
  const cand =
    a?.image ??
    a?.image_url ??
    a?.thumbnail_url ??
    a?.thumbnail ??
    a?.cover ??
    a?.photo ??
    '';

  return typeof cand === 'string' && cand.trim() !== '' ? cand : '';
}

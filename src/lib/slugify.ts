// Utils de normalisation de texte + slugs (accents, espaces, etc.)
export function normalize(input?: string): string {
  return (input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // accents
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(input?: string): string {
  return normalize(input)
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

export function sameSlug(a?: string, b?: string): boolean {
  return slugify(a) === slugify(b);
}

// src/app/dossiers/[slug]/page.tsx
import ArticlePage, {
  generateMetadata as baseGenerateMetadata,
} from "../../articles/[slug]/page";

// On garde exactement la même génération de meta que la page article
export const generateMetadata = baseGenerateMetadata;

// (Optionnel) active l’ISR léger si tu utilises le SSG
export const revalidate = 60;

// ===== Helpers API identiques à ceux déjà présents ailleurs =====
const trimSlash = (s: string) => s.replace(/\/+$/, "");
const apiRoot = () =>
  trimSlash(
    (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(
      /\/api$/i,
      ""
    )
  );
const apiUrl = (p: string) =>
  `${apiRoot()}/api${p.startsWith("/") ? "" : "/"}${p}`;

// Robustifier l’accès au libellé de catégorie, quel que soit le format
function pickCategory(a: any): string {
  const src =
    a?.category ??
    a?.section ??
    a?.rubrique ??
    a?.category_name ??
    a?.section_name ??
    a?.rubrique_name ??
    null;

  const toText = (v: any): string => {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return toText(v[0]);
    if (typeof v === "object") {
      const cand =
        v.name ??
        v.label ??
        v.title ??
        v.slug ??
        Object.values(v).find((x) => typeof x === "string") ??
        "";
      return String(cand);
    }
    return String(v);
  };

  return toText(src);
}

// ===== Pré-render statique ciblé pour la catégorie "Dossiers" =====
export async function generateStaticParams() {
  try {
    // On récupère un lot raisonnable; à ajuster si besoin (ou paginer)
    const url = apiUrl("/articles?perPage=200");
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      // pas de cache build-time (Next gère)
    });
    const raw = await res.text();
    if (/^\s*<!doctype html>|^\s*<html/i.test(raw)) return [];
    const payload = JSON.parse(raw);
    const data: any[] = Array.isArray(payload)
      ? payload
      : payload?.data ?? payload?.items ?? [];

    const needle = "dossier"; // "Dossiers" -> on matche en minuscules
    return data
      .filter((a) => pickCategory(a).toLowerCase().includes(needle))
      .map((a) => ({ slug: String(a.slug) }))
      .filter((p, i, arr) => arr.findIndex((x) => x.slug === p.slug) === i); // uniq
  } catch {
    return [];
  }
}

// ===== Page : on délègue le rendu à la page article =====
export default async function DossierArticleProxy({
  params,
}: {
  params: { slug: string };
}) {
  // Option de "garde douce" : on tente de charger l'article
  // et on vérifie sa catégorie; en cas d'échec, on laisse afficher la page article.
  try {
    const url = apiUrl(`/articles/${encodeURIComponent(params.slug)}`);
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const raw = await res.text();
    if (res.ok && !/^\s*<!doctype html>|^\s*<html/i.test(raw)) {
      const a = JSON.parse(raw);
      const cat = pickCategory(a).toLowerCase();
      // Si ce n'est pas un "dossier", on n'empêche pas le rendu (pas de breaking change).
      // Pour forcer une 404 ici, décommente :
      // if (!cat.includes("dossier")) notFound();
    }
  } catch {
    // silencieux
  }

  
}

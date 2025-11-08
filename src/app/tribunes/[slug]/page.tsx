// src/app/tribunes/[slug]/page.tsx

import ArticlePage, {
  generateMetadata as baseGenerateMetadata,
} from "../../articles/[slug]/page";

// --- CONFIG PAR DOSSIER ---
const ALIAS = "dossiers"; // mets "interviews" ou "tribunes" selon le dossier
// Heuristique simple: on matche la catégorie en minuscules, forme singulière
const CATEGORY_MATCH = ALIAS.replace(/s$/i, "").toLowerCase(); // "dossiers" -> "dossier"

// On garde exactement les mêmes metadata que la page article
export const generateMetadata = baseGenerateMetadata;

// ⚠️ Next 15 exige des exports *statiques* pour la route-segment-config.
// On ne “forward” plus dynamiquement depuis la page article.
// Choisis des valeurs sûres et statiques :
export const dynamic: "auto" | "force-static" | "force-dynamic" | "error" = "auto";
export const dynamicParams = true;
export const revalidate: number | false = 60;

// ===== Helpers API (identiques à ceux utilisés ailleurs) =====
const trimSlash = (s: string) => s.replace(/\/+$/, "");
const apiRoot = () =>
  trimSlash(
    (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api$/i, "")
  );
const apiUrl = (p: string) =>
  `${apiRoot()}/api${p.startsWith("/") ? "" : "/"}${p}`;

// Récupère un libellé de catégorie quelle que soit la forme (string/objet/tableau)
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

// ===== Pré-render statique ciblé par catégorie (plus efficace) =====
export async function generateStaticParams() {
  try {
    const url = apiUrl("/articles?perPage=200");
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const raw = await res.text();
    if (/^\s*<!doctype html>|^\s*<html/i.test(raw)) return [];

    const payload = JSON.parse(raw);
    const data: any[] = Array.isArray(payload)
      ? payload
      : payload?.data ?? payload?.items ?? [];

    return data
      .filter((a) => pickCategory(a).toLowerCase().includes(CATEGORY_MATCH))
      .map((a) => ({ slug: String(a.slug) }))
      .filter((p, i, arr) => arr.findIndex((x) => x.slug === p.slug) === i); // uniq
  } catch {
    return [];
  }
}

// ===== Page : on délègue le rendu à la page article =====
export default async function CategoryArticleProxy({
  params,
}: {
  params: { slug: string };
}) {
  // Garde douce
  try {
    const url = apiUrl(`/articles/${encodeURIComponent(params.slug)}`);
    await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
  } catch {
    // silencieux
  }

  return <ArticlePage params={params} />;
}

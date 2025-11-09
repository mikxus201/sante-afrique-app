// src/app/interviews/[slug]/page.tsx
import ArticlePage, {
  generateMetadata as baseGenerateMetadata,
} from "../../articles/[slug]/page";

// Garde les mêmes metadata que la page article
export const generateMetadata = baseGenerateMetadata;
// Revalidation statique (OK Next 15)
export const revalidate = 60;

/* ===== Helpers API ===== */
const trimSlash = (s: string) => s.replace(/\/+$/, "");
const apiRoot = () =>
  trimSlash(
    (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api$/i, "")
  );
const apiUrl = (p: string) => `${apiRoot()}/api${p.startsWith("/") ? "" : "/"}${p}`;

// Récupère un libellé de catégorie (string/objet/tableau)
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

// On matche par catégorie "interview"
const CATEGORY_MATCH = "interview";

/* ===== Pré-render statique ciblé par catégorie ===== */
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

/* ===== Page : délègue le rendu à la page article ===== */
export default async function CategoryArticleProxy({
  params,
}: {
  params: { slug: string };
}) {
  try {
    const url = apiUrl(`/articles/${encodeURIComponent(params.slug)}`);
    await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
  } catch {
    // silencieux
  }
  return <ArticlePage params={params} />;
}

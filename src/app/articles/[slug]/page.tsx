// src/app/articles/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShareBar from "@/components/ShareBar";
import ArticleCard from "@/components/ArticleCard";
import { SITE_NAME, absUrl } from "@/lib/site";
import { apiUrl } from "@/lib/api";

/* ========= Types ========= */
type Article = {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string | null;
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
  cover_url?: string | null;
  category?: any; // peut être string ou objet selon l’API
  section?: any;
  rubric?: any;
  rubrique?: any;
  featured?: boolean | number | null;
  views?: number | null;
  published_at?: string | null;
  updated_at?: string | null;
  author?: string | null;
  author_slug?: string | null;
  canonical?: string | null;
  sources?: string[] | null;
  tags?: string[] | null;
  // ajouté par nous :
  category_name?: string;
};

/* --- helpers pour normaliser l'article --- */
function pickCategoryName(a: any): string {
  const c = a?.category ?? a?.section ?? a?.rubric ?? a?.rubrique ?? null;
  if (!c) return "";
  if (typeof c === "string") return c;
  return (c?.name ?? c?.label ?? c?.title ?? "").toString();
}

function normalizeArticlePayload(payload: any): Article {
  const raw = (payload?.data ?? payload ?? {}) as Record<string, any>;
  // on conserve toutes les propriétés d’origine et on rajoute category_name
  return {
    ...(raw as Article),
    category_name: pickCategoryName(raw),
  };
}

/* ========= Helpers ========= */
const trimSlash = (s: string) => s.replace(/\/+$/, "");
const apiRoot = () =>
  trimSlash((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api$/i, ""));

const toImg = (a: Article) => {
  const t = a.image_url || a.cover_url || a.thumbnail_url || a.thumbnail;
  if (!t) return null;
  return /^https?:\/\//i.test(t) ? t : `${apiRoot()}/${String(t).replace(/^\/+/, "").replace(/^public\//i,"")}`;
};


const slugify = (s: string) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");


/* ========= Fetchers ========= */
async function getArticleBySlug(slug: string): Promise<Article | null> {
  const url = apiUrl(`/articles/slug/${encodeURIComponent(slug)}`);
  const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
  const raw = await res.text();
  if (!res.ok) throw new Error(`API ${res.status}: ${raw.slice(0, 400)}`);
  if (/^\s*<!doctype html>|^\s*<html/i.test(raw)) throw new Error("HTML reçu au lieu du JSON");
  const parsed = JSON.parse(raw);
  return normalizeArticlePayload(parsed);
}

async function listRelated(a: Article) {
  const qs = new URLSearchParams();
  qs.set("page", "1");
  qs.set("perPage", "12");
  qs.set("sort", "date");

  const res = await fetch(apiUrl(`/articles?${qs.toString()}`), {
    headers: { Accept: "application/json" },
    cache: "no-store",
    next: { revalidate: 0 },
  }).catch(() => null);

  const payload = await res?.json().catch(() => null);
  const items: any[] = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];

  // Filtre robuste : compare sur le nom normalisé
  const wanted = pickCategoryName(a).trim().toLowerCase();
  const filtered = wanted
    ? items.filter((x) => pickCategoryName(x).trim().toLowerCase() === wanted)
    : items;

  return filtered.filter((x) => x?.slug !== a.slug).slice(0, 6);
}

/* ========= SEO ========= */
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const a = await getArticleBySlug(params.slug).catch(() => null);
  if (!a) return {};
  const title = a.title || "Article";
  const description =
    (a.excerpt || a.body || "")
      .toString()
      .replace(/\s+/g, " ")
      .slice(0, 160) || undefined;
  const canonical = a.canonical || `/articles/${a.slug}`;
  const img = toImg(a);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: img ? [{ url: img, width: 1200, height: 630, alt: a.title }] : undefined,
      publishedTime: a.published_at || undefined,
      modifiedTime: a.updated_at || undefined,
      authors: a.author ? [a.author] : undefined,
      tags: a.tags || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: img ? [img] : undefined,
    },
  };
}

/* ========= Page ========= */
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const a = await getArticleBySlug(params.slug);
  if (!a) notFound();

  const img = toImg(a);
  const canonical = a.canonical || `/articles/${a.slug}`;
  const related = await listRelated(a);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt || undefined,
    image: img ? [img] : undefined,
    author: a.author ? [{ "@type": "Person", name: a.author }] : undefined,
    datePublished: a.published_at || undefined,
    dateModified: a.updated_at || a.published_at || undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": absUrl(canonical) },
  };

      // ↓↓↓ AJOUT : slugs auteur & rubrique pour les liens de filtre
     const authorSlug = a.author_slug || (a.author ? slugify(a.author) : "");
     const catName = a.category_name || pickCategoryName(a);
     const rubriqueSlug = slugify(catName);


  const authorHref = a.author
    ? `/auteurs/${encodeURIComponent(a.author_slug || slugify(a.author))}`
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Fil d’Ariane + retour */}
      <nav className="mb-3 flex items-center gap-2 text-sm text-neutral-600">
        <Link href="/articles" className="underline">
          ← Retour aux articles
        </Link>
        <span className="text-neutral-400">|</span>
        <Link href="/" className="hover:underline">
          Accueil
        </Link>
        <span>›</span>
        <Link href="/articles" className="hover:underline">
          Articles
        </Link>
      </nav>

      {/* Titre + méta */}
      <h1 className="text-3xl font-bold mb-2">{a.title}</h1>
      <div className="text-sm text-neutral-600 mb-4">
        {authorSlug ? (
         <>Par <Link href={`/articles?author=${encodeURIComponent(authorSlug)}`} className="underline">{a.author}</Link></>
         ) : null}
         {catName ? (
    <>
         {" · "}
         Rubrique :{" "}
      <Link href={`/articles?rubrique=${encodeURIComponent(rubriqueSlug)}`} className="underline">
        {catName}
       </Link>
     </>
        ) : null}
       {a.published_at ? <> · {new Date(a.published_at).toLocaleDateString("fr-FR")}</> : null}
       {typeof a.views === "number" ? <> · {a.views} vues</> : null}
    </div>

      {/* Image */}
      {img && (
        <div className="relative w-full aspect-[16/9] bg-neutral-100 mb-6 rounded-lg overflow-hidden">
          <Image src={img} alt={a.title} fill className="object-cover" priority />
        </div>
      )}

      {/* Corps */}
      <article className="prose prose-neutral max-w-none">
        {a.excerpt ? <p className="lead">{a.excerpt}</p> : null}
        {a.body ? <div className="whitespace-pre-wrap">{a.body}</div> : null}
      </article>

      {/* Tags */}
      {Array.isArray(a.tags) && a.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {a.tags.map((t) => (
            <span key={t} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Sources */}
      {Array.isArray(a.sources) && a.sources.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-neutral-800 mb-2">Sources</h3>
          <ul className="list-disc pl-5 text-sm text-neutral-700">
            {a.sources.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Partage */}
      <div className="mt-8">
        <ShareBar title={a.title} url={absUrl(canonical)} />
      </div>

      {/* À lire aussi */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">À lire aussi</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r: any) => (
              <ArticleCard
                key={r.id}
                slug={r.slug}
                title={r.title}
                excerpt={r.excerpt || ""}
                cover={r.thumbnail_url || r.thumbnail || r.image_url || undefined}
                // ← évite l’erreur “Objects are not valid as a React child”
                category={pickCategoryName(r) || undefined}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* Forcer le rendu dynamique (pas de cache) */
export const dynamic = "force-dynamic";
export const revalidate = 0;

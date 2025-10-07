// src/app/les-plus-lus/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import SafeImage from "@/components/SafeImage";
import articlesData from "../../../data/articles.json";
import Pagination from "@/components/Pagination";

type Article = {
  id: string | number;
  title: string;
  href: string;

  // image déjà prête OU variations possibles depuis d'autres sources
  image?: string | null;
  image_url?: string | null;
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  cover?: string | null;
  cover_url?: string | null;
  photo?: string | null;

  excerpt?: string | null;
  category?: string | null;
  publishedAt?: string | null;
  views?: number | null;
};

const ARTICLES: Article[] = (articlesData as any) as Article[];

/* ===== Helpers tri ===== */
const byDateDesc = (a: Article, b: Article) =>
  new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();

const byViewsDesc = (a: Article, b: Article) => (b.views ?? 0) - (a.views ?? 0);

/* ===== Helpers URL image (autonomes) ===== */
const trimSlash = (s: string) => s.replace(/\/+$/, "");
const apiRoot = () =>
  trimSlash(
    (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api$/i, "")
  );
const isAbs = (u: string) => /^https?:\/\//i.test(u);

function toPublicImageUrl(raw?: string | null): string | null {
  if (!raw) return null;
  let p = String(raw).trim().replace(/\\/g, "/");
  if (!p) return null;

  if (isAbs(p)) return p; // déjà absolue

  // nettoie éventuels "/" initiaux et "public/"
  p = p.replace(/^\/+/, "").replace(/^public\//i, "");

  // cas courants Laravel/CDN
  if (/^(storage|uploads|images|img|media)\//i.test(p)) {
    return `${apiRoot()}/${p}`;
  }

  // fallback générique
  return `${apiRoot()}/storage/${p}`;
}

function pickImage(a: Article): string | null {
  return (
    toPublicImageUrl(
      a.image ||
        a.image_url ||
        a.thumbnail_url ||
        a.cover_url ||
        a.thumbnail ||
        a.cover ||
        a.photo ||
        null
    ) || null
  );
}

/* ===== SEO ===== */
export const metadata: Metadata = {
  title: "Les plus lus | Santé Afrique",
  description: "Le classement des articles les plus lus sur Santé Afrique.",
};

export default function MostReadPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const pageSize = 12;
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);

  const supportViews = ARTICLES.some((a) => a.views != null);
  const sorted = ARTICLES.slice().sort(supportViews ? byViewsDesc : byDateDesc);

  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Fil d’Ariane */}
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span className="mx-1">/</span>
        <span>Les plus lus</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-extrabold">Les plus lus</h1>
      <p className="mt-1 text-neutral-600">{total} article{total > 1 ? "s" : ""}</p>

      {items.length === 0 ? (
        <p className="mt-8">Aucun article pour le moment.</p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((a, i) => {
            const absoluteIndex = start + i + 1; // numéro global
            const img = pickImage(a);

            return (
              <li key={a.id} className="group rounded border overflow-hidden bg-white relative">
                {/* badge index */}
                <span className="absolute left-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow">
                  {absoluteIndex}
                </span>

                <Link href={a.href}>
                  <div className="relative h-40 w-full bg-neutral-100">
                    <SafeImage
                      src={img ?? null}
                      alt={a.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs uppercase tracking-wide text-neutral-500">
                      {a.category || ""}
                    </p>
                    <h3 className="mt-1 font-semibold leading-snug line-clamp-2 group-hover:text-blue-700">
                      {a.title}
                    </h3>
                    {a.excerpt && (
                      <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{a.excerpt}</p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination basePath="/les-plus-lus" currentPage={page} pageSize={pageSize} totalItems={total} />
    </div>
  );
}

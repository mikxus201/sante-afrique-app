export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { slugify, normalize } from "@/lib/slugify";
import {
  getJSON,
  pickImage,
  toPublicMediaUrl,
  fetchArticlesByAuthorSlug,
} from "@/lib/api";

/* ======================
   Types
====================== */
type Author = {
  id: number | string;
  name: string;
  slug?: string | null;
  bio?: string | null;
  photo?: string | null;
  photo_url?: string | null;
  active?: boolean | number | null;
};

type UIArticle = {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string | null;
  category?: string | null;
  published_at?: string | null;
  image: string; // URL toujours valide
};

/* ======================
   Fetchers
====================== */
async function fetchAuthorBySlugParam(slugParam: string): Promise<Author | null> {
  // 1) Endpoint direct par slug
  const primaryPaths = [
    `/api/authors/${encodeURIComponent(slugParam)}`,
    `/api/users/${encodeURIComponent(slugParam)}`,
    `/authors/slug/${encodeURIComponent(slugParam)}`,
    `/authors/${encodeURIComponent(slugParam)}`,
  ];
  for (const p of primaryPaths) {
    try {
      const data = await getJSON(p);
      const author = (data as any)?.data ?? (data as any) ?? null;
      if (author) return author as Author;
    } catch {}
  }

  // 2) Fallback : on liste les auteurs et on matche sur name/slug normalisés
  const listPaths = [`/api/authors?perPage=200`, `/authors`, `/api/users?role=author`];
  for (const p of listPaths) {
    try {
      const data = await getJSON(p);
      const arr: any[] = Array.isArray((data as any)?.data)
        ? (data as any).data
        : Array.isArray(data)
        ? (data as any)
        : [];
      const target = slugify(slugParam);
      const found = arr.find(
        (u: any) =>
          slugify(u?.slug) === target ||
          slugify(u?.name || u?.fullname) === target
      );
      if (found) return found as Author;
    } catch {}
  }

  return null;
}

/* ======================
   Page
====================== */
export default async function AuthorPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { page?: string; order?: "recent" | "popular" };
}) {
  const page = Math.max(1, Number(searchParams?.page || "1"));
  const perPage = 12;
  const order = (searchParams?.order as "recent" | "popular") || "recent";

  // Récup auteur robuste
  const author = await fetchAuthorBySlugParam(params.slug);
  if (!author) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold mb-2">Auteur introuvable</h1>
        <p className="text-sm text-neutral-500">
          La page demandée n’existe pas ou l’API n’a pas répondu.
        </p>
        <div className="mt-4">
          <Link href="/articles" className="text-sm underline">
            ← Retour aux articles
          </Link>
        </div>
      </div>
    );
  }

  const authorSlug = author.slug || slugify(author.name);
  const res: any = await fetchArticlesByAuthorSlug(authorSlug, { page, perPage, order });

  // Mapping + normalisation images
  const rawItems: any[] = Array.isArray(res?.items)
    ? res.items
    : Array.isArray(res?.data)
    ? res.data
    : [];
  const items: UIArticle[] = rawItems.map((a: any) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt ?? a.summary ?? "",
    category: a.section?.name ?? a.category?.name ?? a.category ?? "",
    published_at: a.published_at ?? a.date ?? null,
    image: pickImage(a),
  }));

  const hasPrev = page > 1;
  const hasNext = res?.total ? page * perPage < Number(res.total) : items.length === perPage;

  const photo = toPublicMediaUrl(author.photo_url || author.photo);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Fil d’Ariane */}
      <nav className="text-sm text-neutral-500 mb-3">
        <Link href="/" className="hover:underline">Accueil</Link> <span>›</span>{" "}
        <Link href="/articles" className="hover:underline">Articles</Link> <span>›</span>{" "}
        <span className="text-neutral-700">{author.name}</span>
      </nav>

      {/* En-tête auteur */}
      <header className="flex items-start gap-5">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200">
          <SafeImage
            src={photo}
            alt={author.name}
            width={96}
            height={96}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{author.name}</h1>
          {author.bio ? (
            <p className="mt-3 text-neutral-700 leading-relaxed whitespace-pre-wrap">
              {author.bio}
            </p>
          ) : (
            <p className="mt-3 text-neutral-500">Aucune biographie disponible.</p>
          )}
        </div>
      </header>

      {/* Liste des articles */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Articles de {author.name}</h2>

        {items.length === 0 ? (
          <div className="text-sm text-neutral-500">Aucun article pour l’instant.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((a) => (
              <Link
                key={a.id}
                href={`/articles/${a.slug}`}
                className="group rounded-lg border border-neutral-200 overflow-hidden hover:shadow-sm transition"
              >
                <div className="relative w-full h-44 bg-neutral-100">
                  <SafeImage
                    src={a.image}
                    alt={a.title}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform"
                  />
                </div>
                <div className="p-3">
                  <div className="text-xs text-neutral-500 mb-1">
                    {a.category || ""}
                    {a.published_at && (
                      <>
                        {a.category ? " • " : ""}
                        {new Date(a.published_at).toLocaleDateString("fr-FR")}
                      </>
                    )}
                  </div>
                  <h3 className="text-sm font-medium leading-snug group-hover:underline line-clamp-3">
                    {a.title}
                  </h3>
                  {a.excerpt && (
                    <p className="mt-1 text-xs text-neutral-600 line-clamp-2">{a.excerpt}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-neutral-500">
            Page {page}{res?.total ? ` — ${res.total} article(s)` : ""}
          </div>
          <div className="flex gap-2">
            {hasPrev ? (
              <Link href={`/auteurs/${authorSlug}?page=${page - 1}&order=${order}`} className="px-3 py-1 rounded border text-sm hover:bg-neutral-50">
                ← Précédent
              </Link>
            ) : (
              <span className="px-3 py-1 rounded border text-sm text-neutral-400">← Précédent</span>
            )}
            {hasNext ? (
              <Link href={`/auteurs/${authorSlug}?page=${page + 1}&order=${order}`} className="px-3 py-1 rounded border text-sm hover:bg-neutral-50">
                Suivant →
              </Link>
            ) : (
              <span className="px-3 py-1 rounded border text-sm text-neutral-400">Suivant →</span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ======================
   SEO (dynamique)
====================== */
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const a = await fetchAuthorBySlugParam(params.slug);
  if (a) {
    return {
      title: `${a.name} — Santé Afrique`,
      description: `Articles écrits par ${a.name}.`,
    };
  }
  const label = params.slug.replace(/-/g, " ");
  return {
    title: `${label} — Santé Afrique`,
    description: `Articles de ${label}.`,
  };
}

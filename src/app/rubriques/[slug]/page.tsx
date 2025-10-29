export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import Link from "next/link";
import SectionCard from "@/components/SectionCard";
import { toImageUrl } from "@/lib/img";
import { fetchArticlesBySectionSlug, slugify } from "@/lib/api";

/* ---------- Types internes ---------- */
type PageProps = {
  // ✅ Next 15: ces props arrivent comme Promises
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/* ---------- SEO ---------- */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;              // ✅ await
  const sp = await props.searchParams;              // ✅ await

  const norm = slugify(slug);
  const page = Number(sp.page ?? 1);
  const titleName = norm.replace(/-/g, " ");
  const title = `${titleName} | Santé Afrique`;
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const canonical = site ? `${site}/rubriques/${encodeURIComponent(norm)}?page=${page}` : undefined;

  return {
    title,
    description: `Tous les articles de la rubrique “${titleName}”. Page ${page}.`,
    alternates: { canonical },
    openGraph: {
      title,
      description: `Tous les articles de la rubrique “${titleName}”. Page ${page}.`,
      url: canonical,
      siteName: "Santé Afrique",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: `Tous les articles de la rubrique “${titleName}”. Page ${page}.`,
    },
  };
}

/* ---------- Helpers ---------- */
function getQP(sp: Record<string, string | string[] | undefined>) {
  const page = Math.max(1, Number(sp.page ?? 1));
  const perPage = Math.max(1, Number(sp.perPage ?? 12));
  const order = String(sp.order ?? "recent") as "recent" | "popular";
  return { page, perPage, order };
}
function pageHref(base: string, page: number, order: string) {
  return `${base}?page=${page}&order=${order}`;
}

/* ---------- Page ---------- */
export default async function RubriquePage(props: PageProps) {
  const { slug } = await props.params;                  // ✅ await
  const sp = await props.searchParams;                  // ✅ await

  // 1) Slug reçu dans l’URL (peut être "Les Odd", "LES-ODD", etc.)
  const rawSlug = decodeURIComponent(slug ?? "");
  // 2) Slug canonique utilisé pour l’API et pour les liens internes
  const normSlug = slugify(rawSlug);

  const { page, perPage, order } = getQP(sp);

  // 3) Appels API toujours avec le slug normalisé
  const res = await fetchArticlesBySectionSlug(normSlug, { page, perPage, order });

  // 4) Normalisation des items
  const rawItems: any[] = Array.isArray((res as any)?.items)
    ? (res as any).items
    : Array.isArray((res as any)?.data)
    ? (res as any).data
    : [];
  const items = rawItems.map((a: any) => ({
    id: a.id,
    title: a.title,
    href: `/articles/${a.slug}`,
    img: toImageUrl(a),
    excerpt: a.excerpt ?? a.summary ?? "",
  }));

  // 5) Titre & pagination : on dérive aussi du slug normalisé
  const titleName = normSlug.replace(/-/g, " ");
  const basePath = `/rubriques/${encodeURIComponent(normSlug)}`;
  const hasPrev = page > 1;
  const hasNext = (res as any)?.total ? page * perPage < Number((res as any).total) : items.length === perPage;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Fil d’Ariane */}
      <nav className="text-sm text-neutral-500 mb-4">
        <Link href="/" className="hover:underline">Accueil</Link> <span>›</span>{" "}
        <Link href="/articles" className="hover:underline">Articles</Link> <span>›</span>{" "}
        <span className="text-neutral-700 capitalize">{titleName}</span>
      </nav>

      <div className="mb-6 flex items-end justify-between gap-4">
        <h1 className="text-2xl font-extrabold capitalize">{titleName}</h1>
        <div className="flex items-center gap-2 text-sm">
          <span>Tri :</span>
          <Link
            href={pageHref(basePath, 1, "recent")}
            className={`px-2 py-1 rounded border ${order === "recent" ? "bg-neutral-900 text-white" : "bg-white"}`}
          >
            Récents
          </Link>
          <Link
            href={pageHref(basePath, 1, "popular")}
            className={`px-2 py-1 rounded border ${order === "popular" ? "bg-neutral-900 text-white" : "bg-white"}`}
          >
            Les plus lus
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <p>Aucun article disponible dans cette rubrique pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => (
            <SectionCard key={it.id} href={it.href} title={it.title} img={it.img} excerpt={it.excerpt} />
          ))}
        </div>
      )}

      <nav className="mt-8 flex justify-between">
        <div>
          {hasPrev && (
            <Link
              href={pageHref(basePath, page - 1, order)}
              className="px-3 py-2 rounded border hover:bg-neutral-50"
            >
              ← Précédent
            </Link>
          )}
        </div>
        <div>
          {hasNext && (
            <Link
              href={pageHref(basePath, page + 1, order)}
              className="px-3 py-2 rounded border hover:bg-neutral-50"
            >
              Suivant →
            </Link>
          )}
        </div>
      </nav>
    </main>
  );
}

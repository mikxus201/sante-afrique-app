// src/app/dossiers/page.tsx
import Image from "next/image";
import Link from "next/link";

/** Ajuste ce nom EXACT selon ta BDD : "Dossier", "Dossiers", etc. */
const CATEGORY = "Dossiers";

/* ========= Types ========= */
type Article = {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  category?: string | null;
  views?: number | null;
  published_at?: string | null;
};
type Paginator<T> = {
  current_page: number; per_page: number; total: number; last_page: number;
  next_page_url?: string | null; prev_page_url?: string | null; data: T[];
};

/* ========= URL helpers ========= */
const trimSlash = (s: string) => s.replace(/\/+$/, "");
const apiRoot = () => trimSlash((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api$/i, ""));
const apiUrl  = (p: string) => `${apiRoot()}/api${p.startsWith("/") ? "" : "/"}${p}`;
const articleImg = (a: Article) => {
  const t = a.thumbnail_url || a.thumbnail;
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return `${apiRoot()}/${t.replace(/^\/+/, "")}`;
};

/* ========= Fetchers ========= */
async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
  const raw = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${raw.slice(0, 100)}`);
  if (/^\s*<!doctype html>|^\s*<html/i.test(raw)) throw new Error("HTML returned");
  return JSON.parse(raw) as T;
}
async function fetchArticles(params: { page: number; sort: string; q?: string; perPage?: number }) {
  const q = new URLSearchParams();
  q.set("page", String(params.page));
  q.set("sort", params.sort === "views" ? "views" : "date");
  q.set("category", CATEGORY);
  if (params.q) q.set("search", params.q);
  q.set("perPage", String(params.perPage ?? 12));
  return fetchJSON<Paginator<Article>>(apiUrl(`/articles?${q.toString()}`));
}

/* ========= Page ========= */
export const metadata = {
  title: `Dossiers — Santé Afrique`,
  description: "Tous nos dossiers thématiques.",
};

export default async function DossiersPage({
  searchParams,
}: { searchParams?: { page?: string; sort?: string; q?: string } }) {
  const page = Math.max(1, Number(searchParams?.page || "1"));
  const sort = searchParams?.sort === "views" ? "views" : "date";
  const q    = (searchParams?.q || "").trim() || undefined;

  const paginator = await fetchArticles({ page, sort, q, perPage: 12 });

  const buildHref = (over: Partial<{ page: number; sort: string; q?: string }>) => {
    const qp = new URLSearchParams();
    qp.set("page", String(over.page ?? page));
    qp.set("sort", over.sort ?? sort);
    if (typeof (over.q ?? q) !== "undefined" && (over.q ?? q)) qp.set("q", String(over.q ?? q));
    const s = qp.toString();
    return s ? `/dossiers?${s}` : `/dossiers`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="text-sm text-neutral-500 mb-4">
        <Link href="/" className="hover:underline">Accueil</Link> <span>›</span>{" "}
        <span className="text-neutral-700">Dossiers</span>
      </nav>

      <header className="flex items-end justify-between gap-4 mb-5">
        <h1 className="text-2xl font-bold">Dossiers</h1>
        <form method="GET" action="/dossiers" className="flex items-center gap-2">
          <input type="hidden" name="sort" defaultValue={sort} />
          <input name="q" defaultValue={q ?? ""} placeholder="Rechercher…" className="h-9 rounded border px-3 text-sm" />
          <button className="h-9 px-3 rounded border text-sm hover:bg-neutral-50" type="submit">Chercher</button>
        </form>
      </header>

      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-neutral-600">Trier :</span>
        <Link href={buildHref({ page: 1, sort: "date" })}  className={`text-sm px-2 py-1 rounded border ${sort==="date"  ? "bg-neutral-100":"hover:bg-neutral-50"}`}>Récents</Link>
        <Link href={buildHref({ page: 1, sort: "views" })} className={`text-sm px-2 py-1 rounded border ${sort==="views" ? "bg-neutral-100":"hover:bg-neutral-50"}`}>Les plus lus</Link>
      </div>

      {paginator.data.length === 0 ? (
        <div className="text-sm text-neutral-500">Aucun dossier trouvé (assure-toi que la catégorie exacte est “{CATEGORY}”).</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginator.data.map(a => {
            const img = articleImg(a);
            return (
              <Link key={a.id} href={`/articles/${a.slug}`} className="group rounded-lg border border-neutral-200 overflow-hidden hover:shadow-sm transition">
                <div className="relative w-full h-44 bg-neutral-100">
                  {img && <Image src={img} alt={a.title} fill className="object-cover group-hover:scale-[1.02] transition-transform" />}
                </div>
                <div className="p-3">
                  <div className="text-xs text-neutral-500 mb-1">
                    {a.category || ""}{a.published_at ? <> {a.category ? "• ":""}{new Date(a.published_at).toLocaleDateString("fr-FR")}</> : null}
                  </div>
                  <h3 className="text-sm font-medium leading-snug group-hover:underline line-clamp-3">{a.title}</h3>
                  {a.excerpt ? <p className="mt-1 text-xs text-neutral-600 line-clamp-2">{a.excerpt}</p> : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {paginator.last_page > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-neutral-500">Page {paginator.current_page} / {paginator.last_page} — {paginator.total} dossiers</div>
          <div className="flex gap-2">
            {paginator.current_page > 1
              ? <Link href={buildHref({ page: paginator.current_page - 1 })} className="px-3 py-1 rounded border text-sm hover:bg-neutral-50">← Précédent</Link>
              : <span className="px-3 py-1 rounded border text-sm text-neutral-400">← Précédent</span>}
            {paginator.current_page < paginator.last_page
              ? <Link href={buildHref({ page: paginator.current_page + 1 })} className="px-3 py-1 rounded border text-sm hover:bg-neutral-50">Suivant →</Link>
              : <span className="px-3 py-1 rounded border text-sm text-neutral-400">Suivant →</span>}
          </div>
        </div>
      )}
    </div>
  );
}

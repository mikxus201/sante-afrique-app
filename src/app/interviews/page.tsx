// src/app/interviews/page.tsx
import Link from "next/link";
import SafeImage from "@/components/SafeImage";

/** Ajuste ce nom EXACT selon ta BDD : "Interview", "Interviews", etc. */
const CATEGORY = "Interview";

type Article = {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string | null;

  // variations possibles côté API
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  image?: string | null;
  image_url?: string | null;
  cover?: string | null;
  cover_url?: string | null;
  photo?: string | null;

  category?: string | null;
  section?: { name?: string | null } | null;
  rubrique?: { name?: string | null } | null;

  views?: number | null;
  published_at?: string | null;
};

type Paginator<T> = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  next_page_url?: string | null;
  prev_page_url?: string | null;
  data: T[];
};

/* =========== Helpers URL/Images =========== */
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
  if (isAbs(p)) return p;

  // nettoie "/" initiaux & "public/"
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
      a.image_url ||
        a.thumbnail_url ||
        a.cover_url ||
        a.image ||
        a.thumbnail ||
        a.cover ||
        a.photo ||
        null
    ) || null
  );
}

function pickCategory(a: Article): string {
  return (a.category || a.section?.name || a.rubrique?.name || "") as string;
}

/* =========== Fetchers =========== */
async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
  const raw = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${raw.slice(0, 100)}`);
  if (/^\s*<!doctype html>|^\s*<html/i.test(raw)) throw new Error("HTML returned");
  return JSON.parse(raw) as T;
}

const apiUrl = (p: string) => `${apiRoot()}/api${p.startsWith("/") ? "" : "/"}${p}`;

async function fetchArticles(params: {
  page: number;
  sort: string;
  q?: string;
  perPage?: number;
}) {
  const q = new URLSearchParams();
  q.set("page", String(params.page));
  q.set("sort", params.sort === "views" ? "views" : "date");
  q.set("category", CATEGORY);
  if (params.q) q.set("search", params.q);
  q.set("perPage", String(params.perPage ?? 12));
  return fetchJSON<Paginator<Article>>(apiUrl(`/articles?${q.toString()}`));
}

/* =========== SEO =========== */
export const metadata = {
  title: `Interviews — Santé Afrique`,
  description: "Entretiens et paroles d’experts.",
};

/* =========== Page =========== */
export default async function InterviewsPage({
  searchParams,
}: {
  searchParams?: { page?: string; sort?: string; q?: string };
}) {
  const page = Math.max(1, Number(searchParams?.page || "1"));
  const sort = searchParams?.sort === "views" ? "views" : "date";
  const q = (searchParams?.q || "").trim() || undefined;

  const paginator = await fetchArticles({ page, sort, q, perPage: 12 });

  const buildHref = (over: Partial<{ page: number; sort: string; q?: string }>) => {
    const qp = new URLSearchParams();
    qp.set("page", String(over.page ?? page));
    qp.set("sort", over.sort ?? sort);
    if (typeof (over.q ?? q) !== "undefined" && (over.q ?? q)) qp.set("q", String(over.q ?? q));
    const s = qp.toString();
    return s ? `/interviews?${s}` : `/interviews`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="text-sm text-neutral-500 mb-4">
        <Link href="/" className="hover:underline">
          Accueil
        </Link>{" "}
        <span>›</span>{" "}
        <span className="text-neutral-700">Interviews</span>
      </nav>

      <header className="flex items-end justify-between gap-4 mb-5">
        <h1 className="text-2xl font-bold">Interviews</h1>
        <form method="GET" action="/interviews" className="flex items-center gap-2">
          <input type="hidden" name="sort" defaultValue={sort} />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Rechercher…"
            className="h-9 rounded border px-3 text-sm"
          />
          <button className="h-9 px-3 rounded border text-sm hover:bg-neutral-50" type="submit">
            Chercher
          </button>
        </form>
      </header>

      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-neutral-600">Trier :</span>
        <Link
          href={buildHref({ page: 1, sort: "date" })}
          className={`text-sm px-2 py-1 rounded border ${
            sort === "date" ? "bg-neutral-100" : "hover:bg-neutral-50"
          }`}
        >
          Récents
        </Link>
        <Link
          href={buildHref({ page: 1, sort: "views" })}
          className={`text-sm px-2 py-1 rounded border ${
            sort === "views" ? "bg-neutral-100" : "hover:bg-neutral-50"
          }`}
        >
          Les plus lus
        </Link>
      </div>

      {paginator.data.length === 0 ? (
        <div className="text-sm text-neutral-500">
          Aucune interview trouvée (vérifie le nom exact “{CATEGORY}”).
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginator.data.map((a) => {
            const img = pickImage(a);
            const cat = pickCategory(a);
            return (
              <Link
                key={a.id}
                href={`/articles/${a.slug}`}
                className="group rounded-lg border border-neutral-200 overflow-hidden hover:shadow-sm transition"
              >
                <div className="relative w-full h-44 bg-neutral-100">
                  <SafeImage
                    src={img ?? null}
                    alt={a.title}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-3">
                  <div className="text-xs text-neutral-500 mb-1">
                    {cat}
                    {a.published_at ? (
                      <>
                        {cat ? " • " : ""}
                        {new Date(a.published_at).toLocaleDateString("fr-FR")}
                      </>
                    ) : null}
                  </div>
                  <h3 className="text-sm font-medium leading-snug group-hover:underline line-clamp-3">
                    {a.title}
                  </h3>
                  {a.excerpt ? (
                    <p className="mt-1 text-xs text-neutral-600 line-clamp-2">{a.excerpt}</p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {paginator.last_page > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-neutral-500">
            Page {paginator.current_page} / {paginator.last_page} — {paginator.total} interviews
          </div>
          <div className="flex gap-2">
            {paginator.current_page > 1 ? (
              <Link
                href={buildHref({ page: paginator.current_page - 1 })}
                className="px-3 py-1 rounded border text-sm hover:bg-neutral-50"
              >
                ← Précédent
              </Link>
            ) : (
              <span className="px-3 py-1 rounded border text-sm text-neutral-400">← Précédent</span>
            )}
            {paginator.current_page < paginator.last_page ? (
              <Link
                href={buildHref({ page: paginator.current_page + 1 })}
                className="px-3 py-1 rounded border text-sm hover:bg-neutral-50"
              >
                Suivant →
              </Link>
            ) : (
              <span className="px-3 py-1 rounded border text-sm text-neutral-400">Suivant →</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

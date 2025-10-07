// src/app/auteurs/page.tsx
import Image from "next/image";
import Link from "next/link";

/* ========= Types ========= */
type Author = {
  id: number | string;
  name: string;
  slug: string;
  bio?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
};

type Paginator<T> = {
  current_page: number; per_page: number; total: number; last_page: number;
  next_page_url?: string | null; prev_page_url?: string | null; data: T[];
};

/* ========= URL helpers ========= */
const trimSlash = (s: string) => s.replace(/\/+$/, "");
const apiRoot = () =>
  trimSlash((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api$/i, ""));
const apiUrl = (p: string) => `${apiRoot()}/api${p.startsWith("/") ? "" : "/"}${p}`;

const toImg = (a: Author) => {
  const t = a.avatar_url || a.avatar;
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return `${apiRoot()}/${t.replace(/^\/+/, "")}`;
};

/* ========= Fetchers ========= */
async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
  const raw = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${raw.slice(0, 120)}`);
  if (/^\s*<!doctype html>|^\s*<html/i.test(raw)) throw new Error("HTML returned from API");
  return JSON.parse(raw) as T;
}

async function listAuthors(params: { page: number; q?: string; perPage?: number }) {
  const q = new URLSearchParams();
  q.set("page", String(params.page));
  if (params.q) q.set("search", params.q);
  q.set("perPage", String(params.perPage ?? 24));
  // Supporte /api/authors qui renvoie soit un tableau, soit un paginator { data: [...] }
  const payload = await fetchJSON<any>(apiUrl(`/authors?${q.toString()}`));
  const data: Author[] = Array.isArray(payload) ? payload : payload?.data ?? [];
  const paginator: Paginator<Author> = Array.isArray(payload)
    ? { current_page: 1, per_page: data.length, total: data.length, last_page: 1, data }
    : payload;
  return paginator;
}

/* ========= Page ========= */
export const metadata = {
  title: "Auteurs — Santé Afrique",
  description: "La rédaction et nos contributeurs.",
};

export default async function AuthorsIndex({
  searchParams,
}: {
  searchParams?: { page?: string; q?: string };
}) {
  const page = Math.max(1, Number(searchParams?.page || "1"));
  const q = (searchParams?.q || "").trim() || undefined;

  const paginator = await listAuthors({ page, q, perPage: 24 });

  const buildHref = (over: Partial<{ page: number; q?: string }>) => {
    const qp = new URLSearchParams();
    qp.set("page", String(over.page ?? page));
    if (typeof (over.q ?? q) !== "undefined" && (over.q ?? q)) qp.set("q", String(over.q ?? q));
    const s = qp.toString();
    return s ? `/auteurs?${s}` : `/auteurs`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="text-sm text-neutral-500 mb-4">
        <Link href="/" className="hover:underline">Accueil</Link> <span>›</span>{" "}
        <span className="text-neutral-700">Auteurs</span>
      </nav>

      <header className="flex items-end justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Auteurs</h1>
        <form method="GET" action="/auteurs" className="flex items-center gap-2">
          <input name="q" defaultValue={q ?? ""} placeholder="Rechercher un auteur…" className="h-9 rounded border px-3 text-sm" />
          <button className="h-9 px-3 rounded border text-sm hover:bg-neutral-50" type="submit">Chercher</button>
        </form>
      </header>

      {paginator.data.length === 0 ? (
        <div className="text-sm text-neutral-500">Aucun auteur trouvé.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {paginator.data.map(a => {
            const img = toImg(a);
            return (
              <Link key={a.id} href={`/auteurs/${a.slug}`} className="group">
                <div className="mx-auto w-24 h-24 rounded-full overflow-hidden bg-neutral-100 ring-1 ring-neutral-200">
                  {img && <Image src={img} alt={a.name} width={96} height={96} className="w-full h-full object-cover" />}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium group-hover:underline">{a.name}</div>
                  {a.bio ? <div className="text-xs text-neutral-500 line-clamp-2">{a.bio}</div> : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {paginator.last_page > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-neutral-500">
            Page {paginator.current_page} / {paginator.last_page} — {paginator.total} auteur(s)
          </div>
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

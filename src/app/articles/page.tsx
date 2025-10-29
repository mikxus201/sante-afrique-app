// src/app/articles/page.tsx
import Image from "next/image";
import Link from "next/link";

/* ========= Types ========= */
type Article = {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string | null;

  // l’API peut renvoyer l’un ou l’autre selon les endpoints :
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  image?: string | null;
  image_url?: string | null;
  cover?: string | null;
  cover_url?: string | null;
  photo?: string | null;

  category?: string | null;
  // parfois c’est un objet: section/category/rubrique
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

/* ========= URL helpers ========= */
const trimSlash = (s: string) => s.replace(/\/+$/, "");
const apiRoot = () =>
  trimSlash(
    (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api$/i, "")
  );
const apiUrl = (p: string) => `${apiRoot()}/api${p.startsWith("/") ? "" : "/"}${p}`;

const isAbsUrl = (u: string) => /^https?:\/\//i.test(u);

/** Normalise un chemin d’image en URL publique exploitable */
function toPublicImageUrl(raw?: string | null): string | null {
  if (!raw) return null;

  let p = String(raw).trim().replace(/\\/g, "/");
  if (!p) return null;

  // déjà absolue
  if (isAbsUrl(p)) return p;

  // retirer éventuel "public/"
  p = p.replace(/^\/+/, "").replace(/^public\//i, "");

  // chemins Laravel courants
  if (/^(storage|uploads|images|img|media)\//i.test(p)) {
    return `${apiRoot()}/${p}`;
  }

  // fallback générique: on suppose que c’est un chemin relatif vers le storage public
  return `${apiRoot()}/storage/${p}`;
}

/** Sélectionne le meilleur champ image renvoyé par l’API */
function pickImage(a: Article): string | null {
  const src =
    a.thumbnail_url ||
    a.image_url ||
    a.cover_url ||
    a.thumbnail ||
    a.image ||
    a.cover ||
    a.photo ||
    null;
  return toPublicImageUrl(src);
}

/** Catégorie “lisible” même si l’API renvoie un objet */
// Safe helper: ALWAYS returns a string
function pickCategory(a: any): string {
  // pick the “category-ish” source from various shapes
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
    if (Array.isArray(v)) return toText(v[0]); // take first if array
    if (typeof v === "object") {
      const cand =
        v.name ??
        v.label ??
        v.title ??
        v.slug ??
        // fallback: first string value inside the object
        Object.values(v).find((x) => typeof x === "string") ??
        "";
      return String(cand);
    }
    return String(v);
  };

  return toText(src);
}

const slugify = (s: string) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/* ========= Fetchers ========= */
async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
  const raw = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${raw.slice(0, 120)}`);
  if (/^\s*<!doctype html>|^\s*<html/i.test(raw)) throw new Error("HTML returned from API");
  return JSON.parse(raw) as T;
}

async function listArticles(params: {
  page: number;
  sort: string;
  q?: string;
  perPage?: number;
  authorSlug?: string;
  rubriqueSlug?: string;
}) {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("sort", params.sort === "views" ? "views" : "date");
  if (params.q) sp.set("search", params.q);
  sp.set("perPage", String(params.perPage ?? 12));
  if (params.authorSlug) sp.set("author", params.authorSlug);     // <<< NOUVEAU
  if (params.rubriqueSlug) sp.set("rubrique", params.rubriqueSlug); // <<< NOUVEAU

  const payload = await fetchJSON<any>(apiUrl(`/articles?${sp.toString()}`));

  // Uniformisation Paginator/array
  let paginator: Paginator<Article>;
  if (Array.isArray(payload)) {
    paginator = {
      current_page: 1,
      per_page: payload.length,
      total: payload.length,
      last_page: 1,
      data: payload as Article[],
    };
  } else {
    paginator = payload as Paginator<Article>;
  }

  // 🛟 Fallback: si l'API n'a pas filtré, on filtre côté client (meilleur-effort)
if (params.authorSlug || params.rubriqueSlug) {
  const normCat = (a: any) => {
    const v =
      a?.category_name ??
      a?.rubrique_name ??
      a?.section_name ??
      a?.category?.name ??
      a?.section?.name ??
      a?.rubrique?.name ??
      a?.rubric?.name ??
      a?.category ??
      a?.section ??
      a?.rubrique ??
      a?.rubric ??
      "";
    return slugify(v);
  };

  const normAuthor = (a: any) =>
    slugify(a?.author_slug ?? a?.author ?? "");

  const filtered = paginator.data.filter((a) => {
    const okA = !params.authorSlug || normAuthor(a) === params.authorSlug;
    const okC = !params.rubriqueSlug || normCat(a) === params.rubriqueSlug;
    return okA && okC;
  });

    paginator = {
      ...paginator,
      total: filtered.length,
      per_page: Math.min(paginator.per_page, filtered.length),
      last_page: 1, // côté client on n'a pas la vraie pagination filtrée
      current_page: 1,
      data: filtered.slice(0, paginator.per_page),
    };
  }

  return paginator;
}

/* ========= SEO ========= */
export const metadata = {
  title: "Tous les articles — Santé Afrique",
  description: "Tous nos contenus, avec recherche, tri et pagination.",
};

/* ========= Page ========= */
export default async function ArticlesIndex({
  searchParams,
}: {
  searchParams?: { page?: string; sort?: string; q?: string; author?: string; rubrique?: string }; // <<< étend ici
}) {
  const page = Math.max(1, Number(searchParams?.page || "1"));
  const sort = searchParams?.sort === "views" ? "views" : "date";
  const q = (searchParams?.q || "").trim() || undefined;

  // <<< NOUVEAU
  const authorSlug = typeof searchParams?.author === "string" ? searchParams!.author.trim().toLowerCase() : "";
  const rubriqueSlug = typeof searchParams?.rubrique === "string" ? searchParams!.rubrique.trim().toLowerCase() : "";

  const paginator = await listArticles({
    page,
    sort,
    q,
    perPage: 12,
    authorSlug: authorSlug || undefined,
    rubriqueSlug: rubriqueSlug || undefined,
  });

  const buildHref = (over: Partial<{ page: number; sort: string; q?: string }>) => {
    const qp = new URLSearchParams();
    qp.set("page", String(over.page ?? page));
    qp.set("sort", over.sort ?? sort);
    if (typeof (over.q ?? q) !== "undefined" && (over.q ?? q)) qp.set("q", String(over.q ?? q));
    // <<< conserve les filtres actifs
    if (authorSlug) qp.set("author", authorSlug);
    if (rubriqueSlug) qp.set("rubrique", rubriqueSlug);
    const s = qp.toString();
    return s ? `/articles?${s}` : `/articles`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Fil d’ariane */}
      <nav className="text-sm text-neutral-500 mb-4">
        <Link href="/" className="hover:underline">Accueil</Link> <span>›</span>{" "}
        <span className="text-neutral-700">Tous les articles</span>
      </nav>

      {/* En-tête + recherche */}
      <header className="flex items-end justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Tous les articles</h1> 
           {(authorSlug || rubriqueSlug) && (
           <div className="text-sm text-neutral-600">
            Filtre actif :
          {authorSlug && <> auteur = <strong>{authorSlug}</strong></>}
          {authorSlug && rubriqueSlug && " ; "}
          {rubriqueSlug && <> rubrique = <strong>{rubriqueSlug}</strong></>}
             {" "}
           <Link href="/articles" className="underline ml-1">Retirer le filtre</Link>
          </div>
           )}
        <form method="GET" action="/articles" className="flex items-center gap-2">
          <input type="hidden" name="sort" defaultValue={sort} />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Rechercher un article…"
            className="h-9 rounded border px-3 text-sm"
          />
          <button className="h-9 px-3 rounded border text-sm hover:bg-neutral-50" type="submit">
            Chercher
          </button>
        </form>
      </header>

      {/* Tri */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-neutral-600">Trier :</span>
        <Link
          href={buildHref({ page: 1, sort: "date" })}
          className={`text-sm px-2 py-1 rounded border ${sort === "date" ? "bg-neutral-100" : "hover:bg-neutral-50"}`}
        >
          Récents
        </Link>
        <Link
          href={buildHref({ page: 1, sort: "views" })}
          className={`text-sm px-2 py-1 rounded border ${sort === "views" ? "bg-neutral-100" : "hover:bg-neutral-50"}`}
        >
          Les plus lus
        </Link>
      </div>

      {/* Liste */}
      {paginator.data.length === 0 ? (
        <div className="text-sm text-neutral-500">Aucun article trouvé.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginator.data.map((a) => {
            const img = pickImage(a); // <<< clé
            const cat = pickCategory(a);
            return (
              <Link
                key={a.id}
                href={`/articles/${a.slug}`}
                className="group rounded-lg border border-neutral-200 overflow-hidden hover:shadow-sm transition"
              >
                <div className="relative w-full h-44 bg-neutral-100">
                  <Image
                    src={img || "/placeholder.jpg"} // fallback propre
                    alt={a.title}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform"
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                  />
                </div>
              <div className="p-3">
                  <div className="text-xs text-neutral-500 mb-1">
                    {cat ? (
                     <Link
                       href={`/articles?rubrique=${encodeURIComponent(slugify(cat))}`}
                       className="hover:underline"
                 >
                      {cat}
                     </Link>
                     ) : null}
                     {a.published_at && (
                     <>
                       {cat ? " • " : ""}
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
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {paginator.last_page > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-neutral-500">
            Page {paginator.current_page} / {paginator.last_page} — {paginator.total} article(s)
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

// src/app/recherche/page.tsx
import Link from "next/link";
import Image from "next/image";
import articlesData from "../../../data/articles.json";
import Pagination from "@/components/Pagination";

export const metadata = {
  title: "Recherche | Santé Afrique",
  description: "Recherchez un article sur Santé Afrique.",
};

type Article = {
  id: string | number;
  title: string;
  href: string;
  image?: string;
  excerpt?: string;
  category?: string;
  publishedAt?: string;
};

const ARTICLES: Article[] = (articlesData as any) as Article[];

const byDateDesc = (a: Article, b: Article) =>
  new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();

const norm = (s?: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function Page({
  searchParams,
}: {
  searchParams?: { q?: string; page?: string };
}) {
  const q = (searchParams?.q || "").trim();
  const pageSize = 12;
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);

  const results = q
    ? ARTICLES.filter((a) => {
        const hay = `${a.title} ${a.excerpt || ""} ${a.category || ""}`;
        return norm(hay).includes(norm(q));
      }).sort(byDateDesc)
    : [];

  const total = results.length;
  const start = (page - 1) * pageSize;
  const items = results.slice(start, start + pageSize);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Fil d’Ariane */}
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span className="mx-1">/</span>
        <span>Recherche</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-extrabold">Recherche</h1>

      {/* Formulaire GET */}
      <form className="mt-4 flex gap-2" action="/recherche" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Tapez un mot-clé…"
          className="w-full rounded border px-3 py-2"
        />
        <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:brightness-95">
          Rechercher
        </button>
      </form>

      {!q ? (
        <p className="mt-6 text-neutral-600">
          Saisissez un mot-clé (ex. “vaccination”, “nutrition”, “pédiatrie”…)
        </p>
      ) : (
        <>
          <p className="mt-6 text-neutral-600">
            {total} résultat{total > 1 ? "s" : ""} pour « {q} »
          </p>

          {items.length === 0 ? (
            <p className="mt-4">Aucun résultat sur cette page.</p>
          ) : (
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((a) => (
                <li key={a.id} className="group rounded border overflow-hidden bg-white">
                  <Link href={a.href}>
                    <div className="relative h-40 w-full">
                      {a.image ? (
                        <Image
                          src={a.image}
                          alt={a.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-neutral-200" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs uppercase tracking-wide text-neutral-500">{a.category}</p>
                      <h3 className="mt-1 font-semibold leading-snug line-clamp-2 group-hover:text-blue-700">
                        {a.title}
                      </h3>
                      {a.excerpt && (
                        <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{a.excerpt}</p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Pagination
            basePath="/recherche"
            currentPage={page}
            pageSize={pageSize}
            totalItems={total}
          />
        </>
      )}
    </div>
  );
}

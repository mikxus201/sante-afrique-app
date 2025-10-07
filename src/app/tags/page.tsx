// src/app/tags/page.tsx
import Link from "next/link";
import articlesData from "../../../data/articles.json";

type Article = { tags?: string[] };
const ARTICLES: Article[] = (articlesData as any) as Article[];

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const metadata = {
  title: "Tous les tags | Santé Afrique",
  description: "Index des tags utilisés sur Santé Afrique.",
};

export default function TagsIndexPage() {
  const map = new Map<string, { slug: string; count: number }>();
  for (const a of ARTICLES) {
    for (const t of a.tags || []) {
      const slug = slugify(t);
      const key = t.trim();
      const prev = map.get(key);
      map.set(key, { slug, count: (prev?.count || 0) + 1 });
    }
  }
  const entries = Array.from(map.entries()).sort((a, b) =>
    a[0].localeCompare(b[0], "fr", { sensitivity: "base" })
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span className="mx-1">/</span>
        <span>Tags</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-extrabold">Tous les tags</h1>
      <p className="mt-1 text-neutral-600">{entries.length} tag{entries.length > 1 ? "s" : ""}</p>

      {entries.length === 0 ? (
        <p className="mt-6">Aucun tag pour le moment.</p>
      ) : (
        <ul className="mt-6 flex flex-wrap gap-2">
          {entries.map(([label, { slug, count }]) => (
            <li key={label}>
              <Link href={`/tags/${slug}`} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm hover:bg-neutral-50">
                <span>#{label}</span>
                <span className="text-xs text-neutral-500">{count}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// src/app/tags/[tag]/page.tsx
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import articlesData from "../../../../data/articles.json";

type Article = {
  id: string | number;
  title: string;
  href: string;
  image?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  publishedAt?: string;
};

const ARTICLES: Article[] = (articlesData as any) as Article[];

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const allTags = Array.from(
  new Set(
    ARTICLES.flatMap((a) => (a.tags || []).map((t) => slugify(t)))
  )
);

export async function generateStaticParams() {
  return allTags.slice(0, 200).map((t) => ({ tag: t }));
}

type Props = { params: { tag: string } };

function findDisplayName(slug: string) {
  // récupère l’orthographe d’origine du tag
  for (const a of ARTICLES) {
    for (const t of a.tags || []) {
      if (slugify(t) === slug) return t;
    }
  }
  return slug.replace(/-/g, " ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = findDisplayName(params.tag);
  return {
    title: `Tag : ${name} | Santé Afrique`,
    description: `Articles associés au tag “${name}”.`,
  };
}

export default function TagPage({ params }: Props) {
  const tagSlug = params.tag;
  const name = findDisplayName(tagSlug);

  const items = ARTICLES.filter((a) => (a.tags || []).some((t) => slugify(t) === tagSlug));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Tag : ${name}`,
    itemListElement: items.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: a.href,
      item: { "@type": "Article", headline: a.title, url: a.href, image: a.image },
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span className="mx-1">/</span>
        <Link href="/tags" className="hover:underline">Tags</Link>
        <span className="mx-1">/</span>
        <span>#{name}</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-extrabold">#{name}</h1>
      <p className="mt-1 text-neutral-600">{items.length} article{items.length > 1 ? "s" : ""}</p>

      {items.length === 0 ? (
        <p className="mt-8">Aucun article pour ce tag pour le moment.</p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((a) => (
            <li key={a.id} className="group rounded border overflow-hidden bg-white">
              <Link href={a.href}>
                <div className="relative h-40 w-full">
                  {a.image ? (
                    <Image src={a.image} alt={a.title} fill className="object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full bg-neutral-200" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs uppercase tracking-wide text-neutral-500">{a.category}</p>
                  <h3 className="mt-1 font-semibold leading-snug line-clamp-2 group-hover:text-blue-700">{a.title}</h3>
                  {a.excerpt && <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{a.excerpt}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}

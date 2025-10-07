// src/components/OthersList.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SafeImage from "@/components/SafeImage";

type Article = {
  id: string;
  title: string;
  excerpt?: string;
  image?: string | null; // ← tolérant
  href: string;
  category?: string;
};

type Props = { items: Article[]; perPage?: number; title?: string };

export default function OthersList({ items, perPage = 6, title = "Nos autres articles" }: Props) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const pageItems = useMemo(
    () => items.slice((page - 1) * perPage, (page - 1) * perPage + perPage),
    [items, page, perPage]
  );

  if (!items?.length) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-extrabold">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pageItems.map((a) => (
          <Link
            key={a.id}
            href={a.href}
            className="group grid grid-cols-[140px,1fr] gap-4 rounded-lg border p-3 hover:shadow transition"
          >
            <div className="relative h-[92px] w-full rounded overflow-hidden bg-neutral-100">
              <SafeImage
                src={a.image ?? null}
                alt={a.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                sizes="(max-width:768px) 40vw, 20vw"
              />
            </div>
            <div>
              {a.category && <p className="text-xs text-neutral-500">{a.category}</p>}
              <h3 className="font-semibold group-hover:text-blue-700">{a.title}</h3>
              {a.excerpt && (
                <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{a.excerpt}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 pt-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 rounded border text-sm hover:bg-neutral-50 disabled:opacity-40"
          disabled={page === 1}
        >
          ← Précédent
        </button>

        {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => setPage(n)}
            className={`h-8 w-8 rounded border text-sm ${
              page === n ? "bg-blue-600 text-white" : "hover:bg-neutral-50"
            }`}
          >
            {n}
          </button>
        ))}

        <button
          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          className="px-3 py-1 rounded border text-sm hover:bg-neutral-50 disabled:opacity-40"
          disabled={page === pageCount}
        >
          Suivant →
        </button>
      </div>
    </section>
  );
}

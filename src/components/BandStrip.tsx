// src/components/BandStrip.tsx
"use client";

import Link from "next/link";
import SafeImage from "@/components/SafeImage";

type Article = {
  id: string | number;
  title: string;
  href: string;
  image?: string | null; // tolérant
  excerpt?: string;
  category?: string;
  publishedAt?: string;
};

type Props = {
  title: string;
  items: Article[];
  seeAllHref?: string;
  /** lg: grande 280x180, md: 192x128, sm: 160x112 */
  size?: "lg" | "md" | "sm";
};

export default function BandStrip({ title, items, seeAllHref, size = "md" }: Props) {
  if (!items?.length) return null;

  const sizeClass =
    size === "lg" ? "w-[280px] h-[180px]" : size === "sm" ? "w-40 h-28" : "w-48 h-32";

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xl font-extrabold">{title}</h2>
        {seeAllHref && (
          <Link href={seeAllHref} className="text-sm text-blue-600 hover:underline">
            Voir tout
          </Link>
        )}
      </div>

      <div className="divide-y divide-neutral-200">
        {items.map((a) => (
          <Link key={a.id} href={a.href} className="group flex gap-4 py-5 hover:bg-neutral-50">
            <div className={`relative ${sizeClass} flex-shrink-0 overflow-hidden rounded bg-neutral-100`}>
              <SafeImage
                src={a.image ?? null}
                alt={a.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>

            <div className="flex-1">
              {a.category && (
                <p className="text-[11px] uppercase tracking-wide mb-1 text-neutral-500">
                  {a.category}
                </p>
              )}
              <h3 className="text-[16px] font-semibold leading-snug group-hover:text-blue-700">
                {a.title}
              </h3>
              {a.excerpt && (
                <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{a.excerpt}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// src/components/PairStrip.tsx
import Link from "next/link";
import type { ReactNode } from "react";
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

type SizeToken = "lg" | "md" | "sm";

type Props = {
  title: string;
  items: Article[];
  seeAllHref?: string;
  cols?: 2 | 3 | 4;
  pattern?: SizeToken[]; // ex: ["lg","sm","sm"]
  /** Ex: "1-2" => 1 grande, 2 petites */
  patten?: string; // (orthographe voulue – compat)
  bigVariant?: "image-top" | "image-left";
  showIndex?: boolean;
  indexVariant?: "pill" | "left";
  className?: string;
};

function SectionTitle({ children, href }: { children: ReactNode; href?: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between">
      <h2 className="text-xl font-extrabold">{children}</h2>
      {href && (
        <Link href={href} className="text-sm text-blue-600 hover:underline">
          Voir tout
        </Link>
      )}
    </div>
  );
}

/** Construit un cycle à partir de "1-2-1" (grand/petit en alternance) */
function buildCycleFromPatten(patten?: string): SizeToken[] | null {
  if (patten == null) return null;
  const nums = patten
    .split("-")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!nums.length) return null;
  const out: SizeToken[] = [];
  nums.forEach((count, idx) => {
    const size: SizeToken = idx % 2 === 0 ? "lg" : "sm";
    for (let i = 0; i < count; i++) out.push(size);
  });
  return out.length ? out : null;
}

export default function PairStrip({
  title,
  items,
  seeAllHref,
  cols = 3,
  className,
  pattern,
  patten,
  bigVariant = "image-top",
  showIndex = false,
  indexVariant = "left",
}: Props) {
  const data = Array.isArray(items) ? items : [];
  const desktopCols =
    cols === 4 ? "lg:grid-cols-4" : cols === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3";

  const defaultPatten = "1-2";
  const cycle: SizeToken[] =
    (pattern && pattern.length ? pattern : buildCycleFromPatten(patten ?? defaultPatten)) ??
    ["sm"];

  return (
    <section className={className}>
      <SectionTitle href={seeAllHref}>{title}</SectionTitle>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${desktopCols} gap-6`}>
        {data.map((a, idx) => {
          const token = cycle[idx % cycle.length];
          const isBig = token === "lg";
          const displayIndex = idx + 1;
          const isImageLeft = bigVariant === "image-left";

          const spanClass =
            cols >= 3
              ? isBig
                ? "lg:col-span-2"
                : "lg:col-span-1"
              : isBig
              ? "md:col-span-2"
              : "md:col-span-1";

          const bigCardClass = isImageLeft
            ? "group border-y py-5 flex flex-col md:flex-row gap-4"
            : "group border-y py-5 flex flex-col gap-4";

          const smallCardBase = "group border-y py-5 flex gap-4";
          const smallCardClass =
            showIndex && indexVariant === "left"
              ? "group border-y py-5 grid grid-cols-[28px_1fr] gap-3"
              : smallCardBase;

          const titleClass = isBig
            ? "text-[18px] md:text-[20px] font-semibold leading-snug group-hover:text-blue-700"
            : "text-[16px] font-semibold leading-snug group-hover:text-blue-700";

          const excerptClamp = isBig ? "line-clamp-3" : "line-clamp-2";

          const bigImageBox = isImageLeft
            ? "relative w-full h-[200px] md:w-[320px] md:h-[200px] lg:w-[360px] lg:h-[220px] overflow-hidden rounded bg-neutral-100"
            : "relative w-full h-[220px] md:h-[260px] overflow-hidden rounded bg-neutral-100";

          const smallImageBox =
            "relative w-[140px] h-[94px] md:w-[200px] md:h-[132px] flex-shrink-0 overflow-hidden rounded bg-neutral-100";

          return (
            <div key={a.id} className={spanClass}>
              {isBig ? (
                <Link href={a.href} className={bigCardClass} aria-label={a.title}>
                  <div className={bigImageBox}>
                    {showIndex && indexVariant === "pill" && (
                      <span className="absolute left-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white">
                        {displayIndex}
                      </span>
                    )}
                    <SafeImage
                      src={a.image ?? null}
                      alt={a.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width:768px) 100vw, (max-width:1024px) 66vw, 66vw"
                    />
                  </div>

                  <div className="min-w-0">
                    {a.category && (
                      <p className="text-[11px] uppercase tracking-wide text-neutral-500 mb-0.5">
                        {a.category}
                      </p>
                    )}
                    <h3 className={titleClass}>{a.title}</h3>
                    {a.excerpt && (
                      <p className={`mt-1 text-sm text-neutral-600 ${excerptClamp}`}>
                        {a.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ) : (
                <Link href={a.href} className={smallCardClass} aria-label={a.title}>
                  {showIndex && indexVariant === "left" && (
                    <span className="mt-1 text-sm font-bold text-neutral-400 tabular-nums">
                      {displayIndex}
                    </span>
                  )}

                  <div className={smallImageBox}>
                    {showIndex && indexVariant === "pill" && (
                      <span className="absolute left-2 top-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-[11px] font-bold text-white">
                        {displayIndex}
                      </span>
                    )}
                    <SafeImage
                      src={a.image ?? null}
                      alt={a.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                    />
                  </div>

                  <div className="min-w-0">
                    {a.category && (
                      <p className="text-[11px] uppercase tracking-wide text-neutral-500 mb-0.5">
                        {a.category}
                      </p>
                    )}
                    <h3 className={titleClass}>{a.title}</h3>
                    {a.excerpt && (
                      <p className={`mt-1 text-sm text-neutral-600 ${excerptClamp}`}>
                        {a.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

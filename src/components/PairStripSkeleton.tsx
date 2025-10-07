// src/components/PairStripSkeleton.tsx
import type { ReactNode } from "react";
import Link from "next/link";

type SizeToken = "lg" | "sm";

type Props = {
  title: string;
  seeAllHref?: string;
  cols?: 2 | 3 | 4;
  /** Ex: "1-2" => 1 grande, 2 petites; répété */
  patten?: string;
  /** Layout de la grande carte : "image-top" (défaut) ou "image-left" */
  bigVariant?: "image-top" | "image-left";
  /** Nombre d’éléments skeleton à afficher (défaut 9) */
  count?: number;
  /** Afficher un badge d’index (cosmétique, pas nécessaire) */
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

function buildCycleFromPatten(patten?: string): SizeToken[] {
  const nums = (patten ?? "1-2")
    .split("-")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!nums.length) return ["sm"];
  const out: SizeToken[] = [];
  nums.forEach((count, idx) => {
    const size: SizeToken = idx % 2 === 0 ? "lg" : "sm";
    for (let i = 0; i < count; i++) out.push(size);
  });
  return out;
}

export default function PairStripSkeleton({
  title,
  seeAllHref,
  cols = 3,
  patten = "1-2",
  bigVariant = "image-top",
  count = 9,
  showIndex = false,
  indexVariant = "left",
  className,
}: Props) {
  const desktopCols =
    cols === 4 ? "lg:grid-cols-4" : cols === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3";
  const cycle = buildCycleFromPatten(patten);

  return (
    <section className={className}>
      <SectionTitle href={seeAllHref}>{title}</SectionTitle>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${desktopCols} gap-6`}>
        {Array.from({ length: count }).map((_, idx) => {
          const token = cycle[idx % cycle.length];
          const isBig = token === "lg";
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
            ? "border-y py-5 flex flex-col md:flex-row gap-4"
            : "border-y py-5 flex flex-col gap-4";
          const smallCardBase = "border-y py-5 flex gap-4";
          const smallCardClass =
            showIndex && indexVariant === "left"
              ? "border-y py-5 grid grid-cols-[28px_1fr] gap-3"
              : smallCardBase;

          const bigImageBox = isImageLeft
            ? "w-full h-[200px] md:w-[320px] md:h-[200px] lg:w-[360px] lg:h-[220px] rounded bg-neutral-200"
            : "w-full h-[220px] md:h-[260px] rounded bg-neutral-200";
          const smallImageBox =
            "w-[140px] h-[94px] md:w-[200px] md:h-[132px] flex-shrink-0 rounded bg-neutral-200";

          return (
            <div key={idx} className={spanClass}>
              <div className={`animate-pulse ${isBig ? bigCardClass : smallCardClass}`}>
                {showIndex && indexVariant === "left" && !isBig && (
                  <span className="mt-1 h-4 w-5 rounded bg-neutral-200" />
                )}

                <div className={isBig ? bigImageBox : smallImageBox} />

                <div className="min-w-0">
                  <div className="mb-2 h-3 w-24 rounded bg-neutral-200" />
                  <div className={isBig ? "h-5 w-3/4 rounded bg-neutral-200" : "h-4 w-4/5 rounded bg-neutral-200"} />
                  <div className="mt-2 h-3 w-5/6 rounded bg-neutral-200" />
                  {isBig && <div className="mt-2 h-3 w-2/3 rounded bg-neutral-200" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

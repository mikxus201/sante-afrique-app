// src/components/mag/IssuesSummaryGrid.tsx
import Image from "next/image";
import Link from "next/link";
import { issues as localIssues } from "@/data/issues";

type IssueLite = {
  id: string | number;
  number?: number;
  slug?: string;
  cover?: string;
  cover_url?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const BASE = API.replace(/\/+$/, "");

// Normalise un item venant de l’API / du fallback local
function normalize(i: any): IssueLite {
  return {
    id: i?.id ?? i?.slug ?? i?.uuid ?? Math.random().toString(36).slice(2),
    number: i?.number ?? i?.num ?? undefined,
    slug: i?.slug ?? undefined,
    cover_url:
      i?.cover_url ??
      (i?.cover
        ? `${BASE}/storage/${String(i.cover).replace(/^\/+/, "")}`
        : i?.cover ?? undefined),
    cover: i?.cover ?? undefined,
  };
}

function toPath(i: IssueLite) {
  return (
    i.slug ||
    (i.number ? `numero-${i.number}` : null) ||
    String(i.id)
  );
}

async function fetchIssues(): Promise<IssueLite[]> {
  try {
    const r = await fetch(`${BASE}/api/issues`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!r.ok) throw new Error("bad status");
    const j = await r.json();
    const arr = Array.isArray(j) ? j : j?.data || j?.items || j?.results || [];
    return (arr as any[]).map(normalize);
  } catch {
    // Fallback: data locale
    return (localIssues as any[]).map((x) => normalize(x));
  }
}

export default async function IssuesSummaryGrid() {
  const list = (await fetchIssues())
    .slice()
    .sort((a, b) => (b.number ?? 0) - (a.number ?? 0));

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Tous les numéros</h2>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((m) => {
          const path = toPath(m);
          const coverSrc = m.cover_url || m.cover || "/placeholder.jpg";

          return (
            <article
              key={`${m.id}`}
              className="overflow-hidden rounded border bg-white hover:shadow"
            >
              {/* 👉 Clic sur la couverture = Sommaire public */}
              <Link
                href={`/magazine/${encodeURIComponent(path)}/sommaire`}
                aria-label={`Voir le sommaire du ${path}`}
                prefetch={false}
              >
                <div className="relative h-56 w-full">
                  <Image
                    src={coverSrc}
                    alt={`Couverture ${path}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>

              <div className="p-3">
                <div className="text-sm font-semibold">
                  N° {m.number ?? "—"}
                </div>
                <div className="text-xs text-neutral-500 truncate">
                  {path}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/magazine/${encodeURIComponent(path)}/sommaire`}
                    className="inline-flex items-center rounded border px-3 py-1.5 text-xs font-semibold hover:bg-neutral-100"
                    prefetch={false}
                  >
                    Sommaire
                  </Link>
                  <Link
                    href={`/magazine/${encodeURIComponent(path)}/lire`}
                    className="inline-flex items-center rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                    prefetch={false}
                  >
                    Lire l’intégralité (abonnés)
                  </Link>
                  <Link
                    href="/abonnement"
                    className="inline-flex items-center rounded border px-3 py-1.5 text-xs font-semibold hover:bg-neutral-100"
                  >
                    S’abonner
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

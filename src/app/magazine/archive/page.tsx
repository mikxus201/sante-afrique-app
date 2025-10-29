// src/app/magazine/archive/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import Image from "next/image";
import { listIssues, type Issue, toPublicMediaUrl } from "@/lib/api";

/* =========================================================
   Helpers (garde ta structure JSX)
   ========================================================= */
const API_ROOT =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:8000";

function normalizeIssue(i: any): Issue {
  const n: Issue = {
    id: i?.id ?? i?.slug ?? i?.uuid ?? Math.random().toString(36).slice(2),
    number: i?.number ?? i?.num ?? undefined,
    // @ts-ignore
    slug: i?.slug ?? undefined,
    // @ts-ignore
    title: i?.title ?? i?.name ?? (i?.number ? `Numéro ${i.number}` : "Numéro"),
    // @ts-ignore
    cover_url:
      i?.cover_url ??
      i?.image_url ??
      i?.thumbnail_url ??
      i?.cover ??
      i?.image ??
      i?.thumbnail ??
      i?.photo ??
      "",
    // @ts-ignore
    date: i?.date ?? i?.published_at ?? i?.released_at ?? i?.created_at ?? undefined,
  } as Issue;
  return n;
}

async function loadIssuesResilient(): Promise<Issue[]> {
  // 1) Essai via helper typé
  try {
    const items = await listIssues({ page: 1, perPage: 200, order: "recent" });
    if (Array.isArray(items) && items.length) return items;
  } catch {
    // on passera aux endpoints de secours
  }

  // 2) Endpoints publics de repli
  const base = API_ROOT.replace(/\/+$/, "");
  const endpoints = [
    `${base}/api/issues`,
    `${base}/api/issues?status=published`,
    `${base}/api/magazines`,
    `${base}/api/public/issues`,
  ];

  for (const url of endpoints) {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) continue;
      const json = await r.json();
      const list =
        Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.items)
          ? json.items
          : Array.isArray(json?.results)
          ? json.results
          : null;
      if (list && list.length) return (list as any[]).map(normalizeIssue);
    } catch {
      // essaie l'endpoint suivant
    }
  }
  return [];
}

// Image URL (fallback propre) — garde ta balise <Image>
const toImg = (i: Partial<Issue> & Record<string, any>) => {
  const raw =
    i?.cover_url ||
    i?.image_url ||
    i?.thumbnail_url ||
    i?.cover ||
    i?.image ||
    i?.thumb ||
    i?.file ||
    i?.path ||
    "";
  const url = toPublicMediaUrl(raw);
  return url && String(url).trim() !== "" ? url : "/placeholder.jpg";
};

export default async function ArchivePage() {
  const items = await loadIssuesResilient();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-extrabold">Tous les numéros</h1>

      {items.length === 0 ? (
        <p className="mt-6 text-neutral-600">Aucun numéro pour le moment.</p>
      ) : (
        <ul className="mt-6 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((it) => (
            <li
              key={it.id}
              className="rounded-lg bg-white ring-1 ring-neutral-200 shadow-sm hover:shadow-md transition"
            >
              <Link href={`/magazine/${(it as any).slug || it.id}`} className="block">
                <div className="relative w-full aspect-[3/4]">
                  <Image
                    src={toImg(it as any)}
                    alt={`Couverture n°${it.number ?? ""}`}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <div className="px-3 py-2 text-sm text-neutral-700">
                  N° {it.number ?? "—"} —{" "}
                  {(it as any).date
                    ? new Date((it as any).date).toLocaleDateString("fr-FR", {
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

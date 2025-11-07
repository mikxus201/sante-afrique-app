// src/app/magazine/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Image from "next/image";
import Link from "next/link";
import { listIssues, type Issue, toPublicMediaUrl } from "@/lib/api";

export const metadata = {
  title: "Santé Afrique — Le Magazine",
  description: "Tous les numéros publiés du magazine Santé Afrique.",
};

/* =========================================================
   Helpers
   ========================================================= */
const API_ROOT =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:8000";

/** Construit le segment d'URL: slug prioritaire, sinon id */
function issuePathSegment(i: Partial<Issue> & Record<string, any>) {
  const slug = (i as any).slug ? String((i as any).slug).trim() : "";
  if (slug) return slug;
  return String(i?.id ?? "");
}

/** Href vers la page lecture protégée */
function readHref(i: Partial<Issue> & Record<string, any>) {
  const rawId = String(i?.id ?? "").trim();
  const numericId = /^\d+$/.test(rawId) ? rawId : "";
  const key = numericId || issuePathSegment(i); // fallback slug si pas d'ID numérique
  return `/magazine/${encodeURIComponent(key)}/lire`;
}

/** Href vers le sommaire public */
function summaryHref(i: Partial<Issue> & Record<string, any>) {
  return `/magazine/${encodeURIComponent(issuePathSegment(i))}/sommaire`;
}

function normalizeIssue(i: any): Issue {
  const n: Issue = {
    id: i?.id ?? i?.uuid ?? i?.slug ?? Math.random().toString(36).slice(2),
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
  try {
    const items = await listIssues({ page: 1, perPage: 50, order: "recent" });
    if (Array.isArray(items) && items.length) return items;
  } catch {}

  const base = API_ROOT.replace(/\/+$/, "");
  const endpoints = [`${base}/api/issues`, `${base}/api/issues?status=published`];

  for (const url of endpoints) {
    try {
      const r = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!r.ok) continue;
      const json = await r.json();
      const list =
        Array.isArray(json)
          ? json
          : Array.isArray((json as any)?.data)
          ? (json as any).data
          : Array.isArray((json as any)?.items)
          ? (json as any).items
          : Array.isArray((json as any)?.results)
          ? (json as any).results
          : null;
      if (list && list.length) return (list as any[]).map(normalizeIssue);
    } catch {}
  }
  return [];
}

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

export default async function MagazinePage() {
  let issues: Issue[] = [];
  try {
    issues = await loadIssuesResilient();
  } catch {
    issues = [];
  }

  const sortVal = (x: any) =>
    Number(x?.number ?? (typeof x?.id === "number" ? x.id : 0));
  const sorted = issues.slice().sort((a, b) => sortVal(b) - sortVal(a));
  const [current, ...older] = sorted;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">Le Magazine</h1>

      {current ? (
        <section className="mb-10 grid gap-8 lg:grid-cols-[auto,1fr]">
          <div className="mx-auto lg:mx-0 w-full max-w-[520px]">
            {/* 👉 Couverture = lien vers SOMMAIRE public */}
            <Link href={summaryHref(current)} className="block" prefetch={false}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl border bg-neutral-50">
                <Image
                  src={toImg(current)}
                  alt={`Couverture N°${current.number ?? ""}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 90vw, 520px"
                  priority
                />
              </div>
            </Link>
          </div>

          <div className="self-center">
            <h2 className="text-xl font-semibold">
              Numéro N°{current.number ?? ""}
            </h2>
            <p className="mt-2 text-neutral-600">
              Paru le{" "}
              {(current as any)["date"] || (current as any)["published_at"]
                ? new Date(
                    (current as any).date ?? (current as any).published_at
                  ).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={summaryHref(current)}
                className="rounded-full bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
                prefetch={false}
              >
                Voir le sommaire
              </Link>
              <Link
                href={readHref(current)}
                className="rounded-full border px-4 py-2 text-neutral-700 hover:bg-neutral-50"
                prefetch={false}
              >
                Lire l’intégralité (abonnés)
              </Link>
              <Link
                href="/abonnement"
                className="rounded-full border px-4 py-2 text-neutral-700 hover:bg-neutral-50"
              >
                S’abonner
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <p className="text-neutral-600 mb-10">Aucun numéro pour le moment.</p>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Numéros précédents</h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {older.map((i) => (
            <li key={i.id}>
              {/* 👉 Tous pointent vers le SOMMAIRE public */}
              <Link href={summaryHref(i)} className="group block" prefetch={false}>
                <div className="mx-auto w-full max-w-[220px]">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg border bg-neutral-50">
                    <Image
                      src={toImg(i)}
                      alt={`Couverture N°${i.number ?? ""}`}
                      fill
                      className="object-contain transition duration-200 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 220px, 220px"
                    />
                  </div>
                </div>
                <p className="mt-2 text-center text-sm text-neutral-700">
                  N°{i.number ?? ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

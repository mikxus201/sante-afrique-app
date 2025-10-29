// src/app/magazine/[id]/sommaire/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Image from "next/image";
import Link from "next/link";

/* ================= Réseau (robuste) ================= */
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const BASE = API.replace(/\/+$/, "");
const T = Date.now();

const q = (url: string) => url + (url.includes("?") ? "&" : "?") + "t=" + T;

async function jget(url: string) {
  try {
    const r = await fetch(q(url), { cache: "no-store", headers: { Accept: "application/json" } });
    if (!r.ok) return { ok: false, status: r.status, json: null, url };
    return { ok: true, status: r.status, json: await r.json(), url };
  } catch {
    return { ok: false, status: 0, json: null, url };
  }
}
const numFromSlug = (s: string) => (String(s).match(/(\d+)/)?.[1] ?? null);

function pickIssue(payload: any) {
  if (!payload) return null;
  return (
    payload.issue ??
    (payload.data && !Array.isArray(payload.data) ? payload.data : null) ??
    payload.item ??
    payload.result ??
    (payload.id || payload.slug || payload.number ? payload : null)
  );
}
function pickSummary(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.summary)) return payload.summary;
  return [];
}

async function fetchIssue(idOrSlug: string) {
  // /api/issues/{slug} → /api/issues/{number} → recherches
  let r = await jget(`${BASE}/api/issues/${encodeURIComponent(idOrSlug)}`);
  let issue = pickIssue(r.json);

  if (!issue) {
    const n = numFromSlug(idOrSlug);
    if (n) {
      r = await jget(`${BASE}/api/issues/${n}`);
      issue = pickIssue(r.json);
    }
  }
  if (!issue) {
    r = await jget(`${BASE}/api/issues?slug=${encodeURIComponent(idOrSlug)}`);
    const arr = Array.isArray(r.json?.data) ? r.json.data : Array.isArray(r.json) ? r.json : [];
    if (arr.length) issue = pickIssue(arr[0]);
  }
  if (!issue) {
    const n = numFromSlug(idOrSlug);
    if (n) {
      r = await jget(`${BASE}/api/issues?number=${encodeURIComponent(n)}`);
      const arr = Array.isArray(r.json?.data) ? r.json.data : Array.isArray(r.json) ? r.json : [];
      if (arr.length) issue = pickIssue(arr[0]);
    }
  }
  if (!issue) return null;

  const cover_url =
    issue.cover_url ??
    (issue.cover ? `${BASE}/storage/${String(issue.cover).replace(/^\/+/, "")}` : null);

  return { ...issue, cover_url };
}

async function fetchSummary(idOrSlug: string) {
  // inclus dans /api/issues
  let r = await jget(`${BASE}/api/issues/${encodeURIComponent(idOrSlug)}`);
  let items =
    (Array.isArray(r.json?.data?.summary) && r.json.data.summary) ||
    (Array.isArray(r.json?.summary) && r.json.summary) ||
    [];

  // endpoint /summary
  if (!items.length) {
    r = await jget(`${BASE}/api/issues/${encodeURIComponent(idOrSlug)}/summary`);
    items = pickSummary(r.json);
  }

  // fallbacks numériques
  if (!items.length) {
    const n = numFromSlug(idOrSlug);
    if (n) {
      r = await jget(`${BASE}/api/issues/${n}`);
      items =
        (Array.isArray(r.json?.data?.summary) && r.json.data.summary) ||
        (Array.isArray(r.json?.summary) && r.json.summary) ||
        items;

      if (!items.length) {
        r = await jget(`${BASE}/api/issues/${n}/summary`);
        items = pickSummary(r.json);
      }
    }
  }

  return items.length ? items : null;
}

/* ================= Page ================= */
export default async function Page({ params }: { params: { id: string } }) {
  const [issue, summary] = await Promise.all([fetchIssue(params.id), fetchSummary(params.id)]);
  if (!issue) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-xl font-bold">Numéro introuvable</h1>
        <p className="text-neutral-600 mt-2">Vérifiez l’URL ou retournez à l’index.</p>
        <div className="mt-4">
          <Link href="/magazine" className="text-blue-600 underline">← Tous les numéros</Link>
        </div>
      </main>
    );
  }

  const dateTxt = issue?.date
    ? new Date(issue.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
    : "";

  const issueIdForLire = issue?.id ?? numFromSlug(String(params.id)) ?? params.id;

  // /summary prioritaire, sinon data.summary
  const summaryItems =
    (Array.isArray(summary) && summary.length > 0 ? summary : null) ??
    (Array.isArray(issue?.summary) && issue.summary.length > 0 ? (issue.summary as any[]) : null) ??
    [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* En-tête + bouton Retour */}
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">
          {issue?.title ?? (issue?.number ? `Santé Afrique N°${issue.number}` : "Le Magazine")}
        </h1>
        {dateTxt && <p className="text-neutral-600 mt-1">{dateTxt}</p>}
        <div className="mt-3">
          <Link
            href="/magazine"
            prefetch={false}
            className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
          >
            <span aria-hidden className="mr-1">←</span>
            Retour
          </Link>
        </div>
      </header>

      {/* >>> CÔTE À CÔTE : on force en flex dès md */}
      <section className="md:flex md:items-start md:gap-10">
        {/* Colonne gauche : couverture + CTA */}
        <aside className="md:w-[300px] shrink-0">
          {issue.cover_url && (
            <div className="relative w-full aspect-[3/4] rounded-lg border bg-neutral-50 overflow-hidden">
              <Image
                src={issue.cover_url}
                alt={`Couverture N°${issue.number ?? ""}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 90vw, 300px"
                priority
              />
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/magazine/${encodeURIComponent(String(issueIdForLire))}/lire`}
              className="inline-flex rounded bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
            >
              Lire l’intégralité (abonnés)
            </Link>
            <Link
              href="/abonnement"
              className="inline-flex rounded border px-4 py-2 font-semibold hover:bg-neutral-50"
            >
              S’abonner
            </Link>
          </div>
        </aside>

        {/* Colonne droite : Sommaire */}
        <article className="mt-6 md:mt-0 md:flex-1">
          <h2 className="text-lg font-semibold mb-3">Sommaire</h2>

          {summaryItems.length ? (
            <ol className="list-decimal pl-6 space-y-2">
              {summaryItems.map((it: any, i: number) => {
                const title = typeof it === "string" ? it : it?.title ?? "";
                const page = typeof it === "object" ? it?.page : null;
                return (
                  <li key={i}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="leading-relaxed">{title}</span>
                      {page ? (
                        <span className="text-sm text-neutral-500 whitespace-nowrap">p.{page}</span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="text-neutral-600">Sommaire non disponible.</p>
          )}
        </article>
      </section>
    </main>
  );
}

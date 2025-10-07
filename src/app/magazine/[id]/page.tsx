// src/app/magazine/[id]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJSON, toPublicMediaUrl } from "@/lib/api";

/* ===== Types locaux ===== */
type Issue = {
  id: number | string;
  number?: number | string | null;
  date?: string | null;
  cover_url?: string | null;
  summary?: Array<{ title: string; page?: number }> | null;
};

/* ===== Helpers locaux ===== */
function mapIssue(a: any): Issue {
  const coverRaw =
    a?.cover_url ||
    a?.image_url ||
    a?.thumbnail_url ||
    a?.cover ||
    a?.image ||
    a?.thumb ||
    a?.file ||
    a?.path ||
    "";

  return {
    id: a?.id ?? a?.slug ?? Math.random().toString(36).slice(2),
    number: a?.number ?? a?.num ?? a?.no ?? null,
    date: a?.date ?? a?.published_at ?? a?.released_at ?? null,
    cover_url: toPublicMediaUrl(String(coverRaw)),
    summary: Array.isArray(a?.summary) ? a.summary : Array.isArray(a?.sommaire) ? a.sommaire : null,
  };
}

async function fetchIssue(idOrSlug: string) {
  const id = encodeURIComponent(idOrSlug);
  const tries = [
    `/api/issues/${id}`,
    `/api/magazine/issues/${id}`,
    `/issues/${id}`, // compat éventuelle
  ];

  for (const p of tries) {
    try {
      const data = await getJSON(p);
      const node = data?.data ?? data ?? null;
      if (node) return mapIssue(node);
    } catch {
      /* essayer l’endpoint suivant */
    }
  }
  return null;
}

/* ===== SEO ===== */
export async function generateMetadata({ params }: { params: { id: string } }) {
  const issue = await fetchIssue(params.id);
  if (issue) {
    return {
      title: `Magazine N°${issue.number ?? ""} — Santé Afrique`,
      description: `Sommaire et couverture du numéro N°${issue.number ?? ""}.`,
    };
  }
  return { title: "Magazine — Santé Afrique" };
}

/* ===== Page ===== */
export default async function IssueDetailPage({ params }: { params: { id: string } }) {
  const issue = await fetchIssue(params.id);
  if (!issue) return notFound();

  const date = issue.date
    ? new Date(issue.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
    : "—";
  const sum = Array.isArray(issue.summary) ? issue.summary : [];
  const cover = issue.cover_url || "/placeholder.jpg";

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8">
      <nav className="mb-4 text-sm">
        <Link href="/magazine" className="text-blue-700 hover:underline">← Tous les numéros</Link>
      </nav>

      <section className="grid gap-10 md:grid-cols-2 items-start">
        <div className="flex justify-center md:justify-start">
          <div className="relative aspect-[3/4] w-full max-w-[520px] overflow-hidden rounded-xl border bg-neutral-50 shadow">
            <Image
              src={cover}
              alt={`Couverture N°${issue.number ?? ""}`}
              fill
              sizes="(max-width:768px) 92vw, 520px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="text-neutral-900">
          <h1 className="text-2xl font-semibold">Santé Afrique</h1>
          <p className="mt-1 text-sm text-neutral-600">
            N°{issue.number ?? "—"} — {date}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/connexion" className="rounded-full bg-neutral-200 px-3 py-1.5 text-xs text-neutral-800 hover:bg-neutral-300">Se connecter</Link>
            <Link href="/abonnement" className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">S’abonner</Link>
            <Link href="/apps" className="rounded-full border px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50">Lire dans l’app mobile</Link>
          </div>

          <hr className="my-6 border-black border-t-2" />

          <div id="sommaire">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-800">Sommaire</h2>
            {sum.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-600">Sommaire indisponible.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {sum.map((s, idx) => (
                  <li key={idx} className="leading-6">
                    <span className="text-neutral-800">{s.title}</span>
                    {typeof s.page === "number" ? <span className="text-neutral-500"> — p.{s.page}</span> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

// src/app/offres-emploi/[id]/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers as nextHeaders } from "next/headers"; // ⬅️ alias
import { absUrl } from "@/lib/site";
import CompanyLogo from "@/components/CompanyLogo";

export const revalidate = 0;

/* ---------- Types ---------- */
type ApiJobDetail = {
  id: string | number;
  title?: string;
  company?: string | { name?: string };
  companyLogo?: string | null;
  company_logo?: string | null;
  type?: string | null;
  location?: string | null;
  country?: string | null;
  description?: string | null;
  excerpt?: string | null;
  requirements?: string | null;
  publishedAt?: string | null;
  apply_url?: string | null;
  url?: string | null;
};

type JobApiResponse = { item?: ApiJobDetail };

/* ---------- Helpers ---------- */
function toPlain(text?: string | null) {
  if (!text) return "";
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchJobServer(id: string | number): Promise<JobApiResponse> {
  const { API_PREFIX } = await import("@/lib/api");
  const base = API_PREFIX.replace(/\/+$/, "");

  // ⬇️ headers() peut être typé Promise<ReadonlyHeaders> → on attend sa valeur
  const cookie = (await nextHeaders()).get("cookie") ?? "";

  const res = await fetch(`${base}/jobs/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Cookie: cookie, // forward cookies -> Sanctum OK
      "X-Requested-With": "XMLHttpRequest",
    },
    cache: "no-store",
    redirect: "manual",
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* ---------- OG/Twitter dynamiques ---------- */
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const id = params.id;
  const canonical = absUrl(`/offres-emploi/${id}`);

  let title = "Offre d’emploi — Santé Afrique";
  let description = "Consultez cette offre d’emploi publiée sur Santé Afrique.";
  let img: string | null = null;

  try {
    const res = await fetchJobServer(id);
    const j = (res?.item ?? {}) as ApiJobDetail;

    const companyName =
      typeof j.company === "string" ? j.company : j.company?.name || "—";

    title = `${j.title ?? "Offre d’emploi"} — ${companyName}`;
    const raw = j.excerpt || j.description || "";
    description = toPlain(raw).slice(0, 180) || description;

    img = (j.companyLogo ?? j.company_logo) || null;
  } catch {
    // silencieux: fallback sur défauts
  }

  const image = absUrl(img || "/og/job-default.jpg");

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      siteName: "Santé Afrique",
      title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

/* ---------- Page ---------- */
export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;

  const res = await fetchJobServer(id).catch(() => null);
  if (!res || !res.item) return notFound();

  const j = res.item as ApiJobDetail;

  const companyName =
    typeof j.company === "string" ? j.company : j.company?.name || "—";

  const logo = (j as any).companyLogo ?? (j as any).company_logo ?? null;
  const applyHref = j.apply_url || j.url || `/offres-emploi/${id}/postuler`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Retour */}
      <div className="mb-6">
        <Link
          href="/offres-emploi"
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          ← Retour aux offres
        </Link>
      </div>

      {/* En-tête */}
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <CompanyLogo src={logo} name={companyName} />
          <div>
            <p className="text-xs text-neutral-500">
              {companyName}
              {j.type ? <> · {j.type}</> : null}
              {(j.location || j.country) ? (
                <> · {[j.location, j.country].filter(Boolean).join(", ")}</>
              ) : null}
            </p>
            <h1 className="text-2xl font-extrabold leading-tight">
              {j.title || "Offre d’emploi"}
            </h1>
          </div>
        </div>

        <div className="mt-3">
          <Link
            href={applyHref}
            className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
          >
            Postuler
          </Link>
        </div>
      </header>

      {/* Contenu */}
      <section className="prose max-w-none">
        {j.description ? (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-2">Description</h2>
            <p className="whitespace-pre-line">{j.description}</p>
          </div>
        ) : null}
        {j.requirements ? (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-2">Profil / Exigences</h2>
            <p className="whitespace-pre-line">{j.requirements}</p>
          </div>
        ) : null}
      </section>

      {/* CTA bas de page */}
      <div className="mt-10 flex justify-end">
        <Link
          href={applyHref}
          className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2.5 text-white font-semibold hover:bg-blue-700"
        >
          Postuler
        </Link>
      </div>
    </main>
  );
}

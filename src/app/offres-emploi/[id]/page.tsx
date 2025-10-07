// src/app/offres-emploi/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import jobsData from "../../../../data/jobs.json";

type Job = {
  id: string | number;
  title: string;
  company: string;
  type: string;
  location: string;
  country: string;
  publishedAt: string;
  excerpt?: string;
  applyUrl?: string;
};

const JOBS: Job[] = (jobsData as any) as Job[];

export function generateStaticParams() {
  return JOBS.map((j) => ({ id: String(j.id) }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const job = JOBS.find((j) => String(j.id) === params.id);
  return {
    title: job ? `${job.title} — ${job.company} | Offres d’emploi` : "Offre d’emploi",
    description: job?.excerpt || "Détail de l’offre d’emploi.",
  };
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const job = JOBS.find((j) => String(j.id) === params.id);

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-extrabold">Offre introuvable</h1>
        <p className="mt-2 text-neutral-600">
          Cette offre n’existe plus ou l’identifiant est invalide.
        </p>
        <Link href="/offres" className="mt-6 inline-block rounded border px-4 py-2 hover:bg-neutral-50">
          ← Retour aux offres
        </Link>
      </div>
    );
  }

  const postulerHref = `/offres-emploi/${job.id}/postuler`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Fil d’Ariane */}
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span className="mx-1">/</span>
        <Link href="/offres" className="hover:underline">Offres d’emploi</Link>
        <span className="mx-1">/</span>
        <span>{job.title}</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-extrabold">{job.title}</h1>
      <p className="mt-1 text-neutral-700">
        <strong>{job.company}</strong> · {job.type} · {job.location}
      </p>
      <p className="mt-1 text-neutral-500">
        Publié le {new Date(job.publishedAt).toLocaleDateString()}
      </p>

      {job.excerpt && <p className="mt-6">{job.excerpt}</p>}

      <div className="mt-6 flex gap-3">
        <Link href="/offres" className="rounded border px-4 py-2 hover:bg-neutral-50">
          ← Retour aux offres
        </Link>
        <Link
          href={postulerHref}
          className="inline-flex items-center rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Postuler
        </Link>
      </div>
    </div>
  );
}

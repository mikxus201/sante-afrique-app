// src/components/JobCard.tsx
import Link from "next/link";

export type Job = {
  id: string | number;
  title: string;
  company: string;
  type: string;        // CDI, CDD, Stage…
  location: string;    // "Abidjan, Côte d’Ivoire"
  country: string;
  publishedAt: string; // ISO
  excerpt?: string;
  applyUrl?: string;   // (optionnel) URL externe si tu en veux une en plus
};

export default function JobCard({ job }: { job: Job }) {
  const detailHref = `/offres-emploi/${job.id}`;
  const postulerHref = `/offres-emploi/${job.id}/postuler`;

  return (
    <article className="rounded border bg-white p-4 flex flex-col justify-between">
      <header>
        <p className="text-xs text-neutral-500">
          {job.company} · {job.type} · {job.location}
        </p>

        {/* Titre ouvre le DÉTAIL SIMPLE */}
        <h3 className="mt-1 text-lg font-semibold leading-snug">
          <Link href={detailHref} className="hover:text-blue-700">
            {job.title}
          </Link>
        </h3>

        {job.excerpt && (
          <p className="mt-2 text-sm text-neutral-700 line-clamp-3">{job.excerpt}</p>
        )}
      </header>

      <footer className="mt-4 flex items-center justify-between">
        <time className="text-xs text-neutral-500">
          Publié le {new Date(job.publishedAt).toLocaleDateString()}
        </time>

        {/* BOUTON POSTULER → page avec formulaire interne */}
        <Link
          href={postulerHref}
          className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1.5 text-white font-semibold hover:bg-blue-700"
        >
          Postuler
        </Link>
      </footer>
    </article>
  );
}

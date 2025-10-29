// src/components/JobCard.tsx
import Link from "next/link";

export type Job = {
  id: string | number;
  title: string;
  company: string;
  type: string;
  location: string;
  country: string;
  publishedAt: string;
  excerpt?: string;
  applyUrl?: string; // optionnel externe
};

export default function JobCard({ job }: { job: Job }) {
  const detailHref = `/offres-emploi/${job.id}`;
  const postulerHref = `/offres-emploi/${job.id}/postuler`;

  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <header>
        <p className="text-xs text-neutral-500">{job.company} · {job.type} · {job.location}</p>
        <h3 className="mt-1 text-base md:text-lg font-semibold leading-snug">
          <Link href={detailHref} className="hover:text-blue-700">{job.title}</Link>
        </h3>
        {job.excerpt && <p className="mt-2 text-sm text-neutral-700 line-clamp-3">{job.excerpt}</p>}
      </header>

      <footer className="mt-4 flex items-center justify-between">
        <time className="text-xs text-neutral-500">
          Publié le {new Date(job.publishedAt).toLocaleDateString()}
        </time>

        <div className="flex gap-2">
          {job.applyUrl && (
            <Link href={job.applyUrl} className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium hover:bg-neutral-50">
              Voir l’offre
            </Link>
          )}
          <Link href={postulerHref} className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1.5 text-white font-semibold hover:bg-blue-700">
            Postuler
          </Link>
        </div>
      </footer>
    </article>
  );
}

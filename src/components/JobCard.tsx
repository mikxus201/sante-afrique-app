// src/components/JobCard.tsx
import Link from "next/link";
import CompanyLogo from "./CompanyLogo";
import { jobPublicUrl, SITE_NAME } from "@/lib/site";

export type Job = {
  id: string | number;
  title: string;
  company: string;
  type: string;
  location: string;
  country: string;
  publishedAt: string;
  excerpt?: string;
  applyUrl?: string;
  logoUrl?: string | null; // ← utilisé par CompanyLogo
};

export default function JobCard({ job }: { job: Job }) {
  const detailHref = `/offres-emploi/${job.id}`;
  const postulerHref = `/offres-emploi/${job.id}/postuler`;

  // URL publique à partager (ex: https://www.santeafrique.net/offres-emploi/123)
  const publicUrl = jobPublicUrl(job.id);
  const shareText = `Je viens de publier une offre sur ${SITE_NAME} : ${job.title} — ${job.company}. Rejoignez-nous !`;

  // Liens de partage
  const shareFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`;
  const shareLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`;
  const shareWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${publicUrl}`)}`;

  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <header className="flex items-start gap-3">
        <CompanyLogo src={job.logoUrl} name={job.company} />

        <div className="flex-1 min-w-0">
          <p className="text-xs text-neutral-500 truncate">
            {job.company} · {job.type} · {job.location}
          </p>
          <h3 className="mt-1 text-base md:text-lg font-semibold leading-snug">
            <Link href={detailHref} className="hover:text-blue-700">
              {job.title}
            </Link>
          </h3>
          {job.excerpt && (
            <p className="mt-2 text-sm text-neutral-700 line-clamp-3">
              {job.excerpt}
            </p>
          )}
        </div>
      </header>

      <footer className="mt-4">
        <div className="flex items-center justify-between">
          <time className="text-xs text-neutral-500">
            Publié le {new Date(job.publishedAt).toLocaleDateString()}
          </time>

          <div className="flex gap-2">
            {job.applyUrl && (
              <Link
                href={job.applyUrl}
                className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
              >
                Voir l’offre
              </Link>
            )}
            <Link
              href={postulerHref}
              className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1.5 text-white font-semibold hover:bg-blue-700"
            >
              Postuler
            </Link>
          </div>
        </div>

        {/* Bloc partage réseaux sociaux */}
        <div className="mt-3 border-t pt-3">
          <p className="text-xs text-neutral-600 mb-2">
            Boostez la visibilité de votre offre : partagez-la à votre réseau
            (cela augmente fortement les candidatures).
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={shareFacebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-neutral-50"
              aria-label="Partager sur Facebook"
              title="Partager sur Facebook"
            >
              <span aria-hidden>📘</span> Facebook
            </a>
            <a
              href={shareWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-neutral-50"
              aria-label="Partager sur WhatsApp"
              title="Partager sur WhatsApp"
            >
              <span aria-hidden>🟢</span> WhatsApp
            </a>
            <a
              href={shareLinkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-neutral-50"
              aria-label="Partager sur LinkedIn"
              title="Partager sur LinkedIn"
            >
              <span aria-hidden>🔗</span> LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </article>
  );
}

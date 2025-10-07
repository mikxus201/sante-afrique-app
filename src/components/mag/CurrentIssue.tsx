// src/components/mag/CurrentIssue.tsx
import Link from "next/link";
import Image from "next/image";
import type { Issue } from "../../types/mag";

type Props = { issue: Issue };

export default function CurrentIssue({ issue }: Props) {
  const dateTxt = new Date(issue.date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="grid gap-6 lg:grid-cols-[1fr_1.2fr] items-start">
      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden ring-1 ring-neutral-200 bg-neutral-100">
        <Image
          src={issue.cover}
          alt={`Couverture n°${issue.number}`}
          fill
          className="object-cover"
          sizes="(min-width:1024px) 420px, 60vw"
          priority
        />
      </div>

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          {issue.title ?? `Numéro ${issue.number}`}
        </h1>
        <p className="mt-1 text-neutral-600">{dateTxt}</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/magazine/${encodeURIComponent(String(issue.id))}`}
            className="inline-flex rounded-full bg-blue-600 px-4 py-2 font-semibold text-white hover:brightness-95"
          >
            Lire en ligne
          </Link>

          {(issue.excerptPdf || (issue.excerptImages && issue.excerptImages.length > 0)) && (
            <Link
              href={`/magazine/${encodeURIComponent(String(issue.id))}#extrait`}
              className="inline-flex rounded-full border px-4 py-2 text-neutral-700 hover:bg-neutral-50"
            >
              Feuilleter un extrait
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

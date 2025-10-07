// src/app/magazine/[id]/sommaire/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listIssues } from "@/lib/api";

type SummaryItem = { title: string; image?: string };
type Issue = {
  id: number | string;
  number: number;
  date: string | null;
  cover_url?: string | null;
  summary: SummaryItem[];
};

type Props = { params: { id: string } };

export const metadata = {
  title: "Sommaire du numéro — Santé Afrique",
};

export default async function SommairePage({ params }: Props) {
  const issues = await listIssues({}, { revalidate: 300 });
  const issue = issues.find((i: any) => String(i.id) === params.id) as Issue | undefined;
  if (!issue) return notFound();

  const date = issue.date
    ? new Date(issue.date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  // Si l’API ne fournit pas encore `summary`, on affiche un fallback élégant
  const items = Array.isArray(issue.summary) ? issue.summary : [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Sommaire — Santé Afrique n°{issue.number}</h1>
          <p className="text-sm text-neutral-600">{date}</p>
        </div>
        <Link href={`/magazine/${issue.id}`} className="text-sm text-blue-600 hover:underline">
          ← Retour au numéro
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Le sommaire détaillé sera disponible dans l’application mobile.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <article
              key={idx}
              className="group overflow-hidden rounded-xl border bg-white shadow-sm"
            >
              <div className="relative aspect-[16/9] w-full bg-neutral-100">
                <Image
                  src={item.image || "/placeholder-wide.jpg"}
                  alt={item.title}
                  fill
                  sizes="(max-width:640px) 92vw, (max-width:1024px) 45vw, 360px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-4">
                <h2 className="text-base font-semibold leading-snug">{item.title}</h2>
                {/* Si plus tard tu veux des pages d’articles de sommaire :
                    <Link href={`/magazine/${issue.id}/sommaire/${slugify(item.title)}`} className="text-sm text-blue-600 hover:underline">
                      Lire la présentation
                    </Link>
                 */}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

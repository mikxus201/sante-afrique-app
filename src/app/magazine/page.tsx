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

// helper local pour la couverture (garde ta structure et tes appels)
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
  return toPublicMediaUrl(raw);
};

export default async function MagazinePage() {
  let issues: Issue[] = [];
  try {
    // on reste simple et typé; pas de 2e argument non supporté
    issues = await listIssues({ page: 1, perPage: 50, order: "recent" });
  } catch {
    issues = [];
  }

  // tri robuste même si "number" est absent
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
            <Link href={`/magazine/${current.id}`} className="block">
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
              {current["date"] || (current as any)["published_at"]
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
                href={`/magazine/${current.id}`}
                className="rounded-full bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
              >
                Voir le sommaire
              </Link>
              <Link
                href="/apps"
                className="rounded-full border px-4 py-2 text-neutral-700 hover:bg-neutral-50"
              >
                Lire dans l’app mobile
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
              <Link href={`/magazine/${i.id}`} className="group block">
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

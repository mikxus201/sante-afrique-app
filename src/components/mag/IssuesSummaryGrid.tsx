// src/components/mag/IssuesSummaryGrid.tsx
import Image from "next/image";
import Link from "next/link";
import { issues } from "@/data/issues";

export default function IssuesSummaryGrid() {
  const list = issues.slice().sort((a, b) => b.number - a.number);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Tous les numéros</h2>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((m) => (
          <article key={m.id} className="overflow-hidden rounded border bg-white hover:shadow">
            <Link href={`/magazine/${m.id}/lire`} aria-label={`Lire ${m.id} dans l’app`}>
              <div className="relative h-56 w-full">
                <Image src={m.cover} alt={`Couverture ${m.id}`} fill className="object-cover" />
              </div>
            </Link>
            <div className="p-3">
              <div className="text-sm font-semibold">N° {m.number}</div>
              <div className="text-xs text-neutral-500">{m.id}</div>
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/magazine/${m.id}/lire`}
                  className="inline-flex items-center rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Lire dans l’app
                </Link>
                <Link
                  href="/abonnement"
                  className="inline-flex items-center rounded border px-3 py-1.5 text-xs font-semibold hover:bg-neutral-100"
                >
                  S’abonner
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

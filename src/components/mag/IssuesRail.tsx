// src/components/mag/IssuesRail.tsx
import Image from "next/image";
import Link from "next/link";
import { issues } from "@/data/issues";

export default function IssuesRail({ title = "Numéros récents" }: { title?: string }) {
  const list = issues.slice().sort((a, b) => b.number - a.number).slice(0, 12);

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Link href="/magazine" className="text-sm text-blue-600 hover:underline">Voir tout</Link>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
        {list.map((m) => (
          <article key={m.id} className="min-w-[190px] max-w-[190px] overflow-hidden rounded border bg-white">
            <Link href={`/magazine/${m.id}/lire`} aria-label={`Lire ${m.id} dans l’app`}>
              <div className="relative h-52 w-full">
                <Image src={m.cover} alt={`Couverture ${m.id}`} fill className="object-cover" />
              </div>
            </Link>
            <div className="p-2">
              <div className="text-sm font-semibold">N° {m.number}</div>
              <div className="text-xs text-neutral-500">{m.id}</div>
              <div className="mt-2 flex gap-2">
                <Link
                  href={`/magazine/${m.id}/lire`}
                  className="inline-flex items-center rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Lire dans l’app
                </Link>
                <Link
                   href={`/magazine/${m.id}/sommaire`}
                    className="inline-flex items-center rounded border px-3 py-1.5 text-xs font-semibold hover:bg-neutral-100"
    >
                    Sommaire
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

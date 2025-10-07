// src/app/magazine/archive/page.tsx
import Link from "next/link";
import Image from "next/image";
import { issues } from "../../../data/issues";

export default function ArchivePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-extrabold">Tous les numéros</h1>

      <ul className="mt-6 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {issues.map((it) => (
          <li key={it.id} className="rounded-lg bg-white ring-1 ring-neutral-200 shadow-sm hover:shadow-md transition">
            <Link href={`/magazine/${it.id}`} className="block">
              <div className="relative w-full aspect-[3/4]">
                <Image src={it.cover} alt={`Couverture n°${it.number}`} fill className="object-cover rounded-t-lg" />
              </div>
              <div className="px-3 py-2 text-sm text-neutral-700">
                N° {it.number} — {new Date(it.date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

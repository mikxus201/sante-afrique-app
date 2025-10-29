// src/app/entreprises/page.tsx
import Image from "next/image";
import Link from "next/link";
import { fetchCompanies } from "@/lib/jobs";

export const metadata = { title: "Les entreprises qui recrutent — Santé Afrique" };

export default async function CompaniesPage() {
  const res = await fetchCompanies();
  const items = res.items || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">Les entreprises qui recrutent</h1>
      <p className="text-neutral-600 mt-1">Découvrez les recruteurs actifs sur la plateforme.</p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((c) => (
          <Link key={c.id} href={`/offres-emploi?companyId=${c.id}`} className="rounded-lg border p-4 hover:shadow">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded bg-neutral-100">
                {c.logo_url ? <Image src={c.logo_url} alt={c.name} fill className="object-cover" /> : null}
              </div>
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-neutral-500">{c.jobs_count} offre(s) publiée(s)</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

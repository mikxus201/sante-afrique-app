// src/app/entreprises/page.tsx
import Link from "next/link";
import { fetchCompanies } from "@/lib/jobs";
import CompanyLogo from "@/components/CompanyLogo";

export const metadata = { title: "Les entreprises qui recrutent — Santé Afrique" };
export const revalidate = 0;

type Company = {
  id: number | string;
  name: string;
  logo_url?: string | null;
  jobs_count?: number;
};

export default async function CompaniesPage() {
  const res = await fetchCompanies();
  const items: Company[] = Array.isArray(res?.items) ? res.items : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">Les entreprises qui recrutent</h1>
      <p className="text-neutral-600 mt-1">Découvrez les recruteurs actifs sur la plateforme.</p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((c) => (
          <Link
            key={c.id}
            href={`/offres-emploi?companyId=${encodeURIComponent(String(c.id))}`}
            className="rounded-lg border p-4 hover:shadow bg-white"
          >
            <div className="flex items-center gap-3">
              {/* Logo 56×56, object-cover, alt dynamique + fallback initiale */}
              <CompanyLogo src={c.logo_url ?? null} name={c.name} />

              <div className="min-w-0">
                <p className="font-semibold truncate">{c.name}</p>
                <p className="text-xs text-neutral-500">
                  {(c.jobs_count ?? 0)} offre{(c.jobs_count ?? 0) > 1 ? "s" : ""} publiée{(c.jobs_count ?? 0) > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// src/app/offres/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import JobBoard from "@/components/JobBoard";
import type { Job } from "@/components/JobCard";
import jobsData from "../../../data/jobs.json";

// Si tu préfères forcer un rendu runtime (élimine tout risque de prerender), décommente :
// export const dynamic = "force-dynamic";
// export const revalidate = 0;

export const metadata: Metadata = {
  title: "Offres d’emploi | Santé Afrique",
  description: "Trouvez un poste dans la santé en Afrique : CDI, CDD, stages…",
};

export default function OffresPage() {
  const jobs = (jobsData as any) as Job[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Fil d’Ariane */}
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span className="mx-1">/</span>
        <span>Offres d’emploi</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-extrabold">Offres d’emploi</h1>
      <p className="mt-1 text-neutral-600">
        Filtrez par pays ou type de contrat, ou recherchez un mot-clé.
      </p>

      <div className="mt-6">
        {/* ⬇️ Important : Suspense autour d’un composant qui utilise useSearchParams */}
        <Suspense fallback={<div className="text-sm text-neutral-500">Chargement…</div>}>
          <JobBoard jobs={jobs} />
        </Suspense>
      </div>
    </div>
  );
}

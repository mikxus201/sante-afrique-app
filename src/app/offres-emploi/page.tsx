// src/app/offres-emploi/page.tsx
import Hero from "@/components/Hero";
import JobBoard from "@/components/JobBoard";
import JobCard, { type Job as UiJob } from "@/components/JobCard";
import {
  fetchCompanies,
  fetchJobs,
  fetchJobTypes,
  fetchProfessions,
  FRANCOPHONE_COUNTRIES,
} from "@/lib/jobs";
import Link from "next/link";
import { API_PREFIX, getJSON } from "@/lib/api";

export const metadata = {
  title: "Offres d’emploi — Santé Afrique",
  description: "Votre carrière en santé commence ici.",
};

// -------- Types --------
type ApiJob = {
  id: string | number;
  title?: string;
  name?: string;
  company?: string | { name?: string; id?: number | string };
  company_id?: number | string;
  type?: string;             // CDI, CDD…
  contract_type?: string;
  location?: string;         // "Abidjan, Côte d’Ivoire"
  city?: string;
  country?: string;
  published_at?: string;
  created_at?: string;
  excerpt?: string;
  description?: string;
  apply_url?: string;
  url?: string;
  profession?: string;
};

type BannerRes = {
  image_url?: string | null;
  title?: string | null;
  subtitle?: string | null;
};

type CompanyOpt = { id: string | number; name: string };

// Map API → UI JobCard
const toUiJob = (j: ApiJob): UiJob => ({
  id: j.id,
  title: (j.title ?? j.name ?? "").trim() || "Poste",
  company:
    (typeof j.company === "string" ? j.company : (j.company?.name ?? "")) || "—",
  type: j.type ?? j.contract_type ?? "—",
  location: j.location ?? [j.city, j.country].filter(Boolean).join(", ") ?? "",
  country: j.country ?? "",
  publishedAt: j.published_at ?? j.created_at ?? new Date().toISOString(),
  excerpt: j.excerpt ?? (j.description ? j.description.slice(0, 180) : undefined),
  applyUrl: j.apply_url ?? j.url ?? undefined,
});

// Fallbacks si l’API des filtres n’existe pas encore
const DEFAULT_PROFESSIONS = [
  "Pharmacien(ne)",
  "Préparateur(trice)",
  "Infirmier(ère)",
  "Médecin",
  "Sage-femme",
  "Data Analyst",
  "Biologiste",
  "Responsable Qualité",
  "Épidémiologiste",
  "Psychologue",
];

// Helpers
const uniqueSorted = (arr: Array<string | undefined | null>) =>
  Array.from(new Set(arr.filter(Boolean) as string[])).sort((a, b) =>
    a.localeCompare(b, "fr", { sensitivity: "base" })
  );

const inferCompaniesFromJobs = (jobs: ApiJob[]): CompanyOpt[] => {
  // On normalise par nom
  const map = new Map<string, CompanyOpt>();
  for (const j of jobs) {
    const name =
      (typeof j.company === "string" ? j.company : j.company?.name) ??
      "";
    if (!name) continue;
    const id = j.company_id ?? (typeof j.company === "object" && j.company?.id) ?? name;
    if (!map.has(name)) map.set(name, { id, name });
  }
  return Array.from(map.values()).sort((a, b) =>
    String(a.name).localeCompare(String(b.name), "fr", { sensitivity: "base" })
  );
};

const inferProfessionsFromJobs = (jobs: ApiJob[]): string[] =>
  uniqueSorted(jobs.map((j) => j.profession));

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  // Requêtes parallèles mais "safe"
  const [jobsP, companiesP, typesP, profsP, bannerP] = await Promise.allSettled([
    fetchJobs({
      q: String(searchParams.q ?? ""),
      country: String(searchParams.country ?? ""),
      type: String(searchParams.type ?? ""),
      profession: String(searchParams.profession ?? ""),
      minExp: String(searchParams.minExp ?? ""),
      companyId: String(searchParams.companyId ?? ""),
      sort: (searchParams.sort as any) ?? "date_desc",
    }),
    fetchCompanies(),
    fetchJobTypes(),       // peut 404 → géré ci-dessous
    fetchProfessions(),    // peut 404 → géré ci-dessous
    getJSON<BannerRes>(`${API_PREFIX}/page-banners/jobs`),
  ]);

  const jobsRes =
    jobsP.status === "fulfilled" ? jobsP.value : { items: [], total: 0, pinned: [] };

  const rawJobs = (jobsRes.items ?? []) as ApiJob[];

  // --- Types (depuis API si dispo)
  const types =
    typesP.status === "fulfilled" && Array.isArray(typesP.value?.items)
      ? typesP.value.items
      : [];

  // --- Professions (API si dispo, sinon déduction sur les jobs, sinon fallback par défaut)
  const apiProfessions =
    profsP.status === "fulfilled" && Array.isArray(profsP.value?.items)
      ? (profsP.value.items as string[])
      : [];
  const inferredProfessions = inferProfessionsFromJobs(rawJobs);
  const professions =
    apiProfessions.length > 0
      ? apiProfessions
      : inferredProfessions.length > 0
      ? inferredProfessions
      : DEFAULT_PROFESSIONS;

  // --- Companies (API si dispo, sinon déduction sur les jobs)
  const companiesRes =
    companiesP.status === "fulfilled" ? companiesP.value : { items: [] as any[] };

  const apiCompanies: CompanyOpt[] =
    (companiesRes.items ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
    })) ?? [];

  const companies: CompanyOpt[] =
    apiCompanies.length > 0 ? apiCompanies : inferCompaniesFromJobs(rawJobs);

  // ✅ bannière typée et sûre
  const banner: BannerRes | null =
    bannerP.status === "fulfilled" ? (bannerP.value as BannerRes) : null;

  return (
    <div>
      <Hero
        title={banner?.title ?? "Votre carrière en santé commence ici"}
        subtitle={
          banner?.subtitle ??
          "La première plateforme panafricaine des métiers de la santé."
        }
        image={banner?.image_url ?? "/heroes/jobs-hero.jpg"}
        align="left"
        height="tall"
      >
        <div className="flex gap-3">
          <Link
            href="/offres-emploi/poster"
            className="inline-flex items-center rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-white"
          >
            Poster une offre
          </Link>
          <Link
            href="/offres-emploi/candidats/inscription"
            className="inline-flex items-center rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-white"
          >
            Déposer mon CV
          </Link>
        </div>
      </Hero>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Épinglées (si l’API en renvoie) */}
        {(jobsRes.pinned?.length ?? 0) > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">Offres mises en avant</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {(jobsRes.pinned ?? []).map((j: ApiJob) => (
                <div key={j.id} className="ring-1 ring-amber-300 rounded-md p-1">
                  <JobCard job={toUiJob(j)} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Board principal */}
        <JobBoard
          jobs={rawJobs.map(toUiJob) as any}
          total={jobsRes.total}
          companies={companies}
          professions={professions}
          types={types}
          countries={FRANCOPHONE_COUNTRIES}
        />
      </div>
    </div>
  );
}

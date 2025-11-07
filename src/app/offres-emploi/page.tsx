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
import { getJSON } from "@/lib/api";

/* -------------------------------- META -------------------------------- */
export const metadata = {
  title: "Offres d’emploi — Santé Afrique",
  description: "Votre carrière en santé commence ici.",
};

// Pas de cache côté Next
export const revalidate = 0;

/* -------------------------------- Types API -------------------------------- */
type ApiJob = {
  id: string | number;
  title?: string;
  name?: string;
  company?: string | { id?: number | string; name?: string };
  company_id?: number | string;
  company_logo?: string | null;
  companyLogo?: string | null;
  type?: string;
  contract_type?: string;
  location?: string;
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

/* ------------------------- Mapping API -> UI JobCard ------------------------ */
const toUiJob = (j: ApiJob): UiJob => {
  const companyName =
    (typeof j.company === "string" ? j.company : j.company?.name) ?? "—";

  return {
    id: j.id,
    title: (j.title ?? j.name ?? "").trim() || "Poste",
    company: companyName,
    type: j.type ?? j.contract_type ?? "—",
    location: j.location ?? [j.city, j.country].filter(Boolean).join(", "),
    country: j.country ?? "",
    publishedAt: j.published_at ?? j.created_at ?? new Date().toISOString(),
    excerpt: j.excerpt ?? (j.description ? j.description.slice(0, 180) : undefined),
    applyUrl: j.apply_url ?? j.url ?? undefined,
    logoUrl: (j as any).companyLogo ?? (j as any).company_logo ?? undefined,
  };
};

/* ------------------------- Fallbacks (si API absente) ----------------------- */
const DEFAULT_PROFESSIONS = [
  "Médecin généraliste",
  "Infirmier(ère) diplômé(e) d’État",
  "Sage-femme",
  "Pharmacien(ne)",
  "Préparateur(trice) en pharmacie",
  "Chirurgien(ne)",
  "Anesthésiste-réanimateur(trice)",
  "Pédiatre",
  "Gynécologue-obstétricien(ne)",
  "Cardiologue",
  "Dermatologue",
  "Neurologue",
  "Psychiatre",
  "Psychologue clinicien(ne)",
  "Kinésithérapeute / Rééducateur(trice)",
  "Ergothérapeute",
  "Odontologiste / Chirurgien-dentiste",
  "Technicien(ne) de laboratoire",
  "Biologiste médical(e)",
  "Technicien(ne) d’imagerie / Radiologie",
  "Ophtalmologue",
  "ORL",
  "Nutritionniste / Diététicien(ne)",
  "Épidémiologiste",
  "Spécialiste Santé publique",
  "Data Analyst Santé / Biostatisticien(ne)",
  "Responsable Qualité / Hygiéniste",
  "Responsable vaccination / EPI",
  "Coordinateur(trice) de projet santé",
  "Responsable logistique santé",
  "Animateur(trice) santé communautaire",
  "Vétérinaire (One Health)",
  "Assistant(e) social(e) en santé",
];

/* --------------------------------- Helpers --------------------------------- */
const uniqueSorted = (arr: Array<string | undefined | null>) =>
  Array.from(new Set(arr.filter(Boolean) as string[])).sort((a, b) =>
    a.localeCompare(b, "fr", { sensitivity: "base" })
  );

const inferCompaniesFromJobs = (jobs: ApiJob[]): CompanyOpt[] => {
  const map = new Map<string, CompanyOpt>();
  for (const j of jobs) {
    const name =
      (typeof j.company === "string" ? j.company : j.company?.name) ?? "";
    if (!name) continue;
    const id = j.company_id ?? (typeof j.company === "object" && j.company?.id) ?? name;
    const key = `${id}::${name}`;
    if (!map.has(key)) map.set(key, { id, name });
  }
  return Array.from(map.values()).sort((a, b) =>
    String(a.name).localeCompare(String(b.name), "fr", { sensitivity: "base" })
  );
};

const inferProfessionsFromJobs = (jobs: ApiJob[]): string[] =>
  uniqueSorted(jobs.map((j) => j.profession));

function findCompanyIdByName(list: CompanyOpt[], name: string): string | null {
  if (!name) return null;
  const needle = name.trim().toLowerCase();
  const found = list.find((c) => String(c.name).trim().toLowerCase() === needle);
  return found ? String(found.id) : null;
}

/* --------------------------------- Page ------------------------------------ */
export default async function JobsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  // 1) Récupération des catalogues (entreprises, types, professions, bannière)
  const [companiesP, typesP, profsP, bannerP] = await Promise.allSettled([
    fetchCompanies(),
    fetchJobTypes(),
    fetchProfessions(),
    getJSON<BannerRes>("/api/page-banners/jobs"),
  ]);

  const companiesRes =
    companiesP.status === "fulfilled" ? companiesP.value : { items: [] as any[] };

  const apiCompanies: CompanyOpt[] = Array.isArray(companiesRes.items)
    ? companiesRes.items.map((c: any) => ({ id: c.id, name: c.name }))
    : [];

  // 2) Normalisation des filtres reçus via l’URL
  // - companyId prioritaire ; sinon on accepte `company` (nom) et on convertit → companyId
  const rawCompanyId = String(searchParams.companyId ?? "").trim();
  const rawCompanyName = String(searchParams.company ?? "").trim();
  const companyId =
    rawCompanyId ||
    findCompanyIdByName(apiCompanies, rawCompanyName) ||
    ""; // si pas trouvé: on n’envoie rien à l’API

  // Profession: on accepte `profession` et quelques alias courants
  const profession =
    String(
      searchParams.profession ??
        searchParams.job ??
        searchParams.role ??
        searchParams.pro ??
        ""
    ).trim();

  const paramsForJobs = {
    q: String(searchParams.q ?? ""),
    country: String(searchParams.country ?? searchParams.pays ?? ""),
    type: String(searchParams.type ?? ""),
    profession,
    minExp: String(searchParams.minExp ?? searchParams.experience_min ?? ""),
    companyId, // ← normalisé
    sort: (searchParams.sort as any) ?? "date_desc",
  };

  // 3) Chargement des offres AVEC les filtres normalisés
  const jobsRes = await (async () => {
    try {
      return await fetchJobs(paramsForJobs);
    } catch {
      return { items: [] as ApiJob[], total: 0, pinned: [] as ApiJob[] };
    }
  })();

  const rawJobs: ApiJob[] = (jobsRes.items ?? []) as ApiJob[];

  // Types
  const types =
    typesP.status === "fulfilled" && Array.isArray(typesP.value?.items)
      ? (typesP.value.items as string[])
      : [];

  // Professions (API → inférence → défaut)
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

  // Entreprises (API → inférence si vide)
  const companies: CompanyOpt[] =
    apiCompanies.length > 0 ? apiCompanies : inferCompaniesFromJobs(rawJobs);

  // Bannière
  const banner: BannerRes | null =
    bannerP.status === "fulfilled" ? bannerP.value : null;

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
          <Link
            href="/offres-emploi/candidats"
            className="inline-flex items-center rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-white"
          >
            Parcourir les CV (recruteurs)
          </Link>
        </div>
      </Hero>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {(jobsRes.pinned?.length ?? 0) > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">Offres mises en avant</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {(jobsRes.pinned as ApiJob[]).map((j) => (
                <div key={j.id} className="ring-1 ring-amber-300 rounded-md p-1">
                  <JobCard job={toUiJob(j)} />
                </div>
              ))}
            </div>
          </section>
        )}

        <JobBoard
          jobs={(rawJobs.map(toUiJob) as unknown) as UiJob[]}
          total={Number(jobsRes.total ?? 0)}
          companies={companies}
          professions={professions}
          types={types}
          countries={FRANCOPHONE_COUNTRIES}
        />
      </div>
    </div>
  );
}

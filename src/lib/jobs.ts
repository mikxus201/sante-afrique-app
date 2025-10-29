// src/lib/jobs.ts

import { API_PREFIX, getJSON } from "@/lib/api"; // tu l’as déjà

// ===== Types existants =====
export type JobLite = {
  id: number | string;
  title: string;
  company: string;
  company_id?: number;
  type: string;            // CDI, CDD, Stage, etc.
  location: string;
  country: string;
  profession?: string;     // ex: Pharmacien, Infirmier, Data Analyst...
  experienceMin?: number;  // années min
  publishedAt: string;     // ISO
  excerpt?: string;
  pinnedUntil?: string | null;
};

export type JobsListResponse = {
  items: JobLite[];
  total: number;
  pinned?: JobLite[];
};

// ===== Fonctions existantes (inchangées) =====
export async function fetchJobs(params: {
  q?: string;
  country?: string;
  type?: string;
  profession?: string;
  minExp?: string;
  companyId?: string;
  sort?: "date_desc" | "date_asc";
  page?: string;
} = {}): Promise<JobsListResponse> {
  const qs = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_PREFIX}/jobs?${qs}`, { cache: "no-store", credentials: "include" });
  if (!res.ok) throw new Error("Failed to load jobs");
  return res.json();
}

export async function fetchJob(id: string | number) {
  const res = await fetch(`${API_PREFIX}/jobs/${id}`, { cache: "no-store", credentials: "include" });
  if (!res.ok) throw new Error("Job not found");
  return res.json();
}

export type CompanyItem = { id:number; name:string; logo_url?:string; jobs_count:number; country?:string };

export async function fetchCompanies() {
  const res = await fetch(`${API_PREFIX}/companies`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load companies");
  return res.json() as Promise<{ items: CompanyItem[] }>;
}

export async function fetchMyApplicationsAgg() {
  const res = await fetch(`${API_PREFIX}/me/applications`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load applications");
  return res.json() as Promise<{
    items: {
      job: { id:number|string; title:string; published_at?:string|null; is_active:boolean };
      count: number;
      applications: {
        id:number|string; name:string; email:string; phone?:string|null;
        cover?:string|null; cv_url:string; created_at?:string|null;
      }[];
    }[];
  }>;
}

// ======== AJOUTS POUR FILTRES DYNAMIQUES ========

// Types de contrat (CDI, CDD, Stage, Freelance, etc.)
export async function fetchJobTypes() {
  // API attendue: GET /api/job-types -> { items: string[] }
  return getJSON<{ items: string[] }>(`${API_PREFIX}/job-types`);
}

// Professions (Pharmacien(ne), Infirmier(ère), etc.)
export async function fetchProfessions() {
  // API attendue: GET /api/job-professions -> { items: string[] }
  return getJSON<{ items: string[] }>(`${API_PREFIX}/job-professions`);
}

// Pays d’Afrique francophone (codes ISO2 + noms)
export type CountryOption = { code: string; name: string };

export const FRANCOPHONE_COUNTRIES: CountryOption[] = [
  { code: "DZ", name: "Algérie" },
  { code: "BJ", name: "Bénin" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "CM", name: "Cameroun" },
  { code: "CF", name: "Centrafrique" },
  { code: "KM", name: "Comores" },
  { code: "CG", name: "Congo (Brazzaville)" },
  { code: "CD", name: "Congo (RDC)" },
  { code: "CI", name: "Côte d’Ivoire" },
  { code: "DJ", name: "Djibouti" },
  { code: "GQ", name: "Guinée équatoriale" },
  { code: "GA", name: "Gabon" },
  { code: "GN", name: "Guinée" },
  { code: "MG", name: "Madagascar" },
  { code: "ML", name: "Mali" },
  { code: "MR", name: "Mauritanie" },
  { code: "MA", name: "Maroc" },
  { code: "NE", name: "Niger" },
  { code: "RW", name: "Rwanda" },
  { code: "SN", name: "Sénégal" },
  { code: "SC", name: "Seychelles" },
  { code: "TD", name: "Tchad" },
  { code: "TG", name: "Togo" },
  { code: "TN", name: "Tunisie" },
];

// (Option pratique) Récupération groupée des filtres
export async function fetchJobFilters() {
  const [typesRes, profsRes, companiesRes] = await Promise.all([
    fetchJobTypes(),
    fetchProfessions(),
    fetchCompanies(),
  ]);
  return {
    types: typesRes.items ?? [],
    professions: profsRes.items ?? [],
    companies: (companiesRes.items ?? []).map(c => ({ id: c.id, name: c.name })),
    countries: FRANCOPHONE_COUNTRIES,
  };
}

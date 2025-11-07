import { API_PREFIX, getJSON, ensureCsrf } from "@/lib/api";

/* ===========================
   Types — Jobs
   =========================== */
export type JobLite = {
  id: number | string;
  title: string;
  company: string;
  company_id?: number;
  type: string;
  location: string;
  country: string;
  profession?: string;
  experienceMin?: number;
  publishedAt: string;
  excerpt?: string;
  pinnedUntil?: string | null;
};

export type JobsListResponse = {
  items: JobLite[];
  total: number;
  pinned?: JobLite[];
};

/* ===========================
   API Jobs
   =========================== */
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
  const res = await fetch(`${API_PREFIX}/jobs?${qs}`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load jobs");
  return res.json();
}

export async function fetchJob(id: string | number) {
  const res = await fetch(`${API_PREFIX}/jobs/${id}`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Job not found");
  return res.json();
}

export type CompanyItem = {
  id: number;
  name: string;
  logo_url?: string;
  jobs_count: number;
  country?: string;
};

export async function fetchCompanies() {
  const res = await fetch(`${API_PREFIX}/companies`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load companies");
  return res.json() as Promise<{ items: CompanyItem[] }>;
}

/* ===========================
   Mes candidatures (agrégées)
   =========================== */
export async function fetchMyApplicationsAgg() {
  const base = API_PREFIX.replace(/\/+$/, "");
  const hdrs = {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  } as const;

  // 1) Sanctum
  let res = await fetch(`${base}/me/applications`, {
    method: "GET",
    headers: hdrs,
    credentials: "include",
    cache: "no-store",
    redirect: "manual",
  });

  if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
    return await res.json();
  }

  // 2) Fallback session web
  if (res.status === 0 || res.status === 401 || res.status === 302 || res.status === 301) {
    const res2 = await fetch(`${base}/me/applications-web`, {
      method: "GET",
      headers: hdrs,
      credentials: "include",
      cache: "no-store",
      redirect: "manual",
    });
    if (!res2.ok) {
      const txt2 = await res2.text().catch(() => "");
      throw new Error(`HTTP ${res2.status} ${txt2}`);
    }
    return await res2.json();
  }

  const txt = await res.text().catch(() => "");
  throw new Error(`HTTP ${res.status} ${txt}`);
}

/* ===========================
   Filtres dynamiques
   =========================== */
export async function fetchJobTypes() {
  return getJSON<{ items: string[] }>(`${API_PREFIX}/job-types`);
}

export async function fetchProfessions() {
  return getJSON<{ items: string[] }>(`${API_PREFIX}/job-professions`);
}

export type CountryOption = { code: string; name: string };

export const FRANCOPHONE_COUNTRIES: CountryOption[] = [
  { code: "DZ", name: "Algérie" }, { code: "BJ", name: "Bénin" }, { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" }, { code: "CM", name: "Cameroun" }, { code: "CF", name: "Centrafrique" },
  { code: "KM", name: "Comores" }, { code: "CG", name: "Congo (Brazzaville)" }, { code: "CD", name: "Congo (RDC)" },
  { code: "CI", name: "Côte d’Ivoire" }, { code: "DJ", name: "Djibouti" }, { code: "GQ", name: "Guinée équatoriale" },
  { code: "GA", name: "Gabon" }, { code: "GN", name: "Guinée" }, { code: "MG", name: "Madagascar" },
  { code: "ML", name: "Mali" }, { code: "MR", name: "Mauritanie" }, { code: "MA", name: "Maroc" },
  { code: "NE", name: "Niger" }, { code: "RW", name: "Rwanda" }, { code: "SN", name: "Sénégal" },
  { code: "SC", name: "Seychelles" }, { code: "TD", name: "Tchad" }, { code: "TG", name: "Togo" },
  { code: "TN", name: "Tunisie" },
];

export async function fetchJobFilters() {
  const [typesRes, profsRes, companiesRes] = await Promise.all([
    fetchJobTypes(),
    fetchProfessions(),
    fetchCompanies(),
  ]);
  return {
    types: typesRes.items ?? [],
    professions: profsRes.items ?? [],
    companies: (companiesRes.items ?? []).map((c) => ({ id: c.id, name: c.name })),
    countries: FRANCOPHONE_COUNTRIES,
  };
}

/* ===========================
   CVthèque (recruteurs)
   =========================== */
export type CandidateItem = {
  id: number;
  first_name: string;
  last_name: string;
  name?: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  profession?: string | null;
  experience_years?: number | null;
  desired_type?: string | null;
  availability?: string | null;
  skills?: string | null;
  cv_url?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CandidatesResponse = {
  items: CandidateItem[];
  total?: number;
  meta?: any;
};

/**
 * Tente 3 endpoints dans l'ordre :
 *  - /candidates/recruiter-any  (Sanctum OU session web)
 *  - /candidates/recruiter      (Sanctum)
 *  - /candidates/recruiter-web  (session web)
 * Affiche le bandeau d'accès réservé seulement si les 3 renvoient 401/402/403.
 */
export async function fetchRecruiterCandidates(params: {
  q?: string;
  country?: string;
  city?: string;
  profession?: string;
  experience_min?: string | number;
  type?: string;
  availability?: string;
  page?: string | number;
  per_page?: string | number;
} = {}): Promise<CandidatesResponse> {
  await ensureCsrf();

  const qs = new URLSearchParams(
    Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== "") acc[k] = String(v);
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const base = API_PREFIX.replace(/\/+$/, "");
  const hdrs = { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" } as const;

  const hit = async (path: string) => {
    const res = await fetch(`${base}${path}?${qs}`, {
      method: "GET",
      headers: hdrs,
      credentials: "include",
      cache: "no-store",
      redirect: "manual",
    });
    const ct = res.headers.get("content-type") || "";
    if (res.ok && ct.includes("application/json")) return res.json();
    return { __status: res.status };
  };

  let data: any;

  // 1) Endpoint unifié
  data = await hit(`/candidates/recruiter-any`);
  if (!("__status" in data)) return data;

  // 2) Sanctum
  data = await hit(`/candidates/recruiter`);
  if (!("__status" in data)) return data;

  // 3) Fallback session web
  data = await hit(`/candidates/recruiter-web`);
  if (!("__status" in data)) return data;

  return {
    items: [],
    total: 0,
    meta: { subscription_required: [401, 402, 403].includes(data.__status), http_status: data.__status },
  };
}

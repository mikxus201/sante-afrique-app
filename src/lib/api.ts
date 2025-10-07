/* =========================================================
   API BASE (normalisée)
   ========================================================= */
const RAW_ENV =
  (typeof process !== "undefined" && process.env && (process.env as any).NEXT_PUBLIC_API_URL) || "";

const RAW = String(RAW_ENV || "http://localhost:8000").replace(/\/+$/, "");
/** Racine serveur Laravel (sans /api) */
export const API_ROOT = RAW.replace(/\/api$/i, "");
/** Préfixe API JSON */
export const API_PREFIX = `${API_ROOT}/api`;

/** (Compat) Ancien export: on considère que "API" = racine publique */
export const API = API_ROOT;

/** Construit une URL absolue vers l’API JSON (préfixée /api) */
export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (/^https?:\/\//i.test(p)) return p;
  // ✅ corrige la coquille : on utilise bien le préfixe /api
  return `${API_PREFIX}${p}`;
}

/* =========================================================
   Utils génériques
   ========================================================= */
export function slugify(input: any): string {
  return String(input || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "-and-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function slugLoose(v: any): string { return slugify(v).replace(/^sante-/, ""); }

function flattenVals(input: any): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.flatMap((x) => flattenVals(x));
  if (typeof input === "object") {
    const pri = [input.slug, input.name, input.label, input.title];
    const rest = Object.values(input).filter((v) => typeof v !== "object");
    return [...pri, ...rest].filter(Boolean).map(String);
  }
  return [String(input)];
}

/* =========================================================
   Fetch helpers (GET/POST/PUT) avec cookies Sanctum
   ========================================================= */
import axios from "axios";

/** Axios pointe sur la RACINE Laravel (pas /api), pour supporter /api/* et /sanctum/* */
const ax = axios.create({
  baseURL: API_ROOT,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});
ax.defaults.xsrfCookieName = "XSRF-TOKEN";
ax.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

/** Optionnel Bearer (tests) */
ax.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const t = localStorage.getItem("sa_token");
    if (t) {
      const h = (config.headers ??= {} as any);
      if (!("Authorization" in h)) (h as any)["Authorization"] = `Bearer ${t}`;
    }
    // ✅ Pose explicitement X-XSRF-TOKEN si absent
    const h = (config.headers ??= {} as any);
    if (!("X-XSRF-TOKEN" in h)) {
      const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
      if (m) h["X-XSRF-TOKEN"] = decodeURIComponent(m[1]);
    }
  }
  return config;
});

/** Prépare le cookie CSRF (obligatoire avant POST/PUT/DELETE avec Sanctum) */
async function csrf() { await ax.get("/sanctum/csrf-cookie"); }

/** GET tolérant à { params } ou params à plat */
export async function getJSON<T = any>(
  path: string,
  paramsOrOpts?: Record<string, any> | { params?: Record<string, any> }
): Promise<T> {
  const params =
    paramsOrOpts && typeof paramsOrOpts === "object" && "params" in (paramsOrOpts as any)
      ? (paramsOrOpts as any).params
      : paramsOrOpts;
  const res = await ax.get(path, { params });
  return res.data as T;
}

export async function postJSON<T = any>(path: string, body?: any): Promise<T> {
  await csrf();
  const res = await ax.post(path, body ?? {});
  return res.data as T;
}

export async function putJSON<T = any>(path: string, body?: any): Promise<T> {
  await csrf();
  const res = await ax.put(path, body ?? {});
  return res.data as T;
}

/* =========================================================
   Helpers payload (compat multiples formats)
   ========================================================= */
function asArray(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.articles)) return payload.articles;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function readMeta(payload: any) {
  const meta = payload?.meta || payload?.pagination || payload?.links || null;
  const total = meta?.total ?? payload?.total ?? (Array.isArray(payload?.data) && payload?.data.length) ?? null;
  const perPage = meta?.per_page ?? meta?.perPage ?? payload?.per_page ?? payload?.perPage ?? null;
  const current = meta?.current_page ?? meta?.page ?? payload?.current_page ?? payload?.page ?? null;
  const last = meta?.last_page ?? payload?.last_page ?? (perPage && total ? Math.ceil(total / perPage) : null);
  return { total, perPage, current, last };
}

function dedupe(items: any[]) {
  const seen = new Set<string>();
  return items.filter((a) => {
    const key = String(a?.id ?? a?.slug ?? `${a?.title ?? ""}-${a?.created_at ?? ""}`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* =========================================================
   Media URL helpers
   ========================================================= */
export function toPublicMediaUrl(input?: string | null): string {
  const raw = String(input ?? "").trim();
  if (!raw) return "/placeholder.jpg";
  if (/^(data:|https?:\/\/|\/\/)/i.test(raw)) return raw;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${API_ROOT}${path}`;
}

export function pickImage(a: any): string {
  const cand =
    a?.thumbnail_url ||
    a?.cover_url ||
    a?.image_url ||
    a?.url ||
    a?.image ||
    a?.thumbnail ||
    a?.cover ||
    a?.thumb ||
    a?.photo ||
    a?.file ||
    a?.path ||
    "";
  return toPublicMediaUrl(cand);
}

/* =========================================================
   Filtres front robustes
   ========================================================= */
export function filterBySectionSlug(items: any[], slug: string) {
  const S = slugLoose(slug);
  return items.filter((a) => {
    const cand = [
      a?.rubric?.slug, a?.rubric?.name, a?.rubric_slug, a?.rubric,
      a?.section?.slug, a?.category?.slug, a?.section_slug, a?.category_slug,
      a?.rubrique_slug, a?.section?.name, a?.category?.name, a?.rubrique, a?.category, a?.section,
      ...(Array.isArray(a?.sections) ? a.sections : []),
      ...(Array.isArray(a?.rubriques) ? a.rubriques : []),
      ...(Array.isArray(a?.tags)
        ? a.tags.filter((t: any) =>
            ["section", "rubrique", "category", "categorie"].includes(
              String(t?.type ?? "").toLowerCase()
            )
          )
        : []),
    ];
    return flattenVals(cand).some((v) => slugLoose(v) === S);
  });
}

export function filterByAuthorSlug(items: any[], slug: string) {
  const S = slugLoose(slug);
  return items.filter((a) => {
    const single = [
      a?.author?.slug, a?.user?.slug, a?.created_by?.slug,
      a?.author_slug, a?.created_by_slug,
      a?.author?.username, a?.user?.username,
      a?.author?.name, a?.user?.name,
      typeof a?.author === "string" ? a.author : null,
    ];
    const multi = Array.isArray(a?.authors) ? a.authors : Array.isArray(a?.contributors) ? a.contributors : [];
    const all = [...single, ...multi];
    return flattenVals(all).some((v) => slugLoose(v) === S);
  });
}

/* =========================================================
   Résultat typé
   ========================================================= */
export type FetchResult = {
  items: any[];
  page: number;
  perPage: number;
  total: number | null;
};

function mapOrder(order?: string) {
  if (order === "popular" || order === "most_read") return { sort: "popular" };
  return { sort: "recent" };
}

/* -------- Helper: paginate & filtre quand on utilise /api/articles ------- */
async function fetchAcrossPagesAndFilter(
  basePath: string,
  baseParams: Record<string, any>,
  wantedPerPage: number,
  applyFilter: (items: any[]) => any[]
) {
  let page = Number(baseParams.page || 1);
  let collected: any[] = [];
  let lastPage: number | null = null;

  while (collected.length < wantedPerPage) {
    const params = { ...baseParams, page, per_page: baseParams.per_page, perPage: baseParams.perPage };
    const payload = await getJSON(basePath, { params });
    const arr = asArray(payload);
    const meta = readMeta(payload);
    lastPage = meta.last ?? lastPage ?? null;
    if (!arr.length) break;

    const filtered = applyFilter(arr);
    if (filtered.length) collected = dedupe([...collected, ...filtered]);

    if (!lastPage || page >= lastPage) break;
    page += 1;
  }

  return collected.slice(0, wantedPerPage);
}

/* =========================================================
   Rubriques / Auteurs / Magazine
   ========================================================= */
export async function fetchArticlesBySectionSlug(
  slug: string,
  opts: { page?: number; perPage?: number; order?: "recent" | "popular" } = {}
): Promise<FetchResult> {
  const page = Math.max(1, Number(opts.page || 1));
  const perPage = Math.max(1, Number(opts.perPage || 12));
  const orderParam = mapOrder(opts.order).sort;

  const tries = [
    { path: `/api/sections/${encodeURIComponent(slug)}/articles`, params: { page, per_page: perPage, perPage, sort: orderParam } },
    { path: `/api/articles`, params: { section_slug: slug, page, per_page: perPage, perPage, sort: orderParam } },
    { path: `/api/articles`, params: { section: slug, page, per_page: perPage, perPage, sort: orderParam } },
    { path: `/api/articles`, params: { rubrique: slug, page, per_page: perPage, perPage, sort: orderParam } },
    { path: `/api/articles`, params: { category: slug, page, per_page: perPage, perPage, sort: orderParam } },
    { path: `/api/articles`, params: { page, per_page: perPage, perPage, sort: orderParam, __fallback: true } },
  ];

  for (const t of tries) {
    try {
      if ((t.params as any).__fallback) {
        const items = await fetchAcrossPagesAndFilter(
          t.path,
          t.params,
          perPage,
          (arr) => filterBySectionSlug(arr, slug)
        );
        if (items.length) return { items, page, perPage, total: null };
        continue;
      }

      const payload = await getJSON(t.path, { params: t.params });
      let arr = asArray(payload);
      if (!arr.length) continue;
      if (t.path.endsWith("/api/articles")) arr = filterBySectionSlug(arr, slug);
      const meta = readMeta(payload);
      const sliced = meta.perPage ? arr : arr.slice(0, perPage);
      if (sliced.length) return { items: dedupe(sliced), page, perPage, total: meta.total ?? null };
    } catch {}
  }
  return { items: [], page, perPage, total: null };
}

export async function fetchArticlesByAuthorSlug(
  slug: string,
  opts: { page?: number; perPage?: number; order?: "recent" | "popular" } = {}
): Promise<FetchResult> {
  const page = Math.max(1, Number(opts.page || 1));
  const perPage = Math.max(1, Number(opts.perPage || 12));
  const orderParam = mapOrder(opts.order).sort;

  const tries = [
    { path: `/api/authors/${encodeURIComponent(slug)}/articles`, params: { page, per_page: perPage, perPage, sort: orderParam } },
    { path: `/api/users/${encodeURIComponent(slug)}/articles`, params: { page, per_page: perPage, perPage, sort: orderParam } },
    { path: `/api/articles`, params: { author_slug: slug, page, per_page: perPage, perPage, sort: orderParam } },
    { path: `/api/articles`, params: { author: slug, page, per_page: perPage, perPage, sort: orderParam } },
    { path: `/api/articles`, params: { user: slug, page, per_page: perPage, perPage, sort: orderParam } },
    { path: `/api/articles`, params: { created_by: slug, page, per_page: perPage, perPage, sort: orderParam } },
    { path: `/api/articles`, params: { page, per_page: perPage, perPage, sort: orderParam, __fallback: true } },
  ];

  for (const t of tries) {
    try {
      if ((t.params as any).__fallback) {
        const items = await fetchAcrossPagesAndFilter(
          t.path,
          t.params,
          perPage,
          (arr) => filterByAuthorSlug(arr, slug)
        );
        if (items.length) return { items, page, perPage, total: null };
        continue;
      }
      const payload = await getJSON(t.path, { params: t.params });
      let arr = asArray(payload);
      if (!arr.length) continue;
      if (t.path.endsWith("/api/articles")) arr = filterByAuthorSlug(arr, slug);
      const meta = readMeta(payload);
      const sliced = meta.perPage ? arr : arr.slice(0, perPage);
      if (sliced.length) return { items: dedupe(sliced), page, perPage, total: meta.total ?? null };
    } catch {}
  }
  return { items: [], page, perPage, total: null };
}

export async function fetchAuthorBySlug(slug: string) {
  const tries = [
    `/api/authors/${encodeURIComponent(slug)}`,
    `/api/users/${encodeURIComponent(slug)}`,
    `/authors/slug/${encodeURIComponent(slug)}`,
  ];
  for (const p of tries) {
    try {
      const data = await getJSON(p);
      return (data as any)?.data ?? (data as any) ?? null;
    } catch {}
  }
  return null;
}

/* =========================================================
   Magazine / Issues
   ========================================================= */
export type Issue = {
  id: number | string;
  slug: string;
  title: string;
  number?: number | string | null;
  date?: string | null;
  published_at?: string | null;
  cover_url?: string | null;
  pdf_url?: string | null;
};

export function pickIssueCover(a: any): string { return pickImage(a); }
export function pickIssuePdf(a: any): string | null {
  const raw = a?.pdf_url || a?.file_url || a?.pdf || a?.file || "";
  const url = toPublicMediaUrl(raw);
  return url === "/placeholder.jpg" ? null : url;
}

function mapIssue(a: any): Issue {
  return {
    id: a?.id ?? a?.slug ?? Math.random().toString(36).slice(2),
    slug: a?.slug ?? slugify(a?.title ?? a?.name ?? ""),
    title: a?.title ?? a?.name ?? "Numéro",
    number: a?.number ?? a?.issue_number ?? a?.no ?? a?.n ?? null,
    date: a?.date ?? a?.released_at ?? a?.publish_date ?? null,
    published_at: a?.published_at ?? a?.date ?? a?.released_at ?? null,
    cover_url: pickIssueCover(a),
    pdf_url: pickIssuePdf(a),
  };
}

export async function listIssues(
  opts: { page?: number; perPage?: number; order?: "recent" | "popular" } = {},
): Promise<Issue[]> {
  const page = Math.max(1, Number(opts.page || 1));
  const perPage = Math.max(1, Number(opts.perPage || 50));
  const orderParam = opts.order === "popular" ? "popular" : "recent";

  const tries = [
    { path: "/api/issues", params: { page, per_page: perPage, perPage, sort: orderParam } },
    { path: "/api/magazine/issues", params: { page, per_page: perPage, perPage, sort: orderParam } },
    { path: "/issues", params: { page, per_page: perPage } },
  ];

  for (const t of tries) {
    try {
      const payload = await getJSON(t.path, { params: t.params });
      const arr = Array.isArray(payload)
        ? payload
        : (payload as any)?.data || (payload as any)?.items || (payload as any)?.issues || [];
      if (Array.isArray(arr) && arr.length) return arr.map(mapIssue);
    } catch {}
  }
  return [];
}

/* =========================================================
   AUTH & MON COMPTE (API)
   ========================================================= */
// Inscription
export async function registerAccount(payload: { name: string; email: string; password: string; phone?: string }) {
  return postJSON("/api/auth/register", payload);
}

/** Connexion email + mot de passe (priorité aux routes web: /auth/login) */
export async function passwordLogin(email: string, password: string) {
  await csrf();

  // ✅ Essaie d'abord l'endpoint qui marche chez toi (/api/auth/login)
  const tries = ["/api/auth/login", "/auth/login", "/api/login", "/login"];

  let lastErr: any = null;
  for (const path of tries) {
    try {
      const res = await ax.post(path, { email, password });
      return res.data || { ok: true };
    } catch (e: any) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      if (status === 403 && (data?.otp_required || data?.need_otp || data?.two_factor_required)) {
        return data; // si ton back signale explicitement l'OTP
      }
      lastErr = e;
    }
  }
  const data = lastErr?.response?.data;
  throw new Error(data?.message || data?.error || lastErr?.message || "Login API introuvable.");
}

/** OTP : demande d’envoi (email/identifier) */
export async function otpRequest(identifier: string) {
  await csrf();
  const tries = ["/auth/request-otp", "/request-otp", "/api/auth/request-otp", "/api/request-otp"];

  let lastErr: any = null;
  for (const path of tries) {
    try {
      const res = await ax.post(path, { identifier, email: identifier });
      return res.data || { ok: true };
    } catch (e: any) {
      lastErr = e;
    }
  }
  const data = lastErr?.response?.data;
  throw new Error(data?.message || data?.error || lastErr?.message || "OTP request: endpoint introuvable.");
}

/** OTP : vérification */
export async function otpVerify(identifier: string, code: string) {
  await csrf();
  const tries = [
    "/auth/verify-otp", "/verify-otp",
    "/api/auth/verify-otp", "/api/verify-otp",
    // fallback : certains back combinent /login + otp
    "/auth/login", "/login"
  ];

  let lastErr: any = null;
  for (const path of tries) {
    try {
      const payload =
        path.endsWith("/login")
          ? { email: identifier, otp: code }
          : { identifier, code, email: identifier };
      const res = await ax.post(path, payload);
      return res.data || { ok: true };
    } catch (e: any) {
      lastErr = e;
    }
  }
  const data = lastErr?.response?.data;
  throw new Error(data?.message || data?.error || lastErr?.message || "OTP verify: endpoint introuvable.");
}

/** Profil connecté (protégé Sanctum) */
export async function me() {
  try {
    return await getJSON("/api/auth/me");
  } catch {
    return null; // 401 -> non connecté
  }
}

/** Mise à jour profil */
export async function updateMe(data: { nom?: string; prenoms?: string; phone?: string }) {
  return postJSON("/api/me", data);
}

/** Abonnement courant */
export async function getMySubscription() {
  return getJSON<{ data: any }>("/api/me/subscription");
}

/** Moyens de paiement */
export async function listPaymentMethods() {
  return getJSON<{ data: any[] }>("/api/me/payment-methods");
}
export async function addPaymentMethod(payload: any) {
  return postJSON("/api/me/payment-methods", payload);
}

/** Factures & PDF */
export async function listInvoices() {
  return getJSON<{ data: any[] }>("/api/me/invoices");
}
export function invoicePdfUrl(id: number | string) {
  return `${API_PREFIX}/me/invoices/${id}/pdf`;
}

/** Newsletters */
export async function listNewsletterTopics() {
  return getJSON<{ data: Array<{ id: number; slug: string; name: string; subscribed: boolean }> }>("/api/me/newsletters");
}
export async function toggleNewsletterTopic(topic_id: number, subscribed?: boolean) {
  return postJSON("/api/me/newsletters/toggle", { topic_id, subscribed });
}

/** Déconnexion (essaie /auth/logout puis /api/auth/logout) */
export async function logoutApi() {
  await csrf();
  const tries = ["/auth/logout", "/api/auth/logout"];
  for (const p of tries) {
    try { await ax.post(p, {}); return; } catch {}
  }
}

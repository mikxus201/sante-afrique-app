// src/lib/account.ts
const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

/** ---------- helpers HTTP ---------- */
async function jget<T = any>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    credentials: "include", // indispensable pour envoyer le cookie de session
  });
  if (!res.ok) {
    // 401 = pas authentifié côté API (cookie manquant / CORS)
    throw new Error(`HTTP_${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function jput<T = any>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  return res.json() as Promise<T>;
}

/** ---------- types (facultatif mais utile) ---------- */
export type PlanDto = {
  id: number;
  name?: string | null;
  slug?: string | null;
  price_cfa?: number | null;
  price?: number | null;
};

export type SubscriptionDto = {
  id: number;
  status: "pending" | "active" | "failed" | "cancelled";
  starts_at: string | null;
  ends_at: string | null;
  days_left?: number | null;
  plan?: PlanDto | null;
};

export type SubscriptionResp = {
  active: boolean;
  subscription: SubscriptionDto | null;
};

/** ---------- API account ---------- */
export const getMe           = () => jget("/api/me");
export const updateMe        = (payload: any) => jput("/api/me", payload);
export const getInvoices     = (page = 1) => jget(`/api/me/invoices?page=${page}`);
export const getNewsletters  = () => jget("/api/me/newsletters");
export const saveNewsletters = (topics: string[]) => jput("/api/me/newsletters", { topics });

/**
 * Statut d’abonnement (route principale + fallbacks).
 * Utilise l’endpoint que nous avons ajouté côté Laravel:
 *   GET /api/account/subscription  (auth:sanctum)
 */
export async function getSubscription(): Promise<SubscriptionResp> {
  // endpoint principal
  try {
    return await jget<SubscriptionResp>("/api/account/subscription");
  } catch (e) {
    // fallbacks si tu as d’autres routes en place
    const fallbacks = [
      "/api/me/subscription",
      "/api/subscription",
      "/api/account/subscriptions/current",
    ];
    for (const p of fallbacks) {
      try {
        return await jget<SubscriptionResp>(p);
      } catch {}
    }
    throw e;
  }
}

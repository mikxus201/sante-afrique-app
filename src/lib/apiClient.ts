// src/lib/apiClient.ts

/** Base URL côté front (env en priorité) */
const API =
  (typeof process !== "undefined" &&
    process.env &&
    (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")) ||
  "http://localhost:8000";

/** Récupère la valeur d'un cookie (ex: "XSRF-TOKEN") */
function getCookie(name: string) {
  const safe = name.replace(/([$?*|{}()[\]\\/+^])/g, "\\$1");
  const m = document.cookie.match(new RegExp("(^|; )" + safe + "=([^;]*)"));
  return m ? decodeURIComponent(m[2]) : null;
}

/** Pose le cookie CSRF de Sanctum (obligatoire avant POST/PUT/PATCH/DELETE) */
export async function csrf() {
  await fetch(`${API}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
  });
}

/** Helper générique (GET/POST/...) qui ajoute cookies + headers nécessaires */
async function apiFetch(
  path: string,
  init: RequestInit = {},
  { autoCsrf = false }: { autoCsrf?: boolean } = {}
) {
  const url = `${API}${path.startsWith("/") ? path : `/${path}`}`;

  if (autoCsrf) {
    await csrf();
  }

  const xsrf = getCookie("XSRF-TOKEN") || "";
  const headers: HeadersInit = {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}),
    ...(init.headers || {}),
  };

  const res = await fetch(url, {
    credentials: "include",
    ...init,
    headers,
  });

  // 204 = No Content (logout, login qui ne renvoie rien, etc.)
  if (res.status === 204) return null;

  // Essaye de parser JSON; en cas d'erreur, lève en gardant le status
  if (!res.ok) {
    let msg = `${res.status}`;
    try {
      const j = await res.json();
      msg = j?.message ? `${res.status} ${j.message}` : msg;
    } catch {}
    throw new Error(msg);
  }

  // Si pas de corps JSON, retourne null
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text as any;
  }
}

/** GET avec cookies + headers (CSRF non requis pour GET, mais headers ok) */
export async function apiGet(path: string) {
  return apiFetch(path, { method: "GET" });
}

/** POST JSON (pose CSRF automatiquement) */
export async function apiPost(path: string, body: any = {}) {
  return apiFetch(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    },
    { autoCsrf: true }
  );
}

/** (Optionnels) PUT / PATCH / DELETE si tu en as besoin plus tard */
export async function apiPut(path: string, body: any = {}) {
  return apiFetch(
    path,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    },
    { autoCsrf: true }
  );
}

export async function apiPatch(path: string, body: any = {}) {
  return apiFetch(
    path,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    },
    { autoCsrf: true }
  );
}

export async function apiDelete(path: string) {
  return apiFetch(path, { method: "DELETE" }, { autoCsrf: true });
}

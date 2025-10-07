// src/lib/http.ts
export async function postJSON<T = any>(url: string, data: any, token?: string): Promise<T> {
  const r = await fetch(process.env.NEXT_PUBLIC_API_URL + url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(json?.message || json?.error || "Erreur API");
  return json as T;
}

export async function getJSON<T = any>(url: string, token?: string): Promise<T> {
  const r = await fetch(process.env.NEXT_PUBLIC_API_URL + url, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(json?.message || "Erreur API");
  return json as T;
}

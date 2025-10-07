// src/lib/server-api.ts
import "server-only";
import { cookies } from "next/headers";
import { apiUrl } from "@/lib/api";

/** Lis tous les cookies (compatible plusieurs versions de Next) */
function readAllCookies(): Array<{ name: string; value: string }> {
  try {
    const jar: any = cookies();
    if (typeof jar?.getAll === "function") {
      return jar.getAll() as Array<{ name: string; value: string }>;
    }
    if (jar && typeof (jar as any)[Symbol.iterator] === "function") {
      return Array.from(jar as any).map((c: any) => ({
        name: String(c?.name ?? ""),
        value: String(c?.value ?? ""),
      }));
    }
    const names = ["XSRF-TOKEN", "laravel_session"];
    const list: Array<{ name: string; value: string }> = [];
    for (const n of names) {
      const v = jar?.get?.(n)?.value;
      if (v) list.push({ name: n, value: String(v) });
    }
    return list;
  } catch {
    return [];
  }
}

/** Construit l’header Cookie */
function buildCookieHeader(): string {
  const list = readAllCookies();
  if (!list.length) return "";
  return list
    .map(({ name, value }) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join("; ");
}

/** Récupère le XSRF depuis le cookie et le renvoie en header */
function buildXsrfHeader(): Record<string, string> {
  try {
    const jar: any = cookies();
    const raw: string | undefined = jar?.get?.("XSRF-TOKEN")?.value;
    return raw ? { "X-XSRF-TOKEN": decodeURIComponent(String(raw)) } : {};
  } catch {
    return {};
  }
}

/** GET côté serveur en forwardant les cookies vers Laravel (Sanctum) */
export async function serverGet(
  path: string,
  params: Record<string, any> = {}
): Promise<any> {
  const url = new URL(apiUrl(path));
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  });

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      Cookie: buildCookieHeader(), // ✅ forward session
      ...buildXsrfHeader(),        // ✅ XSRF si présent
    },
    cache: "no-store",
  });

  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch {}

  if (!res.ok) {
    const detail = json?.message || json?.error || res.statusText;
    throw new Error(`GET ${url} -> ${res.status} ${detail}`);
  }
  return json;
}

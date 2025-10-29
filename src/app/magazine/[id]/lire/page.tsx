// src/app/magazine/[id]/lire/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { headers as nextHeaders } from "next/headers";
import { notFound, redirect } from "next/navigation";
import MagReader from "@/components/mag/MagReader";

export const metadata = {
  title: "Lecture du magazine — Santé Afrique",
  robots: { index: false, follow: false },
};

// --- util: extrait un cookie d'un header Cookie: ---
function readCookie(cookieHeader: string, name: string): string | null {
  const m = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? m[1] : null;
}

async function authorize(id: string) {
  const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
  const cookie = nextHeaders().get("cookie") || "";

  // Récupère le XSRF côté navigateur pour le renvoyer en X-XSRF-TOKEN
  const xsrfCookie = readCookie(cookie, "XSRF-TOKEN");
  const xsrfHeader = xsrfCookie ? decodeURIComponent(xsrfCookie) : "";

  async function call(method: "POST" | "GET") {
    const res = await fetch(`${API}/api/issues/${encodeURIComponent(id)}/authorize`, {
      method,
      headers: {
        Accept: "application/json",
        Cookie: cookie,                 // ← relaie le cookie de session
        ...(xsrfHeader ? { "X-XSRF-TOKEN": xsrfHeader } : {}), // ← CSRF pour POST
      },
      cache: "no-store",
      redirect: "manual",              // évite de suivre une éventuelle redirection HTML
    });
    return res;
  }

  // 1) Tente en POST (flux "stateful" classique)
  let res = await call("POST");

  // 419 (CSRF) / 405 (méthode non autorisée) → fallback GET
  if (res.status === 419 || res.status === 405) {
    res = await call("GET");
  }

  // 401/403 → pas autorisé → page abonnement
  if (res.status === 401 || res.status === 403) {
    redirect(`/abonnement?from=/magazine/${encodeURIComponent(id)}/lire`);
  }

  if (!res.ok) notFound();

  const json = await res.json().catch(() => null);
  if (!json?.pages?.length) notFound();

  return json as {
    issue: { id: number; slug?: string; number?: string | number; title?: string };
    user: { id: number; name?: string; email?: string };
    pages: Array<{ id: number; number: number; url: string; w?: number; h?: number }>;
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const data = await authorize(params.id);
  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-3 text-xl font-bold">Magazine N°{data.issue?.number ?? "—"}</h1>
      <MagReader pages={data.pages} issue={data.issue} user={data.user} />
    </main>
  );
}

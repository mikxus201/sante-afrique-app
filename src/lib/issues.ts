// src/lib/issues.ts
function getCookie(name: string) {
  return typeof document === "undefined"
    ? null
    : document.cookie
        .split("; ")
        .find((row) => row.startsWith(name + "="))
        ?.split("=")[1] ?? null;
}

export async function authorizeIssue(id: string | number) {
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // 1) Demande le cookie XSRF
  await fetch(`${API}/sanctum/csrf-cookie`, {
    credentials: "include",
    cache: "no-store",
  });

  // 2) Récupère le token XSRF du cookie et passe-le dans l’en-tête
  const xsrf = getCookie("XSRF-TOKEN");
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
  if (xsrf) headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrf);

  // 3) Appel d’autorisation
  const res = await fetch(
    `${API}/api/issues/${encodeURIComponent(String(id))}/authorize`,
    {
      method: "POST",
      credentials: "include",
      headers,
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Auth failed ${res.status}: ${txt}`);
  }
  return res.json();
}

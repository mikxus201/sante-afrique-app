// src/lib/account.ts
const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/,"");

async function jget(path: string) {
  const res = await fetch(`${API}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    credentials: "include", // important si session/cookies
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

async function jput(path: string, body: any) {
  const res = await fetch(`${API}${path}`, {
    method: "PUT",
    headers: { "Content-Type":"application/json", Accept:"application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export const getMe         = () => jget("/api/me");
export const updateMe      = (payload:any) => jput("/api/me", payload);
export const getInvoices   = (page=1) => jget(`/api/me/invoices?page=${page}`);
export const getNewsletters= () => jget("/api/me/newsletters");
export const saveNewsletters= (topics:string[]) => jput("/api/me/newsletters", { topics });

// src/app/api/subscribe-request/route.ts
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // 👉 Si tu gères CinetPay côté Next (clé API côté Next), implémente l’appel ici.
  // 👉 Si c’est Laravel qui gère, relaie simplement :
  const API = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const body = await req.text();
  const r = await fetch(`${API}/api/subscribe-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      // on propage le bearer s'il existe
      "Authorization": req.headers.get("authorization") || "",
    },
    body: body || undefined,
  });
  return new Response(await r.text(), { status: r.status, headers: { "Content-Type":"application/json" }});
}

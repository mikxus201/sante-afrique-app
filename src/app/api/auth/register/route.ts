// Proxy Next → Laravel pour l'inscription
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const API = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, ""); // ex: http://localhost:8000
  const body = await req.text();
  const r = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: req.headers.get("authorization") || "",
    },
    body: body || undefined,
  });
  return new Response(await r.text(), {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}

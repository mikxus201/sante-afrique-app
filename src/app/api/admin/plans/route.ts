import { NextRequest } from "next/server";
const API = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export async function GET() {
  const r = await fetch(`${API}/api/admin/plans`, { headers: { Accept: "application/json" } });
  return new Response(await r.text(), { status: r.status, headers: { "Content-Type":"application/json" }});
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const r = await fetch(`${API}/api/admin/plans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: req.headers.get("authorization") || "",
    },
    body
  });
  return new Response(await r.text(), { status: r.status, headers: { "Content-Type":"application/json" }});
}

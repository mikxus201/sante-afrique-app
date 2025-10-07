import { NextRequest } from "next/server";
const API = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.text();
  const r = await fetch(`${API}/api/admin/plans/${params.id}/publish`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: req.headers.get("authorization") || "",
    },
    body
  });
  return new Response(await r.text(), { status: r.status, headers: { "Content-Type":"application/json" }});
}

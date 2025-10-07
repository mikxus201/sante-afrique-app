// src/app/api/plans/[slug]/route.ts
export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const API = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const url = `${API}/api/plans/${encodeURIComponent(params.slug)}`;
  const r = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  return new Response(await r.text(), {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}

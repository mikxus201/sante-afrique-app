// src/app/api/_relay.ts
export const API = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
export async function relay(req: Request, path: string) {
  const body = await req.text();
  const r = await fetch(`${API}${path}`, {
    method: req.method,
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: body || undefined,
    cache: "no-store",
  });
  return new Response(await r.text(), { status: r.status, headers: { "Content-Type":"application/json" }});
}

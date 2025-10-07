// src/app/api/plans/route.ts
import { API } from "../_relay";

export async function GET() {
  const r = await fetch(`${API}/api/plans`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  return new Response(await r.text(), {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}

const API = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const r = await fetch(`${API}/api/admin/plans/${params.id}`, { method: "DELETE" });
  return new Response(await r.text(), { status: r.status, headers: { "Content-Type":"application/json" }});
}

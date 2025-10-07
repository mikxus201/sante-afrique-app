"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-client";

type Plan = { id:number; name:string; slug:string; description?:string|null; price_fcfa:number; is_published:boolean };

export default function AdminPlans() {
  const { token } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState({ name:"", slug:"", price_fcfa:15000, description:"", is_published:true });
  const [msg, setMsg] = useState<string|null>(null);

  async function load() {
    const r = await fetch("/api/admin/plans");
    const j = await r.json();
    setPlans(Array.isArray(j) ? j : []);
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    const r = await fetch("/api/admin/plans", {
      method:"POST",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token||""}` },
      body: JSON.stringify(form),
    });
    if (!r.ok) { setMsg("Erreur création"); return; }
    setForm({ name:"", slug:"", price_fcfa:15000, description:"", is_published:true });
    load();
  }

  async function togglePublish(p: Plan) {
    const r = await fetch(`/api/admin/plans/${p.id}/publish`, {
      method:"PATCH",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token||""}` },
      body: JSON.stringify({ is_published: !p.is_published }),
    });
    if (!r.ok) { setMsg("Erreur publication"); return; }
    load();
  }

  async function remove(p: Plan) {
    if (!confirm("Supprimer cette offre ?")) return;
    const r = await fetch(`/api/admin/plans/${p.id}`, { method:"DELETE" });
    if (!r.ok) { setMsg("Erreur suppression"); return; }
    load();
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Offres d’abonnement</h1>

      <form onSubmit={create} className="grid gap-3 rounded border p-4">
        <input className="border rounded px-3 py-2" placeholder="Nom" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
        <input className="border rounded px-3 py-2" placeholder="Slug (annuel-numerique)" value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})} required />
        <input className="border rounded px-3 py-2" type="number" placeholder="Prix FCFA" value={form.price_fcfa} onChange={e=>setForm({...form, price_fcfa:Number(e.target.value)})} required />
        <textarea className="border rounded px-3 py-2" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={form.is_published} onChange={e=>setForm({...form, is_published:e.target.checked})} />
          Publier
        </label>
        <button className="self-start rounded bg-neutral-900 text-white px-4 py-2">Créer</button>
      </form>

      <div className="rounded border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="p-2 text-left">Nom</th>
              <th className="p-2 text-left">Slug</th>
              <th className="p-2 text-right">Prix</th>
              <th className="p-2 text-center">Publié</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {plans.map(p=>(
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.slug}</td>
                <td className="p-2 text-right">{p.price_fcfa.toLocaleString()} FCFA</td>
                <td className="p-2 text-center">
                  <button onClick={()=>togglePublish(p)} className={`px-2 py-1 rounded ${p.is_published?'bg-green-600':'bg-neutral-400'} text-white`}>
                    {p.is_published?'Publié':'Brouillon'}
                  </button>
                </td>
                <td className="p-2 text-right">
                  <button onClick={()=>remove(p)} className="px-2 py-1 rounded bg-red-600 text-white">Supprimer</button>
                </td>
              </tr>
            ))}
            {plans.length===0 && <tr><td className="p-4 text-center text-neutral-500" colSpan={5}>Aucune offre</td></tr>}
          </tbody>
        </table>
      </div>

      {msg && <p className="text-sm text-red-600">{msg}</p>}
    </div>
  );
}

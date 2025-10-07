"use client";

import { useEffect, useState } from "react";
import { listPaymentMethods, addPaymentMethod } from "@/lib/api";

type PM = { id: string; brand?: string; last4?: string; exp_month?: number; exp_year?: number };

export default function PaiementsPage() {
  const [items, setItems] = useState<PM[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await listPaymentMethods();
        setItems((r as any).data ?? []);
      } catch {}
    })();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdding(true);
    try {
      // démo payload (à remplacer par un vrai token de PSP plus tard)
      const fd = new FormData(e.currentTarget);
      const payload = {
        brand: String(fd.get("brand") || "card"),
        last4: String(fd.get("last4") || "0000"),
        exp_month: Number(fd.get("exp_month") || 1),
        exp_year: Number(fd.get("exp_year") || 2030),
      };
      await addPaymentMethod(payload);
      const r = await listPaymentMethods();
      setItems((r as any).data ?? []);
      (e.currentTarget as HTMLFormElement).reset();
    } finally {
      setAdding(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded border bg-white p-6">
        <h2 className="text-xl font-extrabold">Moyens de paiement enregistrés</h2>
        {items.length ? (
          <ul className="mt-3 space-y-2">
            {items.map((pm) => (
              <li key={pm.id} className="rounded border px-3 py-2">
                {(pm.brand || "Carte")} •••• {pm.last4} — {pm.exp_month}/{pm.exp_year}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-neutral-700">Vous n’avez pas de moyen de paiement enregistré.</p>
        )}
      </div>

      <form onSubmit={onSubmit} className="rounded border bg-white p-6 space-y-4">
        <h3 className="text-lg font-bold">Ajouter un moyen de paiement</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          <input name="brand" className="rounded border px-3 py-2" placeholder="Brand (ex: visa)" />
          <input name="last4" className="rounded border px-3 py-2" placeholder="Derniers 4 (ex: 4242)" />
          <input name="exp_month" className="rounded border px-3 py-2" placeholder="MM" />
          <input name="exp_year" className="rounded border px-3 py-2" placeholder="AAAA" />
        </div>
        <button
          type="submit"
          className="inline-flex rounded bg-neutral-900 px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
          disabled={adding}
        >
          {adding ? "Ajout…" : "Ajouter"}
        </button>
      </form>
    </section>
  );
}

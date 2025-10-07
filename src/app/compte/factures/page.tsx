"use client";

import { useEffect, useState } from "react";
import { listInvoices, invoicePdfUrl } from "@/lib/api";

type Inv = {
  id: number | string;
  number?: string | null;
  status?: string | null;
  period_from?: string | null;
  period_to?: string | null;
  period?: string | null;
  amount_cfa?: number | null;
  amount_fcfa?: number | null;
  amount?: number | null;
  currency?: string | null;
  pdf_url?: string | null;
};

export default function FacturesPage() {
  const [rows, setRows] = useState<Inv[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await listInvoices();
        setRows((r as any).data ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <section className="rounded border bg-white p-6">Chargement…</section>;

  return (
    <section className="rounded border bg-white p-6">
      <h2 className="text-xl font-extrabold">Factures</h2>
      {rows.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[560px] w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-4">N°</th>
                <th className="py-2 pr-4">Période</th>
                <th className="py-2 pr-4">Montant</th>
                <th className="py-2 pr-4">Statut</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => {
                const amount = (f.amount_cfa ?? f.amount_fcfa ?? f.amount ?? 0) as number;
                const currency = f.currency ?? "XOF";
                const period =
                  f.period_from || f.period_to
                    ? `${(f.period_from || "").slice(0, 10)} → ${(f.period_to || "").slice(0, 10)}`
                    : f.period || "—";
                const pdfHref = f.pdf_url || invoicePdfUrl(f.id);
                return (
                  <tr key={String(f.id)} className="border-b">
                    <td className="py-2 pr-4">{f.number ?? `INV-${f.id}`}</td>
                    <td className="py-2 pr-4">{period}</td>
                    <td className="py-2 pr-4">{Number(amount).toLocaleString("fr-FR")} {currency}</td>
                    <td className="py-2 pr-4">
                      {f.status === "paid" ? "Payé" : f.status === "unpaid" ? "Impayé" : f.status === "canceled" ? "Annulé" : (f.status ?? "—")}
                    </td>
                    <td className="py-2">
                      {pdfHref ? (
                        <a className="rounded border px-3 py-1 hover:bg-neutral-50" href={pdfHref} target="_blank">
                          Télécharger (PDF)
                        </a>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 text-neutral-600 text-sm">Aucune facture.</p>
      )}
    </section>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchMyApplicationsAgg } from "@/lib/jobs";

type AppItem = {
  id: number | string;
  name: string;
  email: string;
  phone?: string | null;
  cover?: string | null;
  cv_url: string;
  created_at?: string | null;
};

type Bucket = {
  job: { id: number | string; title: string; published_at?: string | null; is_active: boolean };
  count: number;
  applications: AppItem[];
};

export default function MyApplicationsPage() {
  const [buckets, setBuckets] = useState<Bucket[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetchMyApplicationsAgg();
        setBuckets(r.items || []);
      } catch (e) {
        setErr("Impossible de charger vos candidatures.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <section className="rounded border bg-white p-6">Chargement…</section>;

  if (err) return (
    <section className="rounded border bg-white p-6">
      <h2 className="text-xl font-extrabold mb-1">Candidatures reçues</h2>
      <p className="text-sm text-red-600">{err}</p>
      <div className="mt-4">
        <Link href="/offres-emploi/poster" className="inline-flex rounded bg-neutral-900 px-4 py-2 text-white hover:opacity-90">
          Poster une offre
        </Link>
      </div>
    </section>
  );

  if (!buckets?.length) return (
    <section className="rounded border bg-white p-6">
      <h2 className="text-xl font-extrabold">Candidatures reçues</h2>
      <p className="mt-2 text-neutral-700">Aucune candidature pour l’instant.</p>
      <div className="mt-4">
        <Link href="/offres-emploi/poster" className="inline-flex rounded bg-neutral-900 px-4 py-2 text-white hover:opacity-90">
          Poster une offre
        </Link>
      </div>
    </section>
  );

  return (
    <div className="space-y-6">
      <section className="rounded border bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Candidatures reçues</h2>
          <Link href="/offres-emploi/poster" className="inline-flex rounded border px-3 py-1.5 text-sm font-semibold hover:bg-neutral-50">
            Poster une nouvelle offre
          </Link>
        </div>

        <div className="mt-6 space-y-6">
          {buckets.map((b) => (
            <div key={String(b.job.id)} className="rounded border">
              <div className="flex items-center justify-between p-4 bg-neutral-50">
                <div>
                  <p className="font-semibold">{b.job.title}</p>
                  <p className="text-xs text-neutral-600">
                    {b.job.is_active ? "En ligne" : "En attente"} • {b.job.published_at ? new Date(b.job.published_at).toLocaleDateString("fr-FR") : "—"}
                  </p>
                </div>
                <span className="rounded-full bg-neutral-800 text-white text-xs px-2 py-1 font-semibold">
                  {b.count} candidature{b.count>1?"s":""}
                </span>
              </div>

              {b.applications.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-neutral-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Candidat</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Téléphone</th>
                        <th className="px-4 py-2 text-left">Reçue le</th>
                        <th className="px-4 py-2 text-left">CV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {b.applications.map((a) => (
                        <tr key={String(a.id)} className="border-t">
                          <td className="px-4 py-2">{a.name}</td>
                          <td className="px-4 py-2">{a.email}</td>
                          <td className="px-4 py-2">{a.phone || "—"}</td>
                          <td className="px-4 py-2">{a.created_at ? new Date(a.created_at).toLocaleString("fr-FR") : "—"}</td>
                          <td className="px-4 py-2">
                            <a href={a.cv_url} target="_blank" className="inline-flex rounded bg-blue-600 px-3 py-1.5 text-white font-semibold hover:bg-blue-700">
                              Télécharger
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="p-4 text-sm text-neutral-600">Aucune candidature pour cette offre.</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

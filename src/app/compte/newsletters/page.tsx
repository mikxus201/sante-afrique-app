"use client";

import { useEffect, useState } from "react";
import { listNewsletterTopics, toggleNewsletterTopic } from "@/lib/api";

type Topic = { id: number; slug: string; name: string; subscribed: boolean };

export default function NewslettersPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await listNewsletterTopics();
        // Accepte { items: [...] } OU { data: [...] } OU réponse brute [...]
        const items =
          (r && (r as any).items) ??
          (r && (r as any).data) ??
          (Array.isArray(r) ? r : []);
        setTopics(items as Topic[]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function toggle(t: Topic) {
    if (busyId === t.id) return; // anti double-clic
    const prev = [...topics];

    // Optimiste
    setTopics((ts) => ts.map((x) => (x.id === t.id ? { ...x, subscribed: !x.subscribed } : x)));
    setBusyId(t.id);

    try {
      // Endpoint POST /api/me/newsletters/toggle (lib/api)
      await toggleNewsletterTopic(t.id, !t.subscribed);
    } catch {
      // Rollback si échec
      setTopics(prev);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <section className="rounded border bg-white p-6">Chargement…</section>;

  return (
    <section className="rounded border bg-white p-6">
      <h2 className="text-xl font-extrabold">Gérer mes newsletters</h2>

      {topics.length ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {topics.map((n) => {
            const isBusy = busyId === n.id;
            return (
              <div key={n.id} className="rounded border p-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{n.name}</h3>
                  <p className="text-xs text-neutral-600">({n.slug})</p>
                </div>
                <button
                  onClick={() => (isBusy ? undefined : toggle(n))}
                  disabled={isBusy}
                  className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                    n.subscribed ? "bg-green-600 text-white" : "bg-neutral-200"
                  } ${isBusy ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {n.subscribed ? "ABONNÉ" : "S’abonner"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 text-neutral-600 text-sm">Aucun thème disponible.</p>
      )}
    </section>
  );
}

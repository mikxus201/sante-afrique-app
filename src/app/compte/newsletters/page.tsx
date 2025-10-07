"use client";

import { useEffect, useState } from "react";
import { listNewsletterTopics, toggleNewsletterTopic } from "@/lib/api";

type Topic = { id: number; slug: string; name: string; subscribed: boolean };

export default function NewslettersPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await listNewsletterTopics();
        setTopics((r as any).data ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function toggle(t: Topic) {
    const prev = [...topics];
    setTopics((ts) => ts.map((x) => (x.id === t.id ? { ...x, subscribed: !x.subscribed } : x)));
    try {
      await toggleNewsletterTopic(t.id, !t.subscribed);
    } catch {
      setTopics(prev); // rollback
    }
  }

  if (loading) return <section className="rounded border bg-white p-6">Chargement…</section>;

  return (
    <section className="rounded border bg-white p-6">
      <h2 className="text-xl font-extrabold">Gérer mes newsletters</h2>
      {topics.length ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {topics.map((n) => (
            <div key={n.id} className="rounded border p-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">{n.name}</h3>
                <p className="text-xs text-neutral-600">({n.slug})</p>
              </div>
              <button
                onClick={() => toggle(n)}
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  n.subscribed ? "bg-green-600 text-white" : "bg-neutral-200"
                }`}
              >
                {n.subscribed ? "ABONNÉ" : "S’abonner"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-neutral-600 text-sm">Aucun thème disponible.</p>
      )}
    </section>
  );
}

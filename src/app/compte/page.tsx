// src/app/compte/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSubscription, type SubscriptionResp } from "@/lib/account";

type Sub = {
  status: "active" | "none" | "expired";
  plan?: { id?: number | string; name?: string; description?: string | null };
  started_at?: string | null;
  ends_at?: string | null;
};

export default function AbonnementPage() {
  const [sub, setSub] = useState<Sub | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r: SubscriptionResp = await getSubscription(); // GET /api/account/subscription
        if (!r.active || !r.subscription) {
          setSub({ status: "none" });
        } else {
          const endsAt = r.subscription.ends_at
            ? new Date(r.subscription.ends_at)
            : null;
          const isExpired = endsAt ? endsAt.getTime() < Date.now() : false;

          setSub({
            status: isExpired ? "expired" : "active",
            plan: r.subscription.plan
              ? {
                  id: r.subscription.plan.id,
                  name: r.subscription.plan.name ?? undefined,
                  description: null, // pas fourni par l’API, garde null
                }
              : undefined,
            // L’API renvoie "starts_at" → on mappe vers started_at attendu par l’UI
            started_at: (r.subscription as any).starts_at ?? null,
            ends_at: r.subscription.ends_at ?? null,
          });
        }
      } catch (e) {
        console.error("getSubscription failed:", e);
        setErr("Impossible de récupérer votre statut d’abonnement.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <section className="rounded border bg-white p-6">Chargement…</section>;
  }

  if (err) {
    return (
      <section className="rounded border bg-white p-6">
        <h2 className="text-xl font-extrabold mb-1">Abonnement</h2>
        <p className="text-sm text-red-600">{err}</p>
        <div className="mt-4">
          <Link
            href="/abonnement"
            className="inline-flex rounded bg-neutral-900 px-4 py-2 text-white hover:opacity-90"
          >
            Voir les offres
          </Link>
        </div>
      </section>
    );
  }

  // Aucun abonnement actif
  if (!sub || sub.status === "none") {
    return (
      <section className="rounded border bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Pas d’abonnement actif</h2>
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
            Statut : non abonné
          </span>
        </div>
        <p className="mt-2 text-neutral-700">
          Abonnez-vous pour accéder à 100% de nos contenus.
        </p>
        <div className="mt-4">
          <Link
            href="/abonnement"
            className="inline-flex rounded bg-neutral-900 px-4 py-2 text-white hover:opacity-90"
          >
            Voir les offres
          </Link>
        </div>
      </section>
    );
  }

  const isExpired = sub.status === "expired";
  const started = sub.started_at
    ? new Date(sub.started_at).toLocaleDateString("fr-FR")
    : "—";
  const ends = sub.ends_at
    ? new Date(sub.ends_at).toLocaleDateString("fr-FR")
    : "—";

  return (
    <div className="space-y-6">
      <section className="rounded border bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">
            {isExpired ? "Abonnement expiré" : "Abonnement en cours"}
          </h2>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              isExpired
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            Statut : {isExpired ? "expiré" : "actif"}
          </span>
        </div>

        <div className="mt-2 text-neutral-800 text-sm">
          {sub.plan?.name && (
            <p>
              Formule : <strong>{sub.plan.name}</strong>
              {sub.plan.description ? <> — {sub.plan.description}</> : null}
            </p>
          )}
          <p className="mt-1">
            Début : {started} • {isExpired ? "Expiré le" : "Expire le"} : {ends}.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href="/abonnement"
            className="inline-flex rounded bg-neutral-900 px-4 py-2 text-white hover:opacity-90"
          >
            {isExpired ? "Renouveler mon abonnement" : "Gérer mon abonnement"}
          </Link>

          <Link
            href="/compte/candidatures"
            className="inline-flex rounded border px-4 py-2 font-semibold hover:bg-neutral-50"
          >
            Candidatures reçues
          </Link>

          {isExpired && (
            <span className="text-sm text-red-600">
              Votre abonnement est arrivé à expiration.
            </span>
          )}
        </div>
      </section>

      <section className="rounded border bg-white p-6">
        <h3 className="text-lg font-bold">Vos avantages</h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Tous les articles en illimité",
            "Magazine en avant-première",
            "Exclusivités abonnés",
            "Conseils pratiques premium",
            "Accès à l’app mobile",
          ].map((t, i) => (
            <li key={i} className="rounded border bg-neutral-50 px-4 py-3">
              {t}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

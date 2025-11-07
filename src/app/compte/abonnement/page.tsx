"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMySubscription } from "@/lib/api";

type Sub = {
  status: "active" | "none" | "expired";
  plan?: { id?: number | string; name?: string; description?: string | null };
  started_at?: string | null;
  ends_at?: string | null;
};

export default function AbonnementPage() {
  const [sub, setSub] = useState<Sub | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await getMySubscription();
        setSub(((r as any).data ?? null) as Sub);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <section className="rounded border bg-white p-6">Chargement…</section>;

  if (!sub || sub.status === "none")
    return (
      <section className="rounded border bg-white p-6">
        <h2 className="text-xl font-extrabold">Pas d’abonnement actif</h2>
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

  const ctaLabel =
    sub.status === "expired" ? "Renouveler votre abonnement" : "Gérer mon abonnement";

  return (
    <div className="space-y-6">
      <section className="rounded border bg-white p-6">
        <h2 className="text-xl font-extrabold">Abonnement en cours</h2>
        <p className="mt-2 text-neutral-700">
          {sub.plan?.name ? (
            <>
              Formule : <strong>{sub.plan.name}</strong>.{" "}
            </>
          ) : null}
          Début : {sub.started_at ? new Date(sub.started_at).toLocaleDateString("fr-FR") : "—"} •
          Expire le : {sub.ends_at ? new Date(sub.ends_at).toLocaleDateString("fr-FR") : "—"}.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <Link
            href="/abonnement"
            className="inline-flex rounded bg-neutral-900 px-4 py-2 text-white hover:opacity-90"
          >
            {ctaLabel}
          </Link>
          {sub.status === "expired" && (
            <span className="text-sm text-red-600">Votre abonnement est expiré.</span>
          )}
        </div>
      </section>

      <section className="rounded border bg-white p-6">
        <h3 className="text-lg font-bold">Vos avantages</h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Tous les articles en illimité",
            "Le magazine en avant-première",
            "Exclusivités abonnés",
            "Conseils pratiques",
            "Accès premium à l’app",
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

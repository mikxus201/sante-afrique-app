"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Construit une URL absolue pointant vers Laravel
function absolute(path: string) {
  return new URL(path, BACKEND).toString();
}

export default function RedirectToCinetpay() {
  const sp = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const plan = useMemo(
    () => ({
      id: sp.get("plan_id"),
      slug: sp.get("plan_slug"),
    }),
    [sp]
  );

  useEffect(() => {
    (async () => {
      if (!plan.id || !plan.slug) {
        setError("Paramètres de l’offre manquants.");
        return;
      }
      try {
        // Petit délai visuel puis REDIRECTION GET vers le back
        await new Promise((r) => setTimeout(r, 500));
        const url = absolute(
          `/pay/cinetpay/start?plan_id=${encodeURIComponent(
            String(plan.id)
          )}&plan_slug=${encodeURIComponent(String(plan.slug))}`
        );
        window.location.replace(url);
      } catch (e: any) {
        setError(e?.message ?? "Impossible d’initier le paiement.");
      }
    })();
  }, [plan.id, plan.slug]);

  return (
    <div className="mx-auto max-w-md text-center px-4 py-16 text-neutral-900 dark:text-neutral-100">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <h1 className="text-2xl font-extrabold">Préparation du paiement…</h1>
        {!error ? (
          <>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-sm">
              Merci de patienter, vous allez être redirigé vers la plateforme sécurisée CinetPay.
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
              Ne fermez pas cette fenêtre.
            </p>
          </>
        ) : (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}

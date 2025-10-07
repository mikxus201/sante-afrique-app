"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Toast from "@/components/Toast";

const PROFILE_URL = "/compte"; // ← adapte si nécessaire (ex: "/profil")

export default function RetourEchec() {
  const sp = useSearchParams();
  const tx = sp.get("transaction_id") || sp.get("transactionid") || sp.get("tx") || "";
  const status = (sp.get("status") || "").toUpperCase();
  const reason = sp.get("reason") || sp.get("message") || "";
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      setShowToast(true);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center text-neutral-900 dark:text-neutral-100">
      {showToast && (
        <Toast
          message="Le paiement a été annulé ou n’a pas abouti."
          variant="error"
          duration={7000}
        />
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          <p className="text-neutral-700 dark:text-neutral-300 text-sm">
            Vérification du paiement en cours…
          </p>
        </div>
      ) : (
        <div className="rounded border bg-white p-6 text-left dark:bg-neutral-900 dark:border-neutral-800">
          <h1 className="text-2xl font-extrabold mb-2">Paiement non finalisé</h1>
          <p className="text-neutral-700 dark:text-neutral-300">
            Votre transaction n’a pas pu être complétée. Vous pouvez réessayer ou choisir un autre moyen de paiement.
          </p>

          <div className="mt-4 rounded border bg-neutral-50 p-4 text-sm dark:bg-neutral-950/40 dark:border-neutral-800">
            <p className="mb-1">
              <span className="text-neutral-500 dark:text-neutral-400">Référence :</span>{" "}
              <code>{tx || "—"}</code>
            </p>
            <p className="mb-1">
              <span className="text-neutral-500 dark:text-neutral-400">Statut reçu :</span>{" "}
              <span className="inline-block rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                {status || "REFUSED"}
              </span>
            </p>
            {reason && (
              <p>
                <span className="text-neutral-500 dark:text-neutral-400">Raison :</span>{" "}
                <span>{reason}</span>
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/abonnement" className="rounded bg-blue-600 px-4 py-2 text-white">
              Réessayer le paiement
            </Link>
            <Link href={PROFILE_URL} className="rounded border px-4 py-2 dark:border-neutral-700">
              Mon compte
            </Link>
            <Link href="/" className="rounded border px-4 py-2 dark:border-neutral-700">
              Revenir à l’accueil
            </Link>
          </div>

          <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
            Si vous pensez qu’il s’agit d’une erreur, contactez le support avec la référence ci-dessus.
          </p>
        </div>
      )}
    </div>
  );
}

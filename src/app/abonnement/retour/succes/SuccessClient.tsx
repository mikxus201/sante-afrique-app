"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Toast from "@/components/Toast";

const PROFILE_URL = "/compte";

type SP = Record<string, string | string[] | undefined>;
const get = (sp: SP, k: string) => {
  const v = sp[k];
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
};

export default function SuccessClient({ sp }: { sp: SP }) {
  const tx = get(sp, "transaction_id") || get(sp, "transactionid") || get(sp, "tx") || "";
  const status = (get(sp, "status") || "").toUpperCase();

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
          message="Paiement confirmé ou en cours de validation. Merci !"
          variant="success"
          duration={6000}
        />
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-neutral-700 dark:text-neutral-300 text-sm">
            Vérification de votre paiement en cours…
          </p>
        </div>
      ) : (
        <div className="rounded border bg-white p-6 text-left dark:bg-neutral-900 dark:border-neutral-800">
          <h1 className="text-2xl font-extrabold mb-2">Merci 🙏</h1>
          <p className="text-neutral-700 dark:text-neutral-300">
            Votre paiement a été pris en compte. Votre accès sera activé sous peu si ce
            n’est pas déjà le cas.
          </p>

          <div className="mt-4 rounded border bg-neutral-50 p-4 text-sm dark:bg-neutral-950/40 dark:border-neutral-800">
            <p className="mb-1">
              <span className="text-neutral-500 dark:text-neutral-400">Référence :</span>{" "}
              <code>{tx || "—"}</code>
            </p>
            <p>
              <span className="text-neutral-500 dark:text-neutral-400">Statut reçu :</span>{" "}
              <span className="inline-block rounded bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">
                {status || "ACCEPTED"}
              </span>
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={PROFILE_URL} className="rounded bg-blue-600 px-4 py-2 text-white">
              Mon compte
            </Link>
            <Link
              href="/abonnement"
              className="rounded bg-neutral-900 px-4 py-2 text-white dark:bg-white dark:text-neutral-900"
            >
              Voir mes offres
            </Link>
            <Link href="/" className="rounded border px-4 py-2 dark:border-neutral-700">
              Revenir à l’accueil
            </Link>
          </div>

          <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
            Si l’accès n’apparaît pas immédiatement, actualisez la page ou
            reconnectez-vous.
          </p>
        </div>
      )}
    </div>
  );
}

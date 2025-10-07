// src/components/mag/PaywallGate.tsx
"use client";

import Link from "next/link";
import * as React from "react";

type Props = { children: React.ReactNode };

/**
 * Gate d’accès aux contenus abonnés.
 * En développement, on bypass automatiquement (ou via NEXT_PUBLIC_BYPASS_PAYWALL=true).
 * En prod, la gate s’affiche tant qu’on n’a pas branché l’auth/abonnement réel.
 */
export default function PaywallGate({ children }: Props) {
  const BYPASS =
    process.env.NEXT_PUBLIC_BYPASS_PAYWALL === "true" ||
    process.env.NODE_ENV !== "production";

  if (BYPASS) {
    // Accès libre en dev / quand la variable est activée
    return <>{children}</>;
  }

  // Affichage paywall (prod, sans abonnement actif)
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
      <p className="mb-3 text-lg font-semibold">Contenu réservé aux abonnés</p>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/abonnement"
          className="inline-flex items-center rounded-full bg-amber-500 px-5 py-2 font-semibold text-white hover:bg-amber-600"
        >
          S’abonner
        </Link>
        <span className="text-sm">
          Déjà abonné ?{" "}
          <Link href="/connexion" className="underline hover:no-underline">
            Se connecter
          </Link>
        </span>
      </div>
    </div>
  );
}

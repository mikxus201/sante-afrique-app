// src/components/CookiesPrefsForm.tsx
"use client";

import { useEffect, useState } from "react";
import { readConsentFromCookie, savePartial, acceptAll, rejectAll } from "@/lib/consent";

export default function CookiesPrefsForm() {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const c = readConsentFromCookie();
    if (c) {
      setAnalytics(!!c.analytics);
      setMarketing(!!c.marketing);
    }
  }, []);

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded border bg-white p-4 space-y-4">
        <div>
          <h2 className="text-lg font-bold">Préférences de confidentialité</h2>
          <p className="text-sm text-neutral-600">
            Modifiez à tout moment vos préférences de cookies.
          </p>
        </div>

        <div className="space-y-3">
          <div className="rounded border p-3">
            <div className="font-semibold text-sm">Cookies nécessaires</div>
            <p className="mt-1 text-xs text-neutral-600">
              Indispensables au bon fonctionnement du site. Toujours actifs.
            </p>
          </div>

          <label className="rounded border p-3 flex items-start justify-between gap-3 cursor-pointer">
            <div>
              <div className="font-semibold text-sm">Mesure d’audience</div>
              <p className="mt-1 text-xs text-neutral-600">
                Statistiques anonymisées pour améliorer nos contenus.
              </p>
            </div>
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
            />
          </label>

          <label className="rounded border p-3 flex items-start justify-between gap-3 cursor-pointer">
            <div>
              <div className="font-semibold text-sm">Personnalisation</div>
              <p className="mt-1 text-xs text-neutral-600">
                Personnalisation de certains contenus / partenariats.
              </p>
            </div>
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <button onClick={() => rejectAll()} className="rounded border px-3 py-2 text-sm hover:bg-neutral-50">
            Tout refuser
          </button>
          <button onClick={() => acceptAll()} className="rounded border px-3 py-2 text-sm hover:bg-neutral-50">
            Tout accepter
          </button>
          <button
            onClick={() => savePartial({ analytics, marketing })}
            className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:brightness-95"
          >
            Enregistrer mes choix
          </button>
        </div>
      </div>
    </div>
  );
}

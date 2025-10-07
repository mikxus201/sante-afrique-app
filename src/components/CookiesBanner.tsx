// src/components/CookiesBanner.tsx
"use client";

import { useEffect, useState } from "react";
import { acceptAll, rejectAll, readConsentFromCookie, savePartial } from "@/lib/consent";

export default function CookiesBanner() {
  const [open, setOpen] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Afficher le bandeau seulement si pas déjà consenti
  useEffect(() => {
    const c = readConsentFromCookie();
    if (!c) setOpen(true);
  }, []);

  // Permet d'ouvrir le bandeau depuis n'importe où : window.dispatchEvent(new Event("sa-open-consent"))
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("sa-open-consent", handler);
    return () => window.removeEventListener("sa-open-consent", handler);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100]">
      <div className="mx-auto max-w-5xl rounded-t-lg border bg-white p-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-sm text-neutral-800">
            Nous utilisons des cookies nécessaires au fonctionnement du site et,
            avec votre accord, des cookies d’analyse et de personnalisation.
            <a href="/cookies" className="ml-1 text-blue-700 hover:underline">En savoir plus</a>.
          </p>
          {!showPrefs && (
            <div className="flex gap-2">
              <button
                onClick={() => { rejectAll(); setOpen(false); }}
                className="rounded border px-3 py-2 text-sm hover:bg-neutral-50"
              >
                Tout refuser
              </button>
              <button
                onClick={() => { acceptAll(); setOpen(false); }}
                className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:brightness-95"
              >
                Tout accepter
              </button>
              <button
                onClick={() => setShowPrefs(true)}
                className="rounded border px-3 py-2 text-sm hover:bg-neutral-50"
              >
                Personnaliser
              </button>
            </div>
          )}
        </div>

        {showPrefs && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded border p-3">
              <div className="font-semibold text-sm">Nécessaires</div>
              <p className="mt-1 text-xs text-neutral-600">
                Indispensables au bon fonctionnement du site (toujours actifs).
              </p>
              <div className="mt-2 inline-flex items-center rounded-full bg-neutral-200 px-2 py-0.5 text-xs">Activés</div>
            </div>

            <label className="rounded border p-3 cursor-pointer">
              <div className="flex items-start justify-between gap-3">
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
              </div>
            </label>

            <label className="rounded border p-3 cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-sm">Personnalisation</div>
                  <p className="mt-1 text-xs text-neutral-600">
                    Contenus / partenariats susceptibles de vous intéresser.
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                />
              </div>
            </label>
          </div>
        )}

        {showPrefs && (
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={() => setShowPrefs(false)}
              className="rounded border px-3 py-2 text-sm hover:bg-neutral-50"
            >
              Annuler
            </button>
            <button
              onClick={() => { savePartial({ analytics, marketing }); setOpen(false); }}
              className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:brightness-95"
            >
              Enregistrer mes choix
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

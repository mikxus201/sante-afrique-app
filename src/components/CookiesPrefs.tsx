// src/components/CookiesPrefs.tsx
"use client";

import { useEffect, useState } from "react";
const CUSTOM_EVENT = "cookie-prefs:updated";

type Prefs = {
  necessary: boolean;
  analytics: boolean;
  personalization: boolean;
  advertising: boolean;
};

export default function CookiesPrefs() {
  const [prefs, setPrefs] = useState<Prefs>({
    necessary: true,
    analytics: false,
    personalization: false,
    advertising: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cookie-prefs");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Prefs>;
        setPrefs((p) => ({ ...p, ...parsed, necessary: true }));
      }
    } catch {}
  }, []);

  const toggle = (k: keyof Prefs) => {
    if (k === "necessary") return;
    setPrefs((p) => ({ ...p, [k]: !p[k] }));
  };

  const persist = (next: Prefs) => {
    localStorage.setItem("cookie-prefs", JSON.stringify(next));
    window.dispatchEvent(new Event(CUSTOM_EVENT));
    alert("Vos préférences cookies ont été enregistrées.");
  };

  return (
    <section id="preferences" className="mt-8">
      <h2 className="text-xl font-bold">Paramétrer vos préférences</h2>
      <div className="mt-4 divide-y rounded border">
        {[
          { key: "necessary", label: "Cookies nécessaires", desc: "Indispensables au bon fonctionnement du site." },
          { key: "analytics", label: "Mesure d’audience", desc: "Aide à comprendre l’usage du site pour l’améliorer." },
          { key: "personalization", label: "Personnalisation", desc: "Mémorise vos préférences d’affichage." },
          { key: "advertising", label: "Publicité", desc: "Permet de personnaliser des publicités (si activées)." },
        ].map((row) => (
          <label key={row.key} className="flex items-start gap-3 p-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={(prefs as any)[row.key]}
              onChange={() => toggle(row.key as keyof Prefs)}
              disabled={row.key === "necessary"}
            />
            <div>
              <div className="font-semibold">{row.label}</div>
              <p className="text-sm text-neutral-600">{row.desc}</p>
            </div>
          </label>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            const next = { necessary: true, analytics: false, personalization: false, advertising: false };
            setPrefs(next);
            persist(next);
          }}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Tout refuser (sauf nécessaires)
        </button>
        <button
          onClick={() => {
            const next = { necessary: true, analytics: true, personalization: true, advertising: true };
            setPrefs(next);
            persist(next);
          }}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Tout accepter
        </button>
        <button
          onClick={() => persist(prefs)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Enregistrer
        </button>
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        Vous pouvez aussi gérer les cookies depuis votre navigateur (paramètres &gt; confidentialité).
      </p>
    </section>
  );
}

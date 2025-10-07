// src/components/ConsentBanner.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Prefs = {
  necessary: boolean;
  analytics: boolean;
  personalization: boolean;
  advertising: boolean;
};

const PREFERENCES_KEY = "cookie-prefs";
const CONSENT_TSTAMP_KEY = "cookie-consent:tstamp";
const CONSENT_TTL_DAYS = 180;
const CUSTOM_EVENT = "cookie-prefs:updated";

function nowTs() { return Date.now(); }
function daysToMs(d: number) { return d * 24 * 60 * 60 * 1000; }

export default function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFERENCES_KEY);
      const tsRaw = localStorage.getItem(CONSENT_TSTAMP_KEY);
      if (!raw || !tsRaw) { setShow(true); return; }
      const ts = parseInt(tsRaw, 10);
      if (!Number.isFinite(ts) || nowTs() - ts > daysToMs(CONSENT_TTL_DAYS)) {
        setShow(true);
      }
    } catch {}
  }, []);

  const savePrefs = (prefs: Prefs) => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
      localStorage.setItem(CONSENT_TSTAMP_KEY, String(nowTs()));
      // NEW: prévenir le reste de l’app (AnalyticsLoader, etc.)
      window.dispatchEvent(new Event(CUSTOM_EVENT));
    } catch {}
  };

  const acceptAll = () => {
    savePrefs({ necessary: true, analytics: true, personalization: true, advertising: true });
    setShow(false);
  };
  const refuseAll = () => {
    savePrefs({ necessary: true, analytics: false, personalization: false, advertising: false });
    setShow(false);
  };

  if (!show) return null;

  return (
    <div role="dialog" aria-label="Préférences de cookies" className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-6xl px-4 pb-4">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-100 shadow-2xl">
          <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="md:max-w-[65%]">
              <h2 className="text-base md:text-lg font-semibold">Votre confidentialité, nos cookies</h2>
              <p className="mt-1 text-sm text-neutral-300">
                Nous utilisons des cookies pour le bon fonctionnement du site, mesurer l’audience et
                personnaliser certains contenus. Vous pouvez accepter, refuser (hors nécessaires) ou{" "}
                <Link href="/cookies#preferences" className="underline decoration-blue-400 hover:text-white">
                  personnaliser vos choix
                </Link>
                . En savoir plus :{" "}
                <Link href="/cookies" className="underline decoration-blue-400 hover:text-white">
                  Politique de cookies
                </Link>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <button onClick={refuseAll} className="rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700">
                Tout refuser
              </button>
              <Link
                href="/cookies#preferences"
                onClick={() => { setShow(false); window.dispatchEvent(new Event(CUSTOM_EVENT)); }}
                className="rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-center hover:bg-neutral-700"
              >
                Personnaliser
              </Link>
              <button onClick={acceptAll} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                Tout accepter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

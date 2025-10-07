// src/components/app/OpenInApp.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";

type Props = { issueId: string };

const ANDROID_PACKAGE = "com.santeafrique.app"; // ← À REMPLACER
const IOS_APP_ID = "0000000000";                // ← À REMPLACER

const PLAY_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
const APPLE_URL = `https://apps.apple.com/app/id${IOS_APP_ID}`;

const SCHEME = "santeafrique://"; // ← À REMPLACER si besoin

export default function OpenInApp({ issueId }: Props) {
  const [error, setError] = useState<string | null>(null);

  const isIOS = useMemo(() => /iPad|iPhone|iPod/i.test(navigator.userAgent), []);
  const isAndroid = useMemo(() => /Android/i.test(navigator.userAgent), []);
  const deepLink = `${SCHEME}magazine/${issueId}`;

  const open = useCallback(() => {
    setError(null);
    const start = Date.now();
    const guard = setTimeout(() => {
      if (Date.now() - start < 1600) {
        if (isAndroid) window.location.href = PLAY_URL;
        else if (isIOS) window.location.href = APPLE_URL;
        else window.location.href = "/abonnement";
      }
    }, 1200);

    try {
      window.location.href = deepLink;
    } catch {
      clearTimeout(guard);
      if (isAndroid) window.location.href = PLAY_URL;
      else if (isIOS) window.location.href = APPLE_URL;
      else setError("Oups, impossible d’ouvrir l’application.");
    }
  }, [deepLink, isAndroid, isIOS]);

  return (
    <div className="space-y-3">
      <button
        onClick={open}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        <ExternalLink className="h-4 w-4" />
        Ouvrir dans l’application
      </button>

      <div className="text-sm text-neutral-600">
        Pas encore l’app ?{" "}
        {isAndroid ? (
          <a className="text-blue-600 underline" href={PLAY_URL}>Google Play</a>
        ) : isIOS ? (
          <a className="text-blue-600 underline" href={APPLE_URL}>App Store</a>
        ) : (
          <>
            scannez le QR code depuis votre mobile (
            <a className="text-blue-600 underline" href={PLAY_URL}>Android</a> /
            <a className="text-blue-600 underline ml-1" href={APPLE_URL}>iOS</a>)
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

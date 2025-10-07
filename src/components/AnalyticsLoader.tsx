// src/components/AnalyticsLoader.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { readConsentFromCookie } from "@/lib/consent";

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    plausible?: (event: string, options?: { props?: Record<string, any>; u?: string }) => void;
    __sa_analytics_loaded?: boolean;
    __sa_ga_loaded?: boolean;
    __sa_plausible_loaded?: boolean;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;                     // ex: "G-XXXXXXXXXX"
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN; // ex: "sante-afrique.example"
const IS_PROD = process.env.NODE_ENV === "production";
const ALLOW_IN_DEV = process.env.NEXT_PUBLIC_ANALYTICS_IN_DEV === "true";

function dntEnabled() {
  // Respect Do Not Track
  // @ts-ignore legacy vendors
  const dnt = (navigator as any).doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack;
  return String(dnt) === "1";
}

function loadScript(src: string, attrs: Record<string, string> = {}) {
  // évite les doublons
  if (document.querySelector(`script[src="${src}"]`)) return null;
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
  document.head.appendChild(s);
  return s;
}

function ensureGtag(consented: boolean) {
  if (!GA_ID || window.__sa_ga_loaded) return;

  // injecte gtag.js
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer!.push(args as any);
  }
  window.gtag = gtag;

  // Consent Mode v2 : par défaut deny, puis grant si consented
  gtag("consent", "default", {
    ad_storage: "denied",
    analytics_storage: consented ? "granted" : "denied",
    functionality_storage: "granted",
    personalization_storage: "denied",
    security_storage: "granted",
  });

  gtag("js", new Date());

  // Config GA4 (privacy-first)
  gtag("config", GA_ID, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  window.__sa_ga_loaded = true;
}

function ensurePlausible() {
  if (!PLAUSIBLE_DOMAIN || window.__sa_plausible_loaded) return;

  // Script Plausible
  // (auto-capture SPA variable selon version ; on garde un pageview manuel par sécurité)
  const s = loadScript("https://plausible.io/js/script.js", {
    "data-domain": PLAUSIBLE_DOMAIN,
    "data-sa": "plausible",
  });

  // petit stub si le script tarde, pour éviter les erreurs
  if (!window.plausible) {
    window.plausible = function () {
      /* no-op until script ready */
    };
  }

  if (s) window.__sa_plausible_loaded = true;
}

function sendPageview() {
  try {
    const page_location = window.location.href;
    const page_path = window.location.pathname + window.location.search;
    const page_title = document.title;

    // GA4
    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_location,
        page_path,
        page_title,
      });
    }

    // Plausible
    if (window.plausible) {
      window.plausible("pageview");
    }
  } catch {
    // ignore
  }
}

export default function AnalyticsLoader() {
  const loadedRef = useRef(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Conditions globales
    if (!IS_PROD && !ALLOW_IN_DEV) return; // pas en dev sauf si override
    if (dntEnabled()) return;              // respecte DNT

    const maybeLoad = () => {
      if (window.__sa_analytics_loaded) return;

      const c = readConsentFromCookie(); // attendu: { analytics?: boolean, ... }
      const consented = !!c?.analytics;

      if (!consented) return;

      // Charge providers selon env vars
      ensurePlausible();
      ensureGtag(consented);

      window.__sa_analytics_loaded = true;
      loadedRef.current = true;

      // Pageview initial
      sendPageview();
    };

    // tentative immédiate + quelques rechecks (focus/visibility)
    maybeLoad();
    const onFocus = () => maybeLoad();
    const onVis = () => document.visibilityState === "visible" && maybeLoad();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    // Re-check périodique (ex: consentement changé via bannière)
    const tick = setInterval(maybeLoad, 2000);
    const stop = setTimeout(() => clearInterval(tick), 30000); // stop après 30s

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(tick);
      clearTimeout(stop);
    };
  }, []);

  // Pageviews sur changement de route (App Router)
  useEffect(() => {
    if (!window.__sa_analytics_loaded) return;
    sendPageview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()]);

  return null;
}

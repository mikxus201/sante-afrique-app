// src/lib/consent.ts
export type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  ts: number;
};

export const CONSENT_COOKIE = "sa_consent";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : null;
}

export function readConsentFromCookie(): Consent | null {
  if (typeof document === "undefined") return null;
  const raw = getCookie(CONSENT_COOKIE);
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (v && v.necessary === true) return v as Consent;
  } catch {}
  return null;
}

export function writeConsentToCookie(c: Consent) {
  const value = encodeURIComponent(JSON.stringify(c));
  const days = 180; // 6 mois
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${CONSENT_COOKIE}=${value}; Expires=${expires}; Path=/; SameSite=Lax`;
}

export function acceptAll(): Consent {
  const c: Consent = { necessary: true, analytics: true, marketing: true, ts: Date.now() };
  writeConsentToCookie(c);
  return c;
}

export function rejectAll(): Consent {
  const c: Consent = { necessary: true, analytics: false, marketing: false, ts: Date.now() };
  writeConsentToCookie(c);
  return c;
}

export function savePartial(p: Partial<Consent>): Consent {
  const base = readConsentFromCookie() ?? {
    necessary: true,
    analytics: false,
    marketing: false,
    ts: Date.now(),
  };
  const c: Consent = { ...base, ...p, necessary: true, ts: Date.now() };
  writeConsentToCookie(c);
  return c;
}

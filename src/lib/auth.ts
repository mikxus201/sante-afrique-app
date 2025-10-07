// src/lib/auth.ts
import { apiGet, apiPost, csrf } from "@/lib/apiClient";

export type MeResponse = {
  data?: {
    id: number;
    name?: string | null;
    email?: string | null;
    nom?: string | null;
    prenoms?: string | null;
    phone?: string | null;
    avatar?: string | null;
    created_at?: string | null;

    // différents formats possibles côté back
    email_verified_at?: string | null;
    emailVerifiedAt?: string | null;
    email_verified?: boolean | null;
  };
};

export type LoginResult =
  | { ok: true }                // login direct
  | { otpRequired: true };      // login nécessite un OTP

/** Connexion email + mot de passe (Sanctum + cookies) */
export async function login(email: string, password: string): Promise<LoginResult> {
  await csrf(); // pose XSRF-TOKEN (obligatoire avant POST)
  try {
    // la plupart du temps, le back renvoie 204 No Content
    await apiPost("/api/auth/login", { email, password });
    return { ok: true };
  } catch (e: any) {
    // notre apiPost lance `new Error("<status>")`
    const status = Number(e?.message || 0);
    if (status === 403) {
      // convention : le back peut exiger une vérification OTP
      return { otpRequired: true };
    }
    throw e;
  }
}

/** Déconnexion (invalide la session côté serveur) */
export async function logout(): Promise<boolean> {
  await csrf(); // safe
  try {
    await apiPost("/api/auth/logout", {});
  } catch {
    // si déjà déconnecté, on ignore
  }
  return true;
}

/** Récupère l’utilisateur courant via la session Sanctum */
export async function me(): Promise<MeResponse | null> {
  try {
    const res = await apiGet("/api/auth/me");
    return res as MeResponse;
  } catch {
    // 401 => pas connecté
    return null;
  }
}

/** OTP: demander l’envoi d’un code à l’email */
export async function requestOtp(email: string): Promise<boolean> {
  await csrf();
  await apiPost("/api/auth/request-otp", { email });
  return true;
}

/** OTP: vérifier le code reçu et créer la session */
export async function verifyOtp(email: string, otp: string): Promise<boolean> {
  await csrf();
  await apiPost("/api/auth/verify-otp", { email, otp });
  return true;
}

/* ---------- Petits helpers optionnels ---------- */

/** Email vérifié ? (gère plusieurs formats de payload) */
export function isEmailVerified(meRes: MeResponse | null): boolean {
  const d = meRes?.data;
  if (!d) return false;
  if (typeof d.email_verified === "boolean") return d.email_verified;
  if (d.emailVerifiedAt) return true;
  if (d.email_verified_at) return true;
  return false;
}

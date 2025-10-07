// src/app/abonnement/inscription/[plan]/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-client";
import { me, registerAccount, passwordLogin, otpRequest, otpVerify } from "@/lib/api";


type Plan = { id: number; name: string; slug: string; description?: string | null; price_fcfa: number; };
type Step = 1 | 2 | 3; // 1 = création, 2 = recap+payer, 3 = OTP

async function fetchJSON(input: RequestInfo | URL, init?: RequestInit) {
  const r = await fetch(input, init);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.message || j?.error || `Erreur (${r.status})`);
  return j;
}

/* =========================
   Helpers CSRF + Form POST
   ========================= */

// Récupère un cookie spécifique
function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}

// S’assure que le cookie CSRF de Laravel/Sanctum existe
async function ensureCsrf() {
  await fetch("/sanctum/csrf-cookie", { credentials: "include" });
}

// Soumet dynamiquement un formulaire POST à Laravel
function submitForm(action: string, data: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;

  // Jeton CSRF de Laravel
  const csrf = getCookie("XSRF-TOKEN") || "";
  const inputCsrf = document.createElement("input");
  inputCsrf.type = "hidden";
  inputCsrf.name = "_token";
  inputCsrf.value = csrf;
  form.appendChild(inputCsrf);

  // Champs supplémentaires (plan_id, plan_slug…)
  Object.entries(data).forEach(([k, v]) => {
    const i = document.createElement("input");
    i.type = "hidden";
    i.name = k;
    i.value = String(v ?? "");
    form.appendChild(i);
  });

  document.body.appendChild(form);
  form.submit();
}

export default function Inscription() {
  const { plan } = useParams<{ plan: string }>();

  // Auth
  const { token, user: authUser, setToken, setUser } = useAuth() as {
    token?: string | null;
    user?: { id?: number | string; email?: string | null; name?: string | null } | null;
    setToken: (v: string | null) => void;
    setUser: (v: any) => void;
  };

  // Offres & flux
  const [planData, setPlanData] = useState<Plan | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false); // ✅ pour attendre la détection

  // Form compte (utilisé seulement si NON connecté)
  const [gender, setGender] = useState<"M" | "Mme">("M");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("Côte d'Ivoire");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  // OTP
  const [otp, setOtp] = useState("");
  const canSubmitOtp = otp.replace(/\D/g, "").length === 6;

  // 1) Charger l’offre
  useEffect(() => {
    (async () => {
      setMsg(null);
      try {
        const origin = window.location.origin;
        const data = await fetchJSON(`${origin}/api/plans/${encodeURIComponent(plan)}`, { cache: "no-store" });
        setPlanData(data);
      } catch (e: any) {
        setMsg(String(e?.message ?? e));
      }
    })();
  }, [plan]);

  // 2) Détection de session : token OU cookies Sanctum via /api/auth/me
  useEffect(() => {
    (async () => {
      try {
        // si on a un token ou déjà un user → on tente de compléter l'email
        if (authUser?.email) setEmail(authUser.email);

        // on vérifie la session Sanctum (même sans token)
        const r: any = await me().catch(() => null);
        const u = r?.data ?? r ?? null;
        if (u) {
          setUser(u);
          if (!email && u.email) setEmail(u.email);
          setStep(2); // ✅ sauter l’étape 1
        } else if (token) {
          // si seulement un token (sans cookies) on passe aussi à 2
          setStep(2);
        }
      } finally {
        setAuthChecked(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // 3) Étape 1 : créer le compte puis gérer login/otp
  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!authChecked) return;         // on attend la détection
    if (step === 2) return;           // déjà connecté

    setMsg(null);
    setLoading(true);
    try {
      await registerAccount({ email, password, name: `${firstName} ${lastName}`.trim(), phone });

      const loginRes: any = await passwordLogin(email.trim(), password);
      if (loginRes?.token) {
        setToken(loginRes.token);
        setUser(loginRes.user ?? null);
        setStep(2);
        return;
      }
      if (loginRes?.otp_required) {
        await otpRequest(email.trim());
        setMsg("Un code vous a été envoyé par e-mail. Saisissez-le pour continuer.");
        setStep(3);
        return;
      }
      await otpRequest(email.trim());
      setMsg("Un code vous a été envoyé par e-mail. Saisissez-le pour continuer.");
      setStep(3);
    } catch (e: any) {
      setMsg(e?.message || "Impossible de créer le compte.");
    } finally {
      setLoading(false);
    }
  }

  // 4) Vérifier OTP → étape paiement
  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const r: any = await otpVerify(email.trim(), otp.replace(/\D/g, ""));
      if (!r?.token) throw new Error("Token manquant après vérification du code.");
      setToken(r.token);
      setUser(r.user ?? null);
      setStep(2);
    } catch (e: any) {
      setMsg(e?.message || "Code invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  }

 // 5) Payer : redirige d’abord vers la page intermédiaire avant Laravel
// 5) Payer : passe par la page intermédiaire qui fera le POST vers Laravel
async function goPay() {
  if (!planData) return;
  setMsg(null);
  setLoading(true);
  try {
    const url = `/abonnement/retour/redirect?plan_id=${encodeURIComponent(
      String(planData.id)
    )}&plan_slug=${encodeURIComponent(planData.slug)}`;
    window.location.assign(url);
  } catch (e: any) {
    setMsg(String(e?.message ?? e));
    setLoading(false);
  }
}
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">
          {step === 1 ? "Étape 1/2 — Créez votre compte" : step === 3 ? "Vérification — Code OTP" : "Étape 2/2 — Paiement"}
        </h1>
        <Link href="/abonnement" className="text-sm underline">← Retour aux offres</Link>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        <div>
          {/* Écran d’attente pendant la détection d’auth */}
          {!authChecked && (
            <div className="rounded border p-4 bg-neutral-50">Vérification de votre session…</div>
          )}

          {/* ÉTAPE 1 : FORMULAIRE COMPTE (uniquement si NON connecté) */}
          {authChecked && step === 1 && (
            <form onSubmit={createAccount} className="space-y-4">
              <div className="rounded border p-4 bg-neutral-50">
                <p className="font-semibold mb-2">Vos identifiants</p>
                <input className="w-full border rounded px-3 py-2 mb-2" type="email" placeholder="E-mail*" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <div className="relative">
                  <input className="w-full border rounded px-3 py-2 pr-16" type={showPwd ? "text" : "password"} placeholder="Mot de passe* (min. 8 caractères)" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute inset-y-0 right-2 text-sm" aria-label="Afficher/Masquer">
                    {showPwd ? "Masquer" : "Afficher"}
                  </button>
                </div>
              </div>

              <div className="rounded border p-4 bg-neutral-50">
                <p className="font-semibold mb-2">Vos coordonnées</p>
                <div className="flex items-center gap-4 text-sm">
                  <label className="inline-flex items-center gap-2"><input type="radio" name="gender" checked={gender === "M"} onChange={() => setGender("M")} />M.</label>
                  <label className="inline-flex items-center gap-2"><input type="radio" name="gender" checked={gender === "Mme"} onChange={() => setGender("Mme")} />Mme</label>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <input className="border rounded px-3 py-2" placeholder="Prénom*" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  <input className="border rounded px-3 py-2" placeholder="Nom*" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <select className="border rounded px-3 py-2" value={country} onChange={(e) => setCountry(e.target.value)}>
                    <option>Côte d'Ivoire</option><option>Sénégal</option><option>Mali</option><option>Burkina Faso</option><option>Niger</option><option>Gabon</option><option>Cameroun</option><option>Bénin</option><option>Togo</option><option>Autre</option>
                  </select>
                  <input className="border rounded px-3 py-2" placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button className="rounded bg-neutral-900 text-white px-5 py-2 font-semibold disabled:opacity-60" disabled={loading}>
                  {loading ? "Création..." : "Continuer"}
                </button>
              </div>
            </form>
          )}

          {/* ÉTAPE 3 : OTP */}
          {authChecked && step === 3 && (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div className="rounded border p-4 bg-neutral-50">
                <p className="font-semibold mb-2">Vérification par code</p>
                <p className="text-sm text-neutral-700 mb-3">Un code à 6 chiffres a été envoyé à <strong>{email}</strong>.</p>
                <input className="w-full border rounded px-3 py-2" inputMode="numeric" maxLength={6} pattern="\d{6}" placeholder="Code à 6 chiffres" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} required />
                <div className="mt-3 flex gap-3">
                  <button type="submit" className="rounded bg-neutral-900 text-white px-5 py-2 font-semibold disabled:opacity-60" disabled={loading || !canSubmitOtp}>
                    {loading ? "Vérification..." : "Valider le code"}
                  </button>
                  <button type="button" className="text-sm underline" onClick={async () => {
                    try { setMsg(null); await otpRequest(email.trim()); setMsg("Nouveau code envoyé."); }
                    catch (e: any) { setMsg(e?.message || "Échec du renvoi de code."); }
                  }}>
                    Renvoyer le code
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ÉTAPE 2 : RÉCAP + BOUTON PAYER */}
          {authChecked && step === 2 && (
            <div className="space-y-4">
              <div className="rounded border p-4 bg-neutral-50">
                <p className="font-semibold">Récapitulatif</p>
                {planData && (
                  <ul className="mt-2 text-sm text-neutral-700">
                    <li>Formule : {planData.name}</li>
                    <li>Montant : {Number(planData.price_fcfa).toLocaleString()} FCFA</li>
                    {(authUser?.email || email) && <li>Compte : {authUser?.email || email}</li>}
                  </ul>
                )}
              </div>
              <button onClick={goPay} className="rounded bg-blue-600 text-white px-5 py-2 font-semibold disabled:opacity-60" disabled={loading}>
                {loading ? "Ouverture du paiement..." : "Payer"}
              </button>
              <p className="text-xs text-neutral-600">Vous serez redirigé vers la plateforme de paiement sécurisée.</p>
            </div>
          )}
        </div>

        {/* Carte offre */}
        <aside className="rounded border p-4 h-fit bg-white">
          {!planData ? (
            <p>Chargement…</p>
          ) : (
            <>
              <p className="text-sm uppercase tracking-wide text-neutral-500">Votre formule</p>
              <h3 className="mt-1 font-semibold">{planData.name}</h3>
              <p className="mt-1 text-2xl font-extrabold">{Number(planData.price_fcfa).toLocaleString()} FCFA</p>
              {planData.description && <p className="mt-2 text-sm text-neutral-600">{planData.description}</p>}
            </>
          )}
        </aside>
      </div>

      {msg && <p className="mt-4 text-sm text-red-600">{msg}</p>}
    </div>
  );
}

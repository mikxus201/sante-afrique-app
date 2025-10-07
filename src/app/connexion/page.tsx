// src/app/connexion/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { me as apiMe, passwordLogin, otpRequest, otpVerify } from "@/lib/api";

export default function ConnexionPage() {
  const router = useRouter();

  // Étapes : 1 = login mdp ; 2 = saisie OTP
  const [step, setStep] = useState<1 | 2>(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function goToAccount() {
    // Double-check côté API puis redirection
    try {
      await apiMe();
    } catch {
      // on ignore l'erreur ici (la session vient d'être créée)
    }
    router.push("/compte");
  }

  async function handlePasswordLogin() {
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      const E = email.trim();
      const P = password;
      if (!E || !P) throw new Error("Email et mot de passe sont requis.");

      // 1) Tentative de login
      const loginRes: any = await passwordLogin(E, P);

      // 2) Si le back demande explicitement un OTP -> on passe à l'étape OTP
      const needOtp =
        loginRes?.need_otp === true ||
        loginRes?.otp_required === true ||
        loginRes?.two_factor_required === true;

      if (needOtp) {
        await otpRequest(E);
        setMsg("Un code de vérification vient de vous être envoyé par email.");
        setStep(2);
        return;
      }

      // 3) Sinon, login OK -> on va direct au compte
      await goToAccount();
    } catch (e: any) {
      // Si le back renvoie une erreur typée OTP, on bascule gentiment en OTP
      const text: string = e?.message || "";
      if (/otp|two[- ]?factor|verify|v[eé]rifier/i.test(text)) {
        try {
          await otpRequest(email.trim());
          setStep(2);
          setMsg("Un code de vérification vient de vous être envoyé par email.");
          return;
        } catch {
          setErr("Échec de l’envoi du code. Réessayez.");
          return;
        }
      }
      setErr(e?.message || "Impossible de se connecter.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpVerify() {
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      const E = email.trim();
      const O = otp.trim();
      if (!O) throw new Error("Saisissez le code reçu par email.");
      await otpVerify(E, O);
      await goToAccount();
    } catch (e: any) {
      setErr(e?.message || "Code invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Se connecter</h1>

      {step === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePasswordLogin();
          }}
          className="space-y-4"
        >
          <label className="block">
            <span className="text-sm text-neutral-700">Email</span>
            <input
              type="email"
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="text-sm text-neutral-700">Mot de passe</span>
            <input
              type="password"
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          {err && <div className="text-sm text-red-600">{err}</div>}
          {msg && <div className="text-sm text-green-700">{msg}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded border px-3 py-2 disabled:opacity-50"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>

          <div className="text-sm text-neutral-600">
            Première fois ? Entrez vos identifiants. Si votre email n’est pas
            encore vérifié, un <strong>code OTP</strong> vous sera demandé.
          </div>
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleOtpVerify();
          }}
          className="space-y-4"
        >
          <div className="text-sm text-neutral-700">
            Code envoyé à <strong>{email}</strong>
          </div>

          <label className="block">
            <span className="text-sm text-neutral-700">Code reçu</span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              className="mt-1 w-full border rounded px-3 py-2 tracking-widest"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              autoComplete="one-time-code"
            />
          </label>

          {err && <div className="text-sm text-red-600">{err}</div>}
          {msg && <div className="text-sm text-green-700">{msg}</div>}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded border px-3 py-2 disabled:opacity-50"
            >
              {loading ? "Vérification…" : "Valider le code"}
            </button>

            <button
              type="button"
              className="text-sm underline"
              onClick={async () => {
                try {
                  setMsg(null);
                  setErr(null);
                  await otpRequest(email.trim());
                  setMsg("Nouveau code envoyé.");
                } catch {
                  setErr("Impossible de renvoyer le code pour l’instant.");
                }
              }}
            >
              Renvoyer le code
            </button>

            <button
              type="button"
              className="text-sm underline"
              onClick={() => {
                setStep(1);
                setOtp("");
                setMsg(null);
                setErr(null);
              }}
            >
              Changer d’email
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

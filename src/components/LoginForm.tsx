// src/components/LoginForm.tsx
"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-client";

async function postJSON(url: string, data: any) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.message || j?.error || "Une erreur est survenue.");
  return j;
}

export default function LoginForm() {
  const { setUser, setToken } = useAuth();

  // password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // otp
  const [identifier, setIdentifier] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState("");

  // ui
  const [msg, setMsg] = useState<string | null>(null);
  const [loadingPwd, setLoadingPwd] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);

  function cleanEmail(v: string) {
    return v.trim().toLowerCase();
  }
  function cleanIdentifier(v: string) {
    return v.trim();
  }

  async function onPwd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setLoadingPwd(true);
    try {
      const r = await postJSON("/api/auth/login", {
        email: cleanEmail(email),
        password: password,
      });
      if (!r?.token) throw new Error("Token manquant.");
      setToken(r.token);
      setUser(r.user || { email: cleanEmail(email) });
      setMsg("Connexion réussie.");
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoadingPwd(false);
    }
  }

  async function sendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setLoadingSend(true);
    try {
      const id = cleanIdentifier(identifier);
      await postJSON("/api/auth/request-otp", { identifier: id });
      setOtpSent(true);
      setMsg("Code envoyé. Consultez votre email/SMS.");
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoadingSend(false);
    }
  }

  async function verifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setLoadingVerify(true);
    try {
      const id = cleanIdentifier(identifier);
      const r = await postJSON("/api/auth/verify-otp", { identifier: id, code });
      if (!r?.token) throw new Error("Token manquant.");
      setToken(r.token);
      setUser(r.user || { email: id });
      setMsg("Connecté.");
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoadingVerify(false);
    }
  }

  // limiter l’OTP à 6 chiffres
  function onCodeChange(v: string) {
    const onlyDigits = v.replace(/\D/g, "").slice(0, 6);
    setCode(onlyDigits);
  }

  const inpt = "w-full border rounded px-3 py-2";
  const btn = "w-full rounded bg-neutral-900 text-white py-2 font-semibold";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Connexion classique */}
      <form onSubmit={onPwd} className="space-y-3">
        <input
          className={inpt}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label="Adresse e-mail"
        />
        <input
          className={inpt}
          type="password"
          name="current-password"
          autoComplete="current-password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-label="Mot de passe"
        />
        <button className={btn} disabled={loadingPwd} aria-busy={loadingPwd}>
          {loadingPwd ? "Connexion..." : "Je me connecte"}
        </button>
      </form>

      {/* Connexion OTP */}
      {!otpSent ? (
        <form onSubmit={sendOtp} className="space-y-3">
          <input
            className={inpt}
            placeholder="Email ou téléphone"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            aria-label="Email ou téléphone"
          />
          <button className={btn} disabled={loadingSend} aria-busy={loadingSend}>
            {loadingSend ? "Envoi du code..." : "Recevoir un code OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-3">
          <input
            className={inpt}
            inputMode="numeric"
            maxLength={6}
            pattern="\d{6}"
            placeholder="Code à 6 chiffres"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            required
            aria-label="Code à 6 chiffres"
          />
          <button className={btn} disabled={loadingVerify || code.length !== 6} aria-busy={loadingVerify}>
            {loadingVerify ? "Vérification..." : "Valider le code"}
          </button>
        </form>
      )}

      {msg && <p className="col-span-2 text-center text-sm">{msg}</p>}
    </div>
  );
}

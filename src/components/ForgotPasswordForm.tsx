// src/components/ForgotPasswordForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("email", email);

      const res = await fetch("/api/auth/forgot-password", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Échec d’envoi");
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-neutral-700">
          Si un compte existe pour <strong>{email}</strong>, nous vous avons envoyé un e-mail
          avec les instructions pour réinitialiser votre mot de passe.
        </p>
        <Link href="/connexion" className="inline-block rounded border px-4 py-2 hover:bg-neutral-50">
          ← Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Adresse e-mail*</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="mt-2 w-full rounded bg-neutral-900 px-4 py-2 text-white font-semibold hover:opacity-90 disabled:opacity-60"
      >
        {sending ? "Envoi…" : "Continuer"}
      </button>

      <div className="text-center">
        <Link href="/" className="text-sm font-semibold hover:underline">
          Retour à Santé Afrique
        </Link>
      </div>
    </form>
  );
}

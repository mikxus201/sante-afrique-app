"use client";

import * as React from "react";
import Link from "next/link";
import type { Plan } from "@/lib/plans";

type Props = {
  plan: Plan;
  className?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InscriptionForm({ plan, className = "" }: Props) {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [payMethod, setPayMethod] = React.useState<"momo" | "card">("momo");
  const [agree, setAgree] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string>("");
  const [ok, setOk] = React.useState<boolean | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setOk(null);

    if (!agree) {
      setOk(false);
      setMsg("Veuillez accepter les conditions d’utilisation.");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setOk(false);
      setMsg("E-mail invalide.");
      return;
    }
    if (!phone.trim()) {
      setOk(false);
      setMsg("Renseignez un numéro de téléphone.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/subscribe-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          amount: plan.amountCFA,
          fullName,
          email,
          phone,
          company,
          payMethod,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setOk(false);
        setMsg(data?.message || "Impossible d’enregistrer la demande.");
        return;
      }

      // si l’API renvoie une URL de paiement => redirection
      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl as string;
        return;
      }

      setOk(true);
      setMsg("Demande enregistrée. Un lien de paiement vous sera envoyé.");
    } catch {
      setOk(false);
      setMsg("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  const input =
    "w-full rounded border border-neutral-300 px-3 h-11 text-sm focus:border-blue-500 outline-none";
  const label = "text-sm font-medium text-neutral-700";
  const btn =
    "inline-flex items-center justify-center rounded bg-blue-600 px-4 h-11 text-white font-semibold hover:bg-blue-700 disabled:opacity-60";

  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={label}>Nom & Prénoms</label>
          <input className={input} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label className={label}>Organisation (optionnel)</label>
          <input className={input} value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div>
          <label className={label}>E-mail</label>
          <input type="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className={label}>Téléphone</label>
          <input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
      </div>

      <div>
        <span className={label}>Moyen de paiement</span>
        <div className="mt-2 flex gap-3 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="pay"
              value="momo"
              checked={payMethod === "momo"}
              onChange={() => setPayMethod("momo")}
            />
            Mobile Money
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="pay"
              value="card"
              checked={payMethod === "card"}
              onChange={() => setPayMethod("card")}
            />
            Carte bancaire
          </label>
        </div>
      </div>

      <label className="mt-2 flex items-start gap-2 text-sm">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>
          J’accepte les{" "}
          <Link href="/conditions-d-utilisation" className="text-blue-700 hover:underline">
            conditions d’utilisation
          </Link>{" "}
          et la{" "}
          <Link href="/politique-de-confidentialite" className="text-blue-700 hover:underline">
            politique de confidentialité
          </Link>.
        </span>
      </label>

      <div className="flex items-center gap-3">
        <button type="submit" className={btn} disabled={loading}>
          {loading ? "Traitement…" : `Payer ${plan.priceText}`}
        </button>
        {msg && (
          <span className={`text-sm ${ok === false ? "text-red-600" : "text-green-700"}`}>{msg}</span>
        )}
      </div>
    </form>
  );
}

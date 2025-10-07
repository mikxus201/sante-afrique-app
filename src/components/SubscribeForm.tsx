"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [ok, setOk] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      alert("Merci d’entrer un email valide.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const json = await res.json();
      setOk(json?.ok === true);
      if (json?.ok) {
        setEmail("");
        setName("");
      }
    } catch {
      setOk(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Nom (optionnel)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sa-blue"
          placeholder="Votre nom"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sa-blue"
          placeholder="vous@domaine.com"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full bg-sa-blue px-4 py-2 text-white font-semibold hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Enregistrement..." : "S’abonner"}
      </button>

      {ok === true && (
        <p className="text-sm text-green-700">Merci ! Vous êtes inscrit(e) à la newsletter.</p>
      )}
      {ok === false && (
        <p className="text-sm text-red-700">Un problème est survenu. Réessayez plus tard.</p>
      )}
    </form>
  );
}

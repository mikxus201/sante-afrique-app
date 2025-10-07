// src/components/AccountDashboard.tsx
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "../lib/auth-client";

export default function AccountDashboard() {
  const { user, updateUser, setAvatarUrl, signOut } = useAuth();
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-extrabold">Accès restreint</h1>
        <p className="mt-2 text-neutral-600">
          Veuillez vous connecter pour accéder à votre compte.
        </p>
      </div>
    );
  }

  // --- Upload avatar (robuste côté types) ---
  async function onAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Sécurise la présence du user et de son id pour TS
    if (!user || user.id == null) {
      alert("Session expirée. Veuillez vous reconnecter.");
      return;
    }
    const userId =
      typeof user.id === "number" || typeof user.id === "string"
        ? String(user.id)
        : "anonymous";

    const fd = new FormData();
    fd.append("avatar", file);
    fd.append("userId", userId); // ✅ plus d’erreur ici

    const res = await fetch("/api/account/avatar", { method: "POST", body: fd });
    const json = (await res.json()) as { ok?: boolean; url?: string; error?: string };

    if (res.ok && json.ok && typeof json.url === "string") {
      setAvatarUrl(json.url);
    } else {
      alert(json?.error || "Échec de l’envoi de l’avatar");
    }
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    // Démo: pas d’appel API — à brancher sur ton backend
    setTimeout(() => setSaving(false), 500);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* ===== Colonne gauche ===== */}
        <aside>
          <div className="rounded bg-neutral-900 text-white p-4">
            <p className="text-sm opacity-80">Bonjour</p>
            <h2 className="text-xl font-extrabold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-xs opacity-80 mt-1">{user.email}</p>
          </div>

          <nav className="mt-4 rounded border bg-white p-2 text-sm">
            <a className="block rounded px-3 py-2 font-semibold bg-neutral-100">Abonnement</a>
            <a className="block rounded px-3 py-2 hover:bg-neutral-50">Profil</a>
            <a className="block rounded px-3 py-2 hover:bg-neutral-50">Newsletters</a>
            <a className="block rounded px-3 py-2 hover:bg-neutral-50">Factures</a>
            <a className="block rounded px-3 py-2 hover:bg-neutral-50">Moyens de paiement</a>
            <a className="block rounded px-3 py-2 hover:bg-neutral-50">Applications</a>
            <a className="block rounded px-3 py-2 hover:bg-neutral-50">Cookies</a>
            <a className="block rounded px-3 py-2 hover:bg-neutral-50">FAQ</a>
            <button
              onClick={signOut}
              className="mt-1 w-full text-left rounded px-3 py-2 hover:bg-neutral-50"
            >
              Se déconnecter
            </button>
          </nav>
        </aside>

        {/* ===== Contenu principal ===== */}
        <section className="space-y-6">
          {/* Carte abonnement */}
          <div className="rounded border bg-white p-4">
            <h3 className="text-lg font-extrabold">Abonnement en cours</h3>
            <p className="mt-1 text-neutral-700">
              (Démo) Votre abonnement est affiché ici. Bouton “Renouveler” à brancher.
            </p>
            <button className="mt-3 rounded bg-neutral-900 px-4 py-2 text-white font-semibold hover:opacity-90">
              Renouveler mon abonnement
            </button>
          </div>

          {/* Profil + avatar */}
          <div className="rounded border bg-white p-4">
            <h3 className="text-lg font-extrabold">Mon profil</h3>
            <div className="mt-4 grid gap-6 md:grid-cols-[160px_1fr] items-start">
              <div className="space-y-2">
                <div className="h-28 w-28 overflow-hidden rounded-full bg-neutral-200">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </div>
                  )}
                </div>
                <label className="inline-block cursor-pointer rounded border px-3 py-1.5 text-sm hover:bg-neutral-50">
                  Changer la photo
                  <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
                </label>
              </div>

              <form className="space-y-3" onSubmit={onSave}>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium">Prénom</label>
                    <input
                      defaultValue={user.firstName}
                      onChange={(e) => updateUser({ firstName: e.target.value })}
                      className="mt-1 w-full rounded border px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Nom</label>
                    <input
                      defaultValue={user.lastName}
                      onChange={(e) => updateUser({ lastName: e.target.value })}
                      className="mt-1 w-full rounded border px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium">E-mail</label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    onChange={(e) => updateUser({ email: e.target.value })}
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-neutral-900 px-4 py-2 text-white font-semibold hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { me, updateMe } from "@/lib/api";

type U = {
  email?: string | null;
  nom?: string | null;
  prenoms?: string | null;
  phone?: string | null;
  country?: string | null;
  gender?: "M" | "Mme" | null;
};

export default function ProfilPage() {
  const [user, setUser] = useState<U | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await me();
        setUser((r as any).data ?? null);
      } catch {
        setErr("Veuillez vous reconnecter.");
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      const payload = {
        nom: String(fd.get("nom") || "").trim(),
        prenoms: String(fd.get("prenoms") || "").trim(),
        phone: String(fd.get("phone") || "").trim(),
        country: String(fd.get("country") || "").trim(),
        gender: (fd.get("gender") as any) || null,
      };
      const r = await updateMe(payload);
      setUser((prev) => ({ ...(prev ?? {}), ...((r as any).data ?? {}) }));
    } catch {
      setErr("Échec de l’enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  if (err) return <div className="rounded border bg-white p-6">{err}</div>;
  if (!user) return <div className="rounded border bg-white p-6">Chargement…</div>;

  return (
    <form onSubmit={onSubmit} className="rounded border bg-white p-6 space-y-6">
      <h2 className="text-xl font-extrabold">Vos informations</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 text-sm text-neutral-600">Email : {user.email}</div>

        <div>
          <label className="block text-sm font-medium">Civilité</label>
          <div className="mt-1 flex gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="gender" value="M" defaultChecked={user.gender === "M"} /> M.
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="gender" value="Mme" defaultChecked={user.gender === "Mme"} /> Mme
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Prénoms</label>
          <input name="prenoms" defaultValue={user.prenoms || ""} className="mt-1 w-full rounded border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Nom</label>
          <input name="nom" defaultValue={user.nom || ""} className="mt-1 w-full rounded border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Téléphone</label>
          <input name="phone" defaultValue={user.phone || ""} className="mt-1 w-full rounded border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Pays</label>
          <input name="country" defaultValue={user.country || ""} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="inline-flex rounded bg-neutral-900 px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
          disabled={saving}
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        <a href="/mot-de-passe-oublie" className="text-sm underline hover:no-underline">
          Changer le mot de passe
        </a>
      </div>
    </form>
  );
}

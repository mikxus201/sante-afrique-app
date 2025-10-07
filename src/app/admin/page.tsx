"use client";

import { useEffect, useState } from "react";

type HeroData = {
  title: string;
  subtitle: string;
  slides: { src: string }[];
};

export default function AdminPage() {
  const [keyOk, setKeyOk] = useState(false);
  const [form, setForm] = useState<HeroData>({
    title: "",
    subtitle: "",
    slides: [{ src: "" }, { src: "" }, { src: "" }]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const REQUIRED_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY!;

  useEffect(() => {
    // petit “login” simplifié
    const stored = sessionStorage.getItem("sa_admin_ok");
    if (stored === "1") {
      setKeyOk(true);
    } else {
      const input = prompt("Mot de passe admin ?");
      if (input === REQUIRED_KEY) {
        sessionStorage.setItem("sa_admin_ok", "1");
        setKeyOk(true);
      } else {
        alert("Mot de passe incorrect.");
        setKeyOk(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!keyOk) return;
    (async () => {
      try {
        const res = await fetch("/api/hero");
        const json = await res.json();
        setForm(json);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [keyOk]);

  if (!keyOk) return null;
  if (loading) return <div className="p-6">Chargement…</div>;

  const setSlide = (i: number, value: string) => {
    const slides = [...form.slides];
    slides[i] = { src: value };
    setForm({ ...form, slides });
  };

  const addSlide = () => {
    if (form.slides.length >= 5) return alert("Max 5 images");
    setForm({ ...form, slides: [...form.slides, { src: "" }] });
  };

  const removeSlide = (i: number) => {
    if (form.slides.length <= 1) return;
    const slides = form.slides.filter((_, idx) => idx !== i);
    setForm({ ...form, slides });
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error();
      alert("Enregistré ! Rafraîchis la page d’accueil pour voir le résultat.");
    } catch {
      alert("Échec d’enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin — Hero</h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Titre</label>
        <input
          className="w-full border rounded-md px-3 py-2"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Sous-titre</label>
        <input
          className="w-full border rounded-md px-3 py-2"
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Slides ({form.slides.length}/5)</h2>
          <button
            onClick={addSlide}
            className="px-3 py-1 rounded bg-sa-blue text-white"
          >
            + Ajouter
          </button>
        </div>

        {form.slides.map((s, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              className="flex-1 border rounded-md px-3 py-2"
              placeholder="/hero1.jpg ou https://…"
              value={s.src}
              onChange={(e) => setSlide(i, e.target.value)}
            />
            <button
              onClick={() => removeSlide(i)}
              className="px-3 py-2 rounded border"
              title="Supprimer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="px-5 py-2 rounded bg-green-600 text-white disabled:opacity-60"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
    </div>
  );
}

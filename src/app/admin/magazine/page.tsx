"use client";

import { useEffect, useState } from "react";

type Issue = {
  id: number;
  title: string;
  excerpt: string;
  image: string; // grande couverture (gauche)
  thumb: string; // miniatures (grille)
};

type EditableField = "title" | "excerpt" | "image" | "thumb";

export default function AdminPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les données
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/issues", { cache: "no-store" });
        const json = (await res.json()) as Issue[];
        setIssues(json);
      } catch (e) {
        setError("Impossible de charger les numéros.");
      }
    })();
  }, []);

  // Modifier un champ
  const handleChange = (index: number, field: EditableField, value: string) => {
    setIssues((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  };

  // Sauvegarder
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(issues),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      alert("Changements sauvegardés ✅");
    } catch (e) {
      setError("Échec de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des numéros</h1>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700">
          {error}
        </div>
      )}

      {issues.map((issue, i) => (
        <div key={issue.id} className="mb-6 rounded border p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-neutral-600">Titre</span>
              <input
                className="mt-1 w-full rounded border p-2"
                value={issue.title}
                onChange={(e) => handleChange(i, "title", e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm text-neutral-600">Extrait</span>
              <textarea
                className="mt-1 w-full rounded border p-2"
                rows={3}
                value={issue.excerpt}
                onChange={(e) => handleChange(i, "excerpt", e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm text-neutral-600">
                URL image grande (cover gauche)
              </span>
              <input
                className="mt-1 w-full rounded border p-2"
                value={issue.image}
                onChange={(e) => handleChange(i, "image", e.target.value)}
                placeholder="/covers/issue-01.jpg"
              />
            </label>

            <label className="block">
              <span className="text-sm text-neutral-600">
                URL miniature (grille)
              </span>
              <input
                className="mt-1 w-full rounded border p-2"
                value={issue.thumb}
                onChange={(e) => handleChange(i, "thumb", e.target.value)}
                placeholder="/thumbs/issue-01.jpg"
              />
            </label>
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-full border border-[#0096D3] px-5 py-2 text-[#0096D3] hover:bg-[#0096D3] hover:text-white disabled:opacity-50"
      >
        {saving ? "Sauvegarde..." : "Sauvegarder"}
      </button>
    </div>
  );
}

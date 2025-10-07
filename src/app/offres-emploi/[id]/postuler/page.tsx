// src/app/offres-emploi/[id]/postuler/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import jobsData from "../../../../../data/jobs.json";

type Job = {
  id: string | number;
  title: string;
  company: string;
  type: string;
  location: string;
  publishedAt: string;
  excerpt?: string;
};

const JOBS: Job[] = (jobsData as any) as Job[];

export default function PostulerPage({ params }: { params: { id: string } }) {
  const job = useMemo(() => JOBS.find((j) => String(j.id) === params.id), [params.id]);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<null | { ref: string }>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError(null);
    setDone(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const r = await fetch("/api/candidature", { method: "POST", body: fd });
      const json = await r.json();
      if (!r.ok || !json?.ok) throw new Error(json?.error || "Échec d’envoi");
      setDone({ ref: (json.saved?.cv?.filename || "OK") as string });
      form.reset();
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setSending(false);
    }
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-extrabold">Offre introuvable</h1>
        <Link href="/offres" className="mt-6 inline-block rounded border px-4 py-2 hover:bg-neutral-50">
          ← Retour aux offres
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Ariane */}
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span className="mx-1">/</span>
        <Link href="/offres" className="hover:underline">Offres d’emploi</Link>
        <span className="mx-1">/</span>
        <Link href={`/offres-emploi/${job.id}`} className="hover:underline">{job.title}</Link>
        <span className="mx-1">/</span>
        <span>Postuler</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-extrabold">Postuler — {job.title}</h1>
      <p className="mt-1 text-neutral-700">
        <strong>{job.company}</strong> · {job.type} · {job.location}
      </p>

      <form className="mt-6 space-y-4 rounded border bg-white p-4" onSubmit={onSubmit}>
        {/* champs cachés pour le backend */}
        <input type="hidden" name="jobId" value={String(job.id)} />
        <input type="hidden" name="jobTitle" value={job.title} />

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Adresse email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="vous@exemple.com"
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Numéro de téléphone</label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="+225 01 23 45 67 89"
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">CV (PDF, DOC, DOCX)</label>
            <input
              type="file"
              name="cv"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              required
              className="mt-1 w-full rounded border px-3 py-2 file:mr-3 file:rounded file:border file:px-3 file:py-1.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Lettre de motivation (PDF, DOC, DOCX)</label>
            <input
              type="file"
              name="lm"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              required
              className="mt-1 w-full rounded border px-3 py-2 file:mr-3 file:rounded file:border file:px-3 file:py-1.5"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Message (optionnel)</label>
          <textarea name="message" rows={4} className="mt-1 w-full rounded border px-3 py-2" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {done && (
          <p className="text-sm text-green-700">
            Candidature envoyée ✅ (réf. <span className="font-mono">{done.ref}</span>)
          </p>
        )}

        <div className="flex items-center gap-3">
          <Link href={`/offres-emploi/${job.id}`} className="rounded border px-4 py-2 hover:bg-neutral-50">
            ← Retour à l’offre
          </Link>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {sending ? "Envoi en cours…" : "Envoyer ma candidature"}
          </button>
        </div>

        <p className="mt-2 text-xs text-neutral-500">
          En envoyant ce formulaire, vous acceptez nos{" "}
          <Link href="/conditions" className="underline">Conditions d’utilisation</Link> et notre{" "}
          <Link href="/confidentialite" className="underline">Politique de confidentialité</Link>.
        </p>
      </form>
    </div>
  );
}

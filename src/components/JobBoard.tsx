// src/components/JobBoard.tsx
"use client";

import { useMemo, useState } from "react";
import JobCard, { type Job } from "@/components/JobCard";

type Props = { jobs: Job[] };

function uniqueSorted(values: (string | undefined)[]) {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort();
}

export default function JobBoard({ jobs }: Props) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [country, setCountry] = useState("");

  // listes pour les filtres
  const types = useMemo(() => uniqueSorted(jobs.map(j => j.type)), [jobs]);
  const countries = useMemo(() => {
    // on prend le dernier segment de location comme "pays" (ex: "Abidjan, Côte d’Ivoire" -> "Côte d’Ivoire")
    return uniqueSorted(
      jobs.map(j =>
        (j.location ?? "")
          .split(",")
          .pop()
          ?.trim()
      )
    );
  }, [jobs]);

  // filtrage
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return jobs.filter(j => {
      const hay = `${j.title} ${j.company ?? ""} ${j.location ?? ""}`.toLowerCase();
      const okQ = !needle || hay.includes(needle);
      const okType = !type || j.type === type;
      const okCountry = !country || (j.location ?? "").toLowerCase().includes(country.toLowerCase());
      return okQ && okType && okCountry;
    });
  }, [jobs, q, type, country]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight mb-2">Offres d’emploi</h1>
      <p className="text-neutral-600 mb-6">Trouvez nos dernières offres d’emploi à travers l’Afrique.</p>

      {/* Filtres */}
      <div className="grid gap-3 md:grid-cols-4 mb-6">
        <input
          className="border rounded px-3 py-2 md:col-span-2"
          placeholder="Rechercher (poste, société, ville…)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="border rounded px-3 py-2" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Type</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select className="border rounded px-3 py-2" value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">Pays</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Résultats */}
      <div className="grid gap-4 md:grid-cols-2">
        {results.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

// src/components/JobBoard.tsx
"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import JobCard, { type Job } from "@/components/JobCard";

export type CompanyOpt = { id: number | string; name: string };
export type CountryOpt = { code: string; name: string };

type Props = {
  jobs: Job[];
  total?: number; // optionnel (fallback = jobs.length)
  companies?: CompanyOpt[];
  professions?: string[];
  types?: string[];
  countries?: CountryOpt[];
};

/* ---------- helpers sûrs pour TS ---------- */
const isNonEmpty = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

function uniqSortStr(arr: Array<string | null | undefined>): string[] {
  const set = new Set<string>();
  for (const v of arr) {
    if (isNonEmpty(v)) set.add(v);
  }
  return Array.from(set).sort((a, b) =>
    a.localeCompare(b, "fr", { sensitivity: "base" })
  );
}

export default function JobBoard({
  jobs,
  total = jobs.length,
  companies: companiesProp = [],
  professions: professionsProp = [],
  types: typesProp = [],
  countries: countriesProp = [],
}: Props) {
  const r = useRouter();
  const sp = useSearchParams();

  // URL = source de vérité
  const q = sp.get("q") ?? "";
  const country = sp.get("country") ?? "";
  const type = sp.get("type") ?? "";
  const profession = sp.get("profession") ?? "";
  const companyId = sp.get("companyId") ?? "";
  const minExp = sp.get("minExp") ?? "";
  const sort = (sp.get("sort") === "date_asc" ? "date_asc" : "date_desc") as
    | "date_desc"
    | "date_asc";

  // Listes affichées
  const types = useMemo<string[]>(() => uniqSortStr(typesProp), [typesProp]);

  // On envoie le NOM du pays (pas le code)
  const countries = useMemo<string[]>(
    () => uniqSortStr(countriesProp.map((c) => c?.name)),
    [countriesProp]
  );

  const professions = useMemo<string[]>(
    () => uniqSortStr(professionsProp),
    [professionsProp]
  );

  const companies = useMemo<CompanyOpt[]>(
    () =>
      [...companiesProp].sort((a, b) =>
        String(a?.name ?? "").localeCompare(String(b?.name ?? ""), "fr", {
          sensitivity: "base",
        })
      ),
    [companiesProp]
  );

  const experienceSteps = ["0", "1", "2", "3", "5", "7", "10"];

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = new URLSearchParams();

    // NOMS de paramètres attendus par JobController@index
    for (const [k, v] of fd.entries()) {
      const val = String(v).trim();
      if (val) next.set(k, val);
    }
    next.delete("page"); // au cas où
    r.push(`/offres-emploi?${next.toString()}`);
  }

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Offres d’emploi</h1>
        <span className="text-sm text-neutral-600">
          {total} offre{total > 1 ? "s" : ""} en ligne aujourd’hui
        </span>
      </div>

      {/* Filtres -> soumission = navigation (URL) */}
      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-6 mb-6 items-end">
        <div className="md:col-span-2">
          <input
            className="w-full border rounded px-3 py-2"
            name="q"
            defaultValue={q}
            placeholder="Rechercher (poste, société, ville…)"
          />
        </div>

        <div>
          <select className="border rounded px-3 py-2" name="type" defaultValue={type}>
            <option value="">Type</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select className="border rounded px-3 py-2" name="country" defaultValue={country}>
            <option value="">Pays</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            className="border rounded px-3 py-2"
            name="profession"
            defaultValue={profession}
          >
            <option value="">Profession</option>
            {professions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            className="border rounded px-3 py-2"
            name="companyId"
            defaultValue={companyId}
          >
            <option value="">Entreprise</option>
            {companies.map((c) => (
              <option key={String(c.id)} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2 md:col-span-2">
          <select className="border rounded px-3 py-2" name="minExp" defaultValue={minExp}>
            <option value="">Exp. min</option>
            {experienceSteps.map((y) => (
              <option key={y} value={y}>
                {y}+ ans
              </option>
            ))}
          </select>
          <select className="border rounded px-3 py-2" name="sort" defaultValue={sort}>
            <option value="date_desc">Plus récentes</option>
            <option value="date_asc">Plus anciennes</option>
          </select>
        </div>

        <div className="md:col-span-6">
          <button className="rounded bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700">
            Filtrer
          </button>
        </div>
      </form>

      {/* Résultats */}
      <div className="grid gap-4 md:grid-cols-2">
        {jobs.map((job) => (
          <JobCard key={(job as any).id} job={job as any} />
        ))}
        {!jobs.length && (
          <div className="col-span-full rounded border p-6 text-center text-neutral-600">
            Aucune offre ne correspond à vos critères.
          </div>
        )}
      </div>
    </div>
  );
}

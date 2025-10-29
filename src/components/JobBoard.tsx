// src/components/JobBoard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import JobCard, { type Job } from "@/components/JobCard";

export type CompanyOpt = { id:number; name:string };

// NEW: type option pays (si fourni par le parent)
export type CountryOpt = { code: string; name: string };

type Props = {
  jobs: Job[];
  total: number;
  companies?: CompanyOpt[];
  professions?: string[];
  // NEW: listes dynamiques en props (optionnelles)
  types?: string[];
  countries?: CountryOpt[];
};

function uniqueSorted(values: (string | undefined)[]) {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort();
}

export default function JobBoard({
  jobs,
  total,
  companies = [],
  professions = [],
  // NEW: props optionnelles pour listes de filtres
  types: typesProp = [],
  countries: countriesProp = [],
}: Props) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [country, setCountry] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [profession, setProfession] = useState("");
  const [minExp, setMinExp] = useState("");
  const [sort, setSort] = useState<"date_desc" | "date_asc">("date_desc");

  // listes
  // NEW: si 'types' est fourni en props, on l'utilise; sinon fallback depuis jobs
  const types = useMemo(() => {
    return typesProp.length
      ? uniqueSorted(typesProp)
      : uniqueSorted(jobs.map((j) => (j as any).type));
  }, [typesProp, jobs]);

  // NEW: si 'countries' (objets) est fourni, on prend le .name; sinon fallback depuis jobs
  const countries = useMemo(() => {
    if (countriesProp.length) {
      return uniqueSorted(countriesProp.map((c) => c.name));
    }
    return uniqueSorted(
      jobs.map(
        (j) =>
          ((j as any).country as string) ||
          (j as any).location?.split(",").pop()?.trim()
      )
    );
  }, [countriesProp, jobs]);

  const experienceSteps = ["0", "1", "2", "3", "5", "7", "10"];

  // filtrage client (utile si tu passes un tableau déjà chargé)
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let arr = jobs.filter((j) => {
      const hay = `${j.title} ${j.company ?? ""} ${(j as any).location ?? ""} ${(j as any).country ?? ""}`.toLowerCase();
      const okQ = !needle || hay.includes(needle);
      const okType = !type || (j as any).type === type;
      const okCountry =
        !country ||
        ((j as any).country ?? (j as any).location ?? "")
          .toLowerCase()
          .includes(country.toLowerCase());
      const okProfession =
        !profession ||
        ((j as any).profession ?? "").toLowerCase() === profession.toLowerCase();
      const okCompany =
        !companyId || String((j as any).company_id ?? "") === companyId;
      const okMinExp =
        !minExp || Number(((j as any).experienceMin ?? 0)) >= Number(minExp);
      return (
        okQ && okType && okCountry && okProfession && okCompany && okMinExp
      );
    });

    arr = arr.sort((a, b) => {
      const da = new Date((a as any).publishedAt || 0).getTime();
      const db = new Date((b as any).publishedAt || 0).getTime();
      return sort === "date_desc" ? db - da : da - db;
    });

    return arr;
  }, [jobs, q, type, country, profession, companyId, minExp, sort]);

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Offres d’emploi</h1>
        <span className="text-sm text-neutral-600">
          {total} offre{total > 1 ? "s" : ""} en ligne aujourd’hui
        </span>
      </div>

      {/* Filtres */}
      <div className="grid gap-3 md:grid-cols-6 mb-6">
        <input
          className="border rounded px-3 py-2 md:col-span-2"
          placeholder="Rechercher (poste, société, ville…)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Type</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="">Pays</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
        >
          <option value="">Profession</option>
          {(professions || []).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        >
          <option value="">Entreprise</option>
          {(companies || []).map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2 md:col-span-2">
          <select
            className="border rounded px-3 py-2"
            value={minExp}
            onChange={(e) => setMinExp(e.target.value)}
          >
            <option value="">Exp. min</option>
            {experienceSteps.map((y) => (
              <option key={y} value={y}>
                {y}+ ans
              </option>
            ))}
          </select>
          <select
            className="border rounded px-3 py-2"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
          >
            <option value="date_desc">Plus récentes</option>
            <option value="date_asc">Plus anciennes</option>
          </select>
        </div>
      </div>

      {/* Résultats */}
      <div className="grid gap-4 md:grid-cols-2">
        {results.map((job) => (
          <JobCard key={job.id} job={job as any} />
        ))}
      </div>
    </div>
  );
}

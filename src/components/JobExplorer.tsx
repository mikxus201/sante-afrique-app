// src/components/JobExplorer.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import JobCard, { type Job as UiJob } from "@/components/JobCard";
import JobFilters from "@/components/JobFilters";
import { API_PREFIX } from "@/lib/api";

// —— Types —— //
type Filters = {
  q?: string;
  country?: string;
  type?: string;
  role?: string;
  company?: string;
  experienceMin?: number;
  datePosted?: "24h" | "7j" | "30j" | string;
};

type Job = UiJob & {
  // tolérance de nommage selon l'API
  isPinned?: boolean;
  pinUntil?: string | null;
  publishedAt?: string | null;
  published_at?: string | null;
  closingAt?: string | null;
  closing_at?: string | null;
  isActive?: boolean;
  is_active?: boolean;
};

export default function JobExplorer() {
  // Filtres + données
  const [filters, setFilters] = useState<Filters>({});
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<{ totalActive?: number; total?: number } | null>(null);

  // Chargement
  useEffect(() => {
    const ctrl = new AbortController();

    (async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams();
        if (filters.q) qs.set("q", String(filters.q));
        if (filters.country) qs.set("country", String(filters.country));
        if (filters.type) qs.set("type", String(filters.type));
        if (filters.role) qs.set("role", String(filters.role));
        if (filters.company) qs.set("company", String(filters.company));
        if (filters.experienceMin != null)
          qs.set("experience_min", String(filters.experienceMin));
        if (filters.datePosted) qs.set("date_posted", String(filters.datePosted)); // 24h|7j|30j

        const base = API_PREFIX.replace(/\/+$/, "");
        const url = `${base}/jobs${qs.toString() ? `?${qs}` : ""}`;

        const res = await fetch(url, {
          credentials: "include",
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal: ctrl.signal,
        });

        const json: any = await res.json().catch(() => ({}));

        const list: Job[] = Array.isArray(json?.items)
          ? json.items
          : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];

        setJobs(list);
        setMeta({
          totalActive: json?.totalActive ?? json?.total_active ?? json?.total ?? undefined,
          total: json?.total ?? json?.count ?? list.length,
        });
      } catch {
        // noop (UX silencieux)
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [filters]);

  // Helpers dates/états (gèrent published_at/closing_at & is_active)
  const toDate = (j: Job) => j.publishedAt ?? j.published_at ?? null;
  const toClosing = (j: Job) => j.closingAt ?? j.closing_at ?? null;
  const isActive = (j: Job) => (j.isActive ?? j.is_active ?? true);

  // Tri : pinned (valide) d’abord, puis date décroissante
  const sorted = useMemo(() => {
    const now = Date.now();
    const byPinned = (a: Job, b: Job) => {
      const pa = !!(a.isPinned && (!a.pinUntil || new Date(a.pinUntil).getTime() > now));
      const pb = !!(b.isPinned && (!b.pinUntil || new Date(b.pinUntil).getTime() > now));
      return pa === pb ? 0 : pa ? -1 : 1;
    };
    const byDate = (a: Job, b: Job) =>
      new Date(toDate(b) || 0).getTime() - new Date(toDate(a) || 0).getTime();

    return [...jobs].sort((a, b) => byPinned(a, b) || byDate(a, b));
  }, [jobs]);

  // « en ligne aujourd’hui »
  const onlineToday = useMemo(() => {
    const today = new Date();
    return jobs.filter((j) => {
      const closing = toClosing(j);
      return isActive(j) && (!closing || new Date(closing) >= today);
    });
  }, [jobs]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Offres d’emploi</h1>
        <p className="text-sm text-neutral-600">
          {onlineToday.length} offres en ligne aujourd’hui
        </p>
      </div>

      <p className="text-neutral-600 mb-6">
        Trouvez des opportunités partout en Afrique, filtrées par pays, type de contrat, date de
        publication, expérience, entreprise et métier.
      </p>

      <JobFilters
        value={filters}
        onChange={(n: Partial<Filters>) => setFilters((prev) => ({ ...prev, ...n }))}
        className="mb-6"
      />

      {loading ? (
        <p className="text-neutral-600">Chargement…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sorted.map((job) => (
            <JobCard key={String((job as any).id ?? (job as any).slug)} job={job} />
          ))}

          {!sorted.length && (
            <div className="col-span-full rounded border p-6 text-center text-neutral-600">
              Aucune offre ne correspond à vos critères.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";
const [jobs, setJobs] = useState<Job[]>([]);
const [loading, setLoading] = useState(false);
const [meta, setMeta] = useState<{ totalActive?: number; total?: number } | null>(null);


useEffect(() => {
const ctrl = new AbortController();
const run = async () => {
setLoading(true);
try {
const qs = new URLSearchParams();
if (filters.q) qs.set("q", filters.q);
if (filters.country) qs.set("country", filters.country);
if (filters.type) qs.set("type", filters.type);
if (filters.role) qs.set("role", filters.role);
if (filters.company) qs.set("company", filters.company);
if (filters.experienceMin) qs.set("experience_min", filters.experienceMin);
if (filters.datePosted) qs.set("date_posted", filters.datePosted); // 24h|7j|30j
const res = await fetch(`${API_PREFIX}/jobs?${qs.toString()}`, {
credentials: "include",
signal: ctrl.signal,
});
const json = await res.json();
setJobs(Array.isArray(json?.items) ? json.items : []);
setMeta({ totalActive: json?.totalActive ?? json?.total ?? undefined, total: json?.total ?? undefined });
} catch (_) {
// noop UX silencieux
} finally {
setLoading(false);
}
};
run();
return () => ctrl.abort();
}, [filters]);


// Pinned d’abord (si encore valides), puis par date desc
const sorted = useMemo(() => {
const now = Date.now();
const byPinned = (a: Job, b: Job) => {
const pa = a.isPinned && (!a.pinUntil || new Date(a.pinUntil).getTime() > now);
const pb = b.isPinned && (!b.pinUntil || new Date(b.pinUntil).getTime() > now);
return pa === pb ? 0 : pa ? -1 : 1;
};
const byDate = (a: Job, b: Job) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
return [...jobs].sort((a, b) => byPinned(a, b) || byDate(a, b));
}, [jobs]);


// « en ligne aujourd’hui » : offres actives (isActive) dont pinUntil (si présent) et closingAt (si présent) ne sont pas expirées
const onlineToday = useMemo(() => {
const today = new Date();
return jobs.filter(j => (j.isActive ?? true) && (!j.closingAt || new Date(j.closingAt) >= today));
}, [jobs]);


return (
<div className="mx-auto max-w-6xl px-4 py-10">
<div className="mb-4 flex items-baseline justify-between">
<h1 className="text-2xl font-extrabold tracking-tight">Offres d’emploi</h1>
<p className="text-sm text-neutral-600">{onlineToday.length} offres en ligne aujourd’hui</p>
</div>
<p className="text-neutral-600 mb-6">Trouvez des opportunités partout en Afrique, filtrées par pays, type de contrat, date de publication, expérience, entreprise et métier.</p>


<JobFilters value={filters} onChange={(n) => setFilters({ ...filters, ...n })} className="mb-6" />


{loading ? (
<p className="text-neutral-600">Chargement…</p>
) : (
<div className="grid gap-4 md:grid-cols-2">
{sorted.map((job) => (<JobCard key={job.id} job={job} />))}
{!sorted.length && (
<div className="col-span-full rounded border p-6 text-center text-neutral-600">Aucune offre ne correspond à vos critères.</div>
)}
</div>
)}
</div>
);
}
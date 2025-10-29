"use client";
countries?: string[];
types?: string[];
roles?: string[];
companies?: { name: string; slug: string }[];
};
className?: string;
};


const EXPERIENCE = ["", "0", "1", "2", "3", "4", "5", "7", "10+"];
const DATE_POSTED = [
{ v: "", label: "Toutes dates" },
{ v: "24h", label: "Dernières 24h" },
{ v: "7j", label: "Moins de 7 jours" },
{ v: "30j", label: "Moins de 30 jours" },
];


export default function JobFilters({ value, onChange, options, className }: JobFiltersProps) {
const countries = useMemo(() => (options?.countries ?? []).sort(), [options?.countries]);
const types = useMemo(() => (options?.types ?? []).sort(), [options?.types]);
const roles = useMemo(() => (options?.roles ?? DEFAULT_ROLES).sort(), [options?.roles]);
const companies = options?.companies ?? [];


return (
<div className={"grid gap-3 md:grid-cols-4 lg:grid-cols-6 " + (className ?? "")}>
<input
className="border rounded px-3 py-2 md:col-span-2"
placeholder="Rechercher (poste, société, ville…)"
value={value.q}
onChange={(e) => onChange({ q: e.target.value })}
/>
<select className="border rounded px-3 py-2" value={value.type} onChange={(e) => onChange({ type: e.target.value })}>
<option value="">Type</option>
{types.map((t) => (<option key={t} value={t}>{t}</option>))}
</select>
<select className="border rounded px-3 py-2" value={value.country} onChange={(e) => onChange({ country: e.target.value })}>
<option value="">Pays</option>
{countries.map((c) => (<option key={c} value={c}>{c}</option>))}
</select>
<select className="border rounded px-3 py-2" value={value.role} onChange={(e) => onChange({ role: e.target.value })}>
<option value="">Métier / Profession</option>
{roles.map((r) => (<option key={r} value={r}>{r}</option>))}
</select>
<select className="border rounded px-3 py-2" value={value.company} onChange={(e) => onChange({ company: e.target.value })}>
<option value="">Entreprise</option>
{companies.map((co) => (<option key={co.slug} value={co.slug}>{co.name}</option>))}
</select>
<select className="border rounded px-3 py-2" value={value.experienceMin} onChange={(e) => onChange({ experienceMin: e.target.value })}>
<option value="">Expérience min</option>
{EXPERIENCE.map((y) => (<option key={y} value={y}>{y ? `${y} an${y === "1" ? "" : "s"}+` : "Toutes"}</option>))}
</select>
<select className="border rounded px-3 py-2" value={value.datePosted} onChange={(e) => onChange({ datePosted: e.target.value })}>
{DATE_POSTED.map((d) => (<option key={d.v} value={d.v}>{d.label}</option>))}
</select>
</div>
);
}


const DEFAULT_ROLES = [
"Pharmacien(ne)",
"Médecin généraliste",
"Médecin spécialiste",
"Infirmier(ère)",
"Sage-femme",
"Technicien(ne) de laboratoire",
"Préparateur(trice) en pharmacie",
"Épidémiologiste",
"Hygiéniste",
"Psychologue",
"Nutritionniste / Diététicien(ne)",
"Data Analyst Santé",
"Gestionnaire de projet santé",
"Conseiller(ère) en santé communautaire",
"Autre",
];
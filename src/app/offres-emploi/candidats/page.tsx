// src/app/offres-emploi/candidats/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchRecruiterCandidates,
  FRANCOPHONE_COUNTRIES,
} from "@/lib/jobs";

type Candidate = {
  id: number | string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  profession?: string | null;
  experience_years?: number | null;
  desired_type?: string | null;
  availability?: string | null;
  skills?: string | null;
  cv_url?: string | null;
  created_at?: string | null;
};

const TYPES = ["CDI", "CDD", "Stage", "Intérim", "Freelance", "Consultant"];
const AVAILABILITIES = ["Immédiate", "1 mois", "2 mois", "3 mois", "> 3 mois"];
const DEFAULT_PROFESSIONS = [
  "Médecin généraliste",
  "Infirmier(ère) diplômé(e) d’État",
  "Sage-femme",
  "Pharmacien(ne)",
  "Préparateur(trice) en pharmacie",
  "Chirurgien(ne)",
  "Anesthésiste-réanimateur(trice)",
  "Pédiatre",
  "Gynécologue-obstétricien(ne)",
  "Cardiologue",
  "Dermatologue",
  "Neurologue",
  "Psychiatre",
  "Psychologue clinicien(ne)",
  "Kinésithérapeute / Rééducateur(trice)",
  "Ergothérapeute",
  "Odontologiste / Chirurgien-dentiste",
  "Technicien(ne) de laboratoire",
  "Biologiste médical(e)",
  "Technicien(ne) d’imagerie / Radiologie",
  "Ophtalmologue",
  "ORL",
  "Nutritionniste / Diététicien(ne)",
  "Épidémiologiste",
  "Spécialiste Santé publique",
  "Data Analyst Santé / Biostatisticien(ne)",
  "Responsable Qualité / Hygiéniste",
  "Responsable vaccination / EPI",
  "Coordinateur(trice) de projet santé",
  "Responsable logistique santé",
  "Animateur(trice) santé communautaire",
  "Vétérinaire (One Health)",
  "Assistant(e) social(e) en santé",
];

/* ---------- utilitaires ---------- */
function renderOption(item: unknown, idx: number) {
  if (typeof item === "string") {
    const v = item.trim();
    return (
      <option key={(v || idx).toString()} value={v}>
        {v}
      </option>
    );
  }
  const o = item as any;
  const value: string = String(o?.code ?? o?.value ?? o?.id ?? o?.name ?? "");
  const label: string = String(o?.name ?? o?.label ?? value);
  return (
    <option key={(value || `opt-${idx}`).toString()} value={value}>
      {label}
    </option>
  );
}

function filenameFromUrl(u?: string | null): string {
  if (!u) return "cv.pdf";
  try {
    return decodeURIComponent((u.split("?")[0].split("/").pop() || "cv.pdf"));
  } catch {
    return "cv.pdf";
  }
}

/** Remplace useSearchParams sans nécessiter de <Suspense> */
function useClientSearchParams() {
  const [sp, setSp] = useState<URLSearchParams>(new URLSearchParams());
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSp(new URLSearchParams(window.location.search));
    }
  }, []);
  return sp;
}

/* ---------- page ---------- */
export default function CandidatesListPage() {
  const sp = useClientSearchParams();
  const r = useRouter();

  const [items, setItems] = useState<Candidate[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);

  const q = sp.get("q") ?? "";
  const country = sp.get("country") ?? "";
  const profession = sp.get("profession") ?? "";
  const type = sp.get("type") ?? "";
  const availability = sp.get("availability") ?? "";
  const experienceMin = sp.get("experience_min") ?? "";

  const professionsList = useMemo(() => {
    const set = new Set<string>();
    items.forEach((c) => {
      const v = (c.profession || "").trim();
      if (v) set.add(v);
    });
    const inferred = Array.from(set).sort((a, b) =>
      a.localeCompare(b, "fr", { sensitivity: "base" })
    );
    return inferred.length ? inferred : DEFAULT_PROFESSIONS;
  }, [items]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      setSubscriptionRequired(false);
      try {
        const res = await fetchRecruiterCandidates({
          q,
          country,
          profession,
          type,
          availability,
          experience_min: experienceMin || undefined,
          page: 1,
          per_page: 50,
        });

        if ((res as any)?.meta?.subscription_required) {
          setSubscriptionRequired(true);
          setItems([]);
          setTotal(0);
          return;
        }

        const arr = Array.isArray((res as any)?.items) ? (res as any).items : [];
        setItems(arr as Candidate[]);
        setTotal(Number((res as any)?.total ?? arr.length ?? 0));
      } catch {
        setErr("Impossible de charger la liste des candidats.");
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [q, country, profession, type, availability, experienceMin]);

  function submitFilters(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const qs = new URLSearchParams();
    for (const [k, v] of fd as any) {
      const val = (String(v) || "").trim();
      if (val) qs.set(k, val);
    }
    r.push(`/offres-emploi/candidats?${qs.toString()}`);
  }

  function exportCsv() {
    if (!items.length) return;
    const rows = [
      [
        "Nom",
        "Email",
        "Téléphone",
        "Pays",
        "Ville",
        "Profession",
        "Expérience (ans)",
        "Type souhaité",
        "Disponibilité",
      ],
      ...items.map((c) => [
        `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim(),
        c.email ?? "",
        c.phone ?? "",
        c.country ?? "",
        c.city ?? "",
        c.profession ?? "",
        (c.experience_years ?? "").toString(),
        c.desired_type ?? "",
        c.availability ?? "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "candidats_sante_afrique.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Candidats disponibles</h1>
        <div className="flex gap-2">
          <Link
            href="/offres-emploi/poster"
            className="inline-flex rounded border px-3 py-1.5 text-sm font-semibold hover:bg-neutral-50"
          >
            Poster une offre
          </Link>
          <button
            onClick={exportCsv}
            className="inline-flex rounded bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
            disabled={!items.length}
          >
            Exporter CSV
          </button>
        </div>
      </div>

      <p className="text-neutral-600 mt-1">
        Accès réservé aux recruteurs abonnés. Filtrez par pays, profession et
        type recherché.
      </p>

      <form
        onSubmit={submitFilters}
        className="mt-6 grid grid-cols-1 md:grid-cols-6 gap-3 items-end"
      >
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold mb-1">Recherche</label>
          <input
            name="q"
            defaultValue={q}
            placeholder="Nom, email, mots clés…"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Pays</label>
          <select name="country" defaultValue={country} className="border rounded px-3 py-2">
            <option value="">Pays</option>
            {(Array.isArray(FRANCOPHONE_COUNTRIES) ? FRANCOPHONE_COUNTRIES : []).map((c, i) =>
              renderOption(c, i)
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Profession</label>
          <select name="profession" defaultValue={profession} className="border rounded px-3 py-2">
            <option value="">Profession</option>
            {DEFAULT_PROFESSIONS.map((p, i) => renderOption(p, i))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Exp. min (ans)</label>
          <input
            name="experience_min"
            defaultValue={experienceMin}
            type="number"
            min={0}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Type souhaité</label>
          <select name="type" defaultValue={type} className="border rounded px-3 py-2">
            <option value="">Type</option>
            {TYPES.map((t, i) => renderOption(t, i))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Disponibilité</label>
          <select name="availability" defaultValue={availability} className="border rounded px-3 py-2">
            <option value="">Disponibilité</option>
            {AVAILABILITIES.map((a, i) => renderOption(a, i))}
          </select>
        </div>

        <div className="md:col-span-6">
          <button className="rounded bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700">
            Filtrer
          </button>
        </div>
      </form>

      {loading && (
        <section className="rounded border bg-white p-6 mt-6">Chargement…</section>
      )}

      {!loading && (err || subscriptionRequired) && (
        <section className="rounded border bg-white p-6 mt-6">
          <p className="text-sm text-red-600">
            {subscriptionRequired
              ? "Accès réservé. Connectez-vous avec un abonnement recruteur actif pour consulter la base de CV."
              : err}
          </p>
          <div className="mt-4">
            <Link
              href="/abonnement"
              className="inline-flex rounded bg-neutral-900 px-4 py-2 text-white hover:opacity-90"
            >
              Activer mon abonnement pour recruter
            </Link>
          </div>
        </section>
      )}

      {!loading && !err && !subscriptionRequired && (
        <section className="rounded border bg-white mt-6 overflow-x-auto">
          <div className="flex items-center justify-between p-4">
            <p className="text-sm text-neutral-600">
              {total} candidat{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}
            </p>
          </div>

          <table className="min-w-full text-sm">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-4 py-2 text-left">Candidat</th>
                <th className="px-4 py-2 text-left">Contact</th>
                <th className="px-4 py-2 text-left">Localisation</th>
                <th className="px-4 py-2 text-left">Profil</th>
                <th className="px-4 py-2 text-left">CV</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => {
                const fullName = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
                const fileLabel = filenameFromUrl(c.cv_url);
                return (
                  <tr key={String(c.id)} className="border-t">
                    <td className="px-4 py-2">
                      <div className="font-semibold">{fullName || "—"}</div>
                      <div className="text-xs text-neutral-500">
                        Ajouté le{" "}
                        {c.created_at
                          ? new Date(c.created_at).toLocaleDateString("fr-FR")
                          : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div>{c.email}</div>
                      <div className="text-xs text-neutral-500">{c.phone || "—"}</div>
                    </td>
                    <td className="px-4 py-2">
                      {[c.city, c.country].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-2">
                      <div>{c.profession || "—"}</div>
                      <div className="text-xs text-neutral-500">
                        Exp. {c.experience_years ?? 0} an(s) • {c.desired_type || "Type ?"} •{" "}
                        {c.availability || "Dispo ?"}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {c.cv_url ? (
                        <a
                          href={c.cv_url}
                          target="_blank"
                          className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-1.5 text-white font-semibold hover:bg-blue-700"
                        >
                          <span aria-hidden>📄</span>
                          <span className="truncate max-w-[180px]">{fileLabel}</span>
                        </a>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!items.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-neutral-600">
                    Aucun résultat avec ces filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

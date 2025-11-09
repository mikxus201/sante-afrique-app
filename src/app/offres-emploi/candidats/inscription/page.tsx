// src/app/offres-emploi/candidats/inscription/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_PREFIX } from "@/lib/api";
import { FRANCOPHONE_COUNTRIES } from "@/lib/jobs";

const HEALTH_PROFESSIONS_BASE = [
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

const AVAILABILITIES = ["Immédiate", "1 mois", "2 mois", "3 mois", "Plus de 3 mois"];
const CONTRACT_TYPES = ["CDI", "CDD", "Stage", "Intérim", "Freelance / Consultant", "Volontariat"];

type Msg = { type: "ok" | "err"; text: string } | null;

export default function CandidateSignupPage() {
  // Liste de professions se terminant par "Autre"
  const PROF_OPTIONS = useMemo(() => [...HEALTH_PROFESSIONS_BASE, "Autre"], []);

  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);
  const [cv, setCv] = useState<File | null>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    profession: "", // valeur du <select>
    experience_years: "",
    skills: "",
    desired_type: "",
    availability: "Immédiate",
  });

  // Champ pour la profession libre si "Autre" est choisi
  const [otherProfession, setOtherProfession] = useState("");

  const update =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  /* ---------- Pré-remplissage via ?profession=... (client-only, pas de Suspense requis) ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const raw = (params.get("profession") || "").trim();
    if (!raw) return;

    const i = PROF_OPTIONS.findIndex((p) => p.toLowerCase() === raw.toLowerCase());
    if (i >= 0) {
      setForm((f) => ({ ...f, profession: PROF_OPTIONS[i] }));
      setOtherProfession("");
    } else {
      setForm((f) => ({ ...f, profession: "Autre" }));
      setOtherProfession(raw); // on propose la valeur reçue
    }
  }, [PROF_OPTIONS]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    // validations minimales
    const required: (keyof typeof form)[] = ["first_name", "last_name", "email", "country"];
    for (const k of required) {
      if (!String(form[k]).trim()) {
        setMsg({ type: "err", text: "Veuillez renseigner tous les champs marqués d’un astérisque (*)" });
        return;
      }
    }
    // profession: si "Autre", un texte est requis
    if (form.profession === "Autre" && !otherProfession.trim()) {
      setMsg({ type: "err", text: "Veuillez préciser votre profession." });
      return;
    }
    if (form.profession !== "Autre" && !form.profession.trim()) {
      setMsg({ type: "err", text: "Veuillez sélectionner une profession." });
      return;
    }

    // CV (optionnel, mais si fourni, on vérifie)
    if (cv) {
      const okType = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(cv.type);
      if (!okType) {
        setMsg({ type: "err", text: "Le CV doit être au format PDF, DOC ou DOCX." });
        return;
      }
      if (cv.size > 8 * 1024 * 1024) {
        setMsg({ type: "err", text: "Le CV ne doit pas dépasser 8 Mo." });
        return;
      }
    }

    const fd = new FormData();

    // profession envoyée = valeur libre si "Autre"
    const professionToSend = form.profession === "Autre" ? otherProfession.trim() : form.profession;

    Object.entries({ ...form, profession: professionToSend }).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, String(v));
    });
    if (cv) fd.append("cv", cv);

    setLoading(true);
    try {
      const res = await fetch(`${API_PREFIX}/candidates`, {
        method: "POST",
        body: fd,
        credentials: "omit",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Erreur serveur");
      }
      setMsg({
        type: "ok",
        text: "Profil enregistré avec succès. Les recruteurs abonnés pourront consulter votre fiche.",
      });
      setCv(null);
      // Option : reset partiel du formulaire
      // setForm((f) => ({ ...f, skills: "", desired_type: "", availability: "Immédiate" }));
    } catch (_err) {
      setMsg({ type: "err", text: "Échec de l’enregistrement. Vérifiez le formulaire puis réessayez." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold">Déposer mon CV</h1>
      <p className="mt-2 text-neutral-700">
        Créez votre compte candidat, complétez votre profil et téléversez votre CV. Les recruteurs abonnés à
        <span className="font-semibold"> Santé Afrique Jobboard</span> pourront consulter votre fiche et vous contacter.
      </p>

      {msg && (
        <div
          className={
            "mt-4 rounded border p-3 " +
            (msg.type === "ok"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-red-300 bg-red-50 text-red-800")
          }
        >
          {msg.text}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm mb-1">
              Prénom <span className="text-red-600">*</span>
            </label>
            <input
              required
              className="w-full border rounded px-3 py-2"
              value={form.first_name}
              onChange={update("first_name")}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              Nom <span className="text-red-600">*</span>
            </label>
            <input
              required
              className="w-full border rounded px-3 py-2"
              value={form.last_name}
              onChange={update("last_name")}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              E-mail <span className="text-red-600">*</span>
            </label>
            <input
              required
              type="email"
              className="w-full border rounded px-3 py-2"
              value={form.email}
              onChange={update("email")}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Téléphone (WhatsApp)</label>
            <input className="w-full border rounded px-3 py-2" value={form.phone} onChange={update("phone")} />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Pays <span className="text-red-600">*</span>
            </label>
            <select
              required
              className="w-full border rounded px-3 py-2"
              value={form.country}
              onChange={update("country")}
            >
              <option value="">—</option>
              {(FRANCOPHONE_COUNTRIES as any[]).map((item: any, idx: number) => {
                const label =
                  typeof item === "string" ? item : item?.name ?? item?.label ?? item?.value ?? String(item);
                return (
                  <option key={`${label}-${idx}`} value={label}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Ville</label>
            <input className="w-full border rounded px-3 py-2" value={form.city} onChange={update("city")} />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Profession <span className="text-red-600">*</span>
            </label>
            <select
              required
              className="w-full border rounded px-3 py-2"
              value={form.profession}
              onChange={update("profession")}
            >
              <option value="">Sélectionnez votre profession</option>
              {PROF_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Champ libre si "Autre" */}
          {form.profession === "Autre" && (
            <div>
              <label className="block text-sm mb-1">
                Précisez votre profession <span className="text-red-600">*</span>
              </label>
              <input
                required
                className="w-full border rounded px-3 py-2"
                value={otherProfession}
                onChange={(e) => setOtherProfession(e.target.value)}
                placeholder="Ex. : Agent de santé communautaire, Orthophoniste…"
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">Expérience (années)</label>
            <input
              type="number"
              min={0}
              className="w-full border rounded px-3 py-2"
              value={form.experience_years}
              onChange={update("experience_years")}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Compétences clés (mots-clés)</label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="ex: dispensation, validation d’ordonnances, Excel…"
              value={form.skills}
              onChange={update("skills")}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Type de contrat souhaité</label>
            <select className="w-full border rounded px-3 py-2" value={form.desired_type} onChange={update("desired_type")}>
              <option value="">—</option>
              {CONTRACT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Disponibilité</label>
            <select className="w-full border rounded px-3 py-2" value={form.availability} onChange={update("availability")}>
              {AVAILABILITIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">CV (PDF, DOC, DOCX)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="w-full border rounded px-3 py-2"
              onChange={(e) => setCv(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            disabled={loading}
            className="inline-flex items-center rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Enregistrement..." : "Enregistrer mon profil"}
          </button>
          <Link href="/offres-emploi" className="text-blue-700 hover:underline">
            Retour aux offres
          </Link>
        </div>
      </form>
    </div>
  );
}

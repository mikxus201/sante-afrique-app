/* eslint-disable no-alert */
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { API_PREFIX } from "@/lib/api";
import { useAuth } from "@/lib/auth-client";

/* =========================
   Données UI
   ========================= */
const PROFESSIONS = [
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
  "Autre",
];

const FRANCOPHONE_COUNTRIES = [
  "Algérie","Bénin","Burkina Faso","Burundi","Cameroun","Centrafrique",
  "Comores","Congo (Brazzaville)","Congo (RDC)","Côte d’Ivoire","Djibouti",
  "Égypte (francophone)","Gabon","Guinée","Madagascar","Mali","Maroc",
  "Mauritanie","Maurice","Niger","Rwanda","Sénégal","Seychelles","Tchad",
  "Togo","Tunisie","Guinée équatoriale"
];

/* =========================
   Helpers API
   ========================= */
// API_PREFIX ~ "http://localhost:8000/api"
const API_BASE = API_PREFIX.replace(/\/+$/, "");
const ROOT_BASE = API_BASE.replace(/\/api\/?$/, "");

/** Cookie reader (pour XSRF-TOKEN) */
function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : "";
}

/** Déclenche la pose des cookies XSRF-TOKEN + laravel_session */
async function ensureCsrf(): Promise<void> {
  await fetch(`${ROOT_BASE}/sanctum/csrf-cookie`, { credentials: "include" });
}

/** POST offre : on envoie TOUJOURS le header X-XSRF-TOKEN, puis
 *  1) tente /api/jobs-web (session web)
 *  2) si 404 → fallback /api/jobs (Sanctum)
 */
async function postJob<T = any>(fd: FormData): Promise<T> {
  // Toujours préparer le CSRF et le header
  await ensureCsrf();
  const xsrf = getCookie("XSRF-TOKEN");
  const headers: HeadersInit = {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}),
  };
  const common: RequestInit = { credentials: "include", cache: "no-store" };

  // 1) alias web (peut être CSRFé suivant ta pile → on est paré)
  let res = await fetch(`${API_BASE}/jobs-web`, {
    method: "POST",
    body: fd,
    headers,
    ...common,
  });

  // 2) si l’alias n’existe pas en prod
  if (!res.ok && res.status === 404) {
    res = await fetch(`${API_BASE}/jobs`, {
      method: "POST",
      body: fd,
      headers,
      ...common,
    });
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || json?.error || `HTTP ${res.status}`);
  return json as T;
}

/* =========================
   Page
   ========================= */
export default function PostJobPage() {
  const { user } = useAuth();
  const r = useRouter();

  // Entreprise
  const [companyName, setCompanyName] = React.useState("");
  const [hqAddress, setHqAddress] = React.useState("");
  const [logo, setLogo] = React.useState<File | null>(null);

  // Offre
  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState("CDI");
  const [professionOption, setProfessionOption] = React.useState("");
  const [professionOther, setProfessionOther] = React.useState("");
  const profession = React.useMemo(
    () => (professionOption === "Autre" ? professionOther : professionOption),
    [professionOption, professionOther]
  );

  const [location, setLocation] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [experienceMin, setExperienceMin] = React.useState<number | "">("");
  const [description, setDescription] = React.useState("");
  const [requirements, setRequirements] = React.useState("");

  const [loading, setLoading] = React.useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-xl font-bold">Poster une offre</h1>
        <p className="mt-2">Vous devez être connecté(e) et abonné(e) pour publier une offre.</p>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    if (!title.trim()) return alert("Titre requis");
    if (!companyName.trim()) return alert("Nom / Raison sociale requis");
    if (professionOption === "Autre" && !professionOther.trim()) {
      return alert("Veuillez préciser la profession");
    }

    setLoading(true);
    try {
      const fd = new FormData();

      // ====== Entreprise (noms EXACTS attendus par le back) ======
      fd.append("company_name", companyName);
      fd.append("company_address", hqAddress || "");
      if (logo) fd.append("logo", logo);

      // ====== Offre ======
      fd.append("title", title);
      fd.append("type", type);
      fd.append("profession", profession || "");
      fd.append("location", location || "");
      fd.append("country", country);
      fd.append("experience_min", String(experienceMin || 0));
      fd.append("description", description);
      fd.append("requirements", requirements || "");

      await postJob(fd);

      alert("Offre soumise. Elle sera publiée après validation.");
      r.push("/offres-emploi");
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Échec. Vérifiez les champs et réessayez.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-xl font-bold">Poster une offre d’emploi</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        {/* ========= Entreprise ========= */}
        <fieldset className="space-y-3">
          <legend className="font-semibold">Entreprise</legend>

          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Nom / Raison sociale*"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Adresse du siège social"
            value={hqAddress}
            onChange={(e) => setHqAddress(e.target.value)}
          />

          <div>
            <label
              htmlFor="logo-input"
              className="inline-block cursor-pointer rounded bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
            >
              Choisir un logo (PNG/JPG)
            </label>
            <input
              id="logo-input"
              type="file"
              accept=".png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
            />
            <div className="mt-1 text-sm text-neutral-600">
              {logo ? (
                <>Fichier sélectionné : <span className="font-medium">{logo.name}</span></>
              ) : (
                "Aucun fichier choisi"
              )}
            </div>
          </div>
        </fieldset>

        {/* ========= Offre ========= */}
        <fieldset className="space-y-3">
          <legend className="font-semibold">Offre</legend>

          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Titre du poste*"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <select
              className="border rounded px-3 py-2"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option>CDI</option>
              <option>CDD</option>
              <option>Stage</option>
              <option>Consultant</option>
            </select>

            <div>
              <select
                className="w-full border rounded px-3 py-2"
                value={professionOption}
                onChange={(e) => setProfessionOption(e.target.value)}
              >
                <option value="">Profession</option>
                {PROFESSIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {professionOption === "Autre" && (
                <input
                  className="mt-2 w-full border rounded px-3 py-2"
                  placeholder="Précisez la profession"
                  value={professionOther}
                  onChange={(e) => setProfessionOther(e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              className="border rounded px-3 py-2"
              placeholder="Ville, Pays"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <select
              className="border rounded px-3 py-2"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">Pays (Afrique francophone)</option>
              {FRANCOPHONE_COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              type="number"
              min={0}
              className="border rounded px-3 py-2"
              placeholder="Expérience min (Nombre d’année d’expérience dans le domaine)"
              value={String(experienceMin)}
              onChange={(e) => setExperienceMin(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>

          <textarea
            className="h-40 w-full border rounded px-3 py-2"
            placeholder="Description détaillée*"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <textarea
            className="h-40 w-full border rounded px-3 py-2"
            placeholder="Profil recherché / exigences"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />
        </fieldset>

        <button
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Envoi…" : "Soumettre l’offre"}
        </button>
      </form>
    </div>
  );
}

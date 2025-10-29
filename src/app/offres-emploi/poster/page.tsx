"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_PREFIX } from "@/lib/api";
import { useAuth } from "@/lib/auth-client";

/* =========================
   Helpers CSRF + POST form
   ========================= */

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}

async function ensureCsrf() {
  // Déclenche le cookie XSRF-TOKEN de Laravel/Sanctum
  await fetch("/sanctum/csrf-cookie", { credentials: "include" });
}

async function postForm<T>(url: string, fd: FormData): Promise<T> {
  await ensureCsrf();
  const xsrf = getCookie("XSRF-TOKEN"); // header pour VerifyCsrfToken

  const res = await fetch(url, {
    method: "POST",
    body: fd,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}),
    },
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // réponse vide -> on laisse json = null
  }

  if (!res.ok) {
    throw new Error(json?.message || json?.error || `HTTP ${res.status}`);
  }
  return json as T;
}

/* =========================
   Données UI
   ========================= */

const PROFESSIONS = [
  "Pharmacien(ne)",
  "Préparateur(trice) en pharmacie",
  "Infirmier(ère)",
  "Médecin",
  "Sage-femme",
  "Biologiste",
  "Responsable Qualité",
  "Épidémiologiste",
  "Psychologue",
  "Data Analyst",
  "Technicien(ne) de labo",
  "Responsable Supply/Logistique",
  "Autre",
];

// Pays francophones d'Afrique (libellés FR)
const FRANCOPHONE_COUNTRIES = [
  "Algérie","Bénin","Burkina Faso","Burundi","Cameroun","Centrafrique",
  "Comores","Congo (Brazzaville)","Congo (RDC)","Côte d’Ivoire","Djibouti",
  "Égypte (francophone)","Gabon","Guinée","Madagascar","Mali","Maroc",
  "Mauritanie","Maurice","Niger","Rwanda","Sénégal","Seychelles","Tchad",
  "Togo","Tunisie","Guinée équatoriale"
];

export default function PostJobPage() {
  const { user } = useAuth();
  const r = useRouter();

  // Entreprise
  const [companyName, setCompanyName] = useState("");
  const [hqAddress, setHqAddress] = useState("");
  const [logo, setLogo] = useState<File | null>(null);

  // Offre
  const [title, setTitle] = useState("");
  const [type, setType] = useState("CDI");
  const [professionOption, setProfessionOption] = useState("");
  const [professionOther, setProfessionOther] = useState("");
  const profession = useMemo(
    () => (professionOption === "Autre" ? professionOther : professionOption),
    [professionOption, professionOther]
  );

  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [experienceMin, setExperienceMin] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");

  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-xl font-bold">Poster une offre</h1>
        <p className="mt-2">Vous devez être connecté(e) et abonné(e) pour publier une offre.</p>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Titre requis");
    if (!companyName.trim()) return alert("Nom / Raison sociale requis");
    if (professionOption === "Autre" && !professionOther.trim())
      return alert("Veuillez préciser la profession");

    setLoading(true);
    try {
      const fd = new FormData();
      // Entreprise
      fd.append("company_name", companyName);
      fd.append("hq_address", hqAddress);
      if (logo) fd.append("logo", logo);
      // Offre
      fd.append("title", title);
      fd.append("type", type);
      fd.append("profession", profession || "");
      fd.append("location", location);
      fd.append("country", country);
      fd.append("experience_min", String(experienceMin || 0));
      fd.append("description", description);
      fd.append("requirements", requirements);

      // ✅ Appel robuste (CSRF + cookies + headers)
      await postForm(`${API_PREFIX}/jobs`, fd);

      alert("Offre soumise. Elle sera publiée après validation.");
      r.push("/offres-emploi");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Échec. Vérifiez les champs et réessayez.");
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
            onChange={(e)=>setCompanyName(e.target.value)}
            required
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Adresse du siège social"
            value={hqAddress}
            onChange={(e)=>setHqAddress(e.target.value)}
          />

          {/* Upload Logo — bouton bleu + nom du fichier */}
          <div>
            <label htmlFor="logo-input" className="inline-block cursor-pointer rounded bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700">
              Choisir un logo (PNG/JPG)
            </label>
            <input
              id="logo-input"
              type="file"
              accept=".png,.jpg,.jpeg"
              className="hidden"
              onChange={(e)=>setLogo(e.target.files?.[0] ?? null)}
            />
            <div className="mt-1 text-sm text-neutral-600">
              {logo ? <>Fichier sélectionné : <span className="font-medium">{logo.name}</span></> : "Aucun fichier choisi"}
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
            onChange={(e)=>setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              className="border rounded px-3 py-2"
              value={type}
              onChange={(e)=>setType(e.target.value)}
            >
              <option>CDI</option>
              <option>CDD</option>
              <option>Stage</option>
              <option>Consultant</option>
            </select>

            {/* Profession avec 'Autre' */}
            <div>
              <select
                className="w-full border rounded px-3 py-2"
                value={professionOption}
                onChange={(e)=>setProfessionOption(e.target.value)}
              >
                <option value="">Profession</option>
                {PROFESSIONS.map((p)=>(
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {professionOption === "Autre" && (
                <input
                  className="mt-2 w-full border rounded px-3 py-2"
                  placeholder="Précisez la profession"
                  value={professionOther}
                  onChange={(e)=>setProfessionOther(e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="border rounded px-3 py-2"
              placeholder="Ville, Pays"
              value={location}
              onChange={(e)=>setLocation(e.target.value)}
            />

            {/* Pays francophones d'Afrique */}
            <select
              className="border rounded px-3 py-2"
              value={country}
              onChange={(e)=>setCountry(e.target.value)}
            >
              <option value="">Pays (Afrique francophone)</option>
              {FRANCOPHONE_COUNTRIES.map((c)=>(
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="number"
              min={0}
              className="border rounded px-3 py-2"
              placeholder="Expérience min (Nombre d’année d’expérience dans le domaine)"
              value={String(experienceMin)}
              onChange={(e)=>setExperienceMin(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>

          <textarea
            className="w-full border rounded px-3 py-2 h-40"
            placeholder="Description détaillée*"
            value={description}
            onChange={(e)=>setDescription(e.target.value)}
            required
          />
          <textarea
            className="w-full border rounded px-3 py-2 h-40"
            placeholder="Profil recherché / exigences"
            value={requirements}
            onChange={(e)=>setRequirements(e.target.value)}
          />
        </fieldset>

        <button disabled={loading} className="rounded bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700">
          {loading ? "Envoi…" : "Soumettre l’offre"}
        </button>
      </form>
    </div>
  );
}

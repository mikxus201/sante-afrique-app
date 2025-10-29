// src/app/compte/cvtheque/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getJSON, API_PREFIX } from "@/lib/api";
import Link from "next/link";
type Cand = {
  id: number | string;
  first_name?: string; last_name?: string;
  email?: string; phone?: string;
  country?: string; city?: string;
  profession?: string;
  experience_years?: number;
  availability?: string;
  skills?: string;
  cv_url?: string | null;
};

export default function CvThequePage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [items, setItems] = useState<Cand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      // 1) Vérifie l’ability
      const abil = await getJSON<{ view_candidates?: boolean }>(`${API_PREFIX}/me/abilities`);
      if (!abil?.view_candidates) {
        setAllowed(false);
        setLoading(false);
        return;
      }
      setAllowed(true);

      // 2) Charge la liste (params possibles plus tard)
      const data = await getJSON<{
        items: Cand[];
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
      }>(`${API_PREFIX}/subscriber/candidates`);

      setItems(data?.items ?? []);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        setAllowed(false);                 // accès réservé
      } else if (status === 404) {
        setError("La CVthèque n'est pas disponible (404). Vérifiez la route API.");
      } else {
        setError("Une erreur est survenue lors du chargement des candidats.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <div className="rounded border bg-white p-6">Chargement…</div>;
  }

  if (allowed === false) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
  <p className="font-semibold">CVthèque — Accès réservé</p>
  <p className="text-sm mt-1">
    Votre compte ne possède pas d’abonnement recruteur actif ou l’autorisation requise.
  </p>
  <div className="mt-3">
    <Link
      href="/abonnement"              // ✅ on envoie vers la page d’offres d’abonnement, pas les offres d’emploi
      className="inline-flex items-center rounded border px-3 py-2 text-sm bg-white"
    >
      Voir les offres
      </Link>
      </div>
      </div>
    );
  }

  if (error) {
    return <div className="rounded border bg-white p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">CVthèque — Candidats</h1>

      <div className="space-y-3">
        {items.length ? (
          items.map((c) => (
            <div key={c.id} className="rounded border bg-white p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {`${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || "Candidat"}{" "}
                    <span className="text-neutral-600">— {c.profession ?? "—"}</span>
                  </div>
                  <div className="text-sm text-neutral-600">
                    {c.city ?? "—"}
                    {(c.city && c.country) ? ", " : ""}{c.country ?? ""}
                    {typeof c.experience_years === "number"
                      ? ` · ${c.experience_years} an(s) d’exp.`
                      : ""}
                  </div>
                  {c.skills && (
                    <div className="text-sm text-neutral-600 mt-1 truncate">
                      Compétences&nbsp;: {c.skills}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {c.cv_url && (
                    <a
                      href={c.cv_url}
                      className="px-3 py-1 rounded border"
                      target="_blank"
                    >
                      Télécharger CV
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded border bg-white p-6 text-center text-neutral-600">
            Aucun candidat trouvé…
          </div>
        )}
      </div>
    </div>
  );
}

// src/app/offres-emploi/[id]/postuler/page.tsx
"use client";

import { useState } from "react";
import { API_PREFIX } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";

/* ===== CSRF helpers (Sanctum) ===== */
function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}
async function ensureCsrf() {
  await fetch("/sanctum/csrf-cookie", { credentials: "include" });
}
async function postForm(url: string, fd: FormData) {
  await ensureCsrf();
  const xsrf = getCookie("XSRF-TOKEN") || "";
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
  if (!res.ok) {
    let msg = "apply failed";
    try {
      const j = await res.json();
      msg = j?.message || j?.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json().catch(() => ({}));
}

export default function ApplyPage() {
  // ✅ Option A : récupérer l’id via le hook, pas via props (évite le warning “params is a Promise”)
  const { id } = useParams<{ id: string }>();
  const jobId = String(id || "");

  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cover, setCover] = useState("");
  const [cv, setCv]       = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const r = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) return alert("Offre introuvable.");
    if (!cv)    return alert("Veuillez joindre votre CV (PDF/DOC/DOCX).");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("job_id", jobId);
      fd.append("name", name);
      fd.append("email", email);
      fd.append("phone", phone);
      fd.append("cover_letter", cover);
      fd.append("cv", cv);

      await postForm(`${API_PREFIX}/jobs/${encodeURIComponent(jobId)}/apply`, fd);

      alert("Votre candidature a bien été envoyée !");
      r.push(`/offres-emploi/${encodeURIComponent(jobId)}`);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Échec de l’envoi. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-bold">Postuler à l’offre #{jobId}</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Nom complet*"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          required
        />
        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          placeholder="Email*"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Téléphone"
          value={phone}
          onChange={(e)=>setPhone(e.target.value)}
        />
        <textarea
          className="w-full border rounded px-3 py-2 h-40"
          placeholder="Message / lettre de motivation"
          value={cover}
          onChange={(e)=>setCover(e.target.value)}
        />
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e)=>setCv(e.target.files?.[0] ?? null)}
        />

        <button
          disabled={loading}
          className="rounded bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700"
        >
          {loading ? "Envoi…" : "Envoyer la candidature"}
        </button>
      </form>
    </div>
  );
}

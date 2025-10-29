"use client";

import { useState } from "react";
import { API_PREFIX } from "@/lib/api";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [ok, setOk] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_PREFIX}/contact-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      setOk(res.ok);
      if (res.ok) setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setOk(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="name" value={form.name} onChange={onChange} placeholder="Nom et prénoms"
               className="w-full border border-neutral-300 rounded px-3 py-2" />
        <input name="email" type="email" value={form.email} onChange={onChange} placeholder="Email"
               required className="w-full border border-neutral-300 rounded px-3 py-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="phone" value={form.phone} onChange={onChange} placeholder="Téléphone (facultatif)"
               className="w-full border border-neutral-300 rounded px-3 py-2" />
        <input name="subject" value={form.subject} onChange={onChange} placeholder="Objet"
               className="w-full border border-neutral-300 rounded px-3 py-2" />
      </div>

      <textarea name="message" value={form.message} onChange={onChange} placeholder="Votre message"
                required className="w-full border border-neutral-300 rounded px-3 py-2 min-h-[140px]" />

      <div className="flex items-center gap-3">
        <button disabled={loading}
                className="rounded bg-blue-600 text-white font-semibold px-4 py-2 hover:bg-blue-700 disabled:opacity-60">
          {loading ? "Envoi en cours..." : "Envoyer"}
        </button>
        {ok === true && <span className="text-green-700 text-sm">Message envoyé. Merci !</span>}
        {ok === false && <span className="text-red-700 text-sm">Échec d’envoi. Réessayez.</span>}
      </div>
    </form>
  );
}

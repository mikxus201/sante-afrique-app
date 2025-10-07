"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: branchement API /db ici
    alert(`Merci ! Nous avons bien reçu : ${email}`);
    setEmail("");
  };

  return (
    <form onSubmit={onSubmit} className="mt-4 flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre email"
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#0096D3]"
      />
      <button
        type="submit"
        className="shrink-0 rounded-md bg-[#0096D3] px-4 py-2 font-semibold text-white hover:opacity-90"
      >
        S’abonner
      </button>
    </form>
  );
}

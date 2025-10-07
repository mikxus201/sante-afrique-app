// src/components/AccountWelcome.tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Essaie de lire:
 *  - localStorage.sa_user_name       -> nom à afficher
 *  - localStorage.sa_created_at_iso  -> date ISO d'inscription
 * Tu pourras les renseigner depuis ta logique d'auth plus tard.
 */
export default function AccountWelcome({
  appImageSrc = "/images/app-mobile.png", // remplace par ton image quand tu l'auras
}: {
  appImageSrc?: string;
}) {
  const [name, setName] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    setName(localStorage.getItem("sa_user_name"));
    setCreatedAt(localStorage.getItem("sa_created_at_iso"));
  }, []);

  const since =
    createdAt &&
    new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(createdAt));

  return (
    <div className="border-b bg-neutral-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 flex items-center gap-8">
        <div className="flex-1 min-w-0">
          <p className="uppercase tracking-wide text-sm/6 text-neutral-300">
            Bonjour{ name ? ` ${name}` : "" }
          </p>
          <h1 className="text-2xl font-extrabold mt-1">
            Merci de contribuer à faire avancer l’information santé en Afrique
            {since ? ` depuis le ${since}` : ""}.
          </h1>
          <p className="mt-2 text-neutral-300">
            Vous n’êtes pas {name ?? "le titulaire"} ?{" "}
            <a href="/connexion" className="underline">
              Cliquez ici pour vous déconnecter
            </a>.
          </p>
        </div>

        {/* visuel appli mobile */}
        <div className="relative hidden sm:block w-[200px] h-[410px]">
          {/* si l’image n’existe pas, on affiche un bloc de couleur */}
          <Image
            src={appImageSrc}
            alt="Aperçu application mobile"
            fill
            className="object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              const parent = (e.target as HTMLImageElement).parentElement!;
              parent.innerHTML =
                '<div class="w-full h-full rounded bg-neutral-800 flex items-center justify-center text-neutral-400">Aperçu app</div>';
            }}
          />
        </div>
      </div>
    </div>
  );
}

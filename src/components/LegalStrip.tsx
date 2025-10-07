// src/components/LegalStrip.tsx
import Link from "next/link";

export default function LegalStrip() {
  return (
    <div className="bg-neutral-950 text-neutral-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Message court */}
        <p className="text-center md:text-left">
          Les informations publiées ne remplacent pas l’avis d’un professionnel de santé.
        </p>

        {/* Liens légaux */}
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
          <span className="hidden md:inline text-neutral-600">•</span>
          <Link href="/politique-de-confidentialite" className="hover:text-white">Politique de confidentialité</Link>
          <span className="hidden md:inline text-neutral-600">•</span>
          <Link href="/conditions-d-utilisation" className="hover:text-white">Conditions d’utilisation</Link>
          <span className="hidden md:inline text-neutral-600">•</span>
          <Link href="/cookies" className="hover:text-white">Politique de cookies</Link>
          <span className="hidden md:inline text-neutral-600">•</span>
          <Link href="/cookies#preferences" className="hover:text-white">Paramétrer les cookies</Link>
        </nav>
      </div>
    </div>
  );
}

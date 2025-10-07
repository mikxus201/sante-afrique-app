// src/app/compte/cookies/page.tsx
import Link from "next/link";

export default function CookiesPage() {
  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-extrabold">Cookies & données personnelles</h1>

      <p className="text-neutral-700">
        Vous pouvez ajuster à tout moment vos préférences de cookies et de mesure d’audience.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/cookies-preferences"
          className="inline-block rounded border px-3 py-2 hover:bg-neutral-50"
        >
          Ouvrir le centre de préférences
        </Link>

        <Link
          href="/politique-de-confidentialite"
          className="inline-block rounded border px-3 py-2 hover:bg-neutral-50"
        >
          Lire la politique de confidentialité
        </Link>
      </div>
    </section>
  );
}

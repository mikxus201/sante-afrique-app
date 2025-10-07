// src/app/cookies-preferences/page.tsx
import Link from "next/link";
import CookiesPrefsForm from "@/components/CookiesPrefsForm";

export const metadata = {
  title: "Préférences cookies | Santé Afrique",
  description: "Gérez vos préférences de cookies pour Santé Afrique.",
};

export default function CookiesPreferencesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span className="mx-1">/</span>
        <Link href="/cookies" className="hover:underline">Cookies</Link>
        <span className="mx-1">/</span>
        <span>Préférences</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-extrabold mb-4">Préférences cookies</h1>
      <CookiesPrefsForm />
    </div>
  );
}

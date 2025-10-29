// src/components/Footer.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Facebook, Youtube, Linkedin, Instagram } from "lucide-react";
import { SiX } from "react-icons/si";

export default function Footer() {
  const [email, setEmail] = useState("");

  const submitNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    // validation simple mais robuste
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Veuillez entrer une adresse email valide.");
      return;
    }
    alert(`Merci ! ${email} a bien été enregistré.`);
    setEmail("");
  };

  return (
    <footer className="mt-16 bg-neutral-900 text-neutral-200">
      {/* En-tête marque */}
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-6 text-center">
        <div className="inline-flex items-baseline gap-2 text-2xl font-extrabold">
          <span className="text-white">santé</span>
          <span className="text-blue-400">afrique</span>
        </div>
        <div className="mt-2 text-sm text-neutral-400">
          <em>Bien comprendre, mieux vivre</em>
        </div>
      </div>

      <div className="border-t border-neutral-800" />

      {/* Grille principale */}
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-sm">
        {/* SERVICES */}
        <div>
          <h3 className="text-neutral-400 font-semibold uppercase tracking-wide mb-3">Services</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/offres-emploi/poster" className="hover:text-white">
                Poster une Offre d’emploi
              </Link>
            </li>
            <li>
              <Link href="/offres-emploi" className="hover:text-white">
                Postuler à une Offre d’emploi
              </Link>
            </li>
            <li>
              <Link href="/partenaires" className="hover:text-white">
                Espace partenaire
              </Link>
            </li>
          </ul>
        </div>

        {/* RUBRIQUE */}
        <div>
          <h3 className="text-neutral-400 font-semibold uppercase tracking-wide mb-3">Rubrique</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/rubriques/sante-maternelle" className="hover:text-white">
                Santé maternelle
              </Link>
            </li>
            <li>
              <Link href="/rubriques/sante-nutrition-infantile" className="hover:text-white">
                Nutrition familiale
              </Link>
            </li>
            <li>
              <Link href="/rubriques/vaccination" className="hover:text-white">
                Vaccination
              </Link>
            </li>
            <li>
              <Link href="/rubriques/sante-mental" className="hover:text-white">
                Santé-Mental
              </Link>
            </li>
          </ul>
        </div>

        {/* LA RÉDACTION */}
        <div>
          <h3 className="text-neutral-400 font-semibold uppercase tracking-wide mb-3">La rédaction</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/a-propos" className="hover:text-white">
                Qui sommes-nous
              </Link>
            </li>
            <li>
              <Link href="/nous-rejoindre" className="hover:text-white">
                Nous rejoindre
              </Link>
            </li>
            <li>
              <Link href="/nous-contacter" className="hover:text-white">
                Nous contacter
              </Link>
            </li>
          </ul>
        </div>

        {/* ABONNEMENT */}
        <div>
          <h3 className="text-neutral-400 font-semibold uppercase tracking-wide mb-3">Abonnement</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/abonnement" className="hover:text-white">
                S’abonner
              </Link>
            </li>
            <li>
              <Link href="/abonnement/pour-un-tiers" className="hover:text-white">
                Payer un abonnement pour un tiers
              </Link>
            </li>
            <li>
              <Link href="/magazine" className="hover:text-white">
                Consulter le magazine
              </Link>
            </li>
          </ul>
        </div>

        {/* NEWSLETTER */}
        <div className="lg:col-span-2">
          <h3 className="text-neutral-400 font-semibold uppercase tracking-wide mb-3">Newsletter</h3>
          <p className="text-neutral-300 mb-3">
            Recevez nos actualités et conseils santé directement par email.
          </p>
          <form onSubmit={submitNewsletter} className="flex flex-col sm:flex-row gap-2" noValidate>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              aria-label="Adresse email"
              required
              className="flex-1 rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm placeholder:text-neutral-500 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-500"
            >
              S’abonner
            </button>
          </form>
        </div>

        {/* APPLICATION MOBILE */}
        <div className="lg:col-span-2">
          <h3 className="text-neutral-400 font-semibold uppercase tracking-wide mb-3">
            Application mobile
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/apps/ios"
              className="inline-flex items-center justify-center rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2 hover:bg-neutral-700"
            >
              <span className="mr-2 text-lg" aria-hidden>
                
              </span>
              App Store
            </Link>
            <Link
              href="/apps/android"
              className="inline-flex items-center justify-center rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2 hover:bg-neutral-700"
            >
              <span className="mr-2 text-base" aria-hidden>
                ▶
              </span>
              Play Store
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-800" />

      {/* Bas de page */}
      <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-neutral-400 flex flex-col md:flex-row items-center justify-between gap-3">
        <div>© Santé Afrique {new Date().getFullYear()}, tous droits réservés</div>

        {/* Réseaux sociaux */}
        <div className="flex items-center gap-4">
          <Link
            href="https://https://www.facebook.com/profile.php?id=61564168631404"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="hover:text-white"
          >
            <Facebook size={18} />
          </Link>
          <Link
            href="https://https://www.youtube.com/@pharmaconsults-expertise5941"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="hover:text-white"
          >
            <Youtube size={18} />
          </Link>
          <Link
            href="https://https://www.linkedin.com/company/santeafrique/?viewAsMember=true"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-white"
          >
            <Linkedin size={18} />
          </Link>
          <Link
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-white"
          >
            <Instagram size={18} />
          </Link>
          <Link
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="hover:text-white"
          >
            <SiX size={18} />
          </Link>
        </div>
      </div>
    </footer>
  );
}

// src/app/cookies/page.tsx
import CookiesPrefs from "../../components/CookiesPrefs";

export const metadata = {
  title: "Politique de cookies | Santé Afrique",
  description: "Informations sur l’usage des cookies et vos possibilités de paramétrage.",
};

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Politique de cookies</h1>
      <p className="mt-2 text-sm text-neutral-500">Dernière mise à jour : 07/05/2025</p>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold">Qu’est-ce qu’un cookie ?</h2>
        <p>
          Un cookie est un petit fichier texte déposé sur votre terminal lors de la consultation du site.
          Il permet, par exemple, de mémoriser vos préférences ou de mesurer l’audience.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-bold">Types de cookies utilisés</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Nécessaires</strong> : indispensables au fonctionnement (toujours actifs).</li>
          <li><strong>Mesure d’audience</strong> : statistiques anonymisées.</li>
          <li><strong>Personnalisation</strong> : mémorisation de vos choix d’affichage.</li>
          <li><strong>Publicité</strong> : personnalisation des publicités (le cas échéant).</li>
        </ul>
        <p className="text-sm text-neutral-600 mt-2">
          Durées indicatives : cookies au plus 13 mois ; consentement renouvelé périodiquement.
        </p>
      </section>

      {/* Préférences (client component) */}
      <CookiesPrefs />

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold">Contact</h2>
        <p className="text-sm">
          Pour toute question liée aux cookies et à vos données :{" "}
          <a href="mailto:infos@pharma-consults.com" className="text-blue-600 hover:underline">
            infos@santeafrique.net
          </a>.
        </p>
      </section>
    </div>
  );
}

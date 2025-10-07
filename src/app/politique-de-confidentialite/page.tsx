// src/app/politique-de-confidentialite/page.tsx

export const metadata = {
  title: "Politique de confidentialité | Santé Afrique",
  description:
    "Données collectées, finalités, base légale, conservation, destinataires, transferts, sécurité et droits.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Politique de confidentialité</h1>
      <p className="mt-2 text-sm text-neutral-500">Date d’effet : 07/05/2025</p>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold">Responsable de traitement</h2>
        <p>
          PharmaConsults Expertise SARL — 537, Rue D29, Abidjan, Côte d’Ivoire —{" "}
          <a href="mailto:infos@pharma-consults.com" className="text-blue-600 hover:underline">
            infos@santeafrique.net
          </a>
          .
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-bold">Données collectées</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Données d’identification (nom, email, téléphone) ;</li>
          <li>Données de compte/abonnement ;</li>
          <li>Données de navigation (adresse IP, pages consultées, navigateur/système) ;</li>
          <li>Cookies et technologies similaires (voir <a className="text-blue-600 hover:underline" href="/cookies">Politique de cookies</a>).</li>
        </ul>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-bold">Finalités & bases légales</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Fourniture du service éditorial et des comptes (exécution du contrat) ;</li>
          <li>Newsletter (consentement, désinscription possible) ;</li>
          <li>Mesure d’audience et amélioration du site (intérêt légitime / consentement) ;</li>
          <li>Obligations légales (facturation, sécurité).</li>
        </ul>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-bold">Destinataires</h2>
        <p>
          Prestataires techniques (hébergement, emailing, analytics) et autorités compétentes si la loi l’exige — avec engagements de confidentialité et sécurité.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-bold">Conservation</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Comptes inactifs : supprimés après 2 ans ;</li>
          <li>Pièces comptables / transactions : jusqu’à 5 ans (exigences légales) ;</li>
          <li>Cookies : au plus 13 mois.</li>
        </ul>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-bold">Transferts</h2>
        <p>
          Des transferts hors du pays peuvent exister (ex. prestataires d’hébergement). Des garanties appropriées sont mises en place.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-bold">Sécurité</h2>
        <p>
          Mesures techniques et organisationnelles raisonnables pour protéger vos données contre l’accès non autorisé, la perte ou l’altération.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-bold">Vos droits</h2>
        <p>
          Accès, rectification, effacement, limitation, opposition et portabilité, selon la loi. Contact :{" "}
          <a href="mailto:infos@pharma-consults.com" className="text-blue-600 hover:underline">
            infos@santeafrique.net
          </a>
          .
        </p>
      </section>
    </div>
  );
}

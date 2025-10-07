// src/app/mentions-legales/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Mentions légales | Santé Afrique",
  description:
    "Éditeur, hébergeur, propriété intellectuelle, coordonnées et informations légales de Santé Afrique.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Mentions légales</h1>
      <p className="mt-2 text-sm text-neutral-500">Dernière mise à jour : 07/05/2025</p>

      <section className="mt-8 space-y-2">
        <h2 className="text-xl font-bold">1. Identification de l’éditeur</h2>
        <p>
          <strong>Santé Afrique</strong> est publié par <strong>PharmaConsults Expertise SARL</strong>.<br />
          Siège social : 537 Rue D29, Abidjan – Côte d’Ivoire<br />
          RCCM : CI-ABJ-2019-B-15638 — Capital social : 1 000 000 FCFA<br />
          Tél. : +225 0714565076 — Email :{" "}
          <a href="mailto:infos@pharma-consults.com" className="text-blue-600 hover:underline">
            infos@santeafrique.net
          </a>
          <br />
          Directeur de la publication : BLEOUE KOULOU HERMANN
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-xl font-bold">2. Hébergement</h2>
        <p>
          Hébergeur : Amazon Web Services EMEA SARL, 38 Avenue John F. Kennedy, L-1855, Luxembourg — Tél. : +352 26 73 33 00.<br />
          Site :{" "}
          <a
            href="https://aws.amazon.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            aws.amazon.com
          </a>
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-xl font-bold">3. Propriété intellectuelle</h2>
        <p>
          Les contenus du site (textes, images, logos, bases de données, etc.) sont protégés. Toute reproduction,
          représentation ou exploitation, totale ou partielle, sans autorisation écrite est interdite.
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-xl font-bold">4. Données personnelles</h2>
        <p>
          Le traitement de vos données est décrit dans notre{" "}
          <Link href="/politique-de-confidentialite" className="text-blue-600 hover:underline">
            Politique de confidentialité
          </Link>
          . Vous disposez de droits d’accès, rectification, suppression et opposition via{" "}
          <a href="mailto:infos@pharma-consults.com" className="text-blue-600 hover:underline">
            infos@pharma-consults.com
          </a>.
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-xl font-bold">5. Responsabilité</h2>
        <p>
          Malgré nos soins, des erreurs ou indisponibilités peuvent survenir. L’usage des informations publiées se fait
          sous votre responsabilité.
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-xl font-bold">6. Liens</h2>
        <p>
          Le site peut contenir des liens tiers. Nous n’en contrôlons pas le contenu ni les pratiques.
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-xl font-bold">7. Loi applicable</h2>
        <p>
          Droit ivoirien. Compétence exclusive des tribunaux d’Abidjan.
        </p>
      </section>
    </div>
  );
}

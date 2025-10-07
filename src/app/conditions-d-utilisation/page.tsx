// src/app/conditions-d-utilisation/page.tsx

export const metadata = {
  title: "Conditions d’utilisation | Santé Afrique",
  description:
    "Règles d’utilisation du site Santé Afrique, responsabilités, propriété intellectuelle, et juridiction.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Conditions d’utilisation</h1>
      <p className="mt-2 text-sm text-neutral-500">Dernière mise à jour : 07/05/2025</p>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-bold">1. Acceptation</h2>
        <p>
          En accédant au site, vous acceptez sans réserve les présentes conditions. Si vous refusez, veuillez ne pas utiliser nos services.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-bold">2. Accès & compte</h2>
        <p>
          Certaines fonctionnalités nécessitent un compte. Vous êtes responsable de la confidentialité de vos identifiants et des informations fournies.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-bold">3. Contenus & usage</h2>
        <p>
          Les contenus éditoriaux ont une vocation informative et ne remplacent pas l’avis d’un professionnel de santé.
          Vous vous engagez à respecter les lois en vigueur et les droits des tiers.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-bold">4. Propriété intellectuelle</h2>
        <p>
          Les éléments du site sont protégés. Toute reproduction non autorisée est interdite.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-bold">5. Responsabilité</h2>
        <p>
          Le site est fourni « en l’état ». Nous ne garantissons pas l’absence d’erreurs ou d’interruptions et déclinons toute responsabilité pour tout dommage indirect.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-bold">6. Modifications</h2>
        <p>
          Nous pouvons mettre à jour ces conditions. La poursuite de l’utilisation du site après publication vaut acceptation des nouvelles conditions.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-bold">7. Résiliation</h2>
        <p>
          En cas de violation, nous pouvons suspendre ou supprimer l’accès sans préavis.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-bold">8. Droit applicable</h2>
        <p>
          Droit ivoirien. Compétence : tribunaux d’Abidjan.
        </p>
      </section>
    </div>
  );
}

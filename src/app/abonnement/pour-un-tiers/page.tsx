import Hero from "@/components/Hero";

export const metadata = {
  title: "Offrir un abonnement – Santé Afrique",
  description: "Payez un abonnement pour un proche ou une équipe.",
};

export default function GiftSubPage() {
  return (
    <>
      <Hero
        title="Offrir un abonnement"
        subtitle="Un geste utile : l’accès au savoir en santé."
        image="/heroes/gift.jpg"
        align="left"
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ol className="list-decimal pl-6 space-y-2 text-neutral-700">
          <li>Choisissez la formule sur la page Abonnement.</li>
          <li>Renseignez l’email bénéficiaire au paiement.</li>
          <li>Le bénéficiaire reçoit ses identifiants par email.</li>
        </ol>
      </div>
    </>
  );
}

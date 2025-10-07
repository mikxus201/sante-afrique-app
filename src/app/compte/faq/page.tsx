// src/app/compte/faq/page.tsx
const faqs = [
  {
    q: "Comment modifier mon mot de passe ?",
    a: "Depuis la page « Profil », cliquez sur « Changer le mot de passe ».",
  },
  {
    q: "Comment gérer mes newsletters ?",
    a: "Rendez-vous sur l’onglet « Newsletters » et activez les listes de votre choix.",
  },
  {
    q: "Comment mettre à jour mon moyen de paiement ?",
    a: "Ajoutez ou modifiez vos cartes dans « Moyens de paiement ».",
  },
];

export default function FaqPage() {
  return (
    <section className="rounded border bg-white p-6">
      <h2 className="text-xl font-extrabold">Besoin d’aide ?</h2>
      <ul className="mt-4 space-y-4">
        {faqs.map((f, i) => (
          <li key={i} className="rounded border bg-neutral-50 p-4">
            <p className="font-semibold">{f.q}</p>
            <p className="text-neutral-700">{f.a}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

import Hero from "@/components/Hero";

export const metadata = {
  title: "À propos – Santé Afrique",
  description:
    "Mission, valeurs, équipe : découvrez l’ambition éditoriale de Santé Afrique.",
};

export default function AboutPage() {
  return (
    <>
      <Hero
        title="Qui sommes-nous ?"
        subtitle="Informer, décrypter et outiller l’action en santé publique sur le continent."
        image="/heroes/about.jpg"
        align="left"
      />

      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-10">
        {/* Mission */}
        <section className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-extrabold mb-3">Notre mission</h2>
            <p className="text-neutral-700 leading-7">
              Santé Afrique est un média indépendant dédié à la prévention, à
              la pédagogie et à l’analyse des politiques de santé. Nous
              vulgarisons les connaissances scientifiques, documentons les
              innovations, et mettons en lumière les solutions locales.
            </p>
            <ul className="mt-4 list-disc pl-6 space-y-2 text-neutral-700">
              <li>Rigueur scientifique & vérification des sources</li>
              <li>Information utile, claire et actionnable</li>
              <li>Approche panafricaine, ancrée localement</li>
            </ul>
          </div>
          <div className="rounded-lg border p-6 bg-white">
            <h3 className="font-bold mb-2">Chiffres clés</h3>
            <dl className="grid grid-cols-2 gap-4 text-neutral-800">
              <div>
                <dt className="text-3xl font-extrabold">12</dt>
                <dd className="text-sm opacity-70">numéros / an</dd>
              </div>
              <div>
                <dt className="text-3xl font-extrabold">+50</dt>
                <dd className="text-sm opacity-70">experts contributifs</dd>
              </div>
              <div>
                <dt className="text-3xl font-extrabold">20</dt>
                <dd className="text-sm opacity-70">pays couverts</dd>
              </div>
              <div>
                <dt className="text-3xl font-extrabold">100%</dt>
                <dd className="text-sm opacity-70">indépendant</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Valeurs */}
        <section>
          <h2 className="text-2xl font-extrabold mb-3">Nos valeurs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              ["Exigence", "Sources fiables, revue éditoriale, transparence."],
              ["Utilité", "Contenu orienté prévention et prise de décision."],
              ["Impact", "Mettre en avant les solutions qui fonctionnent."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-lg border p-5 bg-white">
                <h3 className="font-bold">{t}</h3>
                <p className="text-neutral-700 mt-1">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-2xl font-extrabold mb-3">Notre histoire</h2>
          <ol className="relative border-l pl-6 space-y-6">
            {[
              ["2023", "Lancement du projet et constitution du réseau d’experts."],
              ["2024", "Premiers numéros pilotes et croissance de l’audience."],
              ["2025", "Déploiement digital et développement des partenariats."],
            ].map(([year, txt]) => (
              <li key={year}>
                <div className="absolute -left-2.5 top-1.5 h-2.5 w-2.5 rounded-full bg-blue-600" />
                <h4 className="font-semibold">{year}</h4>
                <p className="text-neutral-700">{txt}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Équipe (placeholders) */}
        <section>
          <h2 className="text-2xl font-extrabold mb-3">L’équipe</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              ["Rédaction en chef", "Abidjan, CI"],
              ["Data & Fact-checking", "Dakar, SN"],
              ["Iconographie", "Lomé, TG"],
            ].map(([role, city], i) => (
              <div key={i} className="rounded-lg border p-5 bg-white">
                <div className="h-28 w-28 rounded-full bg-neutral-200 mb-3" />
                <p className="font-semibold">Nom Prénom</p>
                <p className="text-sm text-neutral-600">{role}</p>
                <p className="text-sm text-neutral-600">{city}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

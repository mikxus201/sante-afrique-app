import Hero from "@/components/Hero";

export const metadata = {
  title: "Nous rejoindre – Santé Afrique",
  description:
    "Correspondants, Stages, freelances, rédacteurs et experts : rejoignez l’aventure.",
};

export default function JoinUsPage() {
  return (
    <>
      <Hero
        title="Nous rejoindre"
        subtitle="Correspondance, Rédaction, data, vidéo, commercial : travaillons ensemble."
        image="/heroes/join.jpg"
        align="left"
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-neutral-700 leading-7">
          Envoyez CV/portfolio :{" "}
          <a className="text-blue-600 underline" href="mailto:recrutement@santeafrique.org">
            infos@santeafrique.net
          </a>
          .
        </p>
        <div className="mt-6 rounded-lg border p-5">
          <p className="font-semibold">Profils recherchés</p>
          <ul className="list-disc pl-6 space-y-2 text-neutral-700 mt-2">
            <li>Journalistes/éditeurs santé</li>
            <li>Data-journalistes & fact-checkers</li>
            <li>Community & vidéo</li>
          </ul>
        </div>
      </div>
    </>
  );
}

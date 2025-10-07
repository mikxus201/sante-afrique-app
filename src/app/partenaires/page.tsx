import Hero from "@/components/Hero";

export const metadata = {
  title: "Espace partenaire – Santé Afrique",
  description: "Dossiers, newsletters sponsorisées, évènements.",
};

export default function PartnersPage() {
  return (
    <>
      <Hero
        title="Espace partenaire"
        subtitle="Co-construisons des contenus à impact."
        image="/heroes/partners.jpg"
        align="left"
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-neutral-700">
          Écrivez-nous :{" "}
          <a className="text-blue-600 underline" href="mailto:partenariats@santeafrique.org">
            infos@santeafrique.net
          </a>
        </p>
      </div>
    </>
  );
}

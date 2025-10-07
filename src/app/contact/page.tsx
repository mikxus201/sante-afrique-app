import Hero from "@/components/Hero";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Nous contacter – Santé Afrique",
  description: "Contactez la rédaction Santé Afrique pour vos partenariats et requêtes.",
};

export default function ContactPage() {
  return (
    <>
      <Hero title="Nous contacter" subtitle="Contactez notre rédaction" />
      <div className="max-w-3xl mx-auto py-12 px-4">
        <ContactForm />
      </div>
    </>
  );
}

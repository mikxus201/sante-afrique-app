import Hero from "@/components/Hero";
import ContactForm from "@/components/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nous contacter — Santé Afrique",
  description: "Envoyez un message à l’équipe Santé Afrique",
};

export default function ContactPage() {
  return (
    <>
      <Hero
        title="Nous contacter"
        subtitle="Questions, partenariats, presse : écrivez-nous."
        image="/heroes/contact.jpg"
        align="left"
      />
      <div className="mx-auto max-w-4xl px-4 py-12 grid gap-10 md:grid-cols-[1.1fr,0.9fr]">
        <div>
          <h2 className="text-xl font-bold mb-4">Écrivez-nous</h2>
          <ContactForm />
        </div>

        <aside className="rounded-lg border p-5 bg-white">
          <h3 className="font-semibold mb-2">Coordonnées</h3>
          <p className="text-sm text-neutral-700">
            Santé Afrique — Cocody, Riviera Jardin - Abidjan, Côte d’Ivoire<br />
            Email: infos@santeafrique.net<br />
            WhatsApp: <a className="text-blue-700 underline" href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""}`} target="_blank">Discuter</a>
          </p>
        </aside>
      </div>
    </>
  );
}

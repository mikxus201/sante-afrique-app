import Hero from "@/components/Hero";

export const metadata = {
  title: "App Android – Santé Afrique",
  description: "Application Android (bientôt disponible).",
};

export default function AndroidPage() {
  return (
    <>
      <Hero
        title="Application Android"
        subtitle="Bientôt sur le Play Store."
        image="/heroes/android.jpg"
        align="left"
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-neutral-700">Restez connectés à nos annonces !</p>
      </div>
    </>
  );
}

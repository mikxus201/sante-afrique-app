import Hero from "@/components/Hero";

export const metadata = {
  title: "App iOS – Santé Afrique",
  description: "Application iPhone / iPad (bientôt disponible).",
};

export default function IOSPage() {
  return (
    <>
      <Hero
        title="Application iOS"
        subtitle="Bientôt sur l’App Store."
        image="/heroes/ios.jpg"
        align="left"
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-neutral-700">Restez connectés à nos annonces !</p>
      </div>
    </>
  );
}

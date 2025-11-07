export const dynamic = "force-dynamic";
export const revalidate = 0;

import MagReader from "@/components/mag/MagReader";

export const metadata = {
  title: "Lecture du magazine — Santé Afrique",
  robots: { index: false, follow: false },
};

export default function Page({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-neutral-900">
      {/* Le lecteur gère lui-même sa largeur/hauteur pour un rendu immersif */}
      <MagReader issueId={params.id} />
    </main>
  );
}

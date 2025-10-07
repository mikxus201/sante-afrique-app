// src/app/offres-emploi/page.tsx
import JobBoard from "@/components/JobBoard";
import jobsdata from "@/../data/jobs.json"; // data est à la racine

export const metadata = {
  title: "Offres d’emploi – Santé Afrique",
  description: "Trouvez nos dernières offres d’emploi à travers l’Afrique.",
};

export default function OffresEmploiPage() {
  return (
    <main>
      {/* On passe les données au composant client */}
      <JobBoard jobs={jobsdata as any} />
    </main>
  );
}

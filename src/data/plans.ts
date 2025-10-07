// src/data/plans.ts
export type Plan = {
  slug: string;
  name: string;
  price: number;
  currency: string;
  period?: string;
  perks?: string[];
  badge?: string;
};

export const plans: Plan[] = [
  {
    slug: "annuel",
    name: "Abonnement annuel",
    price: 90000,
    currency: "FCFA",
    period: "/an",
    badge: "OFFRE RECOMMANDEE",
    perks: ["06 numéros (édition Papier + numérique) + accès archives + Offres D'emploi"]
  },
  {
    slug: "annuel-entreprise",
    name: "Offre annuelle papier",
    price: 50000,
    currency: "FCFA",
    period: "/an",
    perks: ["06 numéros (édition Papier)"]
  },
  {
    slug: "annuel-etudiant",
    name: "Offre annuelle Numérique",
    price: 15000,
    currency: "FCFA",
    period: "/an",
    perks: ["06 numéros (édition numérique + accès archivres)"]
  }
];

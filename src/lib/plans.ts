// src/lib/plans.ts
export type PlanId = "annuel" | "annuel-entreprise" | "annuel-numerique";

export type Plan = {
  id: PlanId;
  name: string;
  priceText: string;       // affichage
  amountCFA: number;       // pour CinetPay
  description: string;
  features: string[];
};

export const PLANS: Record<PlanId, Plan> = {
  "annuel": {
    id: "annuel",
    name: "Abonnement Annuel (Papier + Numérique)",
    priceText: "90 000 FCFA",
    amountCFA: 90000,
    description: "06 numéros papier + numérique, archives et offres d’emploi.",
    features: [
      "6 numéros / an",
      "Accès à l’édition numérique et aux archives",
      "Offres d’emploi incluses",
    ],
  },
  "annuel-entreprise": {
    id: "annuel-entreprise",
    name: "Offre Annuelle Papier",
    priceText: "50 000 FCFA",
    amountCFA: 50000,
    description: "06 numéros édition papier.",
    features: ["6 numéros / an (papier)"],
  },
  "annuel-numerique": {
    id: "annuel-numerique",
    name: "Offre Annuelle Numérique",
    priceText: "15 000 FCFA",
    amountCFA: 15000,
    description: "06 numéros (numérique) + accès aux archives.",
    features: ["6 numéros / an (numérique)", "Accès aux archives"],
  },
};

export function getPlanBySlug(slug: string | undefined): Plan | null {
  if (!slug) return null;
  const id = slug as PlanId;
  return PLANS[id] ?? null;
}

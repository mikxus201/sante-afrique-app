// data/sections.ts

export type SectionItem = {
  title: string;
  thumb: string;   // ex: "/rubriques/sante-maternelle/item-01.jpg"
  excerpt?: string;
  href?: string;
};

export type Section = {
  slug: string;      // ex: "sante-maternelle"
  label: string;     // ex: "Santé Maternelle"
  description?: string;
  hero?: string;     // ex: "/rubriques/sante-maternelle/hero.jpg"
  items: SectionItem[];
};

export const sections: Section[] = [
  {
    slug: "actualites",
    label: "Actualités",
    description: "Les temps forts santé en Afrique.",
    hero: "/rubriques/actualites/hero.jpg",
    items: [
      { title: "Brève 1", thumb: "/rubriques/actualites/item-01.jpg", href: "#" },
      { title: "Brève 2", thumb: "/rubriques/actualites/item-02.jpg", href: "#" }
    ]
  },
  {
    slug: "conseils-pratiques",
    label: "Conseils Pratiques",
    description: "Conseils utiles sur les produits de santé et la prévention.",
    hero: "/rubriques/conseils-pratiques/hero.jpg",
    items: [
      { title: "Bien utiliser un tensiomètre", thumb: "/rubriques/conseils-pratiques/item-01.jpg", href: "#" },
      { title: "Trousse santé familiale", thumb: "/rubriques/conseils-pratiques/item-02.jpg", href: "#" }
    ]
  },
  {
    slug: "dossier",
    label: "Dossier",
    description: "Nos grands formats et analyses.",
    hero: "/rubriques/dossier/hero.jpg",
    items: [
      { title: "Dossier du mois", thumb: "/rubriques/dossier/item-01.jpg", href: "#" },
      { title: "Décryptage", thumb: "/rubriques/dossier/item-02.jpg", href: "#" }
    ]
  },
  {
    slug: "equite-acces-produits-sante",
    label: "Équité & Accès aux produits de santé",
    description: "Accès équitable, disponibilité et qualité.",
    hero: "/rubriques/equite-acces-produits-sante/hero.jpg",
    items: [
      { title: "Disponibilité des essentiels", thumb: "/rubriques/equite-acces-produits-sante/item-01.jpg", href: "#" },
      { title: "Chaînes d’approvisionnement", thumb: "/rubriques/equite-acces-produits-sante/item-02.jpg", href: "#" }
    ]
  },
  {
    slug: "les-odd",
    label: "Les ODD",
    description: "Santé et Objectifs de Développement Durable.",
    hero: "/rubriques/les-odd/hero.jpg",
    items: [
      { title: "ODD 3 en action", thumb: "/rubriques/les-odd/item-01.jpg", href: "#" },
      { title: "Partenariats et impacts", thumb: "/rubriques/les-odd/item-02.jpg", href: "#" }
    ]
  },
  {
    slug: "business-sante",
    label: "Business Santé",
    description: "Économie et innovations du secteur.",
    hero: "/rubriques/business-sante/hero.jpg",
    items: [
      { title: "Startups santé", thumb: "/rubriques/business-sante/item-01.jpg", href: "#" },
      { title: "Investissements", thumb: "/rubriques/business-sante/item-02.jpg", href: "#" }
    ]
  },
  {
    slug: "bien-etre-mental",
    label: "Santé Mental",
    description: "Santé mentale, équilibre de vie et prévention.",
    hero: "/rubriques/bien-etre-mental/hero.jpg",
    items: [
      { title: "Gérer son stress", thumb: "/rubriques/bien-etre-mental/item-01.jpg", href: "#" },
      { title: "Sommeil réparateur", thumb: "/rubriques/bien-etre-mental/item-02.jpg", href: "#" }
    ]
  },
  {
    slug: "one-health",
    label: "One Health",
    description: "Santé humaine, animale et environnementale.",
    hero: "/rubriques/one-health/hero.jpg",
    items: [
      { title: "Zoonoses : prévenir", thumb: "/rubriques/one-health/item-01.jpg", href: "#" },
      { title: "Surveillance intégrée", thumb: "/rubriques/one-health/item-02.jpg", href: "#" }
    ]
  },
  {
    slug: "sante-nutrition-infantile",
    label: "Santé & Nutrition Infantile",
    description: "Grandir en bonne santé : allaitement, nutrition, vaccins.",
    hero: "/rubriques/sante-nutrition-infantile/hero.jpg",
    items: [
      { title: "Allaitement : repères", thumb: "/rubriques/sante-nutrition-infantile/item-01.jpg", href: "#" },
      { title: "Diversification", thumb: "/rubriques/sante-nutrition-infantile/item-02.jpg", href: "#" }
    ]
  },
  {
    slug: "sante-maternelle",
    label: "Santé Maternelle",
    description: "Grossesse, accouchement, post-partum.",
    hero: "/rubriques/sante-maternelle/hero.jpg",
    items: [
      {
        title: "Nutrition pendant la grossesse",
        thumb: "/rubriques/sante-maternelle/item-01.jpg",
        excerpt: "Les bases pour une alimentation saine et équilibrée.",
        href: "#"
      },
      {
        title: "Préparer son accouchement",
        thumb: "/rubriques/sante-maternelle/item-02.jpg",
        excerpt: "Tout ce qu’il faut savoir avant le jour J.",
        href: "#"
      }
    ]
  },
  {
    slug: "vaccination",
    label: "Vaccination",
    description: "Infos vaccins et recommandations.",
    hero: "/rubriques/vaccination/hero.jpg",
    items: [
      { title: "Calendrier vaccinal", thumb: "/rubriques/vaccination/item-01.jpg", href: "#" },
      { title: "Idées reçues", thumb: "/rubriques/vaccination/item-02.jpg", href: "#" }
    ]
  }
];

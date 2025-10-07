// src/data/issues.ts

export type SummaryItem = {
  title: string;
  image: string;
  href?: string;
};

export type Contributor = {
  name: string;
  role?: string;
  avatar?: string; // ex: "/images/authors/ndiaye.jpg" (optionnel)
  href?: string;
};

export type Issue = {
  id: string;          // slug ex: "n-020"
  number: number;      // 20
  date: string;        // ISO ex: "2025-08-15"
  cover: string;       // ex: "/images/magazine/20/cover.jpg"
  excerptPdf?: string; // ex: "/images/magazine/20/extrait.pdf" (ou une page)

  // Ajouts pour fiche enrichie
  theme?: string;           // ex: "Spécial tourisme"
  badges?: string[];        // ex: ["Spécial", "Dossier"]
  blurb?: string;           // chapeau éditorial
  tags?: string[];          // ex: ["santé publique", "prévention"]
  pages?: number;           // nb de pages
  fileSizeMb?: number;      // taille du PDF si on veut l’afficher
  contributors?: Contributor[];

  summary: SummaryItem[];
};

export const issues: Issue[] = [
  {
    id: "n-020",
    number: 20,
    date: "2025-08-15",
    cover: "/images/magazine/20/cover.jpg",
    excerptPdf: "/images/magazine/20/extrait.pdf",
    theme: "Spécial tourisme",
    badges: ["Spécial", "Dossier"],
    blurb:
      "Un numéro qui met en lumière les enjeux de santé liés au tourisme et à l’accueil. Parcours de soins, prévention, financement et numérique : notre rédaction mobilise experts et praticiens pour faire le point.",
    tags: ["tourisme", "prévention", "financement", "numérique"],
    pages: 84,
    fileSizeMb: 18.2,
    contributors: [
      { name: "Dr A. Ndiaye", role: "Interview" },
      { name: "K. Traoré", role: "Rédaction en chef" },
      { name: "M. Kouakou", role: "Photographie" },
    ],
    summary: [
      { title: "CMU: Santé pour tous, LE DEFI IVOIRIEN", image: "/images/magazine/20/s1.jpg", href: "/articles/paludisme-recule" },
      { title: "Nutrition : 5 idées reçues passées au crible", image: "/images/magazine/20/s2.jpg", href: "/articles/nutrition-idees-recues" },
      { title: "Dossier — Soins primaires : l’approche communautaire", image: "/images/magazine/20/s3.jpg", href: "/articles/soins-primaires" },
      { title: "Interview — Dr A. Ndiaye : « Former, équiper, mesurer »", image: "/images/magazine/20/s4.jpg", href: "/articles/interview-ndiaye" },
      { title: "Vaccination : comment convaincre durablement ?", image: "/images/magazine/20/s5.jpg", href: "/articles/vaccination-convaincre" },
      { title: "Hôpital numérique : chantiers prioritaires", image: "/images/magazine/20/s6.jpg", href: "/articles/hopital-numerique" }
    ]
  },
  {
    id: "n-019",
    number: 19,
    date: "2025-06-15",
    cover: "/images/magazine/19/cover.jpg",
    excerptPdf: "/images/magazine/19/extrait.pdf",
    theme: "Santé mentale",
    badges: ["Dossier"],
    blurb:
      "Lever les tabous et améliorer l’accès aux soins : ce dossier spécial explore les politiques publiques, la prévention et les innovations de terrain.",
    tags: ["santé mentale", "accès aux soins"],
    pages: 76,
    fileSizeMb: 16.4,
    contributors: [
      { name: "N. Fofana", role: "Coordination" },
      { name: "A. Koné", role: "Reportage" },
    ],
    summary: [
      { title: "Santé mentale : lever les tabous", image: "/images/magazine/19/s1.jpg", href: "/articles/sante-mentale-tabous" },
      { title: "Nutrition : 5 idées reçues passées au crible", image: "/images/magazine/19/s2.jpg", href: "/articles/nutrition-idees-recues" },
      { title: "Dossier — Soins primaires : l’approche communautaire", image: "/images/magazine/19/s3.jpg", href: "/articles/soins-primaires" },
      { title: "Interview — Dr A. Ndiaye : « Former, équiper, mesurer »", image: "/images/magazine/19/s4.jpg", href: "/articles/interview-ndiaye" },
      { title: "Vaccination : comment convaincre durablement ?", image: "/images/magazine/19/s5.jpg", href: "/articles/vaccination-convaincre" },
      { title: "Hôpital numérique : chantiers prioritaires", image: "/images/magazine/19/s6.jpg", href: "/articles/hopital-numerique" }
    ]
  },
  {
    id: "n-018",
    number: 18,
    date: "2025-04-15",
    cover: "/images/magazine/18/cover.jpg",
    excerptPdf: "/images/magazine/18/extrait.pdf",
    theme: "Systèmes de santé",
    badges: ["Analyse"],
    blurb:
      "Financement, ressources humaines, gouvernance : un tour d’horizon des leviers pour renforcer les systèmes de santé.",
    tags: ["financement", "RH", "gouvernance"],
    pages: 72,
    fileSizeMb: 15.1,
    contributors: [{ name: "Équipe rédaction", role: "Rédaction" }],
    summary: [
      { title: "Santé mentale : lever les tabous", image: "/images/magazine/18/s1.jpg", href: "/articles/sante-mentale-tabous" },
      { title: "Nutrition : 5 idées reçues passées au crible", image: "/images/magazine/18/s2.jpg", href: "/articles/nutrition-idees-recues" },
      { title: "Dossier — Soins primaires : l’approche communautaire", image: "/images/magazine/18/s3.jpg", href: "/articles/soins-primaires" },
      { title: "Interview — Dr A. Ndiaye : « Former, équiper, mesurer »", image: "/images/magazine/18/s4.jpg", href: "/articles/interview-ndiaye" },
      { title: "Vaccination : comment convaincre durablement ?", image: "/images/magazine/18/s5.jpg", href: "/articles/vaccination-convaincre" },
      { title: "Hôpital numérique : chantiers prioritaires", image: "/images/magazine/18/s6.jpg", href: "/articles/hopital-numerique" }
    ]
  },
  {
    id: "n-017",
    number: 17,
    date: "2025-02-15",
    cover: "/images/magazine/17/cover.jpg",
    excerptPdf: "/images/magazine/17/extrait.pdf",
    theme: "Prévention",
    badges: ["Spécial"],
    blurb:
      "Pourquoi la prévention reste la meilleure stratégie coût-efficace et comment la déployer massivement.",
    tags: ["prévention", "vaccination"],
    pages: 68,
    fileSizeMb: 14.6,
    contributors: [{ name: "Rédaction Santé Afrique" }],
    summary: [
      { title: "Santé mentale : lever les tabous", image: "/images/magazine/17/s1.jpg", href: "/articles/sante-mentale-tabous" },
      { title: "Nutrition : 5 idées reçues passées au crible", image: "/images/magazine/17/s2.jpg", href: "/articles/nutrition-idees-recues" },
      { title: "Dossier — Soins primaires : l’approche communautaire", image: "/images/magazine/17/s3.jpg", href: "/articles/soins-primaires" },
      { title: "Interview — Dr A. Ndiaye : « Former, équiper, mesurer »", image: "/images/magazine/17/s4.jpg", href: "/articles/interview-ndiaye" },
      { title: "Vaccination : comment convaincre durablement ?", image: "/images/magazine/17/s5.jpg", href: "/articles/vaccination-convaincre" },
      { title: "Hôpital numérique : chantiers prioritaires", image: "/images/magazine/17/s6.jpg", href: "/articles/hopital-numerique" }
    ]
   }
];

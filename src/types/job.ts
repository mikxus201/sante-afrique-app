export type Job = {
id: string | number;
title: string;
role?: string; // ex: Pharmacien, Médecin, Infirmier, etc.
company: string;
companySlug?: string;
companyLogo?: string | null;
type: string; // CDI, CDD, Stage, Consultance, Bénévolat...
location: string; // "Abidjan, Côte d’Ivoire"
country: string; // "Côte d’Ivoire"
experienceMin?: number | null; // années d’expérience min souhaitées
publishedAt: string; // ISO
closingAt?: string | null; // ISO facultatif
excerpt?: string | null;
descriptionHtml?: string | null;// rendu côté détail
externalApplyUrl?: string | null;
isActive?: boolean; // validée/activée par l’admin
isPinned?: boolean; // épinglée
pinUntil?: string | null; // date d’expiration de l’épingle (ISO)
};


export type Company = {
id: string | number;
name: string;
slug: string;
logoUrl?: string | null;
country?: string | null;
hqAddress?: string | null;
website?: string | null;
aboutHtml?: string | null;
openJobsCount?: number;
};
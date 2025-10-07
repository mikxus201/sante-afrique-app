// src/app/<ALIAS>/[slug]/page.tsx
// Exemple d’ALIAS : dossiers, interviews, tribunes, etc.
import ArticlePage, * as ArticleMod from "../../articles/[slug]/page";

// Page
export default ArticlePage;

// Forward des fonctions si présentes côté article
export const generateMetadata      = (ArticleMod as any).generateMetadata;
export const generateStaticParams  = (ArticleMod as any).generateStaticParams;

// Forward des options runtime si définies sur la page article
// (sinon on met des valeurs sûres par défaut)
export const dynamic        = (ArticleMod as any).dynamic;
export const revalidate     = (ArticleMod as any).revalidate ?? 60;   // ajuste selon ton besoin
export const dynamicParams  = (ArticleMod as any).dynamicParams ?? true;

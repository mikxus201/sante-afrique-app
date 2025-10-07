// src/types/mag.ts
// Types partagés pour le module Magazine

export type IssueID = string; // ex: "n_2019" ou "2025-08-15"

/**
 * Élément de sommaire (facultatif par numéro)
 * - title : libellé à afficher
 * - page  : numéro de page (si pertinent)
 * - href  : lien interne (#ancre) ou externe
 * - slug  : id de section (si tu anchors dans la page)
 */
export type SummaryItem = {
  title: string;
  page?: number;
  href?: string;
  slug?: string;
};

/**
 * Un numéro du magazine
 * Champs requis :
 *  - id       : identifiant unique (sert dans l’URL)
 *  - number   : numéro du magazine
 *  - date     : date ISO (ex "2025-08-15")
 *  - cover    : chemin image de couverture (public/)
 *
 * Champs optionnels :
 *  - title           : titre éditorial (affiché si présent)
 *  - pdf             : chemin d’un PDF complet (si jamais tu en avais un à usage interne)
 *  - excerptPdf      : PDF d’extrait (si tu en utilises un)
 *  - excerptImages   : pages exportées en images (flipbook auto-hébergé)
 *  - summary         : sommaire du numéro
 */
export type Issue = {
  id: IssueID;
  number: number;
  date: string; // ISO string
  cover: string;

  title?: string;
  pdf?: string;
  excerptPdf?: string;
  excerptImages?: string[];
  summary?: SummaryItem[];
};

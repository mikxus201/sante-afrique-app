export type Issue = {
  id: string | number;
  number: number;
  title?: string | null;
  date: string;            // ISO string
  cover: string;           // URL de l’image de couverture
  excerptPdf?: string | null;
  excerptImages?: string[] | null;
};

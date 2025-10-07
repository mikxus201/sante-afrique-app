// src/app/page.tsx
import Link from "next/link";

// Composants existants
import HeroSlider from "../components/HeroSlider";
import PairStrip from "../components/PairStrip";
import AdSlot from "../components/AdSlot";
import VideoRail from "../components/VideoRail";

// ---------- Types côté front (souples pour l’API) ----------
type Article = {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string | null;

  // variations possibles côté API
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  image?: string | null;
  image_url?: string | null;
  cover?: string | null;
  cover_url?: string | null;
  photo?: string | null;

  category?: string | null;
  section?: { name?: string | null } | null;
  rubrique?: { name?: string | null } | null;

  featured?: boolean | number | null;
  views?: number | null;
  published_at?: string | null; // ISO 8601
};

// Helpers de tri
const byDateDesc = (a: Article, b: Article) =>
  new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime();
const byViewsDesc = (a: Article, b: Article) => (b.views ?? 0) - (a.views ?? 0);

// ---------- Config & helpers URL ----------
const trimEndSlash = (s: string) => s.replace(/\/+$/, "");
const apiRoot = () =>
  trimEndSlash(
    (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api$/i, "")
  );
const apiUrl = (p: string) => `${apiRoot()}/api${p.startsWith("/") ? "" : "/"}${p}`;
const isAbs = (u: string) => /^https?:\/\//i.test(u);

/** Normalise un chemin d’image en URL publique exploitable */
function toPublicImageUrl(raw?: string | null): string | null {
  if (!raw) return null;
  let p = String(raw).trim().replace(/\\/g, "/");
  if (!p) return null;

  // déjà absolue
  if (isAbs(p)) return p;

  // nettoie "/" initiaux et "public/"
  p = p.replace(/^\/+/, "").replace(/^public\//i, "");

  // cas Laravel/CDN habituels
  if (/^(storage|uploads|images|img|media)\//i.test(p)) {
    return `${apiRoot()}/${p}`;
  }

  // fallback générique
  return `${apiRoot()}/storage/${p}`;
}

/** Choisit la meilleure clé image d’un article */
function pickImage(a: Article): string | null {
  return (
    toPublicImageUrl(
      a.thumbnail_url ||
        a.image_url ||
        a.cover_url ||
        a.thumbnail ||
        a.image ||
        a.cover ||
        a.photo ||
        null
    ) || null
  );
}

/** Catégorie “texte” même si renvoyée comme objet */
// Helper sûr : renvoie TOUJOURS une chaîne
function pickCategory(a: any): string {
  // On récupère la source "catégorie/rubrique/section" quelle que soit sa forme
  const src =
    a?.category ??
    a?.section ??
    a?.rubrique ??
    a?.category_name ??
    a?.section_name ??
    a?.rubrique_name ??
    null;

  const toText = (v: any): string => {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return toText(v[0]); // si tableau, on prend le 1er
    if (typeof v === "object") {
      const cand =
        v.name ??
        v.label ??
        v.title ??
        v.slug ??
        // fallback : première valeur string trouvée dans l’objet
        Object.values(v).find((x) => typeof x === "string") ??
        "";
      return String(cand);
    }
    return String(v);
  };

  return toText(src);
}


/** Transforme un article en card pour PairStrip (avec fallback image) */
function toItem(a: Article) {
  return {
    id: a.id,
    title: a.title,
    href: `/articles/${a.slug}`,
    image: pickImage(a) || "/placeholder.jpg",
    excerpt: a.excerpt ?? undefined,
    category: pickCategory(a) || undefined,
  };
}

// --------- Métadonnées de la page ---------
export const metadata = {
  title: "Santé Afrique — Accueil",
  description: "Magazine santé de référence en Afrique.",
};

// ---------- Page (Server Component) ----------
export default async function HomePage() {
  // --- Récupération API Laravel (robuste aux réponses HTML) ---
  const url = apiUrl("/articles");
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store", // en dev; passe en ISR (revalidate) plus tard si besoin
  });

  const raw = await res.text();
  if (/^\s*<!doctype html>|^\s*<html/i.test(raw)) {
    throw new Error(
      `L'API a renvoyé du HTML. Vérifie NEXT_PUBLIC_API_URL et que Laravel tourne : ${url}`
    );
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new Error(`Réponse non-JSON reçue depuis l'API: ${raw.slice(0, 200)}…`);
  }

  // L’index Laravel renvoie un paginator { data: [...] } ou un tableau
  const all: Article[] = Array.isArray(payload) ? payload : payload?.data ?? [];

  // ---------- Sections ----------
  // À la une (featured d’abord, puis le reste par date)
  const featuredFirst = all.filter((a) => !!a.featured).sort(byDateDesc);
  const nonFeatured = all.filter((a) => !a.featured).sort(byDateDesc);
  const aLaUne = [...featuredFirst, ...nonFeatured].slice(0, 9);

  // Les plus lus (si views dispo, sinon ordre chronologique)
  const mostRead = (
    all.some((a) => a.views != null) ? [...all].sort(byViewsDesc) : [...all].sort(byDateDesc)
  ).slice(0, 9);

  // Catégories pour les bandes du bas (fiables même avec section/rubrique)
  const byCat = (name: string) =>
    all
      .filter((a) => pickCategory(a).toLowerCase().includes(name))
      .sort(byDateDesc);

  const dossiers = byCat("dossier").slice(0, 12);
  const interviews = byCat("interview").slice(0, 12);
  const tribunes = byCat("tribune").slice(0, 12);

  const fallback = [...all].sort(byDateDesc);
  const dossiersSafe = dossiers.length ? dossiers : fallback.slice(6, 18);
  const interviewsSafe = interviews.length ? interviews : fallback.slice(18, 30);
  const tribunesSafe = tribunes.length ? tribunes : fallback.slice(30, 42);

  // Autres (évite de dupliquer ceux “à la une”)
  const aLaUneIds = new Set(aLaUne.map((a) => a.id));
  const others = fallback.filter((a) => !aLaUneIds.has(a.id)).slice(0, 18);

  // ---------- Rendu ----------
  return (
    <div className="space-y-10">
      {/* ===== HERO ===== */}
      <div className="mx-auto max-w-[1800px] px-4 pt-6">
        <HeroSlider
          slides={[
            { src: "/heroes/slide-01.jpg", title: "Prévenir, comprendre, agir", href: "/magazine" },
            {
              src: "/heroes/slide-02.jpg",
              title: "Nutrition & enfance : le guide essentiel",
              href: "/rubriques/sante-et-nutrition-infantile",
            },
            {
              src: "/heroes/slide-03.jpg",
              title: "Vaccination : dossiers et bonnes pratiques",
              href: "/rubriques/vaccination",
            },
            {
              src: "/heroes/slide-04.jpg",
              title: "Bien-être mental : nos conseils",
              href: "/rubriques/bien-etre-mental",
            },
            { src: "/heroes/slide-05.jpg", title: "One Health : une seule santé", href: "/rubriques/one-health" },
          ]}
          aspect="aspect-[16/5]"
        />
      </div>

      {/* ===== CONTENU (colonne + sidebar) ===== */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-8">
          {/* === COLONNE CONTENU === */}
          <div className="space-y-10">
            {/* PUB TOP — 970x170 */}
            <div className="flex justify-center">
              <AdSlot
                id="top-970x170"
                width={970}
                height={170}
                imgSrc="/ads/top-970x170.jpg"
                className="w-full max-w-[970px]"
              />
            </div>

            {/* ——— Articles à la une ——— */}
            <PairStrip
              title="Articles à la une"
              items={aLaUne.map(toItem)}
              seeAllHref="/articles"
              cols={3}
              bigVariant="image-left"
            />

            {/* PUB IN-CONTENT — 370x135 */}
            <div className="flex justify-center">
              <AdSlot
                id="incontent-370x135"
                width={970}
                height={270}
                imgSrc="/ads/incontent-370x135.jpg"
                className="w-full max-w-[970px]"
              />
            </div>

            {/* ——— Les plus lus ——— */}
            <PairStrip
              title="Les plus lus"
              items={mostRead.map(toItem)}
              seeAllHref="/articles?order=popular"
              cols={3}
              showIndex
              indexVariant="pill"
            />

            {/* ——— Vidéos ——— */}
            <VideoRail
              title="Vidéos"
              videos={[
                // Remplace par tes sources réelles si tu en as (YouTube IDs, etc.)
                { id: "v1", title: "Prévention & santé", youtubeId: "dQw4w9WgXcQ", thumbnail: "/videos/thumb-01.jpg", publishedAt: "2025-01-10" },
                { id: "v2", title: "Conseils nutrition", youtubeId: "tAGnKpE4NCI", thumbnail: "/videos/thumb-02.jpg", publishedAt: "2025-01-05" },
                { id: "v3", title: "One Health expliqué", youtubeId: "9bZkp7q19f0", thumbnail: "/videos/thumb-03.jpg", publishedAt: "2025-01-01" },
              ]}
            />

            {/* ——— Bandes thématiques ——— */}
            <PairStrip title="Dossiers"    items={dossiersSafe.map(toItem)}   seeAllHref="/dossiers"   cols={3} />
            <PairStrip title="Interviews"  items={interviewsSafe.map(toItem)} seeAllHref="/interviews" cols={3} />
            <PairStrip title="Tribune"     items={tribunesSafe.map(toItem)}   seeAllHref="/tribunes"   cols={3} />

            {/* ——— Autres articles ——— */}
            <PairStrip
              title="Nos autres articles"
              items={others.map(toItem)}
              seeAllHref="/articles"
              cols={3}
            />
          </div>

          {/* === SIDEBAR === */}
          <aside className="space-y-6">
            <div className="rounded border p-4">
              <h3 className="font-semibold">Magazine</h3>
              <p className="text-sm text-neutral-600 mt-1">Découvrez notre numéro en cours.</p>
              <Link href="/magazine" className="inline-block mt-3 text-blue-700 hover:underline">
                Voir le magazine →
              </Link>
            </div>

            {/* Emplacement pub sidebar 300x250 */}
            <AdSlot
              id="sidebar-300x250"
              width={1070}
              height={270}
              imgSrc="/ads/sidebar-300x250.jpg"
              className="w-full"
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

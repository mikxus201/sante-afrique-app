// src/components/ArticleCard.tsx
import Link from "next/link";
import SafeImage from "@/components/SafeImage";

type Props = {
  slug: string;          // ex: "bien-utiliser-un-antiseptique"
  title: string;
  excerpt?: string;
  cover?: string | null; // URL image absolue ou chemin relatif
  category?: string;
  /** Optionnel : prioriser le chargement si card au-dessus de la ligne de flottaison */
  priority?: boolean;
};

/* ===== Helpers URL autonomes (gèrent les chemins relatifs Laravel) ===== */
const trimSlash = (s: string) => s.replace(/\/+$/, "");
const apiRoot = () =>
  trimSlash(
    (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api$/i, "")
  );
const isAbs = (u: string) => /^https?:\/\//i.test(u);

/** Normalise un chemin d’image en URL publique exploitable */
function toPublicImageUrl(raw?: string | null): string | null {
  if (!raw) return null;
  let p = String(raw).trim().replace(/\\/g, "/");
  if (!p) return null;

  if (isAbs(p)) return p; // déjà absolue

  // nettoie un éventuel "public/" et les "/" initiaux
  p = p.replace(/^\/+/, "").replace(/^public\//i, "");

  // cas courants Laravel (storage, uploads…)
  if (/^(storage|uploads|images|img|media)\//i.test(p)) {
    return `${apiRoot()}/${p}`;
  }

  // fallback générique
  return `${apiRoot()}/storage/${p}`;
}

export default function ArticleCard({ slug, title, excerpt, cover, category, priority = false }: Props) {
  const img = toPublicImageUrl(cover); // <- clé : rend l'URL toujours exploitable

  return (
    <Link
      href={`/articles/${slug}`}
      className="group relative block overflow-hidden rounded-xl border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
    >
      <div className="relative aspect-[4/3] bg-neutral-100">
        <SafeImage
          src={img ?? null}
          alt={title}
          fill
          sizes="(max-width:768px) 100vw, 360px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          priority={priority}
        />
        {/* Badge visuel, non cliquable */}
        <span className="pointer-events-none absolute left-3 bottom-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-blue-700 shadow-sm">
          Lire +
        </span>
      </div>

      <div className="p-3">
        {category ? (
          <p className="text-[11px] uppercase tracking-wide text-neutral-500">{category}</p>
        ) : null}
        <h3 className="mt-0.5 text-sm font-semibold text-neutral-900 line-clamp-2 group-hover:text-blue-700">
          {title}
        </h3>
        {excerpt ? (
          <p className="mt-1 text-xs text-neutral-600 line-clamp-2">{excerpt}</p>
        ) : null}
      </div>
    </Link>
  );
}

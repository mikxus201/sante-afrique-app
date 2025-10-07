// src/components/FeaturedStrip.tsx
import Link from "next/link";
import SafeImage from "@/components/SafeImage";

/** Ton item peut venir déjà "préparé" (image/href) ou brut de l'API. */
type Article = {
  id: string | number;
  title: string;
  excerpt?: string | null;

  // si l'image est déjà préparée par le mapping parent :
  image?: string | null;

  // champs possibles renvoyés par l'API :
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
  cover?: string | null;
  cover_url?: string | null;
  photo?: string | null;

  // lien
  href: string;

  // catégorie texte OU objet
  category?: string | null;
  section?: { name?: string | null } | null;
  rubrique?: { name?: string | null } | null;
};

/* ===== Helpers URL (autonomes) ===== */
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

  p = p.replace(/^\/+/, "").replace(/^public\//i, "");
  if (/^(storage|uploads|images|img|media)\//i.test(p)) {
    return `${apiRoot()}/${p}`;
  }
  return `${apiRoot()}/storage/${p}`;
}

/** Choisit la meilleure clé d'image présente sur l’item */
function pickImage(a: Article): string | null {
  return (
    toPublicImageUrl(
      a.image ||
        a.image_url ||
        a.thumbnail_url ||
        a.cover_url ||
        a.thumbnail ||
        a.cover ||
        a.photo ||
        null
    ) || null
  );
}

/** Catégorie “lisible” même si l’API renvoie un objet */
function pickCategory(a: Article): string {
  return (a.category || a.section?.name || a.rubrique?.name || "") as string;
}

type Props = { items: Article[]; title?: string };

export default function FeaturedStrip({ items, title = "Articles à la une" }: Props) {
  if (!items?.length) return null;

  // on normalise pour être certain d’avoir image et catégorie
  const norm = items.map((a) => ({
    ...a,
    _image: pickImage(a),
    _category: pickCategory(a),
  }));

  const top = norm.slice(0, 6);

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-extrabold">{title}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1.2fr,0.9fr] gap-6">
        {top[0] && (
          <Link href={top[0].href} className="group rounded-lg border p-5 hover:shadow transition">
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
              <div>
                <h3 className="text-[20px] leading-snug font-bold group-hover:text-blue-700">
                  {top[0].title}
                </h3>
                {top[0].excerpt && (
                  <p className="mt-3 text-[14px] leading-6 text-neutral-800 line-clamp-6">
                    {top[0].excerpt}
                  </p>
                )}
                {top[0]._category && (
                  <p className="mt-2 text-xs text-neutral-500">{top[0]._category}</p>
                )}
              </div>
            </div>
          </Link>
        )}

        {top[1] && (
          <Link
            href={top[1].href}
            className="group rounded-lg overflow-hidden border hover:shadow transition"
          >
            <div className="relative w-full h-[360px] md:h-[420px] bg-neutral-100">
              <SafeImage
                src={top[1]._image ?? null}
                alt={top[1].title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width:768px) 100vw, 50vw"
                priority
              />
            </div>
          </Link>
        )}

        {top[2] && (
          <Link
            href={top[2].href}
            className="group rounded-lg overflow-hidden border hover:shadow transition"
          >
            <div className="relative h-[220px] w-full bg-neutral-100">
              <SafeImage
                src={top[2]._image ?? null}
                alt={top[2].title}
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h4 className="font-semibold leading-snug group-hover:text-blue-700">
                {top[2].title}
              </h4>
              {top[2]._category && (
                <p className="mt-1 text-xs text-neutral-500">{top[2]._category}</p>
              )}
            </div>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {top.slice(3, 7).map((a) => (
          <Link
            key={a.id}
            href={a.href}
            className="group rounded-lg overflow-hidden border hover:shadow transition"
          >
            <div className="relative h-[120px] w-full bg-neutral-100">
              <SafeImage
                src={a._image ?? null}
                alt={a.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                sizes="(max-width:768px) 100vw, 25vw"
              />
            </div>
            <div className="p-3">
              {a._category && <p className="text-[11px] text-neutral-500">{a._category}</p>}
              <h5 className="mt-1 text-[13px] font-semibold leading-snug line-clamp-2">
                {a.title}
              </h5>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

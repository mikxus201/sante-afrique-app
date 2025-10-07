// src/components/SuggestedList.tsx
import Link from "next/link";
import SafeImage from "@/components/SafeImage";

export type SuggestedItem = {
  id: number | string;
  title: string;
  href: string;

  // si déjà préparé
  image?: string | null;

  // variations possibles venant de l’API (optionnelles)
  image_url?: string | null;
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  cover?: string | null;
  cover_url?: string | null;
  photo?: string | null;

  excerpt?: string | null;
};

/* ===== Helpers URL image ===== */
const trimSlash = (s: string) => s.replace(/\/+$/, "");
const apiRoot = () =>
  trimSlash(
    (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api$/i, "")
  );
const isAbs = (u: string) => /^https?:\/\//i.test(u);

function toPublicImageUrl(raw?: string | null): string | null {
  if (!raw) return null;
  let p = String(raw).trim().replace(/\\/g, "/");
  if (!p) return null;

  if (isAbs(p)) return p; // déjà absolue

  // nettoie "/" initiaux et "public/"
  p = p.replace(/^\/+/, "").replace(/^public\//i, "");

  // cas Laravel/CDN courants
  if (/^(storage|uploads|images|img|media)\//i.test(p)) {
    return `${apiRoot()}/${p}`;
  }

  // fallback générique
  return `${apiRoot()}/storage/${p}`;
}

function pickImage(it: SuggestedItem): string | null {
  return (
    toPublicImageUrl(
      it.image ||
        it.image_url ||
        it.thumbnail_url ||
        it.cover_url ||
        it.thumbnail ||
        it.cover ||
        it.photo ||
        null
    ) || null
  );
}

export default function SuggestedList({ items }: { items: SuggestedItem[] }) {
  if (!items?.length) return null;

  const norm = items.slice(0, 6).map((it) => ({ ...it, _image: pickImage(it) }));

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xl font-extrabold">À lire aussi</h2>
        <Link href="/articles" className="text-sm text-blue-700 hover:underline">
          Voir tout
        </Link>
      </div>

      <ul className="grid gap-6 md:grid-cols-3">
        {norm.map((it) => (
          <li
            key={it.id}
            className="border rounded-xl overflow-hidden hover:shadow-sm transition"
          >
            <Link href={it.href} aria-label={it.title}>
              <div className="relative w-full h-40 bg-neutral-100">
                <SafeImage
                  src={it._image ?? null}
                  alt={it.title}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold line-clamp-2">{it.title}</h3>
                {it.excerpt && (
                  <p className="text-sm opacity-80 line-clamp-2 mt-1">{it.excerpt}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

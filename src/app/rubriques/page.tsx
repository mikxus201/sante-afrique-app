// src/app/rubriques/page.tsx
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { sections } from "../../../data/sections";

export const metadata = {
  title: "Rubriques | Santé Afrique",
  description: "Toutes nos rubriques éditoriales.",
};

/* ===== Helpers URL (pour chemins relatifs Laravel/CDN) ===== */
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
  if (isAbs(p)) return p;

  // nettoie / public/
  p = p.replace(/^\/+/, "").replace(/^public\//i, "");

  // chemins courants servis par Laravel (ou CDN)
  if (/^(storage|uploads|images|img|media)\//i.test(p)) {
    return `${apiRoot()}/${p}`;
  }
  // fallback générique
  return `${apiRoot()}/storage/${p}`;
}

/** Choisit la meilleure image dispo pour une rubrique (section) */
function pickSectionImage(r: any): string | null {
  const src =
    r?.hero ||
    r?.image_url ||
    r?.thumbnail_url ||
    r?.cover_url ||
    r?.image ||
    r?.thumbnail ||
    r?.cover ||
    r?.thumb ||
    r?.photo ||
    r?.items?.[0]?.thumb ||
    r?.items?.[0]?.thumbnail ||
    r?.items?.[0]?.image ||
    null;

  return toPublicImageUrl(src);
}

export default function RubriquesIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span className="mx-1">/</span>
        <span>Rubriques</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-extrabold">Rubriques</h1>
      <p className="mt-1 text-neutral-600">
        Explorez nos dossiers, interviews, tribunes et bien plus.
      </p>

      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {sections.map((r: any) => {
          const img = pickSectionImage(r);
          return (
            <li key={r.slug} className="group overflow-hidden rounded border bg-white hover:shadow">
              <Link href={`/rubriques/${r.slug}`}>
                <div className="relative h-36 w-full bg-neutral-100">
                  <SafeImage
                    src={img ?? null}
                    alt={r.label}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-semibold">{r.label}</h2>
                  {r.description && (
                    <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{r.description}</p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

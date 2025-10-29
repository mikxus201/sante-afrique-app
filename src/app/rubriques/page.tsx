// src/app/rubriques/page.tsx
import Link from "next/link";
import SafeImage from "@/components/SafeImage";

export const metadata = {
  title: "Rubriques | Santé Afrique",
  description: "Toutes nos rubriques éditoriales.",
};

/* ===== Helpers URL ===== */
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
  p = p.replace(/^\/+/, "").replace(/^public\//i, "");
  if (/^(storage|uploads|images|img|media)\//i.test(p)) return `${apiRoot()}/${p}`;
  return `${apiRoot()}/storage/${p}`;
}

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
    r?.picture ||
    r?.media ||
    r?.items?.[0]?.thumb ||
    r?.items?.[0]?.thumbnail ||
    r?.items?.[0]?.image ||
    null;
  return toPublicImageUrl(src);
}

const slugify = (s: string) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/* ===== Fetch API (avec fallback local) ===== */
async function fetchJSON(url: string) {
  const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 200)}`);
  if (/^\s*<!doctype html>|^\s*<html/i.test(text)) throw new Error("HTML returned");
  return JSON.parse(text);
}

async function getSections(): Promise<any[]> {
  const root = apiRoot();
  const candidates = [
    `${root}/api/sections`,
    `${root}/api/rubriques`,
    `${root}/api/categories`,
    `${root}/api/sections?perPage=100`,
  ];

  for (const url of candidates) {
    try {
      const payload = await fetchJSON(url);
      const arr = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      if (arr.length) return arr;
    } catch {
      /* ignore and try next */
    }
  }

  // 🔙 Fallback local pour le dev
  try {
    const mod: any = await import("../../../data/sections");
    const local = mod.sections || mod.default || [];
    if (Array.isArray(local) && local.length) return local;
  } catch {
    /* no local file */
  }
  return [];
}

/* ===== Page ===== */
export default async function RubriquesIndexPage() {
  const sections = await getSections();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span className="mx-1">/</span>
        <span>Rubriques</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-extrabold">Rubriques</h1>
      <p className="mt-1 text-neutral-600">Explorez nos dossiers, interviews, tribunes et bien plus.</p>

      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {sections.map((r: any) => {
          const label: string = r?.label ?? r?.name ?? r?.title ?? r?.slug ?? "Rubrique";
          const normSlug = slugify(r?.slug ?? label);
          const img = pickSectionImage(r);
          const desc: string | null = r?.description ?? r?.excerpt ?? r?.summary ?? null;

          return (
            <li key={normSlug} className="group overflow-hidden rounded border bg-white hover:shadow">
              <Link href={`/rubriques/${normSlug}`}>
                <div className="relative h-36 w-full bg-neutral-100">
                  <SafeImage
                    src={img ?? null}
                    alt={label}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-semibold">{label}</h2>
                  {desc && <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{desc}</p>}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

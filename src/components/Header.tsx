// src/components/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { sections } from "../../data/sections";
import { me } from "@/lib/auth"; // notre helper qui appelle /api/auth/me
import { useAuth } from "@/lib/auth-client"; // contexte auth
import { logout } from "@/lib/auth";

// ======================
// Types & helpers
// ======================
type Article = {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  image?: string | null;
  image_url?: string | null;
  cover?: string | null;
  cover_url?: string | null;
  photo?: string | null;
  category?: string | { name?: string; slug?: string } | null;
  section?: { name?: string; slug?: string } | null;
  published_at?: string | null;
  date?: string | null;
};

type User = {
  id: number | string;
  name?: string | null;
  email?: string | null;
  nom?: string | null;
  prenoms?: string | null;
};

const trimSlash = (s: string) => s.replace(/\/+$/, "");
const apiRoot = () => {
  const raw = String(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");
  return trimSlash(raw).replace(/\/api$/i, "");
};
const apiUrl = (p: string) => `${apiRoot()}/api${p.startsWith("/") ? "" : "/"}${p}`;

function toPublic(url?: string | null): string | null {
  const raw = String(url ?? "").trim();
  if (!raw) return null;
  if (/^(data:|https?:\/\/|\/\/)/i.test(raw)) return raw;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${apiRoot()}${path}`;
}

function pickCardImage(a: Article): string | null {
  const cand =
    a.thumbnail_url ||
    a.cover_url ||
    a.image_url ||
    a.image ||
    a.thumbnail ||
    a.cover ||
    a.photo ||
    "";
  return toPublic(cand);
}

function getCategoryLabel(a: Article): string {
  if (!a) return "";
  if (typeof a.category === "string") return a.category;
  return a.section?.name || a.category?.name || "";
}

function dedupe(list: Article[]) {
  const seen = new Set<string>();
  return list.filter((it) => {
    const key = String(it.id ?? it.slug ?? Math.random());
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* Nom affiché + initiales robustes */
function displayName(u: User | null): string | undefined {
  if (!u) return undefined;
  const full = (u.name || "").trim();
  if (full) return full;
  const alt = `${(u.prenoms || "").trim()} ${(u.nom || "").trim()}`.trim();
  return alt || undefined;
}
function initials(name?: string | null): string {
  const n = String(name ?? "").trim();
  if (!n) return "??";
  const parts = n.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export default function Header() {
  // --- AUTH depuis le contexte ---
  const { user, setUser, signOut } = useAuth();
  const [userLoading, setUserLoading] = useState(true);

  // Menu utilisateur (dropdown)
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Rehydratation au montage : si pas de user, on tente /api/me
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!user) {
          const res = await me();
          if (!mounted) return;
          const u = (res as any)?.data ?? null;
          if (u) setUser(u);
        }
      } catch {} finally {
        if (mounted) setUserLoading(false);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======= Recherche (structure identique) =======
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setItems([]);
      setOpen(false);
      setError(null);
      abortRef.current?.abort();
      return;
    }
    setLoading(true);
    setError(null);

    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const ctl = new AbortController();
      abortRef.current = ctl;

      const queries = [
        apiUrl(`/articles?search=${encodeURIComponent(term)}&perPage=6`),
        apiUrl(`/articles?q=${encodeURIComponent(term)}&perPage=6`),
        apiUrl(`/search?q=${encodeURIComponent(term)}&perPage=6`),
      ];

      let found: Article[] = [];
      for (const u of queries) {
        try {
          const res = await fetch(u, {
            headers: { Accept: "application/json" },
            cache: "no-store",
            signal: ctl.signal,
          });
          const txt = await res.text();
          if (!res.ok) continue;
          const payload = txt ? JSON.parse(txt) : null;
          const arr: Article[] = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.items)
            ? payload.items
            : [];
          if (arr.length) {
            found = arr;
            break;
          }
        } catch (e) {
          if ((e as any)?.name === "AbortError") return;
        }
      }

      setItems(dedupe(found).slice(0, 6));
      setOpen(true);
      setLoading(false);
      if (!found.length) setError(null);
    }, 220);

    return () => clearTimeout(t);
  }, [q]);

  const toImg = (a: Article) => pickCardImage(a);
  const nameForUi = displayName(user as User | null);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b">
      {/* ===== Bande 1 ===== */}
      <div className="h-14">
        <div className="mx-auto max-w-6xl h-full px-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* GAUCHE */}
          <nav className="hidden sm:flex items-center justify-start text-[15px] divide-x divide-neutral-200">
            <Link href="/" className="hover:underline px-3">Accueil</Link>
            <Link href="/offres-emploi" className="hover:underline px-3">Offres d’emploi</Link>
            <Link href="/partenaires" className="hover:underline px-3">Espace Partenaires</Link>
          </nav>

          {/* LOGO */}
          <div className="flex items-center justify-center">
            <Link href="/" className="flex items-baseline gap-1 font-extrabold text-[30px]" aria-label="Santé Afrique — Accueil">
              <span className="text-blue-700">santé</span>
              <span className="text-neutral-900">afrique</span>
            </Link>
          </div>

          {/* DROITE */}
          <nav className="flex items-center justify-end text-[15px] divide-x divide-neutral-200">
            <Link href="/magazine" className="hover:underline px-3">Magazine</Link>

            {/* Utilisateur */}
            <span className="px-3">
              {userLoading ? (
                <span className="text-neutral-500">…</span>
              ) : user ? (
                <div className="relative z-[70]" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((s) => !s)}
                    className="inline-flex items-center gap-2"
                    title={nameForUi ?? (user.email ?? "Mon compte")}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white text-xs font-bold">
                      {initials(nameForUi)}
                    </span>
                    <span className="hidden sm:inline truncate max-w-[160px]">
                      {nameForUi}
                    </span>
                    <span aria-hidden>▾</span>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 z-[70] bg-white border rounded shadow-md min-w-[200px] overflow-hidden">
                      <div className="px-3 py-2 text-xs text-neutral-600 border-b">
                        {user.email}
                      </div>
                      <Link
                        href="/compte"
                        className="block px-3 py-2 hover:bg-neutral-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Mon espace
                      </Link>
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-neutral-50"
                        onClick={async () => {
                           setMenuOpen(false);
                           await logout();      // ← invalide la session côté Laravel
                           signOut();           // ← vide le contexte côté front
                        }}
                      >
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/connexion" className="hover:underline">
                  Se connecter
                </Link>
              )}
            </span>

            <span className="px-3">
              <Link
                href="/abonnement"
                className="inline-flex rounded-full bg-amber-200/70 px-3 py-1.5 font-semibold text-amber-900 hover:brightness-95"
              >
                S’abonner
              </Link>
            </span>
          </nav>
        </div>
      </div>

      {/* ===== Bande 2 ===== */}
      <div className="h-14 border-t">
        <div className="mx-auto max-w-6xl h-full px-4 flex items-center justify-center">
          <nav className="max-w-full overflow-x-auto no-scrollbar">
            <ul className="flex items-center gap-5 text-[15px] whitespace-nowrap">
              {sections.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/rubriques/${r.slug}`}
                    className="inline-block rounded px-3 py-2 font-semibold hover:text-blue-700"
                  >
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* ===== Bande 3 : recherche ===== */}
      <div className="h-14 border-t bg-neutral-50">
        <div className="mx-auto max-w-6xl h-full px-4 flex items-center justify-center">
          <form action="/recherche" method="get" aria-label="Recherche" className="w-full max-w-2xl relative">
            <div ref={wrapRef} className="relative">
              <input
                type="search"
                name="q"
                placeholder="Rechercher…"
                className="w-full rounded-full border bg-white px-5 py-2.5 pr-12 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-600/40"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => q.trim() && setOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setOpen(false);
                }}
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:text-neutral-900"
                aria-label="Rechercher"
                title="Rechercher"
              >
                🔎
              </button>

              {open && (
                <div className="absolute z-50 mt-2 w-full rounded-lg border bg-white shadow-lg overflow-hidden">
                  {loading ? (
                    <div className="p-3 text-sm text-neutral-500">Recherche…</div>
                  ) : error ? (
                    <div className="p-3 text-sm text-red-600">{error}</div>
                  ) : items.length === 0 ? (
                    <div className="p-3 text-sm text-neutral-500">Aucun résultat.</div>
                  ) : (
                    <ul className="max-h-[70vh] overflow-auto">
                      {items.map((a) => {
                        const img = toImg(a);
                        const cat = getCategoryLabel(a);
                        const when = a.published_at || a.date || null;
                        return (
                          <li key={a.id}>
                            <Link
                              href={`/articles/${a.slug}`}
                              className="flex gap-3 p-3 hover:bg-neutral-50"
                              onClick={() => setOpen(false)}
                            >
                              <div className="relative flex-shrink-0 w-14 h-14 bg-neutral-100 rounded">
                                {img && (
                                  <Image
                                    src={img}
                                    alt={a.title}
                                    fill
                                    sizes="56px"
                                    className="object-cover rounded"
                                  />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium line-clamp-2">{a.title}</div>
                                <div className="text-xs text-neutral-500">
                                  {cat}
                                  {when ? (
                                    <>
                                      {cat ? " • " : ""}
                                      {new Date(when).toLocaleDateString("fr-FR")}
                                    </>
                                  ) : null}
                                </div>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {q.trim().length >= 2 && (
                    <div className="border-t p-2 text-right">
                      <Link
                        href={`/articles?q=${encodeURIComponent(q.trim())}`}
                        className="inline-block text-sm px-3 py-1 rounded border hover:bg-neutral-50"
                        onClick={() => setOpen(false)}
                      >
                        Voir tous les résultats
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}

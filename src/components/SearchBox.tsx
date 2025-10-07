// src/components/SearchBox.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

/* ---- Types min ---- */
type Article = {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  category?: string | null;
  published_at?: string | null;
};

type Paginator<T> = {
  current_page: number; per_page: number; total: number; last_page: number; data: T[];
};

/* ---- Helpers URL ---- */
const trimSlash = (s: string) => s.replace(/\/+$/, "");
const apiRoot = () =>
  trimSlash((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api$/i, ""));
const apiUrl = (p: string) => `${apiRoot()}/api${p.startsWith("/") ? "" : "/"}${p}`;
const toImg = (a: Article) => {
  const t = a.thumbnail_url || a.thumbnail;
  if (!t) return null;
  return /^https?:\/\//i.test(t) ? t : `${apiRoot()}/${t.replace(/^\/+/, "")}`;
};

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  // Fermer au clic extérieur
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Debounce
  useEffect(() => {
    if (!q.trim()) {
      setItems([]);
      setOpen(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const t = setTimeout(async () => {
      try {
        const sp = new URLSearchParams();
        sp.set("search", q.trim());
        sp.set("perPage", "6");
        const res = await fetch(apiUrl(`/articles?${sp.toString()}`), {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const raw = await res.text();
        if (!res.ok) throw new Error(raw);
        const payload = JSON.parse(raw);
        const data: Article[] = Array.isArray(payload) ? payload : payload?.data ?? [];
        setItems(data);
        setOpen(true);
        setActive(0);
      } catch (e: any) {
        setError("Erreur réseau");
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  // Navigation clavier
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    }
  }

  const showFooterLink = useMemo(() => q.trim().length >= 2, [q]);

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => q.trim() && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Rechercher un article…"
        className="w-full h-10 rounded-full border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
      />

      {/* Dropdown */}
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
              {items.map((a, i) => {
                const img = toImg(a);
                const isActive = i === active;
                return (
                  <li key={a.id} className={isActive ? "bg-neutral-50" : ""}>
                    <Link
                      href={`/articles/${a.slug}`}
                      className="flex gap-3 p-3 hover:bg-neutral-50"
                      onClick={() => setOpen(false)}
                    >
                      <div className="relative flex-shrink-0 w-14 h-14 bg-neutral-100 rounded">
                        {img && <Image src={img} alt={a.title} fill className="object-cover rounded" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium line-clamp-2">{a.title}</div>
                        <div className="text-xs text-neutral-500">
                          {(a.category || "").toString()}
                          {a.published_at ? (
                            <>
                              {a.category ? " • " : ""}{new Date(a.published_at).toLocaleDateString("fr-FR")}
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

          {/* Pied : voir tous les résultats */}
          {showFooterLink && (
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
  );
}

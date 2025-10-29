// src/components/mag/MagReader.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Page = { id: number; number: number; url: string; w?: number; h?: number };

export default function MagReader({
  pages,
  issue,
  user,
}: {
  pages: Page[];
  issue: any;
  user: { id: number; name?: string; email?: string };
}) {
  const [zoom, setZoom] = useState(1);
  const [current, setCurrent] = useState(1);
  const email = user?.email ?? "abonne@santeafrique";

  useEffect(() => {
    const off = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("contextmenu", off);
    return () => window.removeEventListener("contextmenu", off);
  }, []);

  const watermark = useMemo(
    () => `${email} — ${new Date().toLocaleString("fr-FR")}`,
    [email]
  );

  return (
    <section className="relative">
      {/* Toolbar */}
      <div className="mb-3 flex items-center gap-2 text-sm">
        <span className="px-2 py-1 rounded border">
          Page {current} / {pages.length}
        </span>
        <button
          className="px-2 py-1 rounded border"
          onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
        >
          −
        </button>
        <span className="px-2">{Math.round(zoom * 100)}%</span>
        <button
          className="px-2 py-1 rounded border"
          onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
        >
          +
        </button>
        <div className="ml-auto flex gap-2">
          <select
            className="rounded border px-2 py-1"
            value={current}
            onChange={(e) => setCurrent(Number(e.target.value))}
          >
            {pages.map((p) => (
              <option key={p.id} value={p.number}>
                Page {p.number}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Viewer */}
      <div className="relative border rounded-lg overflow-hidden bg-neutral-100">
        <div
          aria-hidden
          className="pointer-events-none select-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(0,0,0,0.08) 0 1px, transparent 1px 60px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 60px)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none select-none absolute inset-0 grid place-items-center text-neutral-700/15 text-xl font-semibold"
          style={{ transform: "rotate(-20deg)" }}
        >
          <div className="text-center leading-relaxed">{watermark}</div>
        </div>

        <div className="relative z-10 grid place-items-center p-4">
          <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pages[current - 1]?.url}
              alt={`Page ${current}`}
              className="max-w-full h-auto shadow-sm"
              draggable={false}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Bloque (grossièrement) l’impression */
        @media print {
          body {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}

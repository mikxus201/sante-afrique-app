// src/components/VideoRail.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { API_PREFIX } from "@/lib/api";

type Video = {
  id: string;
  title: string;
  youtubeId?: string;
  src?: string;
  thumbnail?: string;
  publishedAt?: string;
};

type Props = {
  title?: string;
  videos?: Video[]; // optionnel
};

type ApiVideo = {
  id: string | number;
  title: string;
  youtube_id?: string | null;
  src?: string | null;
  thumbnail_url?: string | null;
  published_at?: string | null;
};

// Construit une URL robuste sans double /api
function buildApiUrl(endpoint: string) {
  const base = (API_PREFIX || "").replace(/\/+$/, ""); // enlève les '/' finaux
  const path = base.endsWith("/api") ? endpoint.replace(/^\/api/, "") : endpoint; // évite /api/api
  // base vide => URL relative (utilise les rewrites Next)
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default function VideoRail({ title = "Vidéos", videos = [] }: Props) {
  const [remote, setRemote] = useState<Video[] | null>(null);
  const safe = Array.isArray(videos) ? videos : [];

  // Autofetch si aucune vidéo n'est passée en props
  useEffect(() => {
    if (safe.length > 0) return; // on respecte le flux existant
    let alive = true;
    (async () => {
      try {
        const url = buildApiUrl("/api/videos");
        const res = await fetch(url, {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json();
        const items: ApiVideo[] = json?.items ?? [];
        const mapped: Video[] = items.map((v) => {
          const youtubeId = v.youtube_id || undefined;
          // Fallback vignette YouTube si aucune miniature côté back
          const fallbackThumb =
            !v.thumbnail_url && youtubeId
              ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
              : undefined;
          return {
            id: String(v.id),
            title: v.title,
            youtubeId,
            src: v.src || undefined,
            thumbnail: v.thumbnail_url || fallbackThumb,
            publishedAt: v.published_at || undefined,
          };
        });
        if (alive) setRemote(mapped);
      } catch {
        if (alive) setRemote([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [safe.length]);

  const data = safe.length > 0 ? safe : remote ?? [];

  const sorted = useMemo(
    () =>
      [...data].sort(
        (a, b) =>
          new Date(b.publishedAt ?? 0).getTime() -
          new Date(a.publishedAt ?? 0).getTime()
      ),
    [data]
  );

  const [current, setCurrent] = useState<Video | null>(sorted[0] ?? null);

  // Si la liste change (prop ou fetch), on ajuste la sélection
  useEffect(() => {
    setCurrent((prev) => {
      if (!sorted.length) return null;
      if (!prev) return sorted[0];
      const stillExists = sorted.find((v) => v.id === prev.id);
      return stillExists ?? sorted[0];
    });
  }, [sorted]);

  if (!sorted.length || !current) return null;

  return (
    <section className="rounded-lg bg-neutral-900 p-6 text-white">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xl font-extrabold">{title}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lecteur principal */}
        <div className="lg:col-span-2">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
            {current.youtubeId ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube.com/embed/${current.youtubeId}?rel=0`}
                title={current.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : current.src ? (
              <video
                className="absolute inset-0 h-full w-full"
                controls
                poster={current.thumbnail}
              >
                <source src={current.src} />
              </video>
            ) : (
              <div className="absolute inset-0 grid place-items-center text-neutral-400">
                Aucune source vidéo
              </div>
            )}
          </div>
          <p className="mt-3 text-sm text-neutral-300">{current.title}</p>
        </div>

        {/* Miniatures */}
        <div className="space-y-3">
          {sorted.slice(0, 6).map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setCurrent(v)}
              className={clsx(
                "w-full flex gap-3 rounded-md border border-white/10 p-2 text-left hover:bg-white/5",
                current.id === v.id && "ring-2 ring-blue-400"
              )}
            >
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.thumbnail || "/videos/placeholder.jpg"}
                  alt={v.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-sm">
                <p className="line-clamp-2">{v.title}</p>
                {v.publishedAt && (
                  <p className="mt-1 text-xs text-neutral-400">
                    {new Date(v.publishedAt).toLocaleDateString("fr-FR")}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

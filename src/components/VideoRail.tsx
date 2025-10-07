"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

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

export default function VideoRail({ title = "Vidéos", videos = [] }: Props) {
  const safe = Array.isArray(videos) ? videos : [];

  const sorted = useMemo(
    () =>
      [...safe].sort(
        (a, b) =>
          new Date(b.publishedAt ?? 0).getTime() -
          new Date(a.publishedAt ?? 0).getTime()
      ),
    [safe]
  );

  const [current, setCurrent] = useState<Video | null>(sorted[0] ?? null);
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
                src={`https://www.youtube.com/embed/${current.youtubeId}`}
                title={current.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : current.src ? (
              <video className="absolute inset-0 h-full w-full" controls poster={current.thumbnail}>
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

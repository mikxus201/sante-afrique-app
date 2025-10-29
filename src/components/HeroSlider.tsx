// src/components/HeroSlider.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import SafeImage from "@/components/SafeImage";

type Slide = { src?: string | null; title: string; href?: string };

export default function HeroSlider({
  slides,
  className = "",
  aspect = "aspect-[20/3]",
  autoplayMs = 5000,
  pauseOnHover = true,
}: {
  slides: Slide[];
  className?: string;
  aspect?: string;
  /** Intervalle d’auto-défilement (ms). */
  autoplayMs?: number;
  /** Mettre en pause au survol/focus. */
  pauseOnHover?: boolean;
}) {
  const hasSlides = Array.isArray(slides) && slides.length > 0;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const canAutoplay = hasSlides && slides.length > 1 && autoplayMs > 0;

  // Clamp l’index si la liste change
  useEffect(() => {
    if (!hasSlides) return;
    setI((prev) => Math.min(prev, slides.length - 1));
  }, [hasSlides, slides.length]);

  // Auto-défilement
  useEffect(() => {
    if (!canAutoplay || paused) return;
    const id = setInterval(() => setI((p) => (p + 1) % slides.length), autoplayMs);
    return () => clearInterval(id);
  }, [canAutoplay, paused, autoplayMs, slides.length]);

  // Gestion du pause au survol/focus
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onEnter = () => pauseOnHover && setPaused(true);
  const onLeave = () => pauseOnHover && setPaused(false);

  // Swipe tactile simple
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    const threshold = 40; // px
    if (delta > threshold) prev();
    else if (delta < -threshold) next();
  };

  const prev = () => setI((p) => (p - 1 + slides.length) % slides.length);
  const next = () => setI((p) => (p + 1) % slides.length);

  if (!hasSlides) return null;
  const s = slides[i];

  // Accessibilité: libellé de la région + pagination
  const pagination = useMemo(
    () => `${i + 1} / ${slides.length}`,
    [i, slides.length]
  );

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero slider"
      aria-live="polite"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className={`relative w-full overflow-hidden rounded-lg ${aspect} ${className}`}
    >
      {/* Image / fond */}
      {s?.src ? (
        <SafeImage
          src={s.src ?? null}
          alt={s.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-300" aria-hidden="true" />
      )}

      {/* Voile */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Titre + CTA */}
      <div className="absolute bottom-5 left-5 max-w-[70%]">
        <h2 className="text-white text-2xl md:text-3xl font-extrabold drop-shadow">
          {s.title}
        </h2>
        {s.href && (
          <Link
            href={s.href}
            className="mt-3 inline-block rounded bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            Lire
          </Link>
        )}
      </div>

      {/* Flèches */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Slide précédent"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/35 px-3 py-2 text-white backdrop-blur hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Slide suivant"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/35 px-3 py-2 text-white backdrop-blur hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            ›
          </button>
        </>
      )}

      {/* Bullets + pagination text */}
      <div className="absolute right-5 bottom-5 flex items-center gap-3">
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Aller au slide ${idx + 1}`}
              aria-current={idx === i ? "true" : undefined}
              onClick={() => setI(idx)}
              className={`h-2 w-2 rounded-full ${idx === i ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
        <span className="text-white/80 text-xs">{pagination}</span>
      </div>
    </div>
  );
}

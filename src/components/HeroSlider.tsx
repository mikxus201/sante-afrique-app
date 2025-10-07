// src/components/HeroSlider.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SafeImage from "@/components/SafeImage";

type Slide = { src?: string | null; title: string; href?: string };

export default function HeroSlider({
  slides,
  className = "",
  aspect = "aspect-[20/3]",
}: {
  slides: Slide[];
  className?: string;
  aspect?: string;
}) {
  const hasSlides = Array.isArray(slides) && slides.length > 0;
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!hasSlides) return;
    const id = setInterval(() => setI((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [hasSlides, slides.length]);

  if (!hasSlides) return null;
  const s = slides[i];

  return (
    <div className={`relative w-full overflow-hidden rounded-lg ${aspect} ${className}`}>
      <SafeImage
        src={s.src ?? null}
        alt={s.title}
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      <div className="absolute bottom-5 left-5 max-w-[70%]">
        <h2 className="text-white text-2xl md:text-3xl font-extrabold drop-shadow">{s.title}</h2>
        {s.href && (
          <Link
            href={s.href}
            className="mt-3 inline-block rounded bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700"
          >
            Lire
          </Link>
        )}
      </div>

      <div className="absolute right-5 bottom-5 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Aller au slide ${idx + 1}`}
            onClick={() => setI(idx)}
            className={`h-2 w-2 rounded-full ${idx === i ? "bg-white" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}

// src/components/AdSlot.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SafeImage from "@/components/SafeImage";
import { API_PREFIX } from "@/lib/api";

type Props = {
  id: string;
  /** largeur max visuelle (px) */
  width: number;
  /** hauteur de référence (px) pour le ratio */
  height: number;

  /** URL de l'image (locale ou distante). Par défaut, un placeholder local. */
  imgSrc?: string | null;

  /** Optionnel : rendre la pub cliquable */
  href?: string;
  newTab?: boolean;
  rel?: string;

  /** Accessibilité & style */
  alt?: string;
  className?: string;
  noBorder?: boolean;

  /** Passé à next/image (si tu veux prioriser l’affichage du hero/top banner) */
  priority?: boolean;
};

type RemoteAd = {
  id: number;
  slot_key: string;
  title?: string | null;
  image_url?: string | null;
  link_url?: string | null;
  html_code?: string | null;
  width?: number | null;
  height?: number | null;
};

function sizesFromWidth(w: number) {
  // Sur mobile: 100vw ; au-delà, on plafonne à la largeur cible.
  return `(max-width: ${w}px) 100vw, ${w}px`;
}

// Construit une URL robuste sans double /api
function buildApiUrl(endpoint: string) {
  const base = (API_PREFIX || "").replace(/\/+$/, ""); // enlève les '/' finaux
  const path = base.endsWith("/api") ? endpoint.replace(/^\/api/, "") : endpoint; // évite /api/api
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default function AdSlot({
  id,
  width,
  height,
  imgSrc = "/ads/placeholder-ads.jpg",
  href,
  newTab,
  rel,
  alt = "Publicité",
  className = "",
  noBorder = false,
  priority = false,
}: Props) {
  const [remote, setRemote] = useState<RemoteAd | null>(null);

  useEffect(() => {
    let alive = true;
    const url = buildApiUrl(`/api/ad-slots?keys=${encodeURIComponent(id)}`);
    fetch(url, { cache: "no-store", credentials: "include" })
      .then(async (r) => {
        if (!r.ok) return null;
        const json = await r.json().catch(() => null);
        const item = json && json.items ? json.items[id] : null;
        if (alive) setRemote(item ?? null);
      })
      .catch(() => {
        if (alive) setRemote(null);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  // Dimensions effectives (le back peut fournir width/height)
  const W = Math.max(1, Number(remote?.width ?? width));
  const H = Math.max(1, Number(remote?.height ?? height));

  // Texte alternatif & lien final
  const finalAlt = (remote?.title ?? alt) || "Publicité";
  const finalHref = remote?.link_url ?? href;
  const finalNewTab = newTab ?? true; // Par défaut, ouvrir une pub en nouvel onglet
  const finalRel = rel || (finalNewTab ? "noopener noreferrer" : undefined);

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    finalHref ? (
      <Link
        href={finalHref}
        target={finalNewTab ? "_blank" : undefined}
        rel={finalRel}
        aria-label={finalAlt}
      >
        {children}
      </Link>
    ) : (
      <>{children}</>
    );

  // Si la régie fournit du HTML/script, on l'injecte prioritairement
  const hasHtml = !!remote?.html_code;

  return (
    <figure
      data-slot-id={id}
      aria-label={`Emplacement publicitaire ${id}`}
      className={[
        "relative overflow-hidden bg-white",
        noBorder ? "" : "rounded border border-neutral-200",
        className,
      ].join(" ")}
      style={{ width: "100%", maxWidth: W, aspectRatio: `${W}/${H}` }}
    >
      <div className="absolute inset-0">
        {hasHtml ? (
          // Le code régie gère souvent sa propre mise en page.
          // On garde le conteneur contraint par l'aspect-ratio pour éviter le CLS.
          <div
            className="h-full w-full"
            dangerouslySetInnerHTML={{ __html: remote!.html_code as string }}
            aria-label={finalAlt}
          />
        ) : (
          <Wrapper>
            <SafeImage
              src={(remote?.image_url ?? imgSrc) || null}
              alt={finalAlt}
              fill
              sizes={sizesFromWidth(W)}
              className="object-cover"
              priority={priority}
            />
          </Wrapper>
        )}
      </div>
      <figcaption className="sr-only">{finalAlt}</figcaption>
    </figure>
  );
}

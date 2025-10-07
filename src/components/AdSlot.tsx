// src/components/AdSlot.tsx
import Link from "next/link";
import SafeImage from "@/components/SafeImage";

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

function sizesFromWidth(w: number) {
  // Sur mobile: 100vw ; au-delà, on plafonne à la largeur cible.
  return `(max-width: ${w}px) 100vw, ${w}px`;
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
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    href ? (
      <Link
        href={href}
        target={newTab ? "_blank" : undefined}
        rel={rel || (newTab ? "noopener noreferrer" : undefined)}
        aria-label={alt}
      >
        {children}
      </Link>
    ) : (
      <>{children}</>
    );

  return (
    <figure
      data-slot-id={id}
      aria-label={`Emplacement publicitaire ${id}`}
      className={[
        "relative overflow-hidden bg-white",
        noBorder ? "" : "rounded border border-neutral-200",
        className,
      ].join(" ")}
      style={{ width: "100%", maxWidth: width, aspectRatio: `${width}/${height}` }}
    >
      <Wrapper>
        <div className="absolute inset-0">
          <SafeImage
            src={imgSrc ?? null}
            alt={alt}
            fill
            sizes={sizesFromWidth(width)}
            className="object-cover"
            priority={priority}
          />
        </div>
      </Wrapper>
      <figcaption className="sr-only">{alt}</figcaption>
    </figure>
  );
}

"use client";

type Props = {
  src?: string | null;
  name?: string | null;   // sert pour l'alt et le fallback lettre
  size?: number;          // px (défaut 56)
  rounded?: boolean;      // coins arrondis (défaut true)
  className?: string;
};

// Base API pour transformer les chemins relatifs ('/storage/...') en URL absolues
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

function toAbsolute(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;          // déjà absolue
  const p = url.startsWith("/") ? url : `/${url}`;    // garantit un seul '/'
  return `${API_BASE}${p}`;
}

export default function CompanyLogo({
  src,
  name,
  size = 56,
  rounded = true,
  className = "",
}: Props) {
  const finalSrc = toAbsolute(src);
  const alt = name ? `Logo ${name}` : "Logo entreprise";

  if (finalSrc) {
    return (
      <img
        src={finalSrc}
        alt={alt}
        width={size}
        height={size}
        className={`object-cover ${rounded ? "rounded-md" : ""} ${className}`}
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }

  // Fallback : pastille avec l'initiale
  const initials = (name || "?").trim().slice(0, 1).toUpperCase();
  return (
    <div
      aria-label={alt}
      role="img"
      className={`grid place-items-center bg-neutral-100 text-neutral-500 font-semibold ${rounded ? "rounded-md" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

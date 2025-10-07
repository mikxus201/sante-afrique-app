import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Slug minimal compatible edge (sans dépendance) */
function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // accents
    .toLowerCase()
    .trim()
    .replace(/&/g, "-and-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- Redirection magazine (déjà en place) ---
  const mag = pathname.match(/^\/magazine\/([^/]+)\/(pdf|flip|flipbook|reader)$/i);
  if (mag) {
    const id = mag[1];
    const url = req.nextUrl.clone();
    url.pathname = `/magazine/${id}/lire`;
    return NextResponse.redirect(url, 307);
  }

  // --- Canonicalisation des rubriques ---
  // /rubriques/:slug -> /rubriques/<slug-normalisé>
  let m = pathname.match(/^\/rubriques\/([^/]+)\/?$/i);
  if (m) {
    const raw = decodeURIComponent(m[1] || "");
    const norm = slugify(raw);
    if (raw !== norm) {
      const url = req.nextUrl.clone();
      url.pathname = `/rubriques/${norm}`;
      return NextResponse.redirect(url, 307);
    }
  }

  // /rubrique/:slug (singulier) -> /rubriques/<slug-normalisé>
  m = pathname.match(/^\/rubrique\/([^/]+)\/?$/i);
  if (m) {
    const raw = decodeURIComponent(m[1] || "");
    const norm = slugify(raw);
    const url = req.nextUrl.clone();
    url.pathname = `/rubriques/${norm}`;
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/magazine/:path*",
    "/rubriques/:path*", // plural
    "/rubrique/:path*",  // legacy/singulier
  ],
};

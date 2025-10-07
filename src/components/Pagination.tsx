// src/components/Pagination.tsx
import Link from "next/link";

type Props = {
  basePath: string;       // ex: "/articles"
  currentPage: number;    // 1-based
  pageSize: number;
  totalItems: number;
};

function pageHref(basePath: string, page: number) {
  const p = new URLSearchParams();
  if (page > 1) p.set("page", String(page));
  const qs = p.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function Pagination({ basePath, currentPage, pageSize, totalItems }: Props) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;

  const prev = currentPage > 1 ? currentPage - 1 : undefined;
  const next = currentPage < totalPages ? currentPage + 1 : undefined;

  // petite fenêtre de pages autour de la page courante
  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
      {prev && (
        <Link href={pageHref(basePath, prev)} className="rounded border px-3 py-1 text-sm hover:bg-neutral-50">
          ← Précédent
        </Link>
      )}
      <ul className="flex items-center gap-1">
        {start > 1 && (
          <>
            <li>
              <Link href={pageHref(basePath, 1)} className="rounded border px-3 py-1 text-sm hover:bg-neutral-50">1</Link>
            </li>
            {start > 2 && <li className="px-1 text-neutral-500">…</li>}
          </>
        )}
        {pages.map((p) => (
          <li key={p}>
            {p === currentPage ? (
              <span className="rounded border px-3 py-1 text-sm font-semibold bg-neutral-100">{p}</span>
            ) : (
              <Link href={pageHref(basePath, p)} className="rounded border px-3 py-1 text-sm hover:bg-neutral-50">
                {p}
              </Link>
            )}
          </li>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <li className="px-1 text-neutral-500">…</li>}
            <li>
              <Link href={pageHref(basePath, totalPages)} className="rounded border px-3 py-1 text-sm hover:bg-neutral-50">
                {totalPages}
              </Link>
            </li>
          </>
        )}
      </ul>
      {next && (
        <Link href={pageHref(basePath, next)} className="rounded border px-3 py-1 text-sm hover:bg-neutral-50">
          Suivant →
        </Link>
      )}
    </nav>
  );
}

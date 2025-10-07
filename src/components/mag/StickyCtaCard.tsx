// src/components/mag/StickyCtaCard.tsx
import Link from "next/link";
import { issues } from "@/data/issues";

export default function StickyCtaCard() {
  const current = issues.slice().sort((a, b) => b.number - a.number)[0];
  if (!current) return null;

  return (
    <aside className="sticky top-20 rounded border bg-white p-4">
      <h3 className="text-base font-semibold">Le Magazine</h3>
      <p className="mt-1 text-sm text-neutral-600">
        Accédez au numéro <strong>{current.id}</strong> et aux archives directement depuis l’app.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/magazine/${current.id}/lire`}
          className="inline-flex items-center rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Lire dans l’app
        </Link>
        <Link
          href="/abonnement"
          className="inline-flex items-center rounded border px-3 py-1.5 text-sm font-semibold hover:bg-neutral-100"
        >
          S’abonner
        </Link>
      </div>
    </aside>
  );
}

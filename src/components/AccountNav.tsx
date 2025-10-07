// src/components/AccountNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/compte/abonnement", label: "Abonnement" },
  { href: "/compte/profil", label: "Profil" },
  { href: "/compte/newsletters", label: "Newsletters" },
  { href: "/compte/factures", label: "Factures" },
  { href: "/compte/moyens-de-paiement", label: "Moyens de paiement" },
  { href: "/compte/applications", label: "Applications" },
  { href: "/compte/cookies", label: "Cookies" },
  { href: "/compte/faq", label: "FAQ" },
];

export default function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="rounded border bg-neutral-50 p-3">
      <ul className="space-y-1">
        {items.map((it) => {
          const active =
            pathname === it.href ||
            (pathname?.startsWith(it.href) && it.href !== "/compte/abonnement");
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={`block rounded px-3 py-2 text-sm font-semibold
                ${active ? "bg-neutral-900 text-white" : "hover:bg-white"}`}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

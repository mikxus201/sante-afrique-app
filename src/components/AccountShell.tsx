// src/components/AccountShell.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../lib/auth-client";
import { me } from "@/lib/api"; // <- rehydrate si nécessaire

type Props = { children: React.ReactNode };

const TABS = [
  { href: "/compte", label: "Abonnement" },
  { href: "/compte/profil", label: "Profil" },
  { href: "/compte/newsletters", label: "Newsletters" },
  { href: "/compte/factures", label: "Factures" },
  { href: "/compte/moyens-de-paiement", label: "Moyens de paiement" },
  { href: "/compte/applications", label: "Applications" },
  { href: "/compte/cookies", label: "Cookies" },
  { href: "/compte/faq", label: "FAQ" },
] as const;

const APP_IMAGE = "/images/app-mobile.png";

function NavTabs() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {TABS.map((t) => {
        const active = pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`block rounded-lg px-3 py-2 text-[15px] font-semibold ${
              active ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AccountShell({ children }: Props) {
  const { user, setUser } = useAuth() as {
    user?: {
      id?: string | number;
      name?: string;
      firstName?: string;
      lastName?: string;
      nom?: string;
      prenoms?: string;
      email?: string;
      createdAt?: string | number | Date;
      created_at?: string | number | Date;
      joinedAt?: string | number | Date;
      signupDate?: string | number | Date;
      metadata?: { createdAt?: string | number | Date };
      avatarUrl?: string;
    } | null;
    setUser: (u: any) => void;
  };

  // --- Rehydrate depuis /api/me si jamais user est nul après refresh (cookies Sanctum)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (user) return;
      try {
        const r = await me(); // { data: {...} }
        if (!mounted) return;
        if ((r as any)?.data) setUser((r as any).data);
      } catch {
        // non connecté : on laisse tel quel
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user, setUser]);

  // Nom affiché robuste
  const fromParts = (...parts: Array<string | undefined>) =>
    parts.filter((x) => !!x && String(x).trim() !== "").join(" ").trim();

  const emailLocal = user?.email ? String(user.email).split("@")[0] : "";
  const displayName =
    user?.name ||
    fromParts(user?.prenoms, user?.nom) ||
    fromParts(user?.firstName, user?.lastName) ||
    emailLocal ||
    "cher lecteur";

  // ---- récupère une date d’inscription robuste + fallback localStorage
  const [joinedAt, setJoinedAt] = useState<Date | null>(null);

  useEffect(() => {
    const anyUser = user as any;

    const raw =
      anyUser?.created_at ?? // Laravel
      anyUser?.createdAt ?? // camelCase éventuel
      anyUser?.joinedAt ??
      anyUser?.signupDate ??
      anyUser?.metadata?.createdAt;

    const parse = (v: unknown): Date | null => {
      if (!v) return null;
      const d = new Date(v as any);
      return Number.isNaN(+d) ? null : d;
    };

    let found = parse(raw);

    if (!found) {
      try {
        const ls = localStorage.getItem("sa_joined_at");
        if (ls) found = parse(ls);
      } catch {}
    }
    if (!found) {
      const now = new Date();
      try {
        localStorage.setItem("sa_joined_at", now.toISOString());
      } catch {}
      found = now;
    }
    setJoinedAt(found);
  }, [user]);

  const since =
    joinedAt &&
    joinedAt.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* -------- BANNIÈRE HAUTE (au-dessus du bloc central) -------- */}
      <section className="rounded-xl bg-neutral-900 text-white p-6 lg:p-7 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="text-center lg:text-left">
          <p className="text-sm opacity-80 mb-1">Bonjour</p>
          <h2 className="text-2xl font-extrabold leading-tight">{displayName}</h2>
          <p className="mt-2 text-sm opacity-90">
            Merci de contribuer à faire avancer l’information santé en Afrique
            {since ? (
              <>
                {" "}depuis le <span className="font-semibold">{since}</span>.
              </>
            ) : (
              <>.</>
            )}
          </p>
        </div>

        {/* Aperçu app mobile à droite de la bannière */}
        <div className="relative w-[160px] h-[320px] sm:w-[190px] sm:h-[380px] lg:w-[220px] lg:h-[420px] overflow-hidden rounded-xl shadow-lg">
          <Image
            src={APP_IMAGE}
            alt="Aperçu de l’application mobile Santé Afrique"
            fill
            className="object-cover"
            sizes="(max-width:1024px) 190px, 220px"
            priority
          />
        </div>
      </section>

      {/* -------- CONTENU : colonne nav + colonne centrale -------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 h-max">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <NavTabs />
          </div>
        </aside>

        <main className="space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

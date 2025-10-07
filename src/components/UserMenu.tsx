// src/components/UserMenu.tsx
"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-client";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // ferme au clic dehors
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!user) {
    return (
      <Link
        href="/connexion"
        className="inline-flex items-center rounded border px-3 py-2 text-sm hover:bg-neutral-50"
      >
        Se connecter
      </Link>
    );
  }

  const initials = (user.firstName?.[0] || "S") + (user.lastName?.[0] || "A");

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded px-2 py-1.5 hover:bg-neutral-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {user.avatarUrl ? (
          // avatar image
          <img
            src={user.avatarUrl}
            alt={user.firstName}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          // avatar initiales
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold">
            {initials}
          </span>
        )}
        <span className="hidden sm:block text-sm font-semibold">{user.firstName} {user.lastName}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-52 rounded border bg-white shadow-lg p-1 text-sm"
        >
          <Link href="/compte" className="block rounded px-3 py-2 hover:bg-neutral-100">Mon compte</Link>
          <Link href="/abonnement" className="block rounded px-3 py-2 hover:bg-neutral-100">Mon abonnement</Link>
          <button
            onClick={() => signOut()}
            className="mt-1 w-full text-left rounded px-3 py-2 hover:bg-neutral-100"
          >
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getJSON } from "@/lib/api";

type SubResponse = {
  active: boolean;
  subscription: { days_left: number | null } | null;
};

export default function SubscribeCta({ className = "" }: { className?: string }) {
  const [active, setActive] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    getJSON<SubResponse>("/api/me/subscription")
      .then((r) => { if (mounted) setActive(!!r?.active); })
      .catch(() => { if (mounted) setActive(false); }); // pas connecté → montre “S’abonner”
    return () => { mounted = false; };
  }, []);

  // état « chargement » → on montre S’abonner (ne clignote pas)
  if (active === null) {
    return (
      <Link href="/abonnement"
        className={`inline-flex items-center rounded-full bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700 ${className}`}
        aria-busy="true">
        S’abonner
      </Link>
    );
  }

  return active ? (
    <Link href="/compte#abonnement"
      className={`inline-flex items-center rounded-full bg-neutral-900 px-3 py-1.5 text-white hover:bg-neutral-800 ${className}`}>
        Mon abonnement
    </Link>
  ) : (
    <Link href="/abonnement"
      className={`inline-flex items-center rounded-full bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700 ${className}`}>
      S’abonner
    </Link>
  );
}

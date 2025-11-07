"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getJSON } from "@/lib/api";

type SubResponse = {
  active: boolean;
  subscription: { days_left: number | null } | null;
};

export default function RenewBadge() {
  const [days, setDays] = useState<number | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    getJSON<SubResponse>("/api/me/subscription")
      .then((r) => {
        setActive(!!r?.active);
        setDays(r?.subscription?.days_left ?? null);
      })
      .catch(() => {});
  }, []);

  if (!active) return null;
  const d = typeof days === "number" ? days : 9999;
  if (d > 30) return null;

  return (
    <Link
      href="/abonnement?renew=1"
      className="ml-2 inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100"
      title={d >= 0 ? `Échéance dans ${d} jours` : "Échéance dépassée"}
    >
      Renouveler {d >= 0 ? `(${d} j)` : ""}
    </Link>
  );
}

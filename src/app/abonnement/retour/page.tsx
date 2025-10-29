"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

/** Helpers locaux : CSRF + soumission POST vers Laravel */
function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}
async function ensureCsrf() {
  await fetch("/sanctum/csrf-cookie", { credentials: "include" });
}
function submitForm(action: string, data: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  const csrf = getCookie("XSRF-TOKEN") || "";
  const token = document.createElement("input");
  token.type = "hidden";
  token.name = "_token";
  token.value = csrf;
  form.appendChild(token);
  Object.entries(data).forEach(([k, v]) => {
    const i = document.createElement("input");
    i.type = "hidden";
    i.name = k;
    i.value = String(v ?? "");
    form.appendChild(i);
  });
  document.body.appendChild(form);
  form.submit();
}

export default function RedirectToCinetpay() {
  const sp = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const plan = useMemo(
    () => ({
      id: sp.get("plan_id"),
      slug: sp.get("plan_slug"),
    }),
    [sp]
  );

  useEffect(() => {
    (async () => {
      if (!plan.id || !plan.slug) {
        setError("Paramètres de l’offre manquants.");
        return;
      }
      try {
        // petit délai visuel puis POST vers Laravel -> redirection CinetPay
        await new Promise((r) => setTimeout(r, 600));
        await ensureCsrf();
        submitForm("/pay/cinetpay/start", {
          plan_id: String(plan.id),
          plan_slug: String(plan.slug),
        });
      } catch (e: any) {
        setError(e?.message ?? "Impossible d’initialiser le paiement.");
      }
    })();
  }, [plan.id, plan.slug]);

  return (
    <div className="mx-auto max-w-md text-center px-4 py-16 text-neutral-900 dark:text-neutral-100">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <h1 className="text-2xl font-extrabold">Préparation du paiement…</h1>
        {!error ? (
          <>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-sm">
              Merci de patienter, vous allez être redirigé vers la plateforme sécurisée CinetPay.
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
              Ne fermez pas cette fenêtre.
            </p>
          </>
        ) : (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}

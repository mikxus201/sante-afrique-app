// src/app/abonnement/page.tsx
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import SubscribeForm from "@/components/SubscribeForm"; // ✅ import direct d’un Client Component

// --- Métadonnées
export const metadata = {
  title: "Abonnement | Santé Afrique",
  description:
    "Abonnez-vous à Santé Afrique : 06 numéros (édition numérique) + accès aux archives.",
};

// Pas de cache pour voir les plans admin en temps réel
export const revalidate = 0;

// --- Types
type Plan = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price_fcfa: number;
};
type HelpItem = { key: string; title: string; content: string };

// --- Utils
function withProto(u: string): string {
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}
function serverBase(): string {
  const rawEnv = String(
    process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.SITE_BASE_URL ??
      process.env.NEXT_PUBLIC_VERCEL_URL ??
      ""
  );
  if (rawEnv) return withProto(rawEnv).replace(/\/+$/, "");
  try {
    type HLike = { get?(name: string): string | null | undefined };
    const h = (headers() as unknown) as HLike;
    const forwardedHost = h?.get?.("x-forwarded-host") ?? null;
    const hostHeader = h?.get?.("host") ?? null;
    const host: string = (forwardedHost || hostHeader || "localhost:3000") as string;
    const xfProto = h?.get?.("x-forwarded-proto") ?? null;
    const proto: string = (xfProto || (host.includes("localhost") ? "http" : "https")) as string;
    return `${proto}://${host}`.replace(/\/+$/, "");
  } catch {
    return "http://localhost:3000";
  }
}
function apiBase(): string {
  const api = String(process.env.NEXT_PUBLIC_API_URL ?? "");
  const base = api ? withProto(api) : serverBase();
  return base.replace(/\/+$/, "");
}
function formatPrice(n: number): string {
  try {
    return n.toLocaleString("fr-FR");
  } catch {
    return String(n);
  }
}
function perMonth(n: number): string {
  const m = Math.round(n / 12);
  return formatPrice(m);
}

// --- Data fetchers
async function getPlans(): Promise<Plan[]> {
  try {
    const base = apiBase();
    const r = await fetch(`${base}/api/plans`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!r.ok) throw new Error("plans");
    const json = await r.json();
    const plans: Plan[] = (json?.plans ?? json) as Plan[];
    return plans.sort((a, b) => b.price_fcfa - a.price_fcfa).slice(0, 3);
  } catch {
    return [];
  }
}
async function getHelp(): Promise<HelpItem[]> {
  try {
    const base = apiBase(); // ← ICI: on appelle bien le serveur Laravel
    const r = await fetch(`${base}/api/help/subscribe`, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error("help");
    const { items } = (await r.json()) as { items: HelpItem[] };
    return items ?? [];
  } catch {
    return [];
  }
}

// --- UI helpers
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
      {children}
    </span>
  );
}
function Tick({ className = "" }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 ${className}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.59l7.3-7.3a1 1 0 0 1 1.4 0z" />
    </svg>
  );
}
function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-neutral-700">
      <Tick className="mt-0.5 text-blue-600" />
      <span>{children}</span>
    </li>
  );
}
function PlanCard({
  slotTitle,
  plan,
  highlight = false,
}: {
  slotTitle: string;
  plan?: Plan;
  highlight?: boolean;
}) {
  const disabled = !plan;
  const price = plan?.price_fcfa ?? 0;
  const href = plan ? `/abonnement/inscription/${encodeURIComponent(plan.slug)}` : "#";

  return (
    <div
      className={[
        "relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md",
        highlight ? "border-blue-300 ring-2 ring-blue-100" : "border-neutral-200",
      ].join(" ")}
    >
      {highlight && (
        <div className="absolute -top-3 left-6">
          <Badge>Recommandé</Badge>
        </div>
      )}

      <p className="text-xs uppercase tracking-wide text-neutral-500">{slotTitle}</p>
      <h3 className="mt-1 text-lg font-semibold text-neutral-900">{plan?.name ?? "Bientôt disponible"}</h3>

      <div className="mt-4">
        <div className="flex items-end gap-2">
          <div className="text-3xl font-extrabold text-neutral-900">
            {plan ? `${formatPrice(price)} FCFA` : "—"}
          </div>
          <div className="pb-1 text-sm text-neutral-500">/ an</div>
        </div>
        {plan && <p className="mt-1 text-xs text-neutral-500">soit ≈ {perMonth(price)} FCFA / mois</p>}
      </div>

      <p className="mt-4 text-sm text-neutral-700">
        {plan?.description ?? "Formule en cours d’activation."}
      </p>

      <ul className="mt-4 space-y-2">
        <Feature>6 numéros / an </Feature>
        <Feature>Articles premium et dossiers thématiques</Feature>
        <Feature>Lecture sur tous vos appareils</Feature>
      </ul>

      <div className="mt-6">
        {disabled ? (
          <button
            disabled
            className="inline-flex w-full items-center justify-center rounded-full bg-neutral-200 px-4 py-2 font-semibold text-neutral-500"
          >
            Indisponible
          </button>
        ) : (
          <Link
            href={href}
            className={[
              "inline-flex w-full items-center justify-center rounded-full px-4 py-2 font-semibold",
              highlight ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-neutral-900 text-white hover:bg-neutral-800",
            ].join(" ")}
          >
            S’abonner
          </Link>
        )}
      </div>
    </div>
  );
}

// --- Page
export default async function AbonnementPage() {
  const plans = await getPlans();
  const help = await getHelp();

  const slots: Array<{ plan?: Plan; title: string }> = [
    { plan: plans[0], title: "Abonnement Annuel PREMIUM" },
    { plan: plans[1], title: "Édition Papier + Numérique (Annuel)" },
    { plan: plans[2], title: "Édition Numérique (Annuel)" },
  ];
  const highlightIndex = Math.max(0, slots.findIndex((s) => !!s.plan));

  const h0 = help[0];
  const h1 = help[1];

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* HERO minimaliste */}
      <section className="relative mt-8 overflow-hidden rounded-2xl">
        <div className="relative h-[220px] w-full bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-600">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(255,255,255,.12),_transparent_40%),_radial-gradient(circle_at_80%_0%,_rgba(255,255,255,.1),_transparent_35%)]" />
        </div>
        <div className="absolute inset-0 flex items-center">
          <div className="px-6 py-8 text-white">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
              Abonnez-vous à <span className="text-white/90">Santé Afrique</span>
            </h1>
            <p className="mt-2 max-w-2xl text-white/90">
              Le média santé de référence en Afrique&nbsp;: dossiers, enquêtes, interviews et retours d’expérience utiles pour décider et agir.
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-white/90 md:grid-cols-3">
              <li className="flex items-center gap-2"><Tick className="text-white" /> Accès illimité aux archives</li>
              <li className="flex items-center gap-2"><Tick className="text-white" /> 6 numéros numériques / an</li>
              <li className="flex items-center gap-2"><Tick className="text-white" /> Lecture multi-supports</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-10">
        <div className="grid gap-6 md:grid-cols-3">
          {slots.map((slot, i) => (
            <PlanCard key={i} slotTitle={slot.title} plan={slot.plan} highlight={i === highlightIndex} />
          ))}
        </div>

        {/* Bandeau paiements */}
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-neutral-600 md:flex-row">
            <div className="flex items-center gap-2">
              <Tick className="text-green-600" />
              Paiement sécurisé • Facture envoyée par email
            </div>
            <div className="flex items-center gap-4 opacity-80">
              <Image src="/payments/mobile-money.svg" alt="Mobile Money" width={44} height={28} />
              <Image src="/payments/visa.svg" alt="Visa" width={44} height={28} />
              <Image src="/payments/mastercard.svg" alt="Mastercard" width={44} height={28} />
            </div>
          </div>
        </div>

        {/* Aucun plan -> capter l’intérêt */}
        {plans.length === 0 && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6">
            <p className="font-semibold text-amber-800">Les offres d’abonnement seront bientôt disponibles.</p>
            <p className="mt-1 text-sm text-amber-800/90">
              Laissez votre email pour être informé(e) dès l’ouverture :
            </p>
            <div className="mt-3 max-w-md">
              <SubscribeForm />
            </div>
          </div>
        )}
      </section>

      {/* POURQUOI S’ABONNER ? */}
      <section className="rounded-2xl bg-neutral-50 p-6">
        <h2 className="text-center text-2xl font-extrabold">Pourquoi s’abonner ?</h2>
        <div className="mx-auto mt-6 grid max-w-5xl gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold">Analyses & décryptages</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Dossiers exclusifs, études et analyses sur les enjeux de santé publique en Afrique.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold">Conseils actionnables</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Contenus utiles pour le terrain, validés par notre comité éditorial.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold">Accès premium</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Intégralité des numéros et archives, sur tous vos appareils.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENU UNIQUE */}
      <section className="relative my-10 overflow-hidden rounded-2xl">
        <div className="relative h-[220px] w-full">
          <Image
            src="/abonnement/bg-content.jpg"
            alt="Contenu unique"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 1024px, 100vw"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
          <div className="pointer-events-auto max-w-xl rounded-xl bg-white/95 p-6 text-center shadow-lg">
            <h3 className="text-lg font-semibold">Contenu unique</h3>
            <p className="mt-2 text-sm text-neutral-700">
              Des contenus originaux, exigeants et concrets : numéros thématiques, interviews,
              retours d’expérience, et outils pour décider et agir.
            </p>
          </div>
        </div>
      </section>

      {/* AIDE / FAQ */}
      <section className="py-8">
        <h3 className="text-center text-xl font-extrabold">Besoin d’aide ?</h3>
        <div className="mx-auto mt-4 grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h4 className="font-semibold">{h0?.title || "Questions fréquentes"}</h4>
            {h0?.content ? (
              <p className="mt-3 whitespace-pre-line text-sm text-neutral-700">{h0.content}</p>
            ) : (
              <ul className="mt-3 space-y-1 text-sm text-neutral-700">
                <li>Comment accéder à mes numéros après l’achat ?</li>
                <li>Puis-je changer d’offre en cours d’abonnement ?</li>
                <li>Comment recevoir une facture ?</li>
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h4 className="font-semibold">{h1?.title || "Informations utiles"}</h4>
            <p className="mt-3 whitespace-pre-line text-sm text-neutral-700">
              {h1?.content ||
                "Les offres donnent accès à l’édition numérique. La facturation est libellée en FCFA. Pour toute question sur les moyens de paiement ou un devis multi-comptes, contactez notre équipe."}
            </p>
          </div>
        </div>
      </section>

      {/* SERVICE CLIENT */}
      <section className="mb-14">
        <div className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
          <h4 className="font-semibold">Service client</h4>
          <p className="mt-2 text-sm text-neutral-700">Lundi – Vendredi, 9h00 – 18h00 (GMT)</p>
          <div className="mt-3 flex items-center justify-center gap-6 text-sm">
            <a href="mailto:infos@santeafrique.net" className="text-blue-600 hover:underline">
              infos@santeafrique.net
            </a>
            <span className="text-neutral-400">•</span>
            <a href="tel:+2250714565076" className="text-blue-600 hover:underline">
              +225&nbsp;07&nbsp;14&nbsp;56&nbsp;50&nbsp;76
            </a>
          </div>
          <div className="mt-5 flex items-center justify-center gap-4 opacity-80">
            <Image src="/payments/mobile-money.svg" alt="Mobile Money" width={44} height={28} />
            <Image src="/payments/visa.svg" alt="Visa" width={44} height={28} />
            <Image src="/payments/mastercard.svg" alt="Mastercard" width={44} height={28} />
          </div>
        </div>
      </section>
    </div>
  );
}

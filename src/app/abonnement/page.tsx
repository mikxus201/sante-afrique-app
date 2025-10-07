// src/app/abonnement/page.tsx
import Image from "next/image";
import Link from "next/link";
import { headers as nextHeaders } from "next/headers";

// Métadonnées inchangées
export const metadata = {
  title: "Abonnement | Santé Afrique",
  description:
    "Abonnez-vous à Santé Afrique : 06 numéros (édition numérique) + accès aux archives.",
};

// pas de cache pour voir les plans admin en temps réel
export const revalidate = 0;

type Plan = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price_fcfa: number;
};

type HelpItem = { key: string; title: string; content: string };

// Base site (utile si on passe par les routes Next)
function serverBase(): string {
  const env =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_BASE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL;
  if (env) return env.replace(/\/$/, "");
  try {
    const h = nextHeaders();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const proto =
      h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  } catch {
    return "http://localhost:3000";
  }
}

// Base API (si NEXT_PUBLIC_API_URL= http://localhost:8000 on tape Laravel directement)
function apiBase(): string {
  const api = process.env.NEXT_PUBLIC_API_URL;
  return (api ? api : serverBase()).replace(/\/$/, "");
}

function formatPrice(n: number) {
  try {
    return n.toLocaleString("fr-FR");
  } catch {
    return String(n);
  }
}

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
    return plans.sort((a, b) => b.price_fcfa - a.price_fcfa).slice(0, 3); // max 3 cartes
  } catch {
    return [];
  }
}

async function getHelp(): Promise<HelpItem[]> {
  try {
    const base = serverBase(); // l'aide passe par la route Next si tu l’as
    const r = await fetch(`${base}/api/help/subscribe`, { cache: "no-store" });
    if (!r.ok) throw new Error("help");
    const { items } = await r.json();
    return items as HelpItem[];
  } catch {
    return [];
  }
}

export default async function AbonnementPage() {
  const plans = await getPlans();
  const help = await getHelp();

  // on place au plus 3 offres ; si slot vide => bouton désactivé
  const slots: Array<{ plan?: Plan; title: string; fallbackDesc: string }> = [
    { plan: plans[0], title: "Abonnement Annuel", fallbackDesc: "Formule annuelle complète." },
    { plan: plans[1], title: "Offre Annuelle Papier", fallbackDesc: "Édition papier." },
    { plan: plans[2], title: "Offre Annuelle Numérique", fallbackDesc: "Édition numérique + archives." },
  ];

  const h0 = help[0];
  const h1 = help[1];

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* HERO BANDEAU (structure inchangée) */}
      <section className="relative mt-8 overflow-hidden rounded-xl">
        <div className="relative h-[260px] w-full">
          <Image
            src="/abonnement/hero.jpg"
            alt="Abonnement Santé Afrique"
            fill
            className="object-cover"
            priority
            sizes="(min-width: 1024px) 1024px, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b6aa8]/80 via-[#0b6aa8]/70 to-[#0b6aa8]/40" />
        </div>

        {/* Titre overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center">
          <div className="px-6 text-white">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
              Abonnement
            </h1>
            <p className="mt-2 text-white/90 max-w-xl">
              Le magazine santé de référence en Afrique.
            </p>
          </div>
        </div>

        {/* Cartes tarifs — même structure 3 colonnes */}
        <div className="relative -mt-12 mb-8 flex flex-col gap-4 px-6 md:flex-row">
          {slots.map((slot, i) => {
            const p = slot.plan;
            return (
              <div key={i} className="flex-1 rounded-xl bg-[#1e90d6] p-6 text-white shadow-md">
                <p className="text-sm uppercase tracking-wide opacity-90">{slot.title}</p>
                <p className="mt-1 text-2xl font-extrabold">
                  {p ? `${formatPrice(p.price_fcfa)} FCFA` : "Bientôt"}
                </p>
                <p className="mt-1 text-sm opacity-90">
                  {p?.description || slot.fallbackDesc}
                </p>

                {p ? (
                  <Link
                    href={`/abonnement/inscription/${encodeURIComponent(p.slug)}`}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-[#1e90d6] font-semibold hover:bg-white/90"
                  >
                    S’abonner
                  </Link>
                ) : (
                  <span className="mt-4 inline-flex cursor-not-allowed items-center justify-center rounded-full bg-white/60 px-4 py-2 text-[#1e90d6]/70 font-semibold">
                    Indisponible
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* POURQUOI S’ABONNER ? (inchangé) */}
      <section className="py-10">
        <h2 className="text-center text-2xl font-extrabold">Pourquoi s’abonner à Santé Afrique ?</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold">Analyses & décryptages</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Des dossiers exclusifs, des études et des analyses sur les défis
              sanitaires du continent.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold">Conseils pratiques</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Des contenus utiles pour le terrain, rédigés par des experts et
              validés par notre comité éditorial.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold">Accès premium</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Un accès à l’intégralité des numéros et aux archives, sur tous
              vos appareils.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENU UNIQUE (inchangé) */}
      <section className="relative my-10 overflow-hidden rounded-xl">
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
              L’équipe éditoriale produit des contenus originaux, avec une
              exigence de qualité et de rigueur. Vous profitez de numéros
              thématiques, d’interviews et de retours d’expérience issus du
              terrain.
            </p>
          </div>
        </div>
      </section>

      {/* BESOIN D’AIDE ? (structure identique, contenu pilotable si dispo) */}
      <section className="py-8">
        <h3 className="text-center text-xl font-extrabold">Besoin d’aide ?</h3>
        <div className="mx-auto mt-4 grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h4 className="font-semibold">{h0?.title || "Questions fréquentes"}</h4>
            {h0?.content ? (
              <p className="mt-3 text-sm text-neutral-700 whitespace-pre-line">{h0.content}</p>
            ) : (
              <ul className="mt-3 list-disc pl-5 text-sm text-neutral-700 space-y-1">
                <li>Comment accéder à mes numéros après l’achat ?</li>
                <li>Puis-je changer d’offre en cours d’abonnement ?</li>
                <li>Comment recevoir une facture ?</li>
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h4 className="font-semibold">{h1?.title || "Informations utiles"}</h4>
            <p className="mt-3 text-sm text-neutral-700 whitespace-pre-line">
              {h1?.content ||
                "Les offres donnent accès à l’édition numérique. La facturation est libellée en FCFA. Pour toute question sur les moyens de paiement ou un devis multi-comptes, contactez notre équipe."}
            </p>
          </div>
        </div>
      </section>

      {/* SERVICE CLIENT (inchangé) */}
      <section className="mb-14">
        <div className="mx-auto max-w-3xl rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
          <h4 className="font-semibold">Service client</h4>
          <p className="mt-2 text-sm text-neutral-700">Lundi – Vendredi, 9h00 – 18h00 (GMT)</p>
          <div className="mt-3 flex items-center justify-center gap-6 text-sm">
            <a href="mailto:abonnement@santeafrique.org" className="text-blue-600 hover:underline">
              infos@santeafrique.net
            </a>
            <span className="text-neutral-400">•</span>
            <a href="tel:+2250714565080" className="text-blue-600 hover:underline">
              +225 07 14 56 50 80
            </a>
          </div>
          <div className="mt-5 flex items-center justify-center gap-4 opacity-80">
            <Image src="/payments/visa.svg" alt="Visa" width={44} height={28} />
            <Image src="/payments/mastercard.svg" alt="Mastercard" width={44} height={28} />
            <Image src="/payments/mobile-money.svg" alt="Mobile Money" width={44} height={28} />
          </div>
        </div>
      </section>
    </div>
  );
}

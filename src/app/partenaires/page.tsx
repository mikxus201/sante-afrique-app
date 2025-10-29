/* eslint-disable @next/next/no-img-element */
import Hero from "@/components/Hero";
import type { Metadata } from "next";
import { API_PREFIX } from "@/lib/api";

export const metadata: Metadata = {
  title: "Espace partenaires — Santé Afrique",
  description: "Devenez partenaire média : kits, tarifs, formats et contacts.",
};

type Asset = {
  id: number;
  title: string;
  description?: string;
  file_url: string;
  cover_url?: string | null;
};

async function getAssets(): Promise<Asset[]> {
  try {
    const res = await fetch(`${API_PREFIX}/partner-assets?public=1`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.items) ? (json.items as Asset[]) : [];
  } catch {
    return [];
  }
}

export default async function PartnersPage() {
  const assets = await getAssets();

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const wurl = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(
        "Bonjour Santé Afrique, je souhaite devenir partenaire média."
      )}`
    : "#";

  return (
    <>
      <Hero
        title="Espace partenaires"
        subtitle="Des audiences qualifiées, des formats premium, un média de confiance."
        image="/heroes/partners.jpg"
        align="left"
      >
        <a
          href={wurl}
          className="inline-block rounded-full bg-emerald-600 px-5 py-2 text-white font-semibold hover:bg-emerald-700"
          target="_blank"
        >
          Discuter sur WhatsApp
        </a>
      </Hero>

      {/* Preuves */}
      <section className="mx-auto max-w-6xl px-4 py-12 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-6 bg-white">
          <h3 className="text-lg font-bold">Audience ciblée santé</h3>
          <p className="text-sm text-neutral-700 mt-2">
            Professionnels de santé, décideurs, et grand public qualifié.
          </p>
        </div>
        <div className="rounded-lg border p-6 bg-white">
          <h3 className="text-lg font-bold">Formats & brand content</h3>
          <p className="text-sm text-neutral-700 mt-2">
            Print, digital, vidéo, native ads, dossiers spéciaux.
          </p>
        </div>
        <div className="rounded-lg border p-6 bg-white">
          <h3 className="text-lg font-bold">Accompagnement</h3>
          <p className="text-sm text-neutral-700 mt-2">
            Conseil éditorial, production créative et mesure d’impact.
          </p>
        </div>
      </section>

      {/* Documents dynamiques */}
      <section className="mx-auto max-w-6xl px-4">
        <h2 className="text-xl font-extrabold mb-4">Documents à télécharger</h2>

        {assets.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center text-neutral-700">
            Aucun document public pour le moment.
            <div className="mt-4">
              <a
                href={wurl}
                target="_blank"
                className="inline-block rounded-full bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
              >
                Parler sur WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {assets.map((doc) => (
              <a
                key={doc.id}
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg border overflow-hidden bg-white hover:shadow-md transition-shadow"
                aria-label={`Télécharger ${doc.title}`}
              >
                <div className="relative">
                  <img
                    src={
                      doc.cover_url && doc.cover_url.length
                        ? doc.cover_url
                        : "/images/pdf-generic.jpg"
                    }
                    alt={doc.title}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">
                    PDF
                  </span>
                </div>
                <div className="p-4">
                  <div className="font-semibold leading-snug line-clamp-2">
                    {doc.title}
                  </div>
                  {doc.description ? (
                    <p className="text-sm text-neutral-700 mt-1 line-clamp-2">
                      {doc.description}
                    </p>
                  ) : null}
                  <div className="mt-3 text-sm text-emerald-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Ouvrir le document →
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Logos de confiance */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-4">
        <h2 className="text-xl font-extrabold mb-4">Ils nous font confiance</h2>
        <figure className="rounded-xl border bg-white overflow-hidden">
          <img
            src="/images/trusted-by.png"
            alt="Ils nous font confiance — logos de nos partenaires et institutions"
            className="w-full h-auto object-contain"
            loading="lazy"
            decoding="async"
          />
        </figure>
      </section>

      {/* Bandeau final : uniquement le CTA WhatsApp */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mt-6 rounded-xl bg-neutral-900 text-white p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Prêt(e) à activer votre campagne ?</h3>
            <p className="text-sm opacity-80">
              Nous co-construisons un plan média rentable et mesurable.
            </p>
          </div>
          <a
            href={wurl}
            target="_blank"
            className="rounded-full bg-emerald-600 px-4 py-2 font-semibold hover:bg-emerald-700"
          >
            Parler sur WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}

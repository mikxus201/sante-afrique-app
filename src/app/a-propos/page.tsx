/* eslint-disable @next/next/no-img-element */
import Hero from "@/components/Hero";
import Link from "next/link";
import { API_PREFIX } from "@/lib/api";

type Member = {
  id: number;
  name: string;
  role: string;
  city?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  linkedin?: string;
  group: "direction" | "redaction" | "conseil" | "autres";
  photo_url?: string | null;
};

type GroupsDto = {
  groups: {
    direction: Member[];
    redaction: Member[];
    conseil: Member[];
    autres: Member[];
  };
};

type CMSPage = { title: string; content_html: string };

// ------- Helper: décoder les entités HTML (y compris double encodage) -------
function unescapeHtml(input: string): string {
  let out = String(input ?? "");
  const decodeOnce = (s: string) =>
    s
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));

  for (let i = 0; i < 3; i++) {
    const next = decodeOnce(out);
    if (next === out) break;
    out = next;
  }
  return out;
}

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function MemberCard({ m }: { m: Member }) {
  const wa =
    m.whatsapp &&
    `https://wa.me/${m.whatsapp}?text=${encodeURIComponent(
      "Bonjour, je vous contacte suite à la page Équipe (Santé Afrique)."
    )}`;

  return (
    <div className="rounded-lg border p-4 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        {m.photo_url ? (
          <img src={m.photo_url} alt={m.name} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 font-semibold">
            {initialsOf(m.name)}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-semibold leading-tight truncate">{m.name}</div>
          <div className="text-sm text-neutral-600">{m.role}</div>
          {m.city && <div className="text-xs text-neutral-500">{m.city}</div>}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {m.email && (
          <a href={`mailto:${m.email}`} className="text-sm px-2 py-1 rounded border hover:bg-neutral-50">
            Email
          </a>
        )}
        {m.linkedin && (
          <a href={m.linkedin} target="_blank" className="text-sm px-2 py-1 rounded border hover:bg-neutral-50">
            LinkedIn
          </a>
        )}
        {wa && (
          <a href={wa} target="_blank" className="text-sm px-2 py-1 rounded border hover:bg-neutral-50">
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

/** === FETCH HELPERS (avec noCache pour le mode preview) === */
async function fetchGroups(noCache = false): Promise<GroupsDto["groups"]> {
  const opts = noCache ? { cache: "no-store" as const } : { next: { revalidate: 60 } };
  const res = await fetch(`${API_PREFIX}/team-members${noCache ? `?t=${Date.now()}` : ""}`, opts);
  if (!res.ok) return { direction: [], redaction: [], conseil: [], autres: [] };
  const json = (await res.json()) as GroupsDto;
  return json.groups;
}

async function fetchAbout(noCache = false): Promise<CMSPage | null> {
  try {
    const opts = noCache ? { cache: "no-store" as const } : { next: { revalidate: 60 } };
    const res = await fetch(`${API_PREFIX}/pages/a-propos${noCache ? `?t=${Date.now()}` : ""}`, opts);
    if (!res.ok) return null;
    const json = await res.json();
    const raw = (json?.content_html ?? "") as string;
    const decoded = unescapeHtml(raw);
    return { title: json?.title ?? "Qui sommes-nous ?", content_html: decoded };
  } catch {
    return null;
  }
}

export const metadata = {
  title: "À propos — Santé Afrique",
  description: "Qui sommes-nous, mission, valeurs & notre équipe.",
};

/** ➜ on accepte searchParams pour détecter ?preview=1 */
export default async function TeamPage({
  searchParams,
}: {
  searchParams?: { preview?: string };
}) {
  const preview = (searchParams?.preview ?? "") === "1";

  const [groups, about] = await Promise.all([fetchGroups(preview), fetchAbout(preview)]);

  const waGlobal = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(
        "Bonjour, je souhaite contribuer à Santé Afrique."
      )}`
    : null;

  // 👇 Typage explicite pour éviter l’union 'string | Member[]'
  const sections: [string, Member[]][] = [
    ["Direction éditoriale", groups.direction],
    ["Rédaction & Production", groups.redaction],
    ["Conseil scientifique", groups.conseil],
  ];

  return (
    <>
      <Hero
        title={about?.title ?? "Qui sommes-nous ?"}
        subtitle="Informer, décrypter et outiller l’action en santé publique sur le continent."
        image="/heroes/about.jpg"
        align="left"
      />

      {/* === CONTENU CMS "Qui sommes-nous" === */}
      <section className="mx-auto max-w-4xl px-4 py-10">
        {about?.content_html ? (
          <article
            className="prose prose-neutral max-w-none"
            dangerouslySetInnerHTML={{ __html: unescapeHtml(about.content_html) }}
          />
        ) : (
          <div className="rounded border bg-white p-6 text-neutral-700">
            Le contenu d’introduction n’est pas encore disponible.
          </div>
        )}
      </section>

      {/* === ÉQUIPE === */}
      <div className="mx-auto max-w-6xl px-4 pb-10 grid gap-10">
        {sections.map(([title, list]) =>
          Array.isArray(list) && list.length ? (
            <section key={title}>
              <h2 className="text-xl font-extrabold mb-3">{title}</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                {list.map((m: Member) => (
                  <MemberCard key={m.id} m={m} />
                ))}
              </div>
            </section>
          ) : null
        )}

        {/* CTA */}
        <section className="rounded-xl bg-neutral-900 text-white p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Envie de contribuer ?</h3>
            <p className="text-sm opacity-80">Pitch d’article, chronique, data-story : parlons-en.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/nous-contacter?subject=Candidature%20/%20Collaboration%20%E2%80%94%20Sant%C3%A9%20Afrique"
              className="rounded-full bg-white text-neutral-900 px-4 py-2 font-semibold hover:opacity-90"
            >
              Écrire à la rédaction
            </Link>
            {waGlobal && (
              <a
                href={waGlobal}
                target="_blank"
                className="rounded-full bg-emerald-600 px-4 py-2 font-semibold hover:bg-emerald-700"
              >
                WhatsApp
              </a>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { issues } from "@/data/issues";
import { slugify } from "@/lib/slugify";

type Props = { params: { id: string; slug: string } };

export default function ArticleExcerptPage({ params }: Props) {
  const issue = issues.find((i) => i.id === params.id);
  if (!issue) return notFound();

  const item = issue.summary.find((s) => slugify(s.title) === params.slug);
  if (!item) return notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8 py-8">
      <nav className="mb-6 text-sm">
        <Link href={`/magazine/${issue.id}`} className="text-blue-600 hover:underline">
          Numéro n°{issue.number}
        </Link>{" "}
        /{" "}
        <Link href={`/magazine/${issue.id}/sommaire`} className="text-blue-600 hover:underline">
          Sommaire
        </Link>{" "}
        / <span className="text-neutral-600">Extrait</span>
      </nav>

      <h1 className="text-2xl font-semibold leading-tight">{item.title}</h1>

      <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-100">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width:768px) 92vw, 720px"
          className="object-cover"
          priority
        />
      </div>

      {/* Zone extrait (à remplacer par votre texte) */}
      <div className="prose prose-neutral max-w-none mt-6">
        <p>
          <em>Extrait de l’article :</em> placez ici 2–4 paragraphes qui donnent envie
          de lire la version complète dans le magazine. Ajoutez une donnée clé, une
          citation courte, et terminez par un cliffhanger.
        </p>
        <p>
          Cet espace est libre : vous pouvez y insérer des intertitres, des listes,
          voire un encadré « À retenir ». L’objectif est de teaser le contenu premium.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/abonnement"
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          S’abonner pour tout lire
        </Link>
        <Link
          href="/connexion"
          className="rounded-full border px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
        >
          Déjà abonné ? Se connecter
        </Link>
      </div>
    </main>
  );
}

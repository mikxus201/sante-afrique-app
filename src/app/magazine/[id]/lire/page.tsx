// src/app/magazine/[id]/lire/page.tsx
import { issues } from "@/data/issues";
import Image from "next/image";
import OpenInApp from "@/components/app/OpenInApp";

type Props = { params?: { id?: string } };

export const dynamic = "force-dynamic";

export default function LirePage({ params }: Props) {
  const id = params?.id ?? "";
  const issue = issues.find((i) => i.id === id) ?? null;

  if (!issue) {
    return (
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold">Numéro introuvable</h1>
        <p className="mt-2 text-neutral-600">Vérifiez l’URL ou choisissez un autre numéro.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-xl md:text-2xl font-semibold">
        Lecture du numéro <span className="font-bold">{issue.id}</span>
      </h1>

      <div className="mt-6 grid gap-6 md:grid-cols-[380px_1fr]">
        <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100">
          <Image
            src={issue.cover}
            alt={`Couverture n°${issue.number}`}
            fill
            className="object-cover"
            sizes="380px"
            priority
          />
        </div>

        <div className="space-y-5">
          <p className="text-neutral-700">
            La lecture du magazine <strong>se fait exclusivement</strong> dans notre application mobile.
          </p>
          <OpenInApp issueId={issue.id} />
          <ul className="text-sm text-neutral-500 list-disc pl-5">
            <li>Si vous n’avez pas l’application, vous serez redirigé·e vers le store.</li>
            <li>Déjà abonné·e ? Connectez-vous dans l’app avec le même e-mail.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

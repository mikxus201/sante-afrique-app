// src/app/articles/[slug]/not-found.tsx
import Link from "next/link";

export default function ArticleNotFound() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-2">Article introuvable</h1>
      <p className="text-neutral-600">
        Désolé, ce contenu n’existe pas ou a été déplacé.
      </p>
      <Link href="/" className="mt-4 inline-block text-blue-700 hover:underline">
        ← Retour à l’accueil
      </Link>
    </div>
  );
}

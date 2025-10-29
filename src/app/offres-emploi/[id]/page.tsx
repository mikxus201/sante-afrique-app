// src/app/offres-emploi/[id]/page.tsx
import { fetchJob } from "@/lib/jobs";
import Link from "next/link";

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const { item } = await fetchJob(params.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">{item.title}</h1>
        <span className="rounded-full border px-3 py-1 text-sm">{item.type}</span>
      </div>
      <p className="mt-1 text-neutral-600">{item.company} — {item.location}</p>
      <p className="mt-6 whitespace-pre-wrap">{item.description}</p>
      {item.requirements && (
        <>
          <h2 className="mt-8 font-semibold text-lg">Profil / Exigences</h2>
          <p className="mt-2 whitespace-pre-wrap">{item.requirements}</p>
        </>
      )}

      <div className="mt-8">
        <Link href={`/offres-emploi/${item.id}/postuler`} className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700">
          Postuler maintenant
        </Link>
      </div>
    </div>
  );
}

// src/app/compte/applications/page.tsx
export default function ApplicationsPage() {
  return (
    <section className="rounded border bg-white p-6 space-y-4">
      <h2 className="text-xl font-extrabold">Vos applications disponibles</h2>
      <p className="text-neutral-700">
        Accédez à Santé Afrique où que vous soyez : téléchargez notre application mobile.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <a className="rounded border px-4 py-2 hover:bg-neutral-50" href="#" aria-disabled>
          App Store
        </a>
        <a className="rounded border px-4 py-2 hover:bg-neutral-50" href="#" aria-disabled>
          Google Play
        </a>
      </div>
    </section>
  );
}

// src/app/articles/[slug]/loading.tsx
export default function LoadingArticle() {
  return (
    <div className="mx-auto max-w-3xl p-6 animate-pulse">
      <div className="h-8 w-2/3 bg-neutral-200 rounded mb-4" />
      <div className="h-4 w-1/2 bg-neutral-200 rounded mb-6" />
      <div className="h-64 w-full bg-neutral-200 rounded-xl mb-6" />
      <div className="space-y-3">
        <div className="h-4 w-full bg-neutral-200 rounded" />
        <div className="h-4 w-11/12 bg-neutral-200 rounded" />
        <div className="h-4 w-10/12 bg-neutral-200 rounded" />
      </div>
    </div>
  );
}

// src/app/magazine/[id]/page.tsx
import { redirect } from "next/navigation";

export default function Page({ params }: { params: { id: string } }) {
  redirect(`/magazine/${encodeURIComponent(params.id)}/sommaire`);
}

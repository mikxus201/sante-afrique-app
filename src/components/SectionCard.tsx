import Image from "next/image";
import Link from "next/link";
import { toImageUrl } from "@/lib/img";

type Props = {
  href: string;
  title: string;
  img?: string;
  excerpt?: string;
};

export default function SectionCard({ href, title, img, excerpt }: Props) {
  const src = toImageUrl(img); // <-- normalisation + fallback

  return (
    <Link
      href={href}
      className="group block rounded-xl border border-neutral-200 overflow-hidden bg-white hover:shadow-lg transition"
    >
      <div className="relative w-full h-52 bg-neutral-100">
        <Image
          src={src}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        {excerpt && (
          <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{excerpt}</p>
        )}
      </div>
    </Link>
  );
}

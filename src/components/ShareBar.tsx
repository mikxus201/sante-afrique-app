// src/components/ShareBar.tsx
"use client";

import { useMemo } from "react";

type Props = { title: string; url?: string; className?: string };

export default function ShareBar({ title, url = "", className = "" }: Props) {
  const enc = (s: string) => encodeURIComponent(s);
  const links = useMemo(() => {
    const u = url || (typeof window !== "undefined" ? window.location.href : "");
    const t = title || "";
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(u)}`,
      twitter: `https://twitter.com/intent/tweet?url=${enc(u)}&text=${enc(t)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(u)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${enc(t)}%20${enc(u)}`,
      email: `mailto:?subject=${enc(t)}&body=${enc(u)}`,
    };
  }, [title, url]);

  const btn =
    "inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs hover:bg-neutral-50 active:scale-95 transition";

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <a className={btn} href={links.facebook} target="_blank" rel="noopener">Facebook</a>
      <a className={btn} href={links.twitter}  target="_blank" rel="noopener">X/Twitter</a>
      <a className={btn} href={links.linkedin} target="_blank" rel="noopener">LinkedIn</a>
      <a className={btn} href={links.whatsapp} target="_blank" rel="noopener">WhatsApp</a>
      <a className={btn} href={links.email}>Email</a>
    </div>
  );
}

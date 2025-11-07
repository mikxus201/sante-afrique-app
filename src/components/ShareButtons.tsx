"use client";

import React from "react";

type Props = {
  url: string;                      // URL publique de l’offre
  title: string;                    // Titre à afficher / partager
  text?: string;                    // Petit message d’accompagnement (WA / Web Share)
  size?: "sm" | "md";
  compact?: boolean;                // si true => uniquement icônes
  className?: string;
};

function openPopup(href: string) {
  const w = 640, h = 540;
  const y = window.top?.outerHeight ? Math.max(0, (window.top.outerHeight - h) / 2) : 0;
  const x = window.top?.outerWidth ? Math.max(0, (window.top.outerWidth - w) / 2) : 0;
  window.open(href, "_blank", `noopener,noreferrer,width=${w},height=${h},left=${x},top=${y}`);
}

export default function ShareButtons({ url, title, text = "", size = "md", compact = false, className = "" }: Props) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text || title);

  const btn = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";
  const icon = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  const shareNative = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); } catch { /* ignore */ }
      return;
    }
    // fallback => copie du lien
    try {
      await navigator.clipboard.writeText(url);
      alert("Lien copié dans le presse-papiers ✅");
    } catch {
      window.prompt("Copiez ce lien :", url);
    }
  };

  const fb = `https://www.facebook.com/sharer/sharer.php?u=${u}`;                  // FB ne prend pas le texte
  const li = `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
  const wa = (navigator.userAgent.match(/Android|iPhone|iPad/i))
    ? `whatsapp://send?text=${t}%20${u}`
    : `https://api.whatsapp.com/send?text=${t}%20${u}`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={shareNative}
        className={`rounded border px-3 ${btn} hover:bg-neutral-50`}
        title="Partager (natif)"
      >
        {!compact && <span className="mr-1">Partager</span>}
        <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" strokeWidth="2"/>
          <path d="M16 6l-4-4-4 4" strokeWidth="2"/>
          <path d="M12 2v14" strokeWidth="2"/>
        </svg>
      </button>

      <a onClick={(e)=>{e.preventDefault(); openPopup(fb);}}
         href={fb}
         className={`rounded bg-[#1877F2] text-white ${btn} inline-flex items-center gap-2 hover:opacity-90`}>
        <svg className={icon} viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 22v-8h2.7l.3-3h-3V9.1c0-.9.3-1.5 1.7-1.5H17V5.1c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 3.9V11H8v3h2.6v8h2.9z"/></svg>
        {!compact && "Facebook"}
      </a>

      <a onClick={(e)=>{e.preventDefault(); openPopup(li);}}
         href={li}
         className={`rounded bg-[#0A66C2] text-white ${btn} inline-flex items-center gap-2 hover:opacity-90`}>
        <svg className={icon} viewBox="0 0 24 24" fill="currentColor"><path d="M6.94 6.5A1.94 1.94 0 1 1 5 4.56 1.94 1.94 0 0 1 6.94 6.5zM7 8.75H4.88V20H7zM13 8.6a3.68 3.68 0 0 0-2.84 1.38V8.75H8v11.25h2.16v-5.86c0-1.55.58-2.61 2.03-2.61 1.1 0 1.67.74 1.67 2.61V20H16V14.5c0-3.07-1.36-5.9-3-5.9z"/></svg>
        {!compact && "LinkedIn"}
      </a>

      <a onClick={(e)=>{e.preventDefault(); openPopup(wa);}}
         href={wa}
         className={`rounded bg-[#25D366] text-white ${btn} inline-flex items-center gap-2 hover:opacity-90`}>
        <svg className={icon} viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A10 10 0 0 0 3.5 20.5L2 22l1.7-.5A10 10 0 0 0 22 12a9.9 9.9 0 0 0-1.5-5.5zM12 20A8 8 0 1 1 20 12a8 8 0 0 1-8 8zm4.1-5.3c-.2-.1-1.2-.6-1.3-.6s-.3-.1-.4.1-.4.6-.5.7-.2.1-.3.1a6.6 6.6 0 0 1-3-1.9 7.1 7.1 0 0 1-1.3-1.9c-.1-.2 0-.3.1-.4l.3-.3a1.3 1.3 0 0 0 .2-.3 1.1 1.1 0 0 0 0-.4c0-.1-.4-1.1-.5-1.5s-.3-.3-.4-.3h-.3a.6.6 0 0 0-.4.2 1.8 1.8 0 0 0-.6 1.3 3.1 3.1 0 0 0 .6 1.6 7.1 7.1 0 0 0 2.6 2.7 8.7 8.7 0 0 0 2.4 1c.3.1.6.1.8.1a1.8 1.8 0 0 0 1.2-.5 1.5 1.5 0 0 0 .4-1.1c0-.1 0-.2-.2-.3z"/></svg>
        {!compact && "WhatsApp"}
      </a>
    </div>
  );
}

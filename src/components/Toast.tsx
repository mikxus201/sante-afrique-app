"use client";

import { useEffect, useState } from "react";

type Variant = "success" | "error" | "info";

export default function Toast({
  message,
  variant = "info",
  duration = 5000,
}: {
  message: string;
  variant?: Variant;
  duration?: number;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => setOpen(false), duration);
    return () => clearTimeout(id);
  }, [open, duration]);

  if (!open) return null;

  const styles: Record<Variant, string> = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-neutral-800 text-white",
  };

  return (
    <div className="fixed right-4 top-4 z-[1000]">
      <div className={`shadow-lg rounded-lg px-4 py-3 text-sm ${styles[variant]}`}>
        <div className="flex items-start gap-3">
          <span className="font-semibold">
            {variant === "success" ? "Succès" : variant === "error" ? "Erreur" : "Info"}
          </span>
          <p className="opacity-95">{message}</p>
          <button
            className="ml-2 opacity-75 hover:opacity-100"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

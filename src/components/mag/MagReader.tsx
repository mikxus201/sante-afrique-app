"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ---------------------- Types ---------------------- */
type Page = { id: number; number: number; url: string; w?: number; h?: number };
type Issue = { id: number | string; title?: string; number?: number | string };
type User  = { id: number; name?: string; email?: string };

type Props =
  | { issueId: string | number; pages?: undefined; issue?: undefined; user?: undefined }
  | { issueId?: undefined; pages: Page[]; issue?: Issue; user?: User };

const DEFAULT_W = 1200;
const DEFAULT_H = 1600;

/* ---------------- Sanctum authorize (client) ---------------- */
async function authorizeIssueClient(id: string | number) {
  const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
  await fetch(`${API}/sanctum/csrf-cookie`, { credentials: "include", cache: "no-store" });

  const xsrfCookie =
    typeof document !== "undefined"
      ? document.cookie.split("; ").find((c) => c.startsWith("XSRF-TOKEN="))?.split("=")[1]
      : undefined;
  const xsrf = xsrfCookie ? decodeURIComponent(xsrfCookie) : "";

  const call = (method: "POST" | "GET") =>
    fetch(`${API}/api/issues/${encodeURIComponent(String(id))}/authorize`, {
      method,
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}),
      },
    });

  let res = await call("POST");
  if (res.status === 419 || res.status === 405) res = await call("GET");

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") {
      window.location.href = `/abonnement?from=/magazine/${encodeURIComponent(String(id))}/lire`;
    }
    throw new Error("Unauthorized");
  }

  if (res.status === 204) {
    return { issue: { id: Number(id) || 0 }, user: { id: 0 }, pages: [] as Page[] };
  }
  return (await res.json()) as { issue: Issue; user: User; pages: Page[] };
}

/* ----------------------------- UI ---------------------------- */
export default function MagReader(props: Props) {
  const [pages, setPages]   = useState<Page[]>("pages" in props ? props.pages : []);
  const [issue, setIssue]   = useState<Issue | undefined>("issue" in props ? props.issue : undefined);
  const [user,  setUser]    = useState<User  | undefined>("user"  in props ? props.user  : undefined);

  const [twoUp, setTwoUp]           = useState(true);
  const [zoomFactor, setZoomFactor] = useState(0.5);      // multiplicateur par-dessus fitScale
  const [fitMode, setFitMode]       = useState<"page" | "width" | "height" | "actual">("page");
  const [current, setCurrent]       = useState(1);
  const [loading, setLoading]       = useState<boolean>(!!("issueId" in props));
  const [error, setError]           = useState<string | null>(null);
  const [anim, setAnim]             = useState<"next" | "prev" | null>(null);

  // pan (quand zoomé)
  const [offset, setOffset]   = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  const frameRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  /* --------- Fetch auto --------- */
  useEffect(() => {
    if (!("issueId" in props)) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true); setError(null);
        const data = await authorizeIssueClient(props.issueId);
        if (cancelled) return;
        setPages(data.pages ?? []);
        setIssue(data.issue);
        setUser(data.user);
        setCurrent(1);
      } catch (e: any) {
        if (cancelled) return;
        setError(String(e?.message ?? e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [props, "issueId" in props ? props.issueId : null]);

  /* --------- Mesure du conteneur --------- */
  useEffect(() => {
    if (!frameRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const cr = entry.contentRect;
      setViewport({ w: cr.width, h: cr.height });
    });
    ro.observe(frameRef.current);
    return () => ro.disconnect();
  }, []);

  const total = pages.length;
  const email = user?.email ?? "abonne@santeafrique.net";
  const watermark = `${email} — ${new Date().toLocaleString("fr-FR")}`;

  /* --------- Auto 2-pages selon largeur --------- */
  useEffect(() => {
    setTwoUp(viewport.w >= 980);
  }, [viewport.w]);

  /* --------- Pages visibles --------- */
  const leftPageNumber = useMemo(() => {
    if (!twoUp) return null;
    if (current <= 1) return null;
    return current % 2 === 0 ? current - 1 : current;
  }, [twoUp, current]);

  const rightPageNumber = useMemo(() => {
    if (!twoUp) return current;
    if (current <= 1) return current;
    const left = leftPageNumber!;
    return left + 1 <= total ? left + 1 : null;
  }, [twoUp, current, leftPageNumber, total]);

  const pageByNum = (n: number | null) => (n && n >= 1 && n <= total ? pages[n - 1] : null);
  const leftPage  = pageByNum(leftPageNumber);
  const rightPage = pageByNum(rightPageNumber);

  /* --------- Dimensions & scale --------- */
  const GAP = twoUp && leftPage ? 28 : 0;
  const dims = useMemo(() => {
    const lw = leftPage?.w ?? DEFAULT_W;
    const lh = leftPage?.h ?? DEFAULT_H;
    const rw = rightPage?.w ?? DEFAULT_W;
    const rh = rightPage?.h ?? DEFAULT_H;
    const naturalW = twoUp && leftPage ? lw + GAP + rw : rw;
    const naturalH = twoUp && leftPage ? Math.max(lh, rh) : rh;
    return { lw, lh, rw, rh, naturalW, naturalH };
  }, [twoUp, leftPage?.w, leftPage?.h, rightPage?.w, rightPage?.h, GAP]);

  // padding interne + barres pour éviter tout débordement
  const TOPBAR_H   = 44;
  const BOTBAR_H   = 56;
  const FILMSTRIP_H= 88;
  const PAD_W = 56;
  const PAD_H = 40;

  const usableW = Math.max(0, viewport.w - PAD_W);
  const usableH = Math.max(0, viewport.h - PAD_H - TOPBAR_H - BOTBAR_H - FILMSTRIP_H);

  const fitScale = useMemo(() => {
    if (!usableW || !usableH) return 1;
    const sx = usableW / dims.naturalW;
    const sy = usableH / dims.naturalH;
    switch (fitMode) {
      case "width":  return Math.max(0.1, Math.min(4, sx));
      case "height": return Math.max(0.1, Math.min(4, sy));
      case "actual": return 1;
      default:       return Math.max(0.1, Math.min(4, Math.min(sx, sy))); // "page" → tout visible
    }
  }, [usableW, usableH, dims.naturalW, dims.naturalH, fitMode]);

  const effectiveScale = useMemo(() => {
    // verrouille pan quand on change fortement le zoom
    const s = fitScale * zoomFactor;
    return Math.max(0.25, Math.min(4, Math.round(s * 100) / 100));
  }, [fitScale, zoomFactor]);

  // taille réelle affichée (utile pour le pan/clamp)
  const contentW = dims.naturalW * effectiveScale;
  const contentH = dims.naturalH * effectiveScale;

  // zone affichage (centrée)
  const viewW = usableW;
  const viewH = usableH;

  // clamp pan pour ne jamais sortir des bords
  const clamp = useCallback((x: number, y: number) => {
    const maxX = Math.max(0, (contentW - viewW) / 2);
    const maxY = Math.max(0, (contentH - viewH) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, [contentW, contentH, viewW, viewH]);

  useEffect(() => {
    // réinitialise pan quand on change de fit/zoom
    setOffset((o) => clamp(o.x, o.y));
  }, [effectiveScale, clamp]);

  /* --------- Navigation --------- */
  const goPrev = useCallback(() => {
    setAnim("prev");
    if (twoUp) {
      if (current <= 1) return;
      setCurrent((c) => (c <= 2 ? 1 : c - 2));
    } else {
      setCurrent((c) => Math.max(1, c - 1));
    }
  }, [twoUp, current]);

  const goNext = useCallback(() => {
    setAnim("next");
    if (twoUp) {
      if (current >= total) return;
      if (current <= 1) setCurrent(Math.min(total, 2));
      else setCurrent((c) => Math.min(total, c + (c % 2 === 0 ? 2 : 1)));
    } else {
      setCurrent((c) => Math.min(total, c + 1));
    }
  }, [twoUp, total, current]);

  const goTo = useCallback((n: number) => {
    if (twoUp) {
      if (n <= 1) return setCurrent(1);
      setCurrent(n % 2 === 0 ? n : n - 1);
    } else {
      setCurrent(Math.max(1, Math.min(total, n)));
    }
  }, [twoUp, total]);

  /* --------- Raccourcis clavier + molette zoom --------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "-" || e.key === "_") setZoomFactor((z) => Math.max(0.5, z - 0.1));
      if (e.key === "+" || e.key === "=") setZoomFactor((z) => Math.min(3, z + 0.1));
      if (e.key.toLowerCase() === "0") { setFitMode("page"); setZoomFactor(1); setOffset({x:0,y:0}); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  // molette : zoom si Ctrl, sinon pan vertical/horizontal
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY; // up → zoom in
      const factor = delta > 0 ? 1.07 : 0.93;
      setZoomFactor((z) => Math.max(0.5, Math.min(3, z * factor)));
    } else if (effectiveScale > fitScale) {
      e.preventDefault();
      setOffset((o) => clamp(o.x - e.deltaX * 0.6, o.y - e.deltaY * 0.6));
    }
  }, [effectiveScale, fitScale, clamp]);

  /* --------- Drag pan --------- */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (effectiveScale <= fitScale) return; // pas de drag quand “page” exacte
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y };
  }, [effectiveScale, fitScale, offset]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const { sx, sy, ox, oy } = dragRef.current;
    const nx = ox + (e.clientX - sx);
    const ny = oy + (e.clientY - sy);
    setOffset(clamp(nx, ny));
  }, [clamp]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    dragRef.current = null;
  }, []);

  /* --------- Anti clic-droit --------- */
  useEffect(() => {
    const off = (ev: MouseEvent) => ev.preventDefault();
    window.addEventListener("contextmenu", off);
    return () => window.removeEventListener("contextmenu", off);
  }, []);

  /* --------------------- States UI --------------------- */
  if (loading) {
    return <div className="grid place-items-center min-h-[50vh] text-sm text-neutral-300 bg-neutral-900 rounded-lg">Chargement du numéro…</div>;
  }
  if (error) {
    return <div className="rounded border p-4 bg-red-50 text-red-700">Erreur : {error}</div>;
  }
  if (!total) {
    return <div className="rounded border p-4 bg-yellow-50 text-yellow-700">Aucune page disponible.</div>;
  }

  const shownPageLabel = twoUp ? `${rightPageNumber ?? leftPageNumber}/${total}` : `${current}/${total}`;
  const percent = Math.round(effectiveScale * 100);

  /* ------------------------- RENDER ------------------------- */
  return (
    <section className="relative w-full">
      {/* BARRE HAUT */}
      <div className="sticky top-0 z-40 flex h-11 items-center gap-2 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur px-3 text-neutral-200">
        <span className="text-xs sm:text-sm px-2 py-1 rounded bg-neutral-800/80 border border-neutral-700">
          Page {shownPageLabel}
        </span>

        <button className="btn-ctrl" onClick={goPrev} aria-label="Page précédente">←</button>
        <button className="btn-ctrl" onClick={goNext} aria-label="Page suivante">→</button>

        <div className="mx-2 h-5 w-px bg-neutral-700/70" />

        <button className="btn-ctrl" onClick={() => setZoomFactor((z) => Math.max(0.5, z - 0.1))}>−</button>
        <span className="text-xs w-10 text-center select-none">{percent}%</span>
        <button className="btn-ctrl" onClick={() => setZoomFactor((z) => Math.min(3, z + 0.1))}>+</button>

        <div className="mx-2 h-5 w-px bg-neutral-700/70" />

        <select
          className="text-xs rounded border border-neutral-700 bg-neutral-800/60 px-2 py-1"
          value={fitMode}
          onChange={(e) => { setFitMode(e.target.value as any); setZoomFactor(1); setOffset({x:0,y:0}); }}
          title="Ajustement"
        >
          <option value="page">Ajuster à la page</option>
          <option value="width">Ajuster à la largeur</option>
          <option value="height">Ajuster à la hauteur</option>
          <option value="actual">100%</option>
        </select>

        <label className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded border border-neutral-700 bg-neutral-800/60">
          <input
            type="checkbox"
            className="accent-blue-500"
            checked={twoUp}
            onChange={(e) => {
              const enabled = e.target.checked;
              setTwoUp(enabled);
              if (enabled && current % 2 === 0) setCurrent((c) => Math.max(1, c - 1));
              setOffset({x:0,y:0});
            }}
          />
          mode 2 pages
        </label>

        <div className="ml-auto flex items-center gap-2">
          <button
            className="btn-ctrl"
            onClick={() => {
              const el = frameRef.current;
              if (!el) return;
              if (document.fullscreenElement) document.exitFullscreen();
              else el.requestFullscreen?.();
            }}
            title="Plein écran"
          >⛶</button>
        </div>
      </div>

      {/* CADRE LECTEUR */}
      <div
        ref={frameRef}
        className="relative w-full bg-neutral-900 text-white"
        style={{ height: "calc(100dvh - 100px)" }} // cadre immersif
      >
        {/* Fond quadrillé + watermark */}
        <div
          aria-hidden
          className="pointer-events-none select-none absolute inset-0 z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 60px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 60px)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none select-none absolute inset-0 z-0 grid place-items-center text-neutral-100/10 text-lg sm:text-xl font-semibold"
          style={{ transform: "rotate(-22deg)" }}
        >
          <div className="text-center leading-relaxed">{watermark}</div>
        </div>

        {/* ZONE PAGES (centrée) */}
        <div className="relative z-10 w-full h-full px-7 pt-4 pb-[calc(56px+88px)]">
          <div
            className="relative w-full h-full overflow-hidden rounded-lg"
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div className="absolute inset-0 grid place-items-center">
              <div
                className={`relative flex ${twoUp && leftPage ? "gap-7" : ""}`}
                style={{
                  width: `${twoUp && leftPage ? (leftPage.w ?? DEFAULT_W) + GAP + (rightPage?.w ?? DEFAULT_W) : (rightPage?.w ?? DEFAULT_W)}px`,
                  height: `${twoUp && leftPage ? Math.max(leftPage.h ?? DEFAULT_H, rightPage?.h ?? DEFAULT_H) : (rightPage?.h ?? DEFAULT_H)}px`,
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${effectiveScale})`,
                  transformOrigin: "center top",
                  transition: dragRef.current ? "none" : "transform 120ms ease",
                  willChange: "transform",
                }}
              >
                {twoUp && leftPage && (
                  <PageCard
                    url={leftPage.url}
                    number={leftPage.number}
                    w={leftPage.w ?? DEFAULT_W}
                    h={leftPage.h ?? DEFAULT_H}
                    side="left"
                    anim={anim}
                  />
                )}
                {rightPage && (
                  <PageCard
                    url={rightPage.url}
                    number={rightPage.number}
                    w={rightPage.w ?? DEFAULT_W}
                    h={rightPage.h ?? DEFAULT_H}
                    side={twoUp && leftPage ? "right" : "single"}
                    anim={anim}
                  />
                )}
              </div>
            </div>

            {/* flèches overlay */}
            <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 hover:bg-white p-2 shadow text-neutral-900">←</button>
            <button onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 hover:bg-white p-2 shadow text-neutral-900">→</button>
          </div>
        </div>

        {/* FILMSTRIP MINIATURES */}
        <div className="absolute inset-x-0 bottom-14 z-20 h-[88px] px-4">
          <div className="h-full w-full overflow-x-auto overflow-y-hidden whitespace-nowrap [mask-image:linear-gradient(to right,transparent,black_20%,black_80%,transparent)]">
            <div className="inline-flex items-center gap-2 py-2">
              {pages.map((p) => {
                const isActive = p.number === (twoUp ? (rightPageNumber ?? leftPageNumber) : current);
                return (
                  <button
                    key={p.id}
                    onClick={() => goTo(p.number)}
                    className={`relative h-[72px] w-[52px] rounded border ${isActive ? "border-blue-500 ring-2 ring-blue-500/40" : "border-neutral-700 hover:border-neutral-500"} bg-neutral-800/60 overflow-hidden`}
                    title={`Page ${p.number}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={`Miniature ${p.number}`} className="w-full h-full object-cover" draggable={false} />
                    <span className="absolute bottom-0 inset-x-0 text-[10px] text-center bg-black/60">{p.number}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* BARRE BAS */}
        <div className="absolute inset-x-0 bottom-0 z-20 h-14 bg-neutral-900/95 backdrop-blur border-t border-neutral-800 px-3 flex items-center gap-3">
          <span className="text-xs text-neutral-300 shrink-0">
            {twoUp ? (rightPageNumber ?? leftPageNumber) : current} / {total}
          </span>

          {/* slider pages */}
          <input
            className="flex-1 h-1.5 cursor-pointer accent-blue-500"
            type="range"
            min={1}
            max={total}
            step={1}
            value={twoUp ? (rightPageNumber ?? leftPageNumber ?? 1) : current}
            onChange={(e) => goTo(Number(e.target.value))}
          />

          {/* zoom slider */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-neutral-400 w-8 text-right">{percent}%</span>
            <input
              className="w-40 h-1.5 cursor-pointer accent-blue-500"
              type="range"
              min={Math.round(fitScale * 50)}
              max={Math.round(fitScale * 300)}
              value={Math.round(effectiveScale * 100)}
              onChange={(e) => {
                const v = Number(e.target.value) / 100;
                setZoomFactor(v / fitScale);
              }}
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="btn-ctrl" onClick={() => window.print?.()} title="Imprimer / PDF">⤓</button>
            <button className="btn-ctrl" onClick={() => navigator.share?.({ title: String(issue?.title || "Santé Afrique") }).catch(() => {})} title="Partager">⇪</button>
          </div>
        </div>
      </div>

      {/* styles globaux compacts */}
      <style jsx global>{`
        .btn-ctrl { padding: 0.25rem 0.5rem; border-radius: 0.375rem; border: 1px solid rgb(64 64 64); background: rgba(38,38,38,.6); font-size: 0.75rem; }
        .btn-ctrl:hover { background: rgba(82,82,82,.6); }
        @keyframes flipNext { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(-8deg); } }
        @keyframes flipPrev { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(8deg); } }
        .flip-next { animation: flipNext 160ms ease both; transform-origin: left center; }
        .flip-prev { animation: flipPrev 160ms ease both; transform-origin: right center; }
      `}</style>
    </section>
  );
}

/* -------------------------- Page card -------------------------- */
function PageCard({
  url, number, w, h, side, anim,
}: { url: string; number: number; w: number; h: number; side: "left" | "right" | "single"; anim: "next" | "prev" | null; }) {
  const shadow =
    side === "left"
      ? "shadow-[inset_-10px_0_20px_rgba(0,0,0,0.18),0_10px_30px_rgba(0,0,0,0.35)]"
      : side === "right"
      ? "shadow-[inset_10px_0_20px_rgba(0,0,0,0.18),0_10px_30px_rgba(0,0,0,0.35)]"
      : "shadow-[0_10px_30px_rgba(0,0,0,0.35)]";

  const flipClass = anim === "next" ? "flip-next" : anim === "prev" ? "flip-prev" : "";

  return (
    <figure className={`relative bg-white ${shadow} rounded-[4px] overflow-hidden ${flipClass}`} style={{ width: w, height: h }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={`Page ${number}`} className="w-full h-full object-contain select-none" draggable={false} />
      <figcaption className="absolute bottom-1 right-2 text-[11px] text-neutral-700/70">{number}</figcaption>
    </figure>
  );
}

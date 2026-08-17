import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { getSupabase } from "../lib/supabase";

export const CARROSSEL_CONFIG_KEY = "dodisa_carrossel_config";

export interface CarrosselConfig {
  title: string;
  subtitle: string;
  folder: string;
  selectedUrls: string[];
  autoplaySpeed: number;
}

export const DEFAULT_CARROSSEL_CONFIG: CarrosselConfig = {
  title: "Nossos Projetos em Destaque",
  subtitle: "Veja alguns dos containers transformados pela Dodisa",
  folder: "",
  selectedUrls: [],
  autoplaySpeed: 3000,
};

export function getCarrosselConfig(): CarrosselConfig {
  try {
    const saved = localStorage.getItem(CARROSSEL_CONFIG_KEY);
    if (saved) return { ...DEFAULT_CARROSSEL_CONFIG, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_CARROSSEL_CONFIG;
}

export function saveCarrosselConfigToStorage(config: CarrosselConfig) {
  localStorage.setItem(CARROSSEL_CONFIG_KEY, JSON.stringify(config));
}

export default function CarrosselGaleria() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [config] = useState<CarrosselConfig>(getCarrosselConfig);

  // Lightbox
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Scroll strip
  const stripRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHovered = useRef(false);

  // Drag-to-scroll
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  // ── Load images ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      if (config.selectedUrls.length > 0) {
        setImages(config.selectedUrls);
        setLoading(false);
        return;
      }

      if (config.folder) {
        const supabase = getSupabase();
        if (supabase) {
          try {
            const { data } = await supabase.storage
              .from("site-assets")
              .list(`gallery/${config.folder}`, {
                limit: 100,
                sortBy: { column: "created_at", order: "desc" },
              });
            if (data && data.length > 0) {
              const urls = data
                .filter((f) => f.name && f.name !== ".emptyFolderPlaceholder")
                .map(
                  (f) =>
                    supabase.storage
                      .from("site-assets")
                      .getPublicUrl(`gallery/${config.folder}/${f.name}`)
                      .data.publicUrl
                );
              setImages(urls);
              setLoading(false);
              return;
            }
          } catch {}
        }
      }

      setImages([]);
      setLoading(false);
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.folder, config.selectedUrls.join(",")]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  const CARD_W = 288; // px — matches w-72

  const scrollBy = useCallback((delta: number) => {
    const el = stripRef.current;
    if (!el) return;
    const next = el.scrollLeft + delta;
    // Loop: if we've scrolled past the halfway point, reset to start clone zone
    const half = el.scrollWidth / 2;
    el.scrollLeft = next >= el.scrollWidth - el.clientWidth ? 0 : next < 0 ? half : next;
  }, []);

  const startAuto = useCallback(() => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    autoScrollRef.current = setInterval(() => {
      if (!isHovered.current) scrollBy(CARD_W + 16);
    }, config.autoplaySpeed);
  }, [config.autoplaySpeed, scrollBy]);

  useEffect(() => {
    if (images.length > 1) startAuto();
    return () => { if (autoScrollRef.current) clearInterval(autoScrollRef.current); };
  }, [images.length, startAuto]);

  // ── Arrow nav ─────────────────────────────────────────────────────────────
  const arrowScroll = (dir: 1 | -1) => {
    const el = stripRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (CARD_W + 16) * 2, behavior: "smooth" });
    startAuto();
  };

  // ── Drag-to-scroll ────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.pageX - (stripRef.current?.offsetLeft ?? 0);
    dragScrollLeft.current = stripRef.current?.scrollLeft ?? 0;
    if (stripRef.current) stripRef.current.style.cursor = "grabbing";
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !stripRef.current) return;
    e.preventDefault();
    const x = e.pageX - stripRef.current.offsetLeft;
    stripRef.current.scrollLeft = dragScrollLeft.current - (x - dragStartX.current);
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (stripRef.current) stripRef.current.style.cursor = "grab";
  };

  // ── Lightbox keyboard ─────────────────────────────────────────────────────
  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setLightboxIdx((p) => p !== null ? (p + 1) % images.length : null);
      if (e.key === "ArrowLeft")  setLightboxIdx((p) => p !== null ? (p - 1 + images.length) % images.length : null);
      if (e.key === "Escape")     setLightboxIdx(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIdx, images.length]);

  if (loading || images.length === 0) return null;

  // Duplicate images for seamless loop feel
  const strip = images.length > 3 ? [...images, ...images] : images;

  return (
    <>
      <section id="carrossel" className="relative py-16 bg-[#0B0F14] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1c1917_0%,_#0c0a09_70%)] pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          {(config.title || config.subtitle) && (
            <div className="text-center mb-10 px-4">
              {config.title && (
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
                  {config.title.split(" ").map((word, i, arr) =>
                    i === arr.length - 1 ? (
                      <span key={i} className="text-orange-500"> {word}</span>
                    ) : (
                      <span key={i}>{word} </span>
                    )
                  )}
                </h2>
              )}
              {config.subtitle && (
                <p className="text-stone-400 mt-3 text-sm max-w-2xl mx-auto leading-relaxed">
                  {config.subtitle}
                </p>
              )}
            </div>
          )}

          {/* Strip + arrows */}
          <div className="relative group/strip">
            {/* Left arrow */}
            <button
              onClick={() => arrowScroll(-1)}
              aria-label="Anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-orange-600 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110 cursor-pointer opacity-0 group-hover/strip:opacity-100 shadow-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right arrow */}
            <button
              onClick={() => arrowScroll(1)}
              aria-label="Próxima"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-orange-600 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110 cursor-pointer opacity-0 group-hover/strip:opacity-100 shadow-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Scrollable strip */}
            <div
              ref={stripRef}
              className="flex gap-4 overflow-x-auto scrollbar-none px-6 select-none"
              style={{ cursor: "grab", scrollBehavior: "auto" }}
              onMouseEnter={() => { isHovered.current = true; }}
              onMouseLeave={() => { isHovered.current = false; onMouseUp(); }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
            >
              {strip.map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  onClick={() => {
                    if (!isDragging.current) setLightboxIdx(i % images.length);
                  }}
                  className="w-72 h-52 flex-shrink-0 rounded-2xl overflow-hidden relative group/card border border-white/5 hover:border-orange-500/40 transition-all duration-300 shadow-lg hover:shadow-orange-500/10 cursor-pointer"
                >
                  <img
                    src={url}
                    alt={`Projeto Dodisa ${(i % images.length) + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                    draggable={false}
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
                  </div>
                </div>
              ))}
            </div>

            {/* Edge fades */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0B0F14] to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0B0F14] to-transparent pointer-events-none z-10" />
          </div>
        </div>
      </section>

      {/* ── Lightbox ── */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex items-center justify-center"
          onClick={() => setLightboxIdx(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-all cursor-pointer z-10"
            onClick={() => setLightboxIdx(null)}
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-xs font-mono tabular-nums bg-black/40 px-3 py-1.5 rounded-full">
            {lightboxIdx + 1} / {images.length}
          </div>

          {/* Prev */}
          {images.length > 1 && (
            <button
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-orange-600 text-white p-3 rounded-full transition-all cursor-pointer z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((p) => p !== null ? (p - 1 + images.length) % images.length : 0); }}
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <img
            src={images[lightboxIdx]}
            alt={`Projeto Dodisa ${lightboxIdx + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />

          {/* Next */}
          {images.length > 1 && (
            <button
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-orange-600 text-white p-3 rounded-full transition-all cursor-pointer z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((p) => p !== null ? (p + 1) % images.length : 0); }}
              aria-label="Próxima"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { getSupabase } from "../lib/supabase";
import { useAppContext } from "../context/AppContext";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CARD_W = 288; // px — matches w-72, same as CarrosselGaleria for visual consistency
const GAP = 16; // gap-4
const STEP = CARD_W + GAP;
const TRANSITION = { duration: 0.6, ease: [0.65, 0, 0.35, 1] as const };

export default function MaosAObra() {
  const { maosAObra: config } = useAppContext();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [resetting, setResetting] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const isHovered = useRef(false);

  // Fetch + shuffle (once per successful fetch / folder change)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      if (!config.folder) {
        if (!cancelled) { setImages([]); setLoading(false); }
        return;
      }
      const supabase = getSupabase();
      if (!supabase) {
        if (!cancelled) { setImages([]); setLoading(false); }
        return;
      }
      try {
        const { data } = await supabase.storage
          .from("site-assets")
          .list(`gallery/${config.folder}`, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
        if (data && data.length > 0) {
          const urls = data
            .filter((f) => f.name && f.name !== ".emptyFolderPlaceholder")
            .map((f) => supabase.storage.from("site-assets").getPublicUrl(`gallery/${config.folder}/${f.name}`).data.publicUrl);
          if (!cancelled) { setImages(shuffle(urls)); setIndex(0); }
        } else if (!cancelled) {
          setImages([]);
        }
      } catch {
        if (!cancelled) setImages([]);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.folder]);

  // Auto-advance
  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      if (!isHovered.current) setIndex((i) => i + 1);
    }, config.autoplaySpeed);
    return () => clearInterval(id);
  }, [images.length, config.autoplaySpeed]);

  // Lightbox keyboard nav
  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setLightboxIdx((p) => (p !== null ? (p + 1) % images.length : null));
      if (e.key === "ArrowLeft") setLightboxIdx((p) => (p !== null ? (p - 1 + images.length) % images.length : null));
      if (e.key === "Escape") setLightboxIdx(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIdx, images.length]);

  if (loading || images.length === 0) return null;

  // Duplicate once so the strip can loop seamlessly.
  const loopImages = images.length > 1 ? [...images, ...images] : images;

  return (
    <>
      <section id="maos-a-obra" className="relative bg-[#07090D] py-14 sm:py-24 border-b border-zinc-800/60 scroll-mt-20 overflow-hidden">
        <div className="relative z-10">
          {(config.title || config.subtitle) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-12 px-4"
            >
              {config.title && (
                <h2 className="text-3xl sm:text-5xl font-black font-display uppercase tracking-tight text-white leading-none">
                  {config.title}
                </h2>
              )}
              {config.subtitle && (
                <p className="mt-4 text-stone-400 font-sans text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
                  {config.subtitle}
                </p>
              )}
            </motion.div>
          )}

          <div
            className="relative"
            onMouseEnter={() => { isHovered.current = true; }}
            onMouseLeave={() => { isHovered.current = false; }}
          >
            <div className="overflow-hidden px-6">
              <motion.div
                className="flex gap-4"
                animate={{ x: -index * STEP }}
                transition={resetting ? { duration: 0 } : TRANSITION}
                onAnimationComplete={() => {
                  if (index === images.length) { setResetting(true); setIndex(0); }
                  else if (resetting) { setResetting(false); }
                }}
              >
                {loopImages.map((url, i) => (
                  <div
                    key={`${url}-${i}`}
                    onClick={() => setLightboxIdx(i % images.length)}
                    className="w-72 h-52 flex-shrink-0 rounded-2xl overflow-hidden relative group/card border border-zinc-800 hover:border-brand-yellow/40 transition-all duration-300 shadow-xl cursor-pointer"
                  >
                    <img
                      src={url}
                      alt={`Mãos à Obra Dodisa ${(i % images.length) + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                      draggable={false}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#07090D] to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#07090D] to-transparent pointer-events-none z-10" />
          </div>
        </div>
      </section>

      {/* Lightbox — same visual pattern as CarrosselGaleria's, component-local */}
      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex items-center justify-center" onClick={() => setLightboxIdx(null)}>
          <button className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-all cursor-pointer z-10" onClick={() => setLightboxIdx(null)} aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-xs font-mono tabular-nums bg-black/40 px-3 py-1.5 rounded-full">
            {lightboxIdx + 1} / {images.length}
          </div>
          {images.length > 1 && (
            <button
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-brand-yellow hover:text-zinc-950 text-white p-3 rounded-full transition-all cursor-pointer z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((p) => (p !== null ? (p - 1 + images.length) % images.length : 0)); }}
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <img
            src={images[lightboxIdx]}
            alt={`Mãos à Obra Dodisa ${lightboxIdx + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
          {images.length > 1 && (
            <button
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-brand-yellow hover:text-zinc-950 text-white p-3 rounded-full transition-all cursor-pointer z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((p) => (p !== null ? (p + 1) % images.length : 0)); }}
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
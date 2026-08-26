import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Hammer, CheckCircle2, Award, ChevronLeft, ChevronRight, X, MessageSquare } from "lucide-react";
import { useAppContext } from "../context/AppContext";

// ─── Before/After drag slider ─────────────────────────────────────────────────

function BeforeAfterSlider({ before, after, alt }: { before?: string; after: string; alt: string }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const calcPos = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100)));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none touch-none"
      style={{ cursor: "col-resize" }}
      onPointerDown={(e) => {
        dragging.current = true;
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        calcPos(e.clientX);
      }}
      onPointerMove={(e) => { if (dragging.current) calcPos(e.clientX); }}
      onPointerUp={() => { dragging.current = false; }}
      onPointerCancel={() => { dragging.current = false; }}
    >
      <img
        src={after} alt={alt} draggable={false}
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        {before ? (
          <img
            src={before} alt={`${alt} — Antes`} draggable={false}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <>
            <img
              src={after} alt={`${alt} — Antes`} draggable={false}
              className="absolute inset-0 w-full h-full object-cover object-center brightness-50 grayscale"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="px-3 py-1.5 rounded-lg bg-zinc-900/80 text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                Foto "antes" em breve
              </span>
            </div>
          </>
        )}
      </div>
      <div className="absolute top-0 bottom-0 z-10 pointer-events-none" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -translate-x-1/2 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.9)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center gap-px">
          <span className="text-zinc-800 text-sm font-black leading-none">‹</span>
          <span className="text-zinc-800 text-sm font-black leading-none">›</span>
        </div>
      </div>
      <span className="absolute top-3 left-3 z-20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg bg-brand-orange/90 text-white backdrop-blur-sm pointer-events-none">
        Antes
      </span>
      <span className="absolute top-3 right-3 z-20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg bg-emerald-600/90 text-white backdrop-blur-sm pointer-events-none">
        Depois
      </span>
    </div>
  );
}

// ─── Day/Night overlay ────────────────────────────────────────────────────────

function DayNightOverlay({ nightImage, afterImage, alt }: { nightImage?: string; afterImage: string; alt: string }) {
  const [isNight, setIsNight] = useState(false);

  return (
    <>
      <div
        className={`absolute inset-0 z-40 transition-opacity duration-700 ${isNight ? "opacity-100 pointer-events-none" : "opacity-0 pointer-events-none"}`}
      >
        {nightImage ? (
          <img
            src={nightImage}
            alt={`${alt} — Noturno`}
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <>
            {/* Placeholder noturno: visível — crepúsculo, não preto */}
            <img
              src={afterImage}
              alt={`${alt} — Noturno`}
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.55] saturate-[0.6] hue-rotate-[200deg]"
            />
            <div className="absolute inset-0 bg-indigo-950/20" />
            <div className="absolute inset-0 flex items-end justify-center pb-12">
              <span className="px-3 py-1.5 rounded-lg bg-zinc-900/70 text-[9px] font-mono text-zinc-400 uppercase tracking-widest backdrop-blur-sm border border-white/10">
                📸 Foto noturna em breve
              </span>
            </div>
          </>
        )}
        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg bg-indigo-950/90 text-indigo-300 backdrop-blur-sm">
          🌙 Noturno
        </span>
      </div>
      <button
        onClick={() => setIsNight((n) => !n)}
        aria-label={isNight ? "Ver versão diurna" : "Ver versão noturna"}
        className={`absolute bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest font-mono border transition-all duration-300 cursor-pointer ${
          isNight
            ? "bg-indigo-950/90 border-indigo-400/40 text-indigo-200 hover:border-indigo-300"
            : "bg-brand-black/90 border-white/10 text-zinc-300 hover:border-white/30"
        }`}
      >
        <span className="text-sm leading-none">{isNight ? "☀️" : "🌙"}</span>
        <span>{isNight ? "Diurno" : "Noturno"}</span>
      </button>
    </>
  );
}

// ─── Gallery lightbox ─────────────────────────────────────────────────────────

const PLACEHOLDER_GALLERY = [
  "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
];

function GalleryLightbox({
  images,
  title,
  whatsappNumber,
  onClose,
}: {
  images: string[];
  title: string;
  whatsappNumber: string;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const list = images.length > 0 ? images : PLACEHOLDER_GALLERY;
  const isPlaceholder = images.length === 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx((i) => Math.min(i + 1, list.length - 1));
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(i - 1, 0));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, list.length]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-brand-yellow uppercase tracking-widest">Galeria do Projeto</span>
            <h3 className="text-sm font-black text-white uppercase tracking-tight">{title}</h3>
            {isPlaceholder && (
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                📸 Placeholders — fotos reais em breve
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-[10px] font-mono uppercase tracking-widest transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            Fechar (Esc)
          </button>
        </div>

        {/* Main image */}
        <div className="relative aspect-video w-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
          <img
            src={list[idx]}
            alt={`${title} — foto ${idx + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Prev/Next */}
          {idx > 0 && (
            <button
              onClick={() => setIdx((i) => i - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 border border-white/10 flex items-center justify-center text-white hover:bg-black/90 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {idx < list.length - 1 && (
            <button
              onClick={() => setIdx((i) => i + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 border border-white/10 flex items-center justify-center text-white hover:bg-black/90 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          {/* Counter */}
          <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/70 text-[9px] font-mono text-zinc-400">
            {idx + 1} / {list.length}
          </span>
        </div>

        {/* Thumbnails */}
        {list.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {list.map((src, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  i === idx ? "border-brand-yellow" : "border-zinc-700 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={src} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        )}

        {/* CTA dentro do modal */}
        <button
          onClick={() => {
            const msg = encodeURIComponent(`Olá! Vi o catálogo do projeto '${title}' no site e gostaria de fazer uma pergunta.`);
            window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank");
          }}
          className="w-full py-4 bg-brand-yellow hover:bg-brand-orange text-brand-black font-black text-sm uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-brand-yellow/10"
        >
          <MessageSquare className="w-5 h-5" />
          Faça sua pergunta
        </button>
      </div>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function Projetos() {
  const { projects, whatsapp: systemWhatsapp } = useAppContext();
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [galleryProject, setGalleryProject] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const visibleProjects = projects.filter((p) => p.visible);

  useEffect(() => {
    if (visibleProjects.length <= 1 || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setActiveProjectIdx((prev) => (prev + 1) % visibleProjects.length);
    }, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visibleProjects, isHovered]);

  if (visibleProjects.length === 0) return null;

  const safeIdx = activeProjectIdx >= visibleProjects.length ? 0 : activeProjectIdx;
  const activeProject = visibleProjects[safeIdx] || visibleProjects[0];

  const galleryProjectData = galleryProject
    ? visibleProjects.find((p) => p.id === galleryProject)
    : null;

  return (
    <section
      id="projetos"
      className="relative py-14 sm:py-28 bg-[#0B0F14] overflow-hidden border-t border-white/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-20"
        >
          <h2 className="text-3xl sm:text-5xl font-black font-display text-white uppercase tracking-tight">
            PROJETOS <span className="text-brand-yellow">REALIZADOS</span>
          </h2>
          <div className="w-12 h-0.5 bg-brand-yellow mx-auto mt-4 mb-6" />
          <p className="mt-4 text-stone-400 font-sans text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            +1.850 módulos entregues. 6× mais rápido que obra convencional.
          </p>
        </motion.div>

        {/* Feature Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* Column A: Project Tab Selector */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex flex-col gap-4 w-full"
          >
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest ml-1 font-mono flex items-center justify-between">
              <span>Selecione a obra realizada</span>
              {isHovered ? (
                <span className="text-[#9CA3AF] lowercase font-normal italic">loop pausado</span>
              ) : (
                <span className="text-brand-yellow animate-pulse text-[9px] font-black tracking-widest">AUTO-CICLO ATIVO</span>
              )}
            </span>

            <div className="space-y-3">
              {visibleProjects.map((proj, idx) => (
                <button
                  key={proj.id}
                  onClick={() => setActiveProjectIdx(idx)}
                  className={`w-full text-left p-6 rounded-xl border transition-colors flex flex-col relative overflow-hidden cursor-pointer ${
                    safeIdx === idx
                      ? "bg-zinc-900 border-brand-yellow/40 text-white"
                      : "bg-zinc-900/40 hover:bg-zinc-900 border-zinc-800 text-stone-400 hover:text-stone-200"
                  }`}
                >
                  {safeIdx === idx && (
                    <>
                      <div className="absolute top-0 right-0 py-1 px-3 bg-brand-yellow text-[8px] font-black uppercase text-brand-black rounded-bl-xl font-mono">
                        ATIVO
                      </div>
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-yellow" />
                    </>
                  )}
                  <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-1.5 font-mono">
                    {proj.category}
                  </span>
                  <span className="text-base sm:text-lg font-black uppercase tracking-tight leading-snug font-display text-stone-100">
                    {proj.title}
                  </span>
                  <span className="text-xs text-stone-400 font-sans mt-2 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3.5 mt-2">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-orange flex-shrink-0" />
              <p className="text-[11px] text-stone-400 font-sans leading-normal">
                <span className="font-bold text-stone-200 uppercase">Laudo de Engenharia:</span> Cada obra tem registro fotográfico, ART e teste estrutural.
              </p>
            </div>
          </motion.div>

          {/* Column B: Visual Showcase */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProject.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8 flex flex-col gap-6 relative"
              >
                {/* Image area */}
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-zinc-800 bg-brand-dark group">
                  <BeforeAfterSlider
                    before={activeProject.imageBefore}
                    after={activeProject.imageAfter}
                    alt={activeProject.title}
                  />
                  <DayNightOverlay
                    nightImage={activeProject.imageNight}
                    afterImage={activeProject.imageAfter}
                    alt={activeProject.title}
                  />
                  <div className="absolute bottom-4 left-4 z-30 hidden sm:block pointer-events-none">
                    <p className="text-[9px] text-stone-400 font-mono tracking-wider bg-brand-black/85 px-3 py-1.5 rounded-lg border border-white/5">
                      Local: Pátio Logístico RS • Dodisa Engenharia
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                    <div>
                      <span className="text-[10px] font-bold text-brand-orange uppercase tracking-widest font-mono">
                        DADOS DA IMPLANTAÇÃO
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1 leading-none font-display">
                        {activeProject.title}
                      </h3>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <button
                        onClick={() => setGalleryProject(activeProject.id)}
                        className="px-5 py-3 min-h-[44px] bg-brand-yellow hover:bg-brand-orange text-brand-black font-black text-xs uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Hammer className="w-4 h-4 stroke-[2.5]" />
                        Consultar projeto
                      </button>
                    </div>
                  </div>

                  {/* Execution time infographic */}
                  <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/5">
                    <span className="block text-[9px] font-black text-stone-500 uppercase tracking-widest mb-4 font-mono">
                      Prazo de Execução
                    </span>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-mono text-stone-400 w-28 sm:w-32 flex-shrink-0 text-right leading-tight">
                          Obra Tradicional
                        </span>
                        <div className="flex-1 h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-zinc-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.85, ease: "easeOut", delay: 0.15 }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-stone-500 w-20 flex-shrink-0">
                          90 – 120 dias
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-mono text-brand-yellow font-black w-28 sm:w-32 flex-shrink-0 text-right leading-tight">
                          Padrão Dodisa ⚡
                        </span>
                        <div className="flex-1 h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-brand-yellow rounded-full"
                            style={{ boxShadow: "0 0 8px rgba(251,191,36,0.65)" }}
                            initial={{ width: 0 }}
                            animate={{ width: "17%" }}
                            transition={{ duration: 0.85, ease: "easeOut", delay: 0.35 }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-brand-yellow font-black w-20 flex-shrink-0">
                          15 – 20 dias
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                      <span className="text-brand-yellow text-xs leading-none">⚡</span>
                      <span className="text-[9px] font-mono text-stone-400">
                        <span className="text-white font-black">6× mais rápido</span> que o modelo tradicional de construção
                      </span>
                    </div>
                  </div>

                  <p className="text-stone-300 font-sans text-xs sm:text-sm leading-relaxed">
                    {activeProject.description}
                  </p>

                  {activeProject.specs && (
                    <div className="mt-2 p-5 rounded-xl bg-brand-black/60 border border-white/5">
                      <h4 className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-3.5 font-mono flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-brand-yellow" /> Especificações Estruturais Implantadas
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {activeProject.specs.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-stone-200 font-sans">
                            <CheckCircle2 className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Logistics seal */}
                <div className="flex items-start gap-4 pt-5 border-t border-white/5">
                  <div className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-brand-yellow/10 border border-brand-yellow/25 flex items-center gap-1.5">
                    <span className="text-brand-yellow text-[10px]">🏗️</span>
                    <span className="text-[8px] font-black text-brand-yellow uppercase tracking-widest font-mono whitespace-nowrap">
                      Logística Integrada
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 font-sans leading-relaxed">
                    Não dependemos de terceiros. Da fabricação à fundação: entrega e içamento milimétrico garantidos por nossa frota pesada e caminhões munck próprios.
                  </p>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Gallery lightbox */}
      {galleryProjectData && (
        <GalleryLightbox
          images={galleryProjectData.gallery ?? []}
          title={galleryProjectData.title}
          whatsappNumber={systemWhatsapp.number}
          onClose={() => setGalleryProject(null)}
        />
      )}
    </section>
  );
}

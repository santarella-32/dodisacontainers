import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Check, MessageSquare, LayoutGrid, ChevronRight, ChevronLeft, Sparkles, Zap, Package } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const MAX_SPECS = 4;

// Application combos — cross-sell bundles built from existing product categories
const COMBOS: Record<string, { cats: string[]; label: string; description: string }> = {
  "Canteiro de Obras": {
    cats: ["Escritório", "Banheiro", "Vestiário", "Almoxarifado"],
    label: "🏗️ Canteiro de Obras",
    description: "Conjunto completo para canteiro: escritório, banheiro, vestiário e almoxarifado — tudo da Dodisa, entregue em 24h.",
  },
  "Módulos Logística": {
    cats: ["Depósito", "Almoxarifado"],
    label: "📦 Módulos Logística",
    description: "Estrutura modular para armazenamento e controle logístico — depósito e almoxarifado prontos para operar.",
  },
};

// Reusable technical micro-seal badge
function TechSeal({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded bg-zinc-950/80 backdrop-blur border border-white/10 text-[8px] font-black font-mono text-zinc-300 uppercase tracking-widest whitespace-nowrap">
      <span className="w-1 h-1 rounded-full bg-brand-yellow flex-shrink-0" />
      {label}
    </span>
  );
}

const TECH_SEALS = ["Isolamento PIR", "Chassi Naval"];

const STATUS_STYLES: Record<string, string> = {
  "Disponível":   "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Sob Consulta": "bg-amber-500/15  text-amber-400  border-amber-500/30",
  "Vendido":      "bg-red-500/15    text-red-400    border-red-500/30",
  "Alugado":      "bg-sky-500/15    text-sky-400    border-sky-500/30",
};

function getMetrics() {
  const w = window.innerWidth;
  if (w < 640) return { cardWidth: Math.min(Math.round(w * 0.84), 340), cardStep: Math.round(w * 0.70) };
  if (w < 1024) return { cardWidth: 300, cardStep: 270 };
  return { cardWidth: 360, cardStep: 330 };
}

export default function ContainersGrid() {
  const { containers, whatsapp: systemWhatsapp } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [{ cardWidth, cardStep }, setMetrics] = useState(getMetrics);

  useEffect(() => {
    const update = () => setMetrics(getMetrics());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const touchStartX = useRef(0);

  const visibleContainers = (containers || []).filter((item) => item.visible);

  const categoriesSet = new Set<string>(["Todos"]);
  visibleContainers.forEach((item) => { if (item.category) categoriesSet.add(item.category); });
  const categories = Array.from(categoriesSet);
  const comboNames = Object.keys(COMBOS);

  const isCombo = selectedCategory in COMBOS;
  const filteredContainers =
    selectedCategory === "Todos"
      ? visibleContainers
      : isCombo
      ? visibleContainers.filter((item) => COMBOS[selectedCategory].cats.includes(item.category))
      : visibleContainers.filter((item) => item.category === selectedCategory);

  const maxIdx = Math.max(0, filteredContainers.length - 1);

  // Reset on category change
  useEffect(() => { setCurrentIdx(0); }, [selectedCategory]);

  // Clamp when items change
  useEffect(() => {
    setCurrentIdx((prev) => Math.min(prev, maxIdx));
  }, [maxIdx]);

  const goTo = (idx: number) => setCurrentIdx(Math.max(0, Math.min(idx, maxIdx)));
  const prev = () => setCurrentIdx(Math.max(0, currentIdx - 1));
  const next = () => setCurrentIdx(Math.min(maxIdx, currentIdx + 1));

  const handleRequest = (container: typeof containers[0]) => {
    const defaultMsg = `Olá! Tenho interesse no container "${container.title}" (${container.category}) do site da Dodisa Containers e gostaria de solicitar um orçamento.`;
    const msg = container.whatsappMsg || defaultMsg;
    window.open(`https://wa.me/${systemWhatsapp.number}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <section id="containers" className="relative py-14 sm:py-24 bg-[#0B0F14] overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24, rotateX: -10 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{ perspective: "800px" }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-3xl sm:text-5xl font-black font-display text-white uppercase tracking-tight">
            NOSSOS <span className="text-brand-yellow">CONTAINERS</span>
          </h2>
          <div className="w-12 h-0.5 bg-brand-yellow mx-auto mt-4 mb-6" />
          <p className="mt-4 text-stone-400 font-sans text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Engenharia modular de alto padrão. Estrutura naval robusta e isolamento térmico avançado (painéis PIR) para projetos que exigem velocidade e zero dor de cabeça.
          </p>
        </motion.div>

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-2.5 mb-4 max-w-4xl mx-auto overflow-x-auto pb-2 sm:pb-0 px-1 sm:px-0 scrollbar-none"
        >
          {/* Regular category tabs */}
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2.5 min-h-[44px] rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all duration-200 border font-mono cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? "bg-brand-yellow border-brand-yellow text-brand-black shadow-lg shadow-brand-yellow/10"
                  : "bg-[#111827]/55 hover:bg-[#1f2a3d] text-stone-400 hover:text-white border-white/5"
              }`}
            >
              {cat === "Todos" && <LayoutGrid className="w-3.5 h-3.5" />}
              {cat}
            </button>
          ))}

          {/* Divider */}
          <span className="hidden sm:block w-px h-7 bg-white/10 mx-1 flex-shrink-0" />

          {/* Combo / application tabs */}
          {comboNames.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedCategory(name)}
              className={`flex-shrink-0 px-4 py-2.5 min-h-[44px] rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all duration-200 border font-mono cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === name
                  ? "bg-brand-orange border-brand-orange text-white shadow-lg shadow-brand-orange/15"
                  : "bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange border-brand-orange/30 hover:border-brand-orange/60"
              }`}
            >
              <Package className="w-3.5 h-3.5 flex-shrink-0" />
              {name}
            </button>
          ))}
        </motion.div>

        {/* Combo banner */}
        {isCombo && (
          <div className="max-w-2xl mx-auto mb-8 flex items-start gap-3 px-4 py-3 rounded-xl bg-brand-orange/8 border border-brand-orange/20 text-sm text-stone-300 font-sans">
            <Package className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-black text-white text-[11px] uppercase tracking-wider font-mono mr-2">Combo {selectedCategory}</span>
              <span className="text-[11px] text-stone-400">{COMBOS[selectedCategory].description}</span>
            </div>
          </div>
        )}

        {/* Coverflow carousel */}
        {filteredContainers.length === 0 ? (
          <div className="text-center py-24 text-stone-500 text-sm font-sans">
            Nenhum container encontrado nesta categoria.
          </div>
        ) : (
          <>
            <div
              className="relative group/carousel"
              onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                const diff = touchStartX.current - e.changedTouches[0].clientX;
                if (diff > 40) next();
                else if (diff < -40) prev();
              }}
            >
              {/* Left arrow */}
              {filteredContainers.length > 1 && (
                <button
                  onClick={prev}
                  aria-label="Anterior"
                  className="absolute left-0 top-1/3 -translate-y-1/2 -translate-x-2 z-20 bg-black/70 hover:bg-brand-yellow backdrop-blur-sm text-white hover:text-brand-black p-3 rounded-full transition-all shadow-xl cursor-pointer sm:-translate-x-4"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Right arrow */}
              {filteredContainers.length > 1 && (
                <button
                  onClick={next}
                  aria-label="Próximo"
                  className="absolute right-0 top-1/3 -translate-y-1/2 translate-x-2 z-20 bg-black/70 hover:bg-brand-yellow backdrop-blur-sm text-white hover:text-brand-black p-3 rounded-full transition-all shadow-xl cursor-pointer sm:translate-x-4"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Coverflow — CSS Grid overlap */}
              <div className="overflow-hidden py-6" style={{ perspective: "1400px" }}>
                <div style={{ display: "grid" }}>
                  {filteredContainers.map((container, index) => {
                    const n = filteredContainers.length;
                    const raw = index - currentIdx;
                    const offset = raw - Math.round(raw / n) * n;
                    const absOffset = Math.abs(offset);
                    if (absOffset > 2) return null;

                    const isCenter = absOffset === 0;
                    const isSide = absOffset === 1;
                    const statusStyle = STATUS_STYLES[container.status] ?? STATUS_STYLES["Sob Consulta"];
                    const visibleSpecs = container.specs.slice(0, MAX_SPECS);
                    const extraSpecs = container.specs.length - MAX_SPECS;

                    return (
                      <motion.div
                        key={container.id}
                        animate={{
                          x: offset * cardStep,
                          scale: isCenter ? 1 : isSide ? 0.78 : 0.62,
                          rotateY: isCenter ? 0 : offset > 0 ? -32 : 32,
                          opacity: isCenter ? 1 : isSide ? 0.65 : 0,
                          zIndex: isCenter ? 10 : isSide ? 5 : 0,
                        }}
                        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        onClick={!isCenter ? () => goTo(index) : undefined}
                        aria-hidden={!isCenter && !isSide}
                        style={{
                          gridArea: "1 / 1",
                          width: cardWidth,
                          margin: "0 auto",
                          cursor: isCenter ? "default" : "pointer",
                          pointerEvents: (isCenter || isSide) ? "auto" : "none",
                        }}
                      >
                        <div
                          className={`flex flex-col rounded-xl border transition-all duration-300 group overflow-hidden h-full ${
                            isCenter
                              ? container.destacado
                                ? "border-brand-yellow/50 hover:border-brand-yellow/70 hover:shadow-[0_0_28px_rgba(251,191,36,0.18)]"
                                : "border-zinc-700 hover:border-zinc-600 hover:shadow-[0_0_28px_rgba(255,255,255,0.07)]"
                              : "border-zinc-800"
                          } bg-zinc-900`}
                        >
                          {/* Image */}
                          <div className="relative h-60 w-full overflow-hidden flex-shrink-0">
                            {container.destacado && (
                              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-brand-yellow text-brand-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                                <Sparkles className="w-2.5 h-2.5" /> Destaque
                              </div>
                            )}
                            <span className="absolute top-4 left-4 z-10 px-2.5 py-1 text-[9px] font-black text-brand-black bg-brand-yellow rounded-lg uppercase tracking-wider shadow-md">
                              {container.category}
                            </span>
                            <span className={`absolute top-4 right-4 z-10 px-2.5 py-1 text-[9px] font-black rounded-lg border uppercase tracking-wider shadow-md ${statusStyle}`}>
                              {container.status}
                            </span>
                            <img
                              src={container.image}
                              alt={container.title}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14]/60 via-transparent to-transparent pointer-events-none" />
                            {/* Technical micro-seals floating over image gradient */}
                            <div className="absolute bottom-2.5 left-3 z-10 flex flex-wrap gap-1.5">
                              {TECH_SEALS.map(seal => <TechSeal key={seal} label={seal} />)}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-base font-black text-stone-100 uppercase tracking-tight group-hover:text-brand-yellow transition-colors font-display line-clamp-1 mb-2">
                              {container.title}
                            </h3>
                            <p className="text-stone-400 font-sans text-xs leading-relaxed line-clamp-3 mb-5">
                              {container.description}
                            </p>

                            {/* Specs */}
                            {visibleSpecs.length > 0 && (
                              <div className="border-t border-white/5 pt-4 mb-5 space-y-1.5">
                                {visibleSpecs.map((spec, sIdx) => (
                                  <div key={sIdx} className="flex items-start gap-2 text-[11px] text-stone-300 font-sans leading-tight">
                                    <Check className="w-3.5 h-3.5 text-brand-yellow flex-shrink-0 mt-0.5 stroke-[2.5]" />
                                    <span>{spec}</span>
                                  </div>
                                ))}
                                {extraSpecs > 0 && (
                                  <p className="text-[10px] text-stone-500 font-mono mt-1 pl-5">
                                    +{extraSpecs} especificações
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Delivery sub-copy */}
                            <div className="flex items-center gap-1.5 mb-3 text-[10px] font-mono text-zinc-500">
                              <Zap className="w-3 h-3 text-brand-yellow flex-shrink-0" />
                              <span>Canteiro operacional em menos de 24h.</span>
                            </div>

                            {/* CTA */}
                            <div className="mt-auto">
                              <button
                                onClick={() => handleRequest(container)}
                                className="w-full py-3 px-4 min-h-[44px] bg-brand-yellow hover:bg-brand-orange text-brand-black font-black text-xs uppercase tracking-widest rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-display"
                              >
                                <MessageSquare className="w-4 h-4" />
                                Solicitar cotação
                                <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                              </button>
                              <p className="mt-2 text-center text-[9px] font-mono text-zinc-500">
                                ✅ 100% Adequado às Normas NR-18 e NR-24.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dots */}
            {maxIdx > 0 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {filteredContainers.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={`rounded-full transition-all duration-300 cursor-pointer ${
                      i === currentIdx
                        ? "w-6 h-1.5 bg-brand-yellow"
                        : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

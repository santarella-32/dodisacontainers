import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { MessageSquare, MapPin, BadgeCheck, Zap, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { useAppContext, ProntaEntregaItem } from "../context/AppContext";

function dailyViewCount(seed: string) {
  const day = new Date().getDate() + new Date().getMonth() * 31;
  const hash = [...seed].reduce((acc, c) => acc + c.charCodeAt(0), day);
  return 5 + (hash % 12); // 5–16 pessoas
}

function ProntaEntregaCard({
  item,
  onInterest,
}: {
  item: ProntaEntregaItem;
  onInterest: () => void;
})
 {
  const [imgIdx, setImgIdx] = useState(0);
  const images = item.images && item.images.length > 0
    ? item.images
    : ["https://images.unsplash.com/photo-1594913785162-e67853127ee9?auto=format&fit=crop&w=600&q=80"];
  const hasMultiple = images.length > 1;

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIdx((p) => (p - 1 + images.length) % images.length);
  };
  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIdx((p) => (p + 1) % images.length);
  };

  const getDealType = () => {
    if (item.availableForSale && item.availableForRent) return "Venda ou Locação";
    if (item.availableForSale) return "Disponível p/ Venda";
    if (item.availableForRent) return "Disponível p/ Locação";
    return "Sob Consulta";
  };

  return (
    <div className="bg-[#111827]/40 backdrop-blur-md border border-white/5 hover:border-brand-yellow/30 rounded-2xl overflow-hidden transition-all duration-300 group flex flex-col shadow-xl h-full">
      {/* Image gallery */}
      <div className="relative h-60 overflow-hidden bg-[#0B0F14] flex-shrink-0">
        <img
          src={images[imgIdx]}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {hasMultiple && (
          <>
            <button
              onClick={prevImg}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-all cursor-pointer z-10"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextImg}
              aria-label="Próxima foto"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-all cursor-pointer z-10"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* Top badges */}
        <div className="absolute top-3 left-3 z-10 bg-brand-orange text-white font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded shadow-lg flex items-center gap-1.5 ring-1 ring-white/10">
          <Zap className="w-3 h-3 fill-current animate-pulse" /> DISPONÍVEL HOJE
        </div>
        <div className="absolute top-3 right-3 z-10 bg-black/75 backdrop-blur text-brand-yellow text-[9px] font-bold px-2.5 py-1 rounded border border-white/5 shadow-md">
          {getDealType()}
        </div>

        {/* Dots */}
        {hasMultiple && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {images.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                aria-label={`Foto ${i + 1}`}
                className={`rounded-full transition-all cursor-pointer ${
                  i === imgIdx ? "w-4 h-1.5 bg-brand-yellow" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
            {images.length > 5 && (
              <span className="text-white/40 text-[8px] leading-none">+{images.length - 5}</span>
            )}
          </div>
        )}

        {/* Social proof */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-full">
          <Flame className="w-2.5 h-2.5 text-brand-orange" />
          {dailyViewCount(item.id)} interessados hoje
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-white text-sm font-black uppercase tracking-tight leading-tight group-hover:text-brand-yellow transition-colors mb-4">
          {item.title}
        </h3>

        <div className="space-y-2.5 text-xs font-sans flex-grow border-t border-white/5 pt-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-stone-500 font-mono text-[10px] shrink-0">Tipo:</span>
            <span className="font-bold text-stone-200 text-right text-[11px]">{item.type}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-stone-500 font-mono text-[10px] shrink-0">Dimensões:</span>
            <span className="font-mono text-brand-yellow font-bold text-[10px] bg-brand-yellow/10 px-2 py-0.5 rounded">{item.measurements}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-stone-500 font-mono text-[10px] shrink-0">Conservação:</span>
            <span className="font-bold text-stone-200 text-right text-[11px]">{item.condition}</span>
          </div>
          <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-white/5">
            <span className="text-stone-500 font-mono text-[10px] shrink-0">Localização:</span>
            <span className="font-semibold text-stone-300 flex items-center gap-1 text-[11px]">
              <MapPin className="w-3 h-3 text-brand-yellow flex-shrink-0" />
              {item.city} — {item.state}
            </span>
          </div>
        </div>

        <button
          onClick={onInterest}
          className="mt-5 w-full py-3 px-4 bg-brand-yellow hover:bg-brand-orange text-brand-black font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer font-display border-none shadow-md"
        >
          <MessageSquare className="w-4 h-4" />
          Tenho interesse
        </button>
      </div>
    </div>
  );
}

function getPEMetrics() {
  const w = window.innerWidth;
  if (w < 640) return { cardWidth: Math.min(Math.round(w * 0.84), 340), cardStep: Math.round(w * 0.70) };
  if (w < 1024) return { cardWidth: 300, cardStep: 270 };
  return { cardWidth: 360, cardStep: 330 };
}

export default function ProntaEntrega() {
  const { prontaEntrega, whatsapp: systemWhatsapp } = useAppContext();

  const visibleItems = (prontaEntrega || []).filter((item) => item.active);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [{ cardWidth, cardStep }, setMetrics] = useState(getPEMetrics);

  useEffect(() => {
    const update = () => setMetrics(getPEMetrics());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHoveredRef = useRef(false);
  const skipAnimRef = useRef(false);
  const maxIdx = Math.max(0, visibleItems.length - 1);

  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      if (!isHoveredRef.current) {
        setCurrentIdx((prev) => {
          if (prev >= maxIdx) {
            skipAnimRef.current = true;
            return 0;
          }
          return prev + 1;
        });
      }
    }, 1800);
  }, [maxIdx]);

  useEffect(() => {
    startAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [startAuto]);

  useEffect(() => { skipAnimRef.current = false; }, [currentIdx]);

  useEffect(() => {
    setCurrentIdx((prev) => Math.min(prev, maxIdx));
  }, [maxIdx]);

  const goTo = (idx: number) => {
    setCurrentIdx(Math.max(0, Math.min(idx, maxIdx)));
    startAuto();
  };
  const prev = () => {
    if (currentIdx <= 0) { skipAnimRef.current = true; goTo(maxIdx); }
    else goTo(currentIdx - 1);
  };
  const next = () => {
    if (currentIdx >= maxIdx) { skipAnimRef.current = true; goTo(0); }
    else goTo(currentIdx + 1);
  };

  const handleInterest = (item: ProntaEntregaItem) => {
    const dealTypeStr = (() => {
      if (item.availableForSale && item.availableForRent) return "Venda ou Locação";
      if (item.availableForSale) return "Disponível p/ Venda";
      if (item.availableForRent) return "Disponível p/ Locação";
      return "Sob Consulta";
    })();
    const message = `Olá! Tenho interesse no container à pronta entrega da Dodisa Containers:\nEstrutura: ${item.title}\nTipo: ${item.type}\nMedidas: ${item.measurements}\nEstado: ${item.condition}\nDisponível em: ${item.city} - ${item.state}\nModalidade: ${dealTypeStr}\nGostaria de agendar a entrega ou saber mais detalhes.`;
    window.open(`https://wa.me/${systemWhatsapp.number}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section id="pronta-entrega" className="relative bg-[#07090D] py-24 border-b border-white/5 scroll-mt-20 overflow-hidden">
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-orange/10 border border-brand-orange/20 text-[10px] font-mono font-black text-brand-orange uppercase tracking-widest mb-4 shadow-sm shadow-brand-orange/5">
            <Zap className="w-3.5 h-3.5 animate-pulse" /> EMBARQUE IMEDIATO HOJE
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display uppercase tracking-tight text-white leading-none">
            Lotes à <span className="text-brand-yellow">Pronta Entrega</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-brand-yellow to-brand-orange mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-stone-400 font-sans text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Containers prontos, limpos e revisados no pátio. Envio imediato.
          </p>
        </motion.div>

        {/* Carousel */}
        {visibleItems.length === 0 ? (
          <div className="text-center py-24 text-stone-500 text-sm font-sans">
            Nenhum item à pronta entrega no momento.
          </div>
        ) : (
          <>
            <div
              className="relative group/carousel"
              onMouseEnter={() => { isHoveredRef.current = true; }}
              onMouseLeave={() => { isHoveredRef.current = false; }}
            >
              {/* Left arrow */}
              {maxIdx > 0 && (
                <button
                  onClick={prev}
                  aria-label="Anterior"
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 bg-black/70 hover:bg-brand-yellow backdrop-blur-sm text-white hover:text-brand-black p-3 rounded-full transition-all shadow-xl cursor-pointer opacity-0 group-hover/carousel:opacity-100 sm:-translate-x-4"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Right arrow */}
              {maxIdx > 0 && (
                <button
                  onClick={next}
                  aria-label="Próximo"
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 bg-black/70 hover:bg-brand-yellow backdrop-blur-sm text-white hover:text-brand-black p-3 rounded-full transition-all shadow-xl cursor-pointer opacity-0 group-hover/carousel:opacity-100 sm:translate-x-4"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Coverflow — CSS Grid overlap */}
              <div className="overflow-hidden py-6" style={{ perspective: "1400px" }}>
                <div style={{ display: "grid" }}>
                  {visibleItems.map((item, index) => {
                    const offset = index - currentIdx;
                    const absOffset = Math.abs(offset);
                    if (absOffset > 2) return null;
                    const isCenter = absOffset === 0;
                    const isSide = absOffset === 1;
                    return (
                      <motion.div
                        key={item.id}
                        animate={{
                          x: offset * cardStep,
                          scale: isCenter ? 1 : isSide ? 0.78 : 0.62,
                          rotateY: isCenter ? 0 : offset > 0 ? -32 : 32,
                          opacity: isCenter ? 1 : isSide ? 0.65 : 0,
                          zIndex: isCenter ? 10 : isSide ? 5 : 0,
                        }}
                        transition={skipAnimRef.current
                          ? { duration: 0 }
                          : { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
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
                        <ProntaEntregaCard
                          item={item}
                          onInterest={() => handleInterest(item)}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dots */}
            {maxIdx > 0 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {visibleItems.map((_, i) => (
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

        {/* Trust banner */}
        <div className="mt-12 p-5 rounded-2xl bg-[#111827]/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto text-center sm:text-left shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow border border-brand-yellow/20 flex-shrink-0">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <p className="text-xs text-stone-400 font-sans leading-relaxed">
              <span className="font-black text-white uppercase block mb-0.5">Inspeção Antes do Embarque:</span>
              Testamos solda, vedação e parte elétrica de cada container.
            </p>
          </div>
          <button
            onClick={() =>
              window.open(
                `https://wa.me/${systemWhatsapp.number}?text=${encodeURIComponent(systemWhatsapp.autoMsgGeneral)}`,
                "_blank"
              )
            }
            className="py-2.5 px-5 rounded-lg bg-[#0B0F14] hover:bg-[#1c2638] border border-white/5 text-stone-200 hover:text-brand-yellow text-[10px] font-black uppercase tracking-widest transition-all shrink-0 cursor-pointer font-mono whitespace-nowrap"
          >
            Ver pátio completo
          </button>
        </div>
      </div>
    </section>
  );
}

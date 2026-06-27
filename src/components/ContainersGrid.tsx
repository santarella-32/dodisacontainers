import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, MessageSquare, ArrowRight, LayoutGrid, Sparkles, Sliders, Box, Star } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function ContainersGrid() {
  const { containers, whatsapp: systemWhatsapp } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  const visibleContainers = (containers || []).filter((item) => item.visible);

  // Extract categories dynamically from visible catalog items
  const categoriesSet = new Set<string>();
  categoriesSet.add("Todos");
  visibleContainers.forEach((item) => {
    if (item.category) {
      categoriesSet.add(item.category);
    }
  });

  const categories = Array.from(categoriesSet);

  const filteredContainers = selectedCategory === "Todos"
    ? visibleContainers
    : visibleContainers.filter((item) => item.category === selectedCategory);

  // Duplicating filtered items to ensure infinite marquee slider works flawlessly even post-filter
  const carouselTrackItems = filteredContainers.length >= 2 
    ? [...filteredContainers, ...filteredContainers, ...filteredContainers]
    : filteredContainers;

  const handleContainerRequest = (container: typeof containers[0]) => {
    const defaultMsg = `Olá! Tenho interesse no container "${container.title}" (${container.category}) do site da Dodisa Containers e gostaria de solicitar um orçamento.`;
    const msg = container.whatsappMsg || defaultMsg;
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${systemWhatsapp.number}?text=${encoded}`, "_blank");
  };

  const getStatusBadge = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("banheiro") || lower.includes("vestiário")) {
      return { text: "Sob Demanda", color: "bg-[#FF8A00]/20 text-brand-orange border-brand-orange/30" };
    }
    if (lower.includes("depósito") || lower.includes("e-30") || lower.includes("blindado")) {
      return { text: "Pronta Entrega", color: "bg-brand-yellow/10 text-[#FFD54A] border-brand-yellow/30" };
    }
    return { text: "Sob Consulta", color: "bg-stone-800 text-stone-300 border-white/5" };
  };

  return (
    <section id="containers" className="relative py-24 bg-[#0B0F14] overflow-hidden">
      
      {/* Background architectural scaffolding design overlays */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-yellow/3 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-orange/2 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827]/85 border border-white/5 text-[10px] font-mono font-black text-brand-yellow uppercase tracking-widest mb-4">
            <Box className="w-3.5 h-3.5 text-brand-yellow animate-pulse" /> Modelos Disponíveis & Locações
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display text-white uppercase tracking-tight">
            NOSSOS <span className="text-brand-yellow">CONTAINERS</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-brand-yellow to-brand-orange mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-stone-400 font-sans text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Módulos de altíssima segurança contra intempéries, construídos com aço corrugado e isolamento termoacústico premium. Selecione uma categoria e inicie o orçamento imediato.
          </p>
        </motion.div>

        {/* Filter Navigation - Industrial Segments */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-2.5 mb-12 max-w-4xl mx-auto"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4.5 py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all duration-300 border font-mono cursor-pointer flex items-center ${
                selectedCategory === cat
                  ? "bg-brand-yellow border-brand-yellow text-brand-black shadow-lg shadow-brand-yellow/10"
                  : "bg-[#111827]/55 hover:bg-[#1f2a3d] text-stone-400 hover:text-white border-white/5"
              }`}
            >
              {cat === "Todos" && <LayoutGrid className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />}
              {cat}
            </button>
          ))}
        </motion.div>

      </div>

      {/* HORIZONTAL CAROUSEL: Fluid Automatic looping scroll track with pause-on-hover */}
      <div className="w-full overflow-hidden relative mask-fade-edges py-6 pause-marquee-hover select-none">
        <div className="animate-marquee-track hover:[animation-play-state:paused]" style={{ '--marquee-speed': '55s' } as React.CSSProperties}>
          
          {carouselTrackItems.map((container, index) => {
            const badgeMeta = getStatusBadge(container.title);
            return (
              <div
                key={`${container.id}-${index}`}
                className="w-[300px] sm:w-[360px] mx-4.5 flex-shrink-0 bg-[#111827]/40 backdrop-blur-md rounded-2xl border border-white/5 hover:border-brand-yellow/35 shadow-xl hover:shadow-2xl hover:shadow-brand-yellow/5 transition-all duration-300 group flex flex-col justify-between"
              >
                {/* Image panel */}
                <div className="relative h-56 w-full overflow-hidden bg-brand-dark rounded-t-2xl border-b border-white/5">
                  {/* Category overlay label */}
                  <span className="absolute top-4 left-4 z-10 px-3 py-1 text-[9px] font-black text-brand-black bg-brand-yellow rounded-lg uppercase tracking-wider shadow-md">
                    {container.category}
                  </span>

                  {/* Status badge */}
                  <span className={`absolute top-4 right-4 z-10 px-2.5 py-1 text-[9px] font-black rounded-lg border uppercase tracking-wider shadow-md ${badgeMeta.color}`}>
                    {badgeMeta.text}
                  </span>
                  
                  <img
                    src={container.image}
                    alt={container.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-[600ms]"
                    style={{ filter: "brightness(1.05) contrast(1.1)" }}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Grid industrial mask layout */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-transparent to-transparent opacity-90" />
                </div>

                {/* Content Details Block */}
                <div className="p-6 flex flex-col flex-grow justify-between bg-[#111827]/25 rounded-b-2xl">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-stone-100 uppercase tracking-tight group-hover:text-brand-yellow transition-colors font-display line-clamp-1">
                      {container.title}
                    </h3>
                    
                    <p className="mt-2.5 text-stone-400 font-sans text-xs leading-relaxed line-clamp-2 h-10">
                      {container.description}
                    </p>

                    {/* Ficha técnica panel formatted for engineering precision */}
                    <div className="mt-5 pt-4.5 border-t border-white/5 space-y-2">
                      <h4 className="text-[9px] font-black text-stone-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-mono">
                        <Star className="w-3 h-3 text-brand-orange animate-spin" /> Ficha Técnica Homologada
                      </h4>
                      {container.specs.map((spec, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2 text-[11px] text-stone-300 font-sans leading-tight">
                          <Check className="w-3.5 h-3.5 text-brand-yellow flex-shrink-0 mt-0.5 stroke-[2.5]" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* WhatsApp contact triggers highlighted */}
                  <div className="mt-6 pt-5 border-t border-white/5">
                    <button
                      onClick={() => handleContainerRequest(container)}
                      className="w-full py-3 px-4 bg-brand-yellow hover:bg-brand-orange text-brand-black font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer font-display shadow-md ring-1 ring-brand-yellow hover:ring-brand-orange border-none"
                    >
                      <MessageSquare className="w-4 h-4 text-brand-black" />
                      Solicitar cotação
                    </button>
                    <div className="text-[9px] text-stone-500 text-center mt-2 font-mono uppercase tracking-wider font-semibold">
                      Pronto para entrega imediata • Faturamento BNDES em até 48h
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </div>

    </section>
  );
}

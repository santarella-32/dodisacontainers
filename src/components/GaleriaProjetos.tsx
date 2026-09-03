import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MessageSquare, ArrowRight, ImagePlus } from "lucide-react";
import { useAppContext } from "../context/AppContext";

function renderTitleWithHighlight(title: string, highlight: string) {
  if (!highlight) return title;
  const idx = title.indexOf(highlight);
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx)}
      <span className="text-amber-500">{highlight}</span>
      {title.slice(idx + highlight.length)}
    </>
  );
}

export default function GaleriaProjetos() {
  const { projects, gallery, whatsapp: systemWhatsapp } = useAppContext();
  const [activeCategory, setActiveCategory] = useState("Todos");

  const visibleProjects = projects.filter((p) => p.visible);

  // Dynamically extract categories from registered projects
  const categoriesSet = new Set<string>();
  categoriesSet.add("Todos");
  visibleProjects.forEach((p) => {
    if (p.category) {
      categoriesSet.add(p.category);
    }
  });
  const categories = Array.from(categoriesSet);

  const filteredProjetos = activeCategory === "Todos"
    ? visibleProjects
    : visibleProjects.filter((p) => p.category === activeCategory);

  const handleSimilars = (proj: typeof projects[0]) => {
    const message = `Olá! Vi o projeto "${proj.title}" (${proj.category}) na galeria do site da Dodisa e gostaria de encomendar um orçamento para um projeto parecido!`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${systemWhatsapp.number}?text=${encoded}`, "_blank");
  };

  return (
    <section id="galeria-real" className="relative bg-zinc-950 py-20 border-b border-stone-900 scroll-mt-20 overflow-hidden">
      
      {/* Heavy Mesh Pattern Accent Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-35" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-stone-900 border border-stone-800 text-xs font-black text-amber-500 uppercase tracking-widest mb-4">
            {gallery.eyebrow}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-sans uppercase tracking-tight text-white leading-none">
            {renderTitleWithHighlight(gallery.title, gallery.titleHighlight)}
          </h2>
          <p className="mt-4 text-stone-400 font-sans text-sm sm:text-base leading-relaxed">
            {gallery.subtitle}
          </p>
        </motion.div>

        {/* Categories Dynamic Navigation Slider */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-4xl mx-auto">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                type="button"
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`py-2 px-4 rounded text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? "bg-amber-500 border-amber-400 text-stone-950 font-black shadow-lg shadow-amber-950/20"
                    : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Bento/Grid Panel list with Animation transitions */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjetos.map((proj) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35 }}
                key={proj.id}
                className="group relative bg-stone-900 rounded-xl overflow-hidden border border-stone-850 hover:border-amber-500/40 shadow-xl"
              >
                {/* Photo frame with modern zoom filter */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-950">
                  <img
                    src={proj.imageAfter}
                    alt={proj.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  
                  {/* Category Float Tag */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-stone-950/90 text-[9px] font-black uppercase text-amber-500 tracking-widest border border-stone-800">
                    {proj.category}
                  </div>

                  {/* Dark Elegant Glass Hover overlay — visible on desktop hover, always on mobile via touch */}
                  <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center pointer-events-none group-hover:pointer-events-auto [@media(hover:none)]:pointer-events-auto">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-500">
                      <ImagePlus className="w-5 h-5 animate-pulse" />
                    </div>
                    <h4 className="text-white text-base font-black uppercase tracking-tight mb-2">
                      {proj.title}
                    </h4>
                    <p className="text-xs text-stone-400 font-sans max-w-xs mb-6 hidden sm:block">
                      {proj.specs}
                    </p>
                    <button
                      onClick={() => handleSimilars(proj)}
                      className="py-2.5 px-4 bg-amber-500 text-stone-950 font-black text-[10px] uppercase tracking-widest rounded transition-colors hover:bg-amber-400 flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-current" />
                      Quero um projeto parecido
                    </button>
                  </div>
                </div>

                {/* Footer details visible on simple static screen */}
                <div className="p-4 flex items-center justify-between border-t border-stone-850/85">
                  <div className="truncate max-w-[200px]">
                    <h5 className="text-stone-200 text-xs font-bold uppercase tracking-tight truncate">
                      {proj.title}
                    </h5>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {proj.specs}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSimilars(proj)}
                    className="p-1.5 rounded bg-stone-950 text-amber-500 group-hover:bg-amber-500 group-hover:text-stone-950 transition-all duration-300 flex-shrink-0 cursor-pointer"
                    title="Pedir similar"
                  >
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Global callout banner */}
        <div className="mt-12 text-center">
          <p className="text-xs text-stone-500 font-mono">
            * Todos os nossos projetos cumprem estritamente os padrões técnicos da ABNT.
          </p>
        </div>

      </div>

    </section>
  );
}

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Hammer, CheckCircle2, Eye, Compass, Info, ArrowUpRight, Award } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function Projetos() {
  const { projects, whatsapp: systemWhatsapp } = useAppContext();
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [showBeforeMap, setShowBeforeMap] = useState<{ [key: string]: boolean }>({});
  const [isHovered, setIsHovered] = useState(false);
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

  if (visibleProjects.length === 0) {
    return null;
  }

  const safeIdx = activeProjectIdx >= visibleProjects.length ? 0 : activeProjectIdx;
  const activeProject = visibleProjects[safeIdx] || visibleProjects[0];

  const toggleBeforeAfter = (projectId: string) => {
    setShowBeforeMap((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const handleConsultancyRequest = (title: string) => {
    const msg = encodeURIComponent(`Olá! Vi no site o projeto '${title}' e gostaria de fazer uma consulta semelhante para a minha demanda.`);
    window.open(`https://wa.me/${systemWhatsapp.number}?text=${msg}`, "_blank");
  };

  return (
    <section 
      id="projetos" 
      className="relative py-28 bg-[#0B0F14] overflow-hidden border-t border-white/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* Background blueprint elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-orange/2 rounded-full blur-[150px] pointer-events-none" />

      {/* Structural side details */}
      <div className="absolute top-0 left-6 w-[1px] h-full bg-white/5 hidden md:block" />
      <div className="absolute top-0 right-6 w-[1px] h-full bg-white/5 hidden md:block" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-brand-yellow/10 border border-brand-yellow/20 text-[10px] font-mono font-black text-brand-yellow uppercase tracking-widest mb-4">
            <Compass className="w-3.5 h-3.5 text-brand-yellow animate-spin" /> Portfólio de Engenharia Modular
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display text-white uppercase tracking-tight">
            PROJETOS <span className="text-brand-yellow">REALIZADOS</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-brand-yellow to-brand-orange mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-stone-400 font-sans text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Veja como transformamos terrenos vazios em espaços prontos para uso.
          </p>
        </motion.div>

        {/* Feature Split Layout - Bigger & More spacious */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Column A: Project Tab Selector (Auto-cycles) */}
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
                  className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 flex flex-col relative overflow-hidden cursor-pointer ${
                    safeIdx === idx
                      ? "bg-[#111827]/40 border-brand-yellow/40 shadow-2xl text-white"
                      : "bg-[#111827]/10 hover:bg-[#111827]/30 border-white/5 text-stone-400 hover:text-stone-200"
                  }`}
                >
                  {safeIdx === idx && (
                    <>
                      {/* Active indicator */}
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

            {/* Drone notice banner upgraded */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3.5 mt-2">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-orange animate-ping flex-shrink-0" />
              <p className="text-[11px] text-stone-400 font-sans leading-normal">
                <span className="font-bold text-stone-200 uppercase">Laudo de Engenharia:</span> Cada obra tem registro fotográfico, ART e teste estrutural.
              </p>
            </div>
          </motion.div>

          {/* Column B: High Impact Visual Showcase Screen */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProject.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-[#111827]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 relative shadow-2xl"
              >
                {/* Visual before and after layout container - Giant scale */}
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden shadow-2xl border border-white/5 bg-brand-dark group">
                  
                  {/* Before or after image renderer */}
                  <img
                    src={showBeforeMap[activeProject.id] && activeProject.imageBefore ? activeProject.imageBefore : activeProject.imageAfter}
                    alt={activeProject.title}
                    className="w-full h-full object-cover object-center transition-all duration-[800ms] brightness-[0.9] group-hover:scale-102"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />

                  {/* Top corner watermark indicator representing state */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg border backdrop-blur-md ${
                      showBeforeMap[activeProject.id]
                        ? "bg-brand-orange text-white border-brand-orange/30 animate-pulse"
                        : "bg-emerald-600 text-white border-emerald-400/30"
                    }`}>
                      {showBeforeMap[activeProject.id] ? "Fase Inicial (Antes)" : "Finalizado (Depois)"}
                    </span>
                  </div>

                  {/* Slider simulation button or Toggle */}
                  {activeProject.imageBefore && (
                    <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
                      <button
                        onClick={() => toggleBeforeAfter(activeProject.id)}
                        className="px-4.5 py-2.5 text-[10px] font-black bg-brand-black/90 hover:bg-brand-yellow text-white hover:text-brand-black rounded-lg border border-white/5 hover:border-brand-yellow shadow-xl flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md font-mono"
                      >
                        <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                        {showBeforeMap[activeProject.id] ? "Ver Depois" : "Ver Antes"}
                      </button>
                    </div>
                  )}

                  {/* Watermark identifier */}
                  <div className="absolute bottom-4 left-4 z-10 hidden sm:block">
                    <p className="text-[9px] text-stone-400 font-mono tracking-wider bg-brand-black/85 px-3 py-1.5 rounded-lg border border-white/5">
                      Local: Pátio Logístico RS • Dodisa Engenharia
                    </p>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-transparent to-transparent z-0 opacity-80" />
                </div>

                {/* Technical specifics description */}
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
                    
                    <button
                      onClick={() => handleConsultancyRequest(activeProject.title)}
                      className="px-5 py-3 bg-brand-yellow hover:bg-brand-orange text-brand-black font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Hammer className="w-4 h-4 stroke-[2.5]" />
                      Consultar projeto
                    </button>
                  </div>

                  <p className="text-stone-300 font-sans text-xs sm:text-sm leading-relaxed">
                    {activeProject.description}
                  </p>

                  {/* Highlights checklist and metrics */}
                  {activeProject.specs && (
                    <div className="mt-2 p-5 rounded-xl bg-brand-black/60 border border-white/5">
                      <h4 className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-3.5 font-mono flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-brand-yellow" /> Especificações Estruturais Implantadas
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {activeProject.specs.map((s, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-stone-200 font-sans">
                            <CheckCircle2 className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}

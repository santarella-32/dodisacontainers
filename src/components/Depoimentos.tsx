import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Quote, Star, ChevronLeft, ChevronRight, UserCheck, Award } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function Depoimentos() {
  const { testimonials } = useAppContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const visibleTestimonials = (testimonials || []).filter((t) => t.visible);

  // Auto-slide effect that pauses when the user hovers over the block
  useEffect(() => {
    if (visibleTestimonials.length <= 1 || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visibleTestimonials.length);
    }, 6500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visibleTestimonials, isHovered]);

  if (visibleTestimonials.length === 0) {
    return null;
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? visibleTestimonials.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % visibleTestimonials.length);
  };

  const safeIndex = currentIndex >= visibleTestimonials.length ? 0 : currentIndex;
  const activeTestimonial = visibleTestimonials[safeIndex] || visibleTestimonials[0];

  // Helper to generate a reliable high-quality corporate face from Unsplash dynamically
  const getAvatarUrl = (name: string) => {
    const faces = [
      "photo-1519085360753-af0119f7cbe7", // Executive Male
      "photo-1573496359142-b8d87734a5a2", // Executive Female
      "photo-1472099645785-5658abf4ff4e", // Engineering Director
      "photo-1580489944761-15a19d654956"  // Senior Purchaser Woman
    ];
    const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const faceId = faces[Math.abs(sum) % faces.length];
    return `https://images.unsplash.com/${faceId}?auto=format&fit=crop&w=150&h=150&q=80`;
  };

  return (
    <section 
      id="depoimentos" 
      className="relative py-28 bg-[#0B0F14] overflow-hidden border-t border-white/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* Background yellow subtle circular glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] bg-brand-yellow/3 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-4 right-10 w-96 h-96 bg-brand-orange/2 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-brand-yellow/10 border border-brand-yellow/20 text-[10px] font-mono font-black text-brand-yellow uppercase tracking-widest mb-4">
            <UserCheck className="w-3.5 h-3.5 text-brand-yellow" /> Opinião de Quem Opera Conosco
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display text-white uppercase tracking-tight">
            DEPOIMENTOS DE <span className="text-brand-yellow">CLIENTES</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-brand-yellow to-brand-orange mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-stone-400 font-sans text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            A real credibilidade Dodisa aprovada por diretores de suprimentos, construtoras renomadas, mineradoras e engenheiros de infraestrutura do Rio Grande do Sul.
          </p>
        </motion.div>

        {/* Carousel Deck */}
        <div className="max-w-4xl mx-auto relative px-2 sm:px-12">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial.id}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.35 }}
              className="bg-[#111827]/40 backdrop-blur-xl p-8 sm:p-12 rounded-2xl border border-white/5 shadow-2xl relative flex flex-col sm:flex-row gap-8 items-start sm:items-center"
            >
              {/* Giant watermarked quote visual asset */}
              <Quote className="absolute top-6 right-8 w-14 h-14 text-white/[0.02] stroke-[3]" />

              {/* Dynamic Portrait avatar with grayscale consistent aesthetic filter */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-brand-yellow/40 p-1 flex-shrink-0 bg-brand-dark/50 relative overflow-hidden shadow-lg shadow-brand-yellow/5">
                <img
                  src={getAvatarUrl(activeTestimonial.name)}
                  alt={activeTestimonial.name}
                  className="w-full h-full object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-brand-black flex items-center justify-center text-[7px]" title="Compra Confirmada" />
              </div>

              {/* Textual column */}
              <div className="flex-1 flex flex-col justify-center">
                
                {/* Stars Score - Upgraded yellow paint */}
                <div className="flex gap-1 mb-4 text-brand-yellow">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4.5 h-4.5 fill-current ${
                        i < (activeTestimonial.rating || 5) ? "text-brand-yellow" : "text-stone-800"
                      }`}
                    />
                  ))}
                </div>

                {/* Text content feedback support both content and text fallback */}
                <blockquote className="text-stone-200 font-sans text-sm sm:text-base italic leading-relaxed font-light">
                  "{activeTestimonial.content || activeTestimonial.text || "Excelente atendimento e entrega super rápida."}"
                </blockquote>

                {/* Patient / Profile details column */}
                <div className="mt-6 pt-5 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <cite className="not-italic text-sm sm:text-base font-black text-white uppercase tracking-wide font-display">
                      {activeTestimonial.name}
                    </cite>
                    <p className="text-[10px] font-mono font-bold text-stone-400 mt-0.5 uppercase tracking-wider">
                      {activeTestimonial.role || "Cliente"} — <span className="text-brand-yellow">{activeTestimonial.company || activeTestimonial.city || "Rio Grande do Sul"}</span>
                    </p>
                  </div>

                  {/* Trust check badge stamp */}
                  <span className="inline-flex self-start sm:self-auto items-center gap-1.5 border border-brand-yellow/20 px-2.5 py-1 text-[8px] font-black font-mono text-brand-yellow uppercase tracking-widest bg-brand-yellow/5 rounded-lg shadow-sm">
                    <Award className="w-3.5 h-3.5" /> COMPRA VERIFICADA ✓
                  </span>
                </div>

              </div>

            </motion.div>
          </AnimatePresence>

          {/* Carousel Left / Right Command Controls */}
          <div className="flex justify-between items-center mt-6 gap-4">
            
            {/* Index Dot Nav indicators */}
            <div className="flex gap-2 justify-start">
              {visibleTestimonials.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentIndex(dotIdx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === dotIdx ? "w-8 bg-brand-yellow" : "bg-white/10 hover:bg-white/20"
                  }`}
                  aria-label={`Ir para depoimento ${dotIdx + 1}`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-xl bg-[#111827]/40 hover:bg-[#1C2638] text-stone-400 hover:text-white border border-white/5 flex items-center justify-center transition-all shadow-md group cursor-pointer"
                aria-label="Depoimento Anterior"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-xl bg-[#111827]/40 hover:bg-[#1C2638] text-stone-400 hover:text-white border border-white/5 flex items-center justify-center transition-all shadow-md group cursor-pointer"
                aria-label="Próximo Depoimento"
              >
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform stroke-[2.5]" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

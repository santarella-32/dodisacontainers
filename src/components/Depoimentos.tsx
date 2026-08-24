import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Quote, Star, ChevronLeft, ChevronRight, UserCheck, Award, Building2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";

function InitialsAvatar({ name, size = 96 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div
      className="w-full h-full rounded-xl flex items-center justify-center font-black text-white select-none"
      style={{
        background: `linear-gradient(135deg, hsl(${hue},55%,28%), hsl(${(hue + 40) % 360},55%,20%))`,
        fontSize: size * 0.32,
      }}
    >
      {initials}
    </div>
  );
}

export default function Depoimentos() {
  const { testimonials } = useAppContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const visible = (testimonials || []).filter((t) => t.visible);

  useEffect(() => {
    if (visible.length <= 1 || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visible.length);
    }, 6500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [visible, isHovered]);

  if (visible.length === 0) return null;

  const safeIndex = currentIndex >= visible.length ? 0 : currentIndex;
  const active = visible[safeIndex];

  const prev = () => setCurrentIndex((p) => (p === 0 ? visible.length - 1 : p - 1));
  const next = () => setCurrentIndex((p) => (p + 1) % visible.length);

  return (
    <section
      id="depoimentos"
      className="relative py-28 bg-[#0B0F14] overflow-hidden border-t border-white/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] bg-[#FFD400]/3 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-4 right-10 w-96 h-96 bg-[#FF9A00]/2 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#FFD400]/10 border border-[#FFD400]/20 text-[10px] font-mono font-black text-[#FFD400] uppercase tracking-widest mb-4">
            <UserCheck className="w-3.5 h-3.5" /> Opinião de Quem Opera Conosco
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display text-white uppercase tracking-tight">
            DEPOIMENTOS DE <span className="text-[#FFD400]">CLIENTES</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#FFD400] to-[#FF9A00] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-stone-400 font-sans text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Aprovado por construtoras, mineradoras e empresas de todo o Brasil.
          </p>
        </motion.div>

        {/* Desktop: 3 cards side by side | Mobile: carousel */}
        <>
          {/* Desktop grid — 3 cards */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {visible.slice(0, 3).map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[#111827]/40 backdrop-blur-xl p-7 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-5 relative"
              >
                <Quote className="absolute top-5 right-6 w-10 h-10 text-white/[0.03] stroke-[2]" />

                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className={`w-4 h-4 fill-current ${si < (t.rating || 5) ? "text-[#FFD400]" : "text-stone-800"}`} />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-stone-300 text-sm leading-relaxed italic flex-1">
                  "{t.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#FFD400]/20 flex-shrink-0">
                    {t.image ? (
                      <img src={t.image} alt={t.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300" />
                    ) : (
                      <InitialsAvatar name={t.name} size={48} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-black uppercase truncate">{t.name}</p>
                    <p className="text-[10px] font-mono text-[#FFD400] truncate mt-0.5 flex items-center gap-1">
                      <Building2 className="w-2.5 h-2.5 shrink-0" />
                      {t.cityOrCompany}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[8px] font-black font-mono text-[#FFD400] uppercase tracking-widest border border-[#FFD400]/15 px-2 py-0.5 rounded bg-[#FFD400]/5 w-fit">
                  <Award className="w-2.5 h-2.5" /> Compra Verificada ✓
                </span>
              </motion.div>
            ))}
          </div>

          {/* Mobile carousel */}
          <div className="lg:hidden max-w-2xl mx-auto px-2 sm:px-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-[#111827]/40 backdrop-blur-xl p-5 sm:p-8 rounded-2xl border border-white/5 shadow-2xl relative"
              >
                <Quote className="absolute top-6 right-8 w-12 h-12 text-white/[0.025] stroke-[2]" />

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#FFD400]/30 flex-shrink-0">
                    {active.image ? (
                      <img src={active.image} alt={active.name} className="w-full h-full object-cover" />
                    ) : (
                      <InitialsAvatar name={active.name} size={64} />
                    )}
                  </div>
                  <div>
                    <div className="flex gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} className={`w-3.5 h-3.5 fill-current ${si < (active.rating || 5) ? "text-[#FFD400]" : "text-stone-800"}`} />
                      ))}
                    </div>
                    <p className="text-white text-sm font-black uppercase">{active.name}</p>
                    <p className="text-[10px] font-mono text-[#FFD400] mt-0.5">{active.cityOrCompany}</p>
                  </div>
                </div>

                <blockquote className="text-stone-300 text-sm leading-relaxed italic">
                  "{active.content}"
                </blockquote>

                <span className="inline-flex items-center gap-1 mt-5 text-[8px] font-black font-mono text-[#FFD400] uppercase tracking-widest border border-[#FFD400]/15 px-2 py-0.5 rounded bg-[#FFD400]/5">
                  <Award className="w-2.5 h-2.5" /> Compra Verificada ✓
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex justify-between items-center mt-5">
              <div className="flex gap-2">
                {visible.map((_, di) => (
                  <button
                    key={di}
                    onClick={() => setCurrentIndex(di)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${di === safeIndex ? "w-8 bg-[#FFD400]" : "w-2 bg-white/15 hover:bg-white/30"}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={prev} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={next} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>

        {/* CTA abaixo */}
        {visible.length > 3 && (
          <div className="text-center mt-10">
            <p className="text-stone-500 text-xs font-mono">
              +{visible.length - 3} depoimentos verificados de clientes Dodisa
            </p>
          </div>
        )}

      </div>
    </section>
  );
}

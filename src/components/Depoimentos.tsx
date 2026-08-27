import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";

function InitialsAvatar({ name, size = 96 }: { name: string; size?: number }) {
  const initials = name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="w-full h-full rounded-full flex items-center justify-center font-black text-white select-none"
      style={{
        background: `linear-gradient(135deg, hsl(${hue},50%,25%), hsl(${(hue + 40) % 360},50%,18%))`,
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}

export default function Depoimentos() {
  const { testimonials } = useAppContext();
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const visible = (testimonials || []).filter((t) => t.visible);

  useEffect(() => {
    if (visible.length <= 1 || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % visible.length);
    }, 7000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [visible, isHovered]);

  if (visible.length === 0) return null;

  const safeIdx = current >= visible.length ? 0 : current;
  const active = visible[safeIdx];
  const prev = () => setCurrent((p) => Math.max(0, p - 1));
  const next = () => setCurrent((p) => Math.min(visible.length - 1, p + 1));

  return (
    <section
      id="depoimentos"
      className="relative py-16 sm:py-32 bg-[#060A10] overflow-hidden border-t border-white/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(255,212,0,0.04),transparent)] pointer-events-none" />
      {/* Dot grid texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-16"
        >
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-[0.25em]">
            Validação de Campo — Clientes Reais
          </span>
          <div className="h-px flex-1 bg-white/5" />
        </motion.div>

        {/* Main testimonial spotlight */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center mb-16"
          >
            {/* Quote — large */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              {/* Stars */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 fill-current ${i < (active.rating || 5) ? "text-[#FFD400]" : "text-zinc-800"}`} />
                ))}
                <span className="ml-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  {active.rating || 5}.0 / 5.0
                </span>
              </div>

              {/* The quote itself — premium large */}
              <blockquote className="relative">
                <span
                  className="absolute -top-6 -left-2 text-[120px] leading-none text-[#FFD400]/8 font-black select-none pointer-events-none"
                  aria-hidden
                >
                  "
                </span>
                <p className="relative text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-snug tracking-tight">
                  "{active.content}"
                </p>
              </blockquote>

              {/* Author row */}
              <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-[#FFD400]/20 flex-shrink-0">
                  {active.image ? (
                    <img src={active.image} alt={active.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <InitialsAvatar name={active.name} size={48} />
                  )}
                </div>
                <div>
                  <p className="text-white text-sm font-black uppercase tracking-wide">{active.name}</p>
                  <p className="text-[11px] font-mono text-[#FFD400]/80 mt-0.5 flex items-center gap-1.5">
                    <Building2 className="w-3 h-3" />
                    {active.cityOrCompany}
                  </p>
                </div>
                <div className="ml-auto">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black font-mono text-emerald-400 uppercase tracking-widest">
                    ✓ Verificado
                  </span>
                </div>
              </div>
            </div>

            {/* Right panel — metrics + nav */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Compact list of other testimonials — hidden on mobile */}
              <div className="hidden lg:flex flex-col gap-2 mt-2">
                {visible.slice(0, 4).map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setCurrent(i)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                      i === safeIdx
                        ? "bg-zinc-900 border-[#FFD400]/30"
                        : "bg-zinc-900/30 border-zinc-800/50 hover:border-zinc-700 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                      {t.image ? (
                        <img src={t.image} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <InitialsAvatar name={t.name} size={28} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-white uppercase truncate">{t.name}</p>
                      <p className="text-[9px] font-mono text-zinc-500 truncate">{t.cityOrCompany}</p>
                    </div>
                    {i === safeIdx && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FFD400] flex-shrink-0 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom nav bar */}
        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          {/* Dot indicators */}
          <div className="flex gap-2">
            {visible.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                  i === safeIdx ? "w-10 bg-[#FFD400]" : "w-3 bg-white/10 hover:bg-white/25"
                }`}
              />
            ))}
          </div>

          {/* Prev/Next */}
          <div className="flex gap-2">
            <button
              onClick={prev}
              disabled={safeIdx === 0}
              className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              disabled={safeIdx === visible.length - 1}
              className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

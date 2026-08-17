import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, MessageSquare, Zap, CheckCircle2, ChevronRight } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const OPTIONS = [
  { label: "Depósito / Almoxarifado", emoji: "📦" },
  { label: "Escritório / Comercial",  emoji: "🏢" },
  { label: "Sanitário / Banheiro",    emoji: "🚿" },
  { label: "Pronta Entrega",           emoji: "⚡" },
  { label: "Projeto Personalizado",    emoji: "✏️" },
];

const NEVER_KEY = "dodisa_popup_never";

export default function OrcamentoPopup() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const { whatsapp } = useAppContext();
  const shownRef = useRef(false);

  const closeNever = () => {
    localStorage.setItem(NEVER_KEY, "1");
    setOpen(false);
  };

  useEffect(() => {
    if (localStorage.getItem(NEVER_KEY)) return; // usuário pediu para não mostrar mais
    const check = () => {
      if (shownRef.current) return;
      const scrolled = window.scrollY + window.innerHeight;
      const total   = document.documentElement.scrollHeight;
      if (scrolled >= total - 200) {
        shownRef.current = true;
        setOpen(true);
        window.removeEventListener("scroll", check);
      }
    };

    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleCTA = () => {
    const base = `Olá! Vim pelo site da Dodisa Containers e gostaria de um orçamento.`;
    const extra = selected ? ` Interesse: ${selected}.` : "";
    const msg = base + extra;
    window.open(`https://wa.me/${whatsapp.number}?text=${encodeURIComponent(msg)}`, "_blank");
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 70, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md bg-[#0D1117] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Gradient bar */}
            <div className="h-1 w-full bg-gradient-to-r from-brand-yellow via-brand-orange to-brand-yellow" />

            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative p-6 sm:p-8">
              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="absolute top-5 right-5 text-stone-500 hover:text-white transition-colors cursor-pointer p-1.5 rounded-full hover:bg-white/8"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-orange/10 border border-brand-orange/25 text-[10px] font-mono font-black text-brand-orange uppercase tracking-widest mb-4">
                <Zap className="w-3 h-3 animate-pulse" /> Orçamento grátis em minutos
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-tight mb-1.5">
                Ficou interessado?
              </h2>
              <p className="text-stone-400 text-xs leading-relaxed mb-6">
                Selecione o que você precisa e fale agora com um especialista da Dodisa. Sem enrolação.
              </p>

              {/* Options */}
              <div className="space-y-2 mb-6">
                {OPTIONS.map((opt) => {
                  const active = selected === opt.label;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setSelected(opt.label)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        active
                          ? "border-brand-yellow/50 bg-brand-yellow/8 text-white"
                          : "border-white/6 bg-white/2 text-stone-400 hover:border-white/12 hover:text-stone-200 hover:bg-white/4"
                      }`}
                    >
                      <span className="text-base leading-none select-none">{opt.emoji}</span>
                      <span className="text-xs font-bold flex-1">{opt.label}</span>
                      {active && <CheckCircle2 className="w-4 h-4 text-brand-yellow flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* CTA */}
              <button
                onClick={handleCTA}
                className="w-full py-4 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20c05e] text-white font-black text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/35 hover:scale-[1.015] active:scale-[0.985]"
              >
                <MessageSquare className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">
                  {selected ? `Orçar: ${selected}` : "Quero um orçamento agora"}
                </span>
                <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />
              </button>

              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={() => setOpen(false)}
                  className="text-stone-500 hover:text-stone-300 text-[11px] font-semibold transition-colors cursor-pointer underline underline-offset-2"
                >
                  Fechar agora
                </button>
                <span className="text-stone-700 text-[10px]">·</span>
                <button
                  onClick={closeNever}
                  className="text-stone-600 hover:text-stone-400 text-[11px] font-semibold transition-colors cursor-pointer underline underline-offset-2"
                >
                  Não aparecer novamente
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

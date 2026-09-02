import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ShieldAlert, Sparkles } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function FAQInteligente() {
  const { faq } = useAppContext();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const visibleFaqs = faq.filter((f) => f.visible);

  const toggleIndex = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-inteligente" className="relative bg-[#0B0F14] py-28 border-b border-white/5 scroll-mt-20 overflow-hidden">
      
      {/* Background circles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,212,0,0.02),transparent_60%)] pointer-events-none" />

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
            ENGENHARIA INTEGRADA E PROJETOS
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display uppercase tracking-tight text-white leading-none">
            Central de <span className="text-brand-yellow">Atendimentos</span>, tire sua dúvida
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-brand-yellow to-brand-orange mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-stone-400 font-sans text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Separamos as perguntas que mais recebemos no dia a dia. Não achou a sua aqui? Chama a gente no WhatsApp que a resposta é rápida.
          </p>
        </motion.div>

        {/* Accordion Layout */}
        <div className="max-w-4xl mx-auto space-y-3 mb-12 animate-fade-in">
          {visibleFaqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-[#111827]/40 rounded-xl border border-white/5 hover:border-brand-yellow/20 overflow-hidden transition-all duration-200 backdrop-blur-sm"
              >
                {/* Trigger head */}
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="w-full py-4.5 px-6 flex items-center justify-between text-left text-white font-black text-xs sm:text-sm uppercase tracking-wider hover:text-brand-yellow transition-colors cursor-pointer font-display leading-tight"
                >
                  <span className="pr-4 leading-tight">{item.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-500 transition-transform duration-350 shrink-0 ${
                      isOpen ? "rotate-180 text-brand-yellow" : ""
                    }`}
                  />
                </button>

                {/* Animated Answer panel */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                    >
                      <div className="pb-5 px-6 text-[#9CA3AF] font-sans text-xs sm:text-sm leading-relaxed border-t border-white/[0.03] pt-3 bg-[#0B0F14]/40">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            );
          })}
        </div>

      </div>

    </section>
  );
}

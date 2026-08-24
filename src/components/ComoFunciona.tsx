import React from "react";
import { motion } from "motion/react";
import { MessageSquare, FileSpreadsheet, Puzzle, Truck } from "lucide-react";
import { STEPS_DATA } from "../data";

const stepIcons = [
  MessageSquare,
  FileSpreadsheet,
  Puzzle,
  Truck
];

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="relative py-14 sm:py-28 bg-[#0B0F14] border-t border-white/5 overflow-hidden">

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-20"
        >
          <h2 className="text-3xl sm:text-5xl font-black font-display text-white uppercase tracking-tight">
            COMO FUNCIONA A <span className="text-brand-yellow">ENTREGA?</span>
          </h2>
          <div className="w-12 h-0.5 bg-brand-yellow mx-auto mt-4 mb-6" />
          <p className="mt-4 text-stone-400 font-sans text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Do primeiro contato até a entrega no seu pátio. Sem burocracia.
          </p>
        </motion.div>

        {/* Timeline Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative animate-fade-in">
          
          {STEPS_DATA.map((step, idx) => {
            const IconComponent = stepIcons[idx] || MessageSquare;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="group relative bg-zinc-900 p-6 sm:p-7 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col justify-between"
              >
                {/* Large architectural step watermarking */}
                <span className="absolute top-4 right-6 text-4xl sm:text-5xl font-black text-stone-900/40 font-mono select-none group-hover:text-brand-yellow/10 transition-colors">
                  0{step.number}
                </span>

                <div>
                  {/* Decorative weld dots resembling metal fabrication */}
                  <div className="flex gap-1.5 mb-6 text-stone-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-800" />
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-800" />
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-800" />
                  </div>

                  {/* Icon wrap with yellow accents */}
                  <div className="w-12 h-12 rounded-xl bg-[#0B0F14]/50 border border-white/5 text-brand-yellow flex items-center justify-center mb-5 group-hover:bg-brand-yellow group-hover:text-brand-black transition-all duration-300">
                    <IconComponent className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-stone-100 uppercase tracking-tight group-hover:text-brand-yellow transition-colors font-display leading-tight">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-[#9CA3AF] font-sans text-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Bottom line progress simulator */}
                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-mono font-bold text-stone-500 uppercase tracking-widest leading-none">
                  <span>Passo {step.number} de 4</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-800 group-hover:bg-brand-orange transition-all" />
                </div>

              </motion.div>
            );
          })}

        </div>

        {/* Highlight footer step CTA info */}
        <div className="mt-16 text-center max-w-xl mx-auto">
          <p className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-widest">
            ★ PRODUÇÃO COMEÇA EM <span className="text-brand-yellow font-black">24 HORAS</span> APÓS O CONTRATO.
          </p>
        </div>

      </div>
    </section>
  );
}

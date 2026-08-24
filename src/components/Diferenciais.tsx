import React from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Hammer,
  Zap,
  Sliders,
  Truck,
  TrendingUp,
  Users,
  Wrench
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

// Helper to map string to actual Lucide component
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "ShieldAlert":
      return ShieldCheck;
    case "Hammer":
      return Hammer;
    case "Zap":
      return Zap;
    case "Sliders":
      return Sliders;
    case "Truck":
      return Truck;
    case "TrendingUp":
      return TrendingUp;
    case "Users":
      return Users;
    case "Wrench":
      return Wrench;
    default:
      return ShieldCheck;
  }
};

export default function Diferenciais() {
  const { differentials } = useAppContext();
  const visibleDiffs = differentials.filter((d) => d.visible);

  return (
    <section id="diferenciais" className="relative py-14 sm:py-28 bg-[#0B0F14] border-b border-zinc-800/60 overflow-hidden">

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20 animate-fade-in">
          <h2 className="text-3xl sm:text-5xl font-black font-display text-white uppercase tracking-tight">
            POR QUE ESCOLHER A <span className="text-brand-yellow">DODISA?</span>
          </h2>
          <div className="w-12 h-0.5 bg-brand-yellow mx-auto mt-4 mb-6" />
          <p className="mt-4 text-stone-400 font-sans text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Aço resistente, bom isolamento e acabamento de qualidade — containers feitos para durar.
          </p>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleDiffs.map((diff, idx) => {
            const Icon = getIconComponent(diff.icon);
            return (
              <motion.div
                key={diff.id || diff.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group relative p-6 sm:p-7 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Icon holder with modern metal shield styling */}
                  <div className="w-12 h-12 rounded-xl bg-[#0B0F14]/55 border border-white/5 text-brand-yellow flex items-center justify-center mb-6 group-hover:text-brand-black group-hover:bg-brand-yellow transition-all duration-300">
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-stone-100 uppercase tracking-wide group-hover:text-brand-yellow transition-colors font-display leading-tight">
                    {diff.title}
                  </h3>

                  <p className="mt-3 text-[#9CA3AF] group-hover:text-stone-300 text-xs font-sans leading-relaxed">
                    {diff.description}
                  </p>
                </div>

                {/* Subtle bottom indicator */}
                <div className="mt-6 flex items-center justify-end">
                  <span className="text-[10px] font-mono font-bold text-stone-600 group-hover:text-brand-yellow uppercase tracking-widest select-none transition-colors">
                    ✓ Homologado
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

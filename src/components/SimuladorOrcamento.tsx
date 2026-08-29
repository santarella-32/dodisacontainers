import { motion } from "motion/react";
import ContainerConfigurator from "./configurator/ContainerConfigurator";
import MaterialsCatalog from "./MaterialsCatalog";

// "Monte seu Container" — section shell. All configurator logic/state lives in
// ./configurator (ContainerConfigurator + its steps/data), split out per the
// component-architecture guidance in the upgrade spec (section 51) instead of
// one large file. This file only owns the section heading/background.
export default function SimuladorOrcamento() {
  return (
    <section
      id="simulador-orcamento"
      className="relative bg-[#07090D] border-b border-zinc-800/60 scroll-mt-20 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="relative z-10 pt-14 sm:pt-20 pb-8 text-center px-4"
      >
        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
          Monte seu <span className="text-brand-yellow">Container</span>
        </h2>
        <div className="w-12 h-0.5 bg-brand-yellow mx-auto mt-4 mb-4" />
        <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
          Monte cada detalhe do seu projeto e acompanhe o resultado em 3D, em tempo real.
        </p>
      </motion.div>

      <MaterialsCatalog />
      <ContainerConfigurator />
    </section>
  );
}

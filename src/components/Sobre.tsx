import { motion } from "motion/react";
import { Truck } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function Sobre() {
  const { about } = useAppContext();

  return (
    <section id="sobre" className="relative py-14 sm:py-28 bg-[#0B0F14] border-t border-white/5 overflow-hidden">

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Two-Column Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-14 lg:mb-24">

          {/* Institutional Text Grid */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 text-left"
          >
            <h2 className="text-3xl sm:text-5xl font-black font-display text-white uppercase tracking-tight leading-tight">
              {about.title}<br />
              <span className="text-brand-yellow">{about.highlightTitle}</span>
            </h2>

            <div className="w-12 h-0.5 bg-brand-yellow my-6" />

            <div className="space-y-5 text-stone-300 font-sans text-xs sm:text-sm leading-relaxed">
              <p>{about.paragraph1}</p>
              <p>{about.paragraph2}</p>
              <p className="font-extrabold text-white">{about.paragraph3}</p>
            </div>

            {/* Quick credentials columns */}
            <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-xl sm:text-3xl font-black font-display text-white">{about.stat1Value}</span>
                <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider mt-1">{about.stat1Label}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-3xl font-black font-display text-white">{about.stat2Value}</span>
                <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider mt-1">{about.stat2Label}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-xl font-black font-display text-white leading-tight">{about.stat3Value}</span>
                <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider mt-1">{about.stat3Label}</span>
              </div>
            </div>
          </motion.div>

          {/* Institutional Image Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-xl overflow-hidden border border-zinc-800 aspect-[4/3] bg-brand-dark">
              {/* PLACEHOLDER — substituir por foto aérea/drone de containers montados ou içamento de módulo */}
              <img
                src={about.image}
                alt="Operação de logística e içamento de container Dodisa"
                className="w-full h-full object-cover object-center scale-102 hover:scale-100 transition-transform duration-[800ms] brightness-90"
                loading="lazy"
                referrerPolicy="no-referrer"
              />

              <div className="absolute inset-0 bg-brand-black/20" />

              {/* Float container detail watermark */}
              <div className="absolute bottom-6 left-6 right-6 bg-[#0B0F14]/95 backdrop-blur-md border border-white/5 p-5 rounded-xl flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center text-brand-yellow flex-shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <p className="text-xs text-stone-300 font-sans leading-relaxed">
                  <span className="font-extrabold text-white block">Logística Integrada:</span>
                  Frota pesada e caminhões munck próprios. Içamento milimétrico garantido.
                </p>
              </div>
            </div>

            {/* Background glowing frame accent */}
            <div className="absolute -top-3 -left-3 w-40 h-40 border-t border-l border-brand-yellow/40 rounded-tl-2xl pointer-events-none -z-10" />
            <div className="absolute -bottom-3 -right-3 w-40 h-40 border-b border-r border-brand-orange/40 rounded-br-2xl pointer-events-none -z-10" />
          </motion.div>

        </div>

        {/* Pillars — editorial numbered layout */}
        <div className="mt-20 max-w-5xl mx-auto">
          {/* Section label */}
          <div className="flex items-center gap-4 mb-12">
            <span className="text-[9px] font-mono font-black text-zinc-600 uppercase tracking-[0.3em]">{about.pillarsLabel}</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="flex flex-col">
            {about.pillars.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                className="group grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 py-10 border-t border-white/5 hover:border-brand-yellow/20 transition-colors duration-300 items-start"
              >
                {/* Large number */}
                <div className="lg:col-span-2 flex items-start">
                  <span className="text-6xl sm:text-7xl font-black text-white/5 group-hover:text-brand-yellow/20 transition-colors duration-500 leading-none font-display select-none">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Title */}
                <div className="lg:col-span-4">
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight font-display leading-tight group-hover:text-brand-yellow transition-colors duration-300">
                    {p.title}
                  </h3>
                  <span className="inline-block mt-3 px-2.5 py-0.5 rounded-full bg-brand-yellow/8 border border-brand-yellow/15 text-[9px] font-black font-mono text-brand-yellow uppercase tracking-widest">
                    ✓ {p.seal}
                  </span>
                </div>

                {/* Description */}
                <div className="lg:col-span-6">
                  <p className="text-stone-400 font-sans text-sm leading-relaxed group-hover:text-stone-300 transition-colors duration-300">
                    {p.description}
                  </p>
                </div>
              </motion.div>
            ))}
            {/* Bottom border */}
            <div className="border-t border-white/5" />
          </div>
        </div>

      </div>
    </section>
  );
}

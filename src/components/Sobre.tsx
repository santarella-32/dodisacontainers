import { motion } from "motion/react";
import { Compass, Target, Heart, Building2, ShieldCheck, Box } from "lucide-react";

export default function Sobre() {
  const values = [
    {
      title: "Nossa Missão",
      description: "Fornecer módulos habitáveis e industriais de altíssima resistência e adaptabilidade, reduzindo prazos e otimizando layouts com engenharia limpa.",
      icon: Target,
      color: "text-brand-yellow",
      bg: "bg-[#111827]/30 border-brand-yellow/10 hover:border-brand-yellow/30"
    },
    {
      title: "Nossa Visão",
      description: "Ser reconhecida nacionalmente como o padrão de ouro absoluto em engenhosidade mecânica, robustez estrutural e integridade logística.",
      icon: Compass,
      color: "text-brand-orange",
      bg: "bg-[#111827]/30 border-brand-orange/10 hover:border-brand-orange/30"
    },
    {
      title: "Nossos Valores",
      description: "Segurança estrutural sob ART, rigor com normas NR-18 e NR-24, transparência comercial absoluta e suporte pós-venda incondicional.",
      icon: Heart,
      color: "text-brand-yellow",
      bg: "bg-[#111827]/30 border-brand-yellow/10 hover:border-brand-yellow/30"
    }
  ];

  return (
    <section id="sobre" className="relative py-28 bg-[#0B0F14] border-t border-white/5 overflow-hidden">
      
      {/* Background spotlights */}
      <div className="absolute top-1/2 left-0 w-96 h-[100px] bg-brand-yellow/3 blur-[90px] pointer-events-none" />
      <div className="absolute top-12 right-0 w-80 h-80 bg-brand-orange/2 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Two-Column Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-24">
          
          {/* Institutional Text Grid */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-brand-yellow/10 border border-brand-yellow/20 text-[10px] font-mono font-black text-brand-yellow uppercase tracking-widest mb-4">
              ENGENHARIA QUE DURA
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black font-display text-white uppercase tracking-tight leading-tight">
              A FORÇA DA ENGENHARIA <br />
              <span className="text-brand-yellow">MODULAR EM AÇO CORTEN.</span>
            </h2>
            
            <div className="w-16 h-1 bg-gradient-to-r from-brand-yellow to-brand-orange my-6 rounded-full" />

            <div className="space-y-5 text-stone-300 font-sans text-xs sm:text-sm leading-relaxed">
              <p>
                A <span className="font-extrabold text-white">Dodisa Containers</span> nasceu da sinergia de engenheiros especialistas em plantas mecânicas de alta complexidade e transporte pesado. Identificando a necessidade regional por módulos verdadeiramente robustos para canteiros, criamos nossa própria linha de produção focada em soldabilidade balística e isolação térmica termoacústica premium.
              </p>
              <p>
                Operamos com estrita observância das normas regulamentadoras nacionais vigentes (<span className="text-brand-yellow font-semibold">NR-18 e NR-24 da Portaria 3.214</span>), entregando todos os nossos módulos homologados com laudos de descontaminação e testes estruturais de vedabilidade.
              </p>
              <p>
                Nossos revestimentos passam por pintura eletrostática anticorrosiva marítima tripla de poliuretano epóxi, blindando cada chapa de aço contra corrosão ou vazamentos por longos anos, sob sol causticante ou chuvas intensas.
              </p>
            </div>

            {/* Quick credentials columns */}
            <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-xl sm:text-3xl font-black font-display text-white">100%</span>
                <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider mt-1">Homologado NR-18</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-3xl font-black font-display text-white">Aço</span>
                <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider mt-1">Corten Certificado</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-3xl font-black font-display text-white">Frota</span>
                <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider mt-1">Serralheria Própria</span>
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
            <div className="relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl aspect-[4/3] bg-brand-dark">
              <img
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80"
                alt="Operários da Dodisa soldando e inspecionando estruturas de metal"
                className="w-full h-full object-cover object-center scale-102 hover:scale-100 transition-transform duration-[800ms] brightness-90"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute inset-0 bg-brand-black/20" />

              {/* Float container detail watermark */}
              <div className="absolute bottom-6 left-6 right-6 bg-[#0B0F14]/95 backdrop-blur-md border border-white/5 p-5 rounded-xl flex items-center gap-3.5 shadow-2xl">
                <div className="w-10 h-10 rounded-lg bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center text-brand-yellow flex-shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <p className="text-xs text-stone-300 font-sans leading-relaxed">
                  <span className="font-extrabold text-white block">Visite Nosso Pátio Logístico:</span>
                  Visitas técnicas guiadas estão sempre disponíveis em nossa planta industrial sob marcação junto ao comercial.
                </p>
              </div>
            </div>
            
            {/* Background glowing frame accent */}
            <div className="absolute -top-3 -left-3 w-40 h-40 border-t border-l border-brand-yellow/40 rounded-tl-2xl pointer-events-none -z-10" />
            <div className="absolute -bottom-3 -right-3 w-40 h-40 border-b border-r border-brand-orange/40 rounded-br-2xl pointer-events-none -z-10" />
          </motion.div>

        </div>

        {/* Mission Vision Values Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6.5 mt-16 max-w-6xl mx-auto">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className={`p-6 sm:p-8 rounded-2xl border ${v.bg} shadow-lg flex flex-col justify-between transition-all duration-300 group`}
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-brand-black/80 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                    <Icon className={`w-5 h-5 ${v.color}`} />
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-black text-stone-100 uppercase tracking-wide font-display">
                    {v.title}
                  </h3>
                  
                  <p className="mt-3 text-stone-400 font-sans text-xs leading-relaxed">
                    {v.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-[10px] font-semibold text-stone-500 font-mono uppercase">
                  <ShieldCheck className="w-4 h-4 text-brand-yellow/50" />
                  Homologação Dodisa S.A.
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

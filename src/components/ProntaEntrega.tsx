import React from "react";
import { motion } from "motion/react";
import { MessageSquare, MapPin, BadgeCheck, Zap, Ruler, Shield, ClipboardCheck } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function ProntaEntrega() {
  const { prontaEntrega, whatsapp: systemWhatsapp } = useAppContext();
  
  const visibleItems = (prontaEntrega || []).filter((item) => item.active);

  // If there are too few items, let's multiply them so there's enough runway for an infinite smooth loop
  const carouselItems = [...visibleItems, ...visibleItems, ...visibleItems];

  const getDealType = (item: typeof prontaEntrega[0]) => {
    if (item.availableForSale && item.availableForRent) return "Venda ou Locação";
    if (item.availableForSale) return "Disponível p/ Venda";
    if (item.availableForRent) return "Disponível p/ Locação";
    return "Sob Consulta";
  };

  const handleInterest = (item: typeof prontaEntrega[0]) => {
    const dealTypeStr = getDealType(item);
    const message = `Olá! Tenho interesse no container à pronta entrega do site da Dodisa Containers:
Estrutura: ${item.title}
Tipo: ${item.type}
Medidas: ${item.measurements}
Estado: ${item.condition}
Disponível em: ${item.city} - ${item.state}
Modalidade: ${dealTypeStr}
Gostaria de agendar a entrega comercial ou saber mais detalhes.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${systemWhatsapp.number}?text=${encoded}`, "_blank");
  };

  return (
    <section id="pronta-entrega" className="relative bg-[#07090D] py-24 border-b border-white/5 scroll-mt-20 overflow-hidden">
      
      {/* Structural background highlights mimicking industrial scaffolding */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,138,0,0.03),transparent_70%)] pointer-events-none" />
      <div className="absolute top-12 left-10 w-96 h-96 bg-brand-yellow/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.6 }}
           className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-orange/10 border border-brand-orange/20 text-[10px] font-mono font-black text-brand-orange uppercase tracking-widest mb-4 shadow-sm shadow-brand-orange/5">
            <Zap className="w-3.5 h-3.5 text-brand-orange animate-pulse" /> EMBARQUE IMEDIATO HOJE
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display uppercase tracking-tight text-white leading-none">
            Lotes à <span className="text-brand-yellow">Pronta Entrega</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-brand-yellow to-brand-orange mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-stone-400 font-sans text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Evite filas e tempos de espera estruturais. Temos lotes prontos, limpos e revisados em nossos pátios logísticos para remessa, despacho rodoviário e içamento imediatos.
          </p>
        </motion.div>
      </div>

      {/* Automatic loop sliding infinite marquee carousel */}
      <div className="relative w-full py-4 overflow-hidden mask-fade-edges pause-marquee-hover select-none">
        {/* Inner track containing duplicated items */}
        <div className="animate-marquee-track cursor-grab active:cursor-grabbing hover:[animation-play-state:paused]" style={{ '--marquee-speed': '45s' } as React.CSSProperties}>
          
          {carouselItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="w-[280px] sm:w-[320px] mx-4 flex-shrink-0 bg-[#111827]/40 backdrop-blur-md border border-white/5 hover:border-brand-yellow/30 rounded-xl overflow-hidden transition-all duration-300 group flex flex-col justify-between shadow-xl"
            >
              {/* Product Photo with Badge */}
              <div className="relative h-44 sm:h-48 overflow-hidden bg-brand-dark flex-shrink-0">
                <img
                  src={(item.images && item.images[0]) || "https://images.unsplash.com/photo-1594913785162-e67853127ee9?auto=format&fit=crop&w=600&q=80"}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Status Float Indicator tag */}
                <div className="absolute top-3 left-3 bg-brand-orange text-white font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded shadow-lg flex items-center gap-1.5 ring-1 ring-white/10">
                  <Zap className="w-3 h-3 fill-current animate-bounce" /> DISPONÍVEL HOJE
                </div>

                <div className="absolute top-3 right-3 bg-brand-black/80 backdrop-blur text-brand-yellow text-[9px] font-bold px-2.5 py-1 rounded border border-white/5 shadow-md">
                  {getDealType(item)}
                </div>
              </div>

              {/* Descriptions & Specs */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-white text-sm sm:text-base font-black uppercase tracking-tight leading-tight group-hover:text-brand-yellow transition-colors mb-3">
                    {item.title}
                  </h3>

                  {/* Technical values metadata panel */}
                  <div className="space-y-2 border-t border-white/5 pt-3 text-xs text-stone-400 font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 font-mono text-[10px]">Modelo / Tipo:</span>
                      <span className="font-bold text-stone-200 text-[11px]">{item.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 font-mono text-[10px]">Dimensões (Exter):</span>
                      <span className="font-mono text-brand-yellow font-bold text-[10px] bg-brand-yellow/5 px-1.5 py-0.5 rounded">{item.measurements}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 font-mono text-[10px]">Conservação:</span>
                      <span className="font-bold text-stone-200 text-[11px]">{item.condition}</span>
                    </div>
                    <div className="flex items-start gap-1 justify-between text-[11px] mt-1 text-stone-400 leading-normal border-t border-white/5 pt-2">
                      <span className="text-stone-500 font-mono text-[10px]">Origem / Pátio:</span>
                      <span className="font-semibold text-stone-300 inline-flex items-center gap-1 text-right max-w-[150px]">
                        <MapPin className="w-3 h-3 text-brand-yellow flex-shrink-0" />
                        {item.city} - {item.state}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Interest Launcher Action Button */}
                <button
                  onClick={() => handleInterest(item)}
                  className="mt-6 w-full py-3 px-4 bg-brand-yellow hover:bg-brand-orange text-brand-black font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-display border border-brand-yellow hover:border-brand-orange shadow-md"
                >
                  <MessageSquare className="w-4 h-4 text-brand-black" />
                  Tenho interesse
                </button>
              </div>
            </div>
          ))}

        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Speed Callout Label */}
        <div className="p-5 rounded-2xl bg-[#111827]/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto text-center sm:text-left shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow border border-brand-yellow/20 flex-shrink-0">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <p className="text-xs text-stone-400 font-sans leading-relaxed">
              <span className="font-black text-white uppercase block mb-0.5">Içamento Técnico Credenciado:</span> Todos os lotes à pronta entrega passam por verificação tripla de soldabilidade balística, vedação, assoalho naval de alta espessura e redes elétricas preparadas antes do embarque.
            </p>
          </div>
          <button
            onClick={() => window.open(`https://wa.me/${systemWhatsapp.number}?text=Ola!%20Gostaria%20de%20consultar%20outros%20containers%20a%20pronta%20entrega.`, "_blank")}
            className="py-2.5 px-5 rounded-lg bg-brand-dark hover:bg-[#1c2638] border border-white/5 text-stone-200 hover:text-brand-yellow text-[10px] font-black uppercase tracking-widest transition-all shrink-0 cursor-pointer font-mono"
          >
            Ver pátio completo
          </button>
        </div>
      </div>

    </section>
  );
}

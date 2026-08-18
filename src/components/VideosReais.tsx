import React from "react";
import { motion } from "motion/react";
import { Play, MessageSquare, ShieldCheck, Video, HelpCircle, HardHat } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function VideosReais() {
  const { videos, whatsapp: systemWhatsapp } = useAppContext();
  
  const visibleVideos = videos.filter((v) => v.visible);

  const handleVideoRequest = (card: typeof videos[0]) => {
    const encoded = encodeURIComponent(card.whatsappMessage || `Olá! Gostaria de receber o vídeo sobre ${card.title}.`);
    window.open(`https://wa.me/${systemWhatsapp.number}?text=${encoded}`, "_blank");
  };

  return (
    <section id="videos-demonstrativos" className="relative bg-zinc-950 py-20 border-b border-stone-900 scroll-mt-20 overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.02),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-stone-900 border border-stone-800 text-xs font-black text-red-500 uppercase tracking-widest mb-4">
            Operação em Campo
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-sans uppercase tracking-tight text-white leading-none">
            Vídeos <span className="text-red-500">Reais</span> de Logística
          </h2>
          <p className="mt-4 text-stone-400 font-sans text-sm sm:text-base leading-relaxed">
            Veja de perto como entregamos e montamos seus containers.
          </p>
        </motion.div>

        {/* Video cards list — horizontal scroll */}
        <div className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleVideos.map((card, idx) => (
            <motion.div
              key={card.id || card.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group bg-stone-900 border border-stone-850 hover:border-red-500/30 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between flex-shrink-0 w-[320px] sm:w-[380px] snap-start"
            >
              {/* Simulated player window frame */}
              <div className="relative aspect-[16/9] bg-stone-950 overflow-hidden flex items-center justify-center">
                
                {/* Background mask photo of heavy trucking */}
                <img
                  src={card.thumbnail || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=650&q=80"}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-35 filter blur-[1px] group-hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                {/* Dark overlay gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/60" />

                {/* Animated Glowing Play-ish Placeholder trigger */}
                <button
                  onClick={() => handleVideoRequest(card)}
                  className="relative z-10 w-16 h-16 rounded-full bg-red-650 hover:bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all outline-none border border-red-500/40 cursor-pointer"
                  title="Solicitar vídeo demonstrativo"
                >
                  <Play className="w-7 h-7 text-white fill-current ml-1" />
                </button>

                {/* Duration sticker tag */}
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-stone-950/90 text-[10px] font-mono text-zinc-400">
                  {card.duration}
                </div>

                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-stone-950/90 text-[9px] font-black uppercase text-red-500 tracking-widest border border-stone-800">
                  {card.category}
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-white text-base sm:text-lg font-black uppercase tracking-tight group-hover:text-red-500 transition-colors leading-tight mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs text-stone-500 font-sans leading-relaxed mb-4">
                    Peça esse vídeo completo no WhatsApp.
                  </p>
                </div>

                <button
                  onClick={() => handleVideoRequest(card)}
                  className="w-full py-2.5 px-4 bg-stone-950 hover:bg-stone-850 text-stone-300 hover:text-white font-bold text-xs uppercase tracking-widest rounded border border-stone-800 hover:border-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-current text-red-500" />
                  Pedir vídeo no WhatsApp
                </button>
              </div>

            </motion.div>
          ))}
        </div>

        {/* Global heavy structural alert strip */}
        <div className="mt-12 max-w-4xl mx-auto p-4 rounded bg-stone-950 border border-stone-850/80 flex items-center gap-3">
          <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/25 text-yellow-500 shrink-0">
            <HardHat className="w-5 h-5" />
          </div>
          <p className="text-xs text-stone-400 font-sans leading-normal">
            <strong>Vídeos Reais:</strong> Gravados em obras de clientes de verdade, sem atores nem cenário.
          </p>
        </div>

      </div>

    </section>
  );
}

import { motion } from "motion/react";
import { MessageSquare, ArrowRight, HardHat, PhoneCall } from "lucide-react";
import { APP_INFO } from "../data";
import { useAppContext } from "../context/AppContext";

export default function CTA() {
  const { whatsapp: systemWhatsapp } = useAppContext();

  const handleCtaClick = () => {
    const msg = encodeURIComponent("Olá! Estou no site da Dodisa Containers e gostaria de iniciar uma conversa com um especialista comercial para ver preços e disponibilidade.");
    window.open(`https://wa.me/${systemWhatsapp.number}?text=${msg}`, "_blank");
  };

  return (
    <section className="relative py-28 bg-[#0B0F14] overflow-hidden">
      
      {/* Heavy mesh background gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffd54a04_1px,transparent_1px)] bg-[size:24px_24px] opacity-60" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner container designed like a shipping container outline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative p-8 sm:p-20 rounded-2xl bg-[#111827]/40 backdrop-blur-md border border-white/5 shadow-2xl text-center flex flex-col items-center overflow-hidden"
        >
          
          {/* Construction safety warning strip stripes left and right */}
          <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-b from-brand-yellow via-brand-orange to-brand-yellow opacity-40" />
          <div className="absolute top-0 bottom-0 right-0 w-2 bg-gradient-to-b from-brand-yellow via-brand-orange to-brand-yellow opacity-40" />
          
          {/* Top subtle line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-yellow to-brand-orange" />

          {/* HardHat Icon float */}
          <div className="w-14 h-14 bg-[#0B0F14] border border-brand-yellow text-brand-yellow rounded-full flex items-center justify-center mb-6 shadow-xl relative animate-pulse">
            <HardHat className="w-6 h-6 stroke-[2.5]" />
          </div>

          <span className="text-[10px] sm:text-xs font-mono font-black text-brand-yellow uppercase tracking-[4px] mb-3">
            Atendimento Rápido Nacional
          </span>

          <h2 className="text-3xl sm:text-5xl font-black font-display text-white uppercase tracking-tight max-w-3xl leading-none">
            PRECISA DE UM CONTAINER?
          </h2>

          <p className="mt-4 text-stone-400 font-sans text-xs sm:text-sm max-w-2xl leading-relaxed">
            Nossa equipe técnica e comercial está homologada sob ART para emitir orçamentos detalhados imediatos. Converse com quem entende de logística pesada.
          </p>

          {/* Large actionable button */}
          <div className="mt-10 flex flex-col items-center gap-4 w-full sm:w-auto">
            <button
              onClick={handleCtaClick}
              className="w-full sm:w-auto group relative py-4 px-12 bg-brand-yellow hover:bg-[#ffe17d] text-brand-black font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-brand-yellow/10 cursor-pointer font-display"
            >
              <MessageSquare className="w-5 h-5 text-brand-black group-hover:scale-105 transition-transform" />
              Falar com um especialista
              <ArrowRight className="w-4 h-4 text-brand-black group-hover:translate-x-1.5 transition-transform stroke-[2.5]" />
            </button>
            
            <p className="text-xs text-stone-500 font-mono flex items-center gap-1.5 mt-2 font-bold select-all">
              <PhoneCall className="w-3.5 h-3.5 text-stone-600" />
              Se preferir ligar: {APP_INFO.phone}
            </p>
          </div>

        </motion.div>
      </div>

    </section>
  );
}

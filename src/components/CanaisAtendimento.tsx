import React from "react";
import { motion } from "motion/react";
import { MessageSquare, Instagram, MapPin } from "lucide-react";
import { APP_INFO } from "../data";
import { useAppContext } from "../context/AppContext";

export default function CanaisAtendimento() {
  const { whatsapp: systemWhatsapp } = useAppContext();

  const handleWhatsapp = () => {
    const msg = encodeURIComponent("Olá! Vi as informações no site e gostaria de atendimento.");
    window.open(`https://wa.me/${systemWhatsapp.number}?text=${msg}`, "_blank");
  };

  const handleInstagram = () => {
    window.open(APP_INFO.instagramUrl, "_blank");
  };

  const handleMaps = () => {
    window.open(APP_INFO.mapsUrl, "_blank");
  };

  return (
    <section id="contatos-rapidos" className="relative bg-zinc-950 py-16 overflow-hidden z-20">
      
      {/* Heavy mesh metal texture accent background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
      
      {/* Industrial framing guides */}
      <div className="absolute top-0 left-4 w-[1px] h-full bg-stone-900" />
      <div className="absolute top-0 right-4 w-[1px] h-full bg-stone-900" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-stone-900 border border-stone-800 text-xs font-black text-amber-500 uppercase tracking-widest mb-4">
            Contatos Digitais
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-sans uppercase tracking-tight text-white leading-none">
            Nossos Canais <span className="text-[#FFD400]">Oficiais</span>
          </h2>
          <p className="mt-4 text-stone-400 font-sans text-sm sm:text-base leading-relaxed">
            Fale com a gente pelo WhatsApp, Instagram ou visite nosso pátio.
          </p>
        </motion.div>

        {/* The requested Red-themed block containing 3 gorgeous cards */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-amber-200 shadow-2xl relative overflow-hidden">

          {/* Background subtle glowing effect */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-amber-50/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
            
            {/* Card 1: WhatsApp */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-amber-50 text-stone-900 p-6 sm:p-8 rounded-xl border border-amber-200 shadow-lg flex flex-col items-center text-center justify-between min-h-[280px] hover:scale-[1.02] transition-transform duration-300 group"
            >
              <div className="flex flex-col items-center">
                {/* Whatsapp Icon Container */}
                <div className="w-14 h-14 rounded-full bg-amber-100 hover:bg-amber-200 flex items-center justify-center mb-4 transition-colors">
                  <MessageSquare className="w-8 h-8 text-amber-600 fill-current" />
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider mb-2">
                  WhatsApp
                </h3>
                
                <p className="text-lg sm:text-xl font-black tracking-wide mb-1 select-all">
                  {APP_INFO.phone}
                </p>
                
                <p className="text-xs sm:text-sm text-stone-500 font-sans">
                  Atendimento rápido e direto
                </p>
              </div>

              <button
                onClick={handleWhatsapp}
                className="mt-6 w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-[#FFD400] font-black text-xs uppercase tracking-widest rounded-lg shadow transition-colors cursor-pointer"
              >
                Chamar no WhatsApp
              </button>
            </motion.div>

            {/* Card 2: Instagram */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-amber-50 text-stone-900 p-6 sm:p-8 rounded-xl border border-amber-200 shadow-lg flex flex-col items-center text-center justify-between min-h-[280px] hover:scale-[1.02] transition-transform duration-300 group"
            >
              <div className="flex flex-col items-center">
                {/* Instagram Icon Container */}
                <div className="w-14 h-14 rounded-full bg-amber-100 hover:bg-amber-200 flex items-center justify-center mb-4 transition-colors">
                  <Instagram className="w-8 h-8 text-amber-600" />
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider mb-2">
                  Instagram
                </h3>
                
                <p className="text-lg sm:text-xl font-black tracking-wide mb-1 select-all">
                  {APP_INFO.instagram}
                </p>
                
                <p className="text-xs sm:text-sm text-stone-500 font-sans">
                  Acompanhe nossos projetos
                </p>
              </div>

              <button
                onClick={handleInstagram}
                className="mt-6 w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-[#FFD400] font-black text-xs uppercase tracking-widest rounded-lg shadow transition-colors cursor-pointer"
              >
                Seguir no Instagram
              </button>
            </motion.div>

            {/* Card 3: Localização */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-amber-50 text-stone-900 p-6 sm:p-8 rounded-xl border border-amber-200 shadow-lg flex flex-col items-center text-center justify-between min-h-[280px] hover:scale-[1.02] transition-transform duration-300 group"
            >
              <div className="flex flex-col items-center">
                {/* Location Icon Container */}
                <div className="w-14 h-14 rounded-full bg-amber-100 hover:bg-amber-200 flex items-center justify-center mb-4 transition-colors">
                  <MapPin className="w-8 h-8 text-amber-600" />
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider mb-2">
                  Localização
                </h3>
                
                <p className="text-xs sm:text-sm font-bold tracking-tight mb-2 leading-tight">
                  Rua Julio Gaviragui, Santa Rosa, Rio Grande do Sul, Brazil - CEP 98790146
                </p>
                
                <p className="text-xs text-white/80 font-sans">
                  Santa Rosa, Rio Grande do Sul
                </p>
              </div>

              <button
                onClick={handleMaps}
                className="mt-6 w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-[#FFD400] font-black text-xs uppercase tracking-widest rounded-lg shadow transition-colors cursor-pointer"
              >
                Ver no Mapa
              </button>
            </motion.div>

          </div>

        </div>

      </div>

    </section>
  );
}

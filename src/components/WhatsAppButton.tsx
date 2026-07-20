import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, ShieldCheck, HelpCircle } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function WhatsAppButton() {
  const { whatsapp: systemWhatsapp } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    {
      label: "Falar Geral / Orçamento",
      text: systemWhatsapp.autoMsgGeneral || "Olá, vim pelo site da Dodisa Containers e gostaria de solicitar um orçamento.",
    },
    {
      label: "Container Depósito (D-20)",
      text: systemWhatsapp.categoryMessages?.["Depósito"] || "Olá! Gostaria de um orçamento para o Módulo Container Depósito d-20.",
    },
    {
      label: "Container Escritório (E-30)",
      text: systemWhatsapp.categoryMessages?.["Escritório"] || "Olá! Quero cotar valores e prazos do Container Escritório Premium e-30.",
    },
    {
      label: "Container Banheiro (B-15)",
      text: systemWhatsapp.categoryMessages?.["Banheiro"] || "Olá! Gostaria de mais detalhes sobre o Container Banheiro e Sanitário b-15.",
    },
    {
      label: "Container Habitacional",
      text: systemWhatsapp.categoryMessages?.["Habitacional"] || "Olá! Gostaria de tirar dúvidas técnicas e valores do Container Habitacional Studio.",
    },
    {
      label: "Projeto Personalizado",
      text: systemWhatsapp.categoryMessages?.["Personalizados"] || "Olá! Desejo cotar um Projeto Especial e customizado sob medida com a Dodisa.",
    },
  ];

  const triggerWhatsapp = (textMsg: string) => {
    const encoded = encodeURIComponent(textMsg);
    window.open(`https://wa.me/${systemWhatsapp.number}?text=${encoded}`, "_blank");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end">
      
      {/* Small notification count bubble above is displayed when closed */}
      {!isOpen && (
        <span className="absolute -top-1.5 -left-1.5 w-5.5 h-5.5 bg-red-650 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce shadow-md">
          1
        </span>
      )}

      {/* Flyout Conversions Directory Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ duration: 0.25 }}
            className="w-[calc(100vw-32px)] max-w-[340px] rounded-xl bg-stone-950 border border-emerald-500/30 overflow-hidden shadow-2xl mb-4 text-left"
          >
            {/* Header of the dialog widget */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-emerald-600 rounded-full animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider leading-none">Dodisa Suporte</h4>
                  <p className="text-[10px] text-emerald-100 font-semibold mt-1">Conectado • Resposta média: 1 min</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
                aria-label="Minimizar chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inner Body of quick selections */}
            <div className="p-4 bg-stone-950 space-y-3">
              <p className="text-[11px] text-stone-400 font-sans leading-normal">
                Selecione o modelo de interesse para iniciar nosso sistema de atendimento imediato e inteligente com o especialista:
              </p>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => triggerWhatsapp(opt.text)}
                    className="w-full p-2.5 rounded text-left bg-stone-900 hover:bg-emerald-600/10 text-stone-200 hover:text-emerald-400 text-xs font-bold border border-stone-850 hover:border-emerald-500/30 transition-all duration-200 flex items-center justify-between group"
                  >
                    <span>{opt.label}</span>
                    <Send className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            {/* Verification Footer section */}
            <div className="px-4 py-2 bg-stone-900 text-[9px] text-stone-500 font-semibold flex items-center justify-between border-t border-stone-850">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Atendimento Seguro
              </span>
              <span>Dodisa Containers Ltda.</span>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating launcher bubble button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border focus:outline-none cursor-pointer ${
          isOpen
            ? "bg-stone-950 text-emerald-500 border-stone-800 rotate-90"
            : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-950/40 hover:scale-105"
        }`}
        aria-label="Atendimento no WhatsApp"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 fill-current animate-pulse-slow" />}
      </button>

    </div>
  );
}

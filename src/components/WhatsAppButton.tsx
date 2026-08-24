import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, ShieldCheck } from "lucide-react";
import { useAppContext } from "../context/AppContext";

function WhatsAppIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

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
      text: systemWhatsapp.categoryMessages?.["Projetos Personalizados"] || "Olá! Desejo cotar um Projeto Especial e customizado sob medida com a Dodisa.",
    },
  ];

  const triggerWhatsapp = (textMsg: string) => {
    const encoded = encodeURIComponent(textMsg);
    window.open(`https://wa.me/${systemWhatsapp.number}?text=${encoded}`, "_blank");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end">

      {!isOpen && (
        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce shadow-md">
          1
        </span>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ duration: 0.25 }}
            className="w-[calc(100vw-32px)] max-w-[340px] rounded-xl bg-stone-950 border border-emerald-500/30 overflow-hidden shadow-2xl mb-4 text-left"
          >
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <WhatsAppIcon className="w-5 h-5" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-emerald-600 rounded-full animate-pulse" />
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

            <div className="p-4 bg-stone-950 space-y-3">
              <p className="text-[11px] text-stone-400 font-sans leading-normal">
                Selecione o modelo de interesse para iniciar nosso sistema de atendimento imediato e inteligente com o especialista:
              </p>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => triggerWhatsapp(opt.text)}
                    className="w-full p-2.5 rounded text-left bg-stone-900 hover:bg-emerald-600/10 text-stone-200 hover:text-emerald-400 text-xs font-bold border border-stone-800 hover:border-emerald-500/30 transition-all duration-200 flex items-center justify-between group"
                  >
                    <span>{opt.label}</span>
                    <Send className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 py-2 bg-stone-900 text-[9px] text-stone-500 font-semibold flex items-center justify-between border-t border-stone-800">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Atendimento Seguro
              </span>
              <span>Dodisa Containers Ltda.</span>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border focus:outline-none cursor-pointer ${
          isOpen
            ? "bg-stone-950 text-emerald-500 border-stone-800 rotate-90"
            : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-950/40 hover:scale-105"
        }`}
        aria-label="Atendimento no WhatsApp"
      >
        {isOpen ? <X className="w-6 h-6" /> : <WhatsAppIcon className="w-7 h-7" />}
      </button>

    </div>
  );
}

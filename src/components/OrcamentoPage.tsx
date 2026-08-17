import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare, ChevronRight, ChevronLeft, CheckCircle2,
  Box, Clock, Ruler, User, Phone, Zap, ArrowLeft
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import Logo from "./Logo";

const STEPS = [
  {
    id: "finalidade",
    icon: Box,
    title: "Qual a finalidade?",
    subtitle: "Selecione o uso principal do seu container",
    options: [
      { label: "Depósito / Almoxarifado", emoji: "📦", desc: "Guarda de materiais, ferramentas ou produtos" },
      { label: "Escritório / Comercial",  emoji: "🏢", desc: "Ambiente de trabalho ou atendimento ao cliente" },
      { label: "Sanitário / Banheiro",    emoji: "🚿", desc: "Módulo sanitário completo para obras e eventos" },
      { label: "Habitacional / Studio",   emoji: "🏠", desc: "Moradia, quarto extra ou studio moderno" },
      { label: "Projeto Personalizado",   emoji: "✏️", desc: "Ideias únicas sob medida com projeto técnico" },
    ],
  },
  {
    id: "tamanho",
    icon: Ruler,
    title: "Qual o tamanho?",
    subtitle: "Escolha o módulo mais adequado à sua necessidade",
    options: [
      { label: "Pequeno — 3m (10 pés)",   emoji: "📏", desc: "Ideal para banheiros, guaritas e usos compactos" },
      { label: "Padrão — 6m (20 pés)",    emoji: "📐", desc: "O mais versátil: escritórios, depósitos e studios" },
      { label: "Grande — 12m (40 pés)",   emoji: "📊", desc: "Amplo espaço para operações maiores" },
      { label: "Módulos acoplados",        emoji: "🔗", desc: "Dois ou mais containers integrados sob medida" },
    ],
  },
  {
    id: "prazo",
    icon: Clock,
    title: "Qual o prazo?",
    subtitle: "Isso nos ajuda a priorizar sua proposta",
    options: [
      { label: "Urgente — esta semana",    emoji: "⚡", desc: "Temos lotes à pronta entrega disponíveis agora" },
      { label: "Próximas 2–4 semanas",     emoji: "📅", desc: "Tempo ideal para fabricação ou adaptação" },
      { label: "1 a 3 meses",              emoji: "🗓️", desc: "Projeto mais elaborado com personalização" },
      { label: "Apenas cotação futura",    emoji: "📝", desc: "Quero pesquisar e comparar valores agora" },
    ],
  },
  {
    id: "contato",
    icon: User,
    title: "Seus dados",
    subtitle: "Assim nosso especialista já chega com tudo preparado",
    fields: true,
  },
];

export default function OrcamentoPage() {
  const { whatsapp } = useAppContext();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dir, setDir] = useState(1); // 1 = forward, -1 = backward

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const progress = ((step) / (STEPS.length - 1)) * 100;

  const select = (value: string) => {
    setAnswers((a) => ({ ...a, [current.id]: value }));
    if (!isLast) {
      setTimeout(() => { setDir(1); setStep((s) => s + 1); }, 250);
    }
  };

  const back = () => { setDir(-1); setStep((s) => s - 1); };

  const handleSubmit = () => {
    const lines = [
      `Olá! Fiz a simulação de orçamento no site Dodisa Containers e gostaria de receber uma proposta.`,
      ``,
      `📦 Finalidade: ${answers.finalidade || "—"}`,
      `📐 Tamanho: ${answers.tamanho || "—"}`,
      `📅 Prazo: ${answers.prazo || "—"}`,
      nome ? `👤 Nome: ${nome}` : null,
      telefone ? `📱 Telefone: ${telefone}` : null,
      ``,
      `Aguardo o contato. Obrigado!`,
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/${whatsapp.number}?text=${encodeURIComponent(lines)}`, "_blank");
  };

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d * 40 }),
    center: { opacity: 1, x: 0 },
    exit:  (d: number) => ({ opacity: 0, x: d * -40 }),
  };

  return (
    <div className="min-h-screen bg-[#07090D] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-xs font-bold cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </a>
        <Logo />
        <div className="w-24" />
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 mb-2">
              <span>Etapa {step + 1} de {STEPS.length}</span>
              <span>{Math.round(progress)}% concluído</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-yellow to-brand-orange rounded-full"
                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Step card */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
            >
              {/* Icon + title */}
              <div className="mb-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center text-brand-yellow mx-auto mb-4">
                  <current.icon className="w-5 h-5" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2">
                  {current.title}
                </h1>
                <p className="text-stone-400 text-sm">{current.subtitle}</p>
              </div>

              {/* Options */}
              {!current.fields && (
                <div className="space-y-3">
                  {current.options?.map((opt) => {
                    const active = answers[current.id] === opt.label;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => select(opt.label)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer group ${
                          active
                            ? "border-brand-yellow/60 bg-brand-yellow/8 shadow-lg shadow-brand-yellow/5"
                            : "border-white/6 bg-white/2 hover:border-white/15 hover:bg-white/4"
                        }`}
                      >
                        <span className="text-2xl leading-none select-none flex-shrink-0">{opt.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-black text-sm uppercase tracking-tight ${active ? "text-brand-yellow" : "text-white"}`}>
                            {opt.label}
                          </p>
                          <p className="text-stone-500 text-[11px] mt-0.5 leading-snug">{opt.desc}</p>
                        </div>
                        {active
                          ? <CheckCircle2 className="w-5 h-5 text-brand-yellow flex-shrink-0" />
                          : <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-stone-400 flex-shrink-0 transition-colors" />
                        }
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Contact step */}
              {current.fields && (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="bg-white/3 border border-white/6 rounded-2xl p-4 space-y-2 mb-6">
                    <p className="text-[10px] font-mono text-stone-500 uppercase tracking-wider mb-3">Resumo da sua simulação</p>
                    {Object.entries(answers).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <span className="text-stone-500 text-xs capitalize">{k}</span>
                        <span className="text-brand-yellow text-xs font-bold">{v}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Seu nome <span className="text-stone-600">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Como devemos te chamar?"
                      className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-brand-yellow/50 transition-colors placeholder-stone-600 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> WhatsApp <span className="text-stone-600">(opcional)</span>
                    </label>
                    <input
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(55) 99999-9999"
                      className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-brand-yellow/50 transition-colors placeholder-stone-600 font-sans font-mono"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full py-4 px-5 mt-2 rounded-2xl bg-[#25D366] hover:bg-[#20c05e] text-white font-black text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer shadow-xl shadow-[#25D366]/20 hover:shadow-[#25D366]/35 hover:scale-[1.015] active:scale-[0.985]"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Enviar orçamento via WhatsApp
                    <Zap className="w-4 h-4 ml-auto" />
                  </button>

                  <p className="text-center text-stone-600 text-[10px] font-mono">
                    Abrirá o WhatsApp com tudo preenchido · Sem spam · Sem compromisso
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Back button */}
          {step > 0 && !isLast && (
            <button
              onClick={back}
              className="mt-6 mx-auto flex items-center gap-1.5 text-stone-500 hover:text-stone-300 transition-colors text-xs font-bold cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Voltar
            </button>
          )}
          {isLast && (
            <button
              onClick={back}
              className="mt-4 mx-auto flex items-center gap-1.5 text-stone-500 hover:text-stone-300 transition-colors text-xs font-bold cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Alterar respostas
            </button>
          )}
        </div>
      </main>

      {/* Footer strip */}
      <div className="border-t border-white/5 py-4 text-center text-[10px] text-stone-600 font-mono">
        Dodisa Containers · Santa Rosa, RS · Atendimento em todo o Sul do Brasil
      </div>
    </div>
  );
}

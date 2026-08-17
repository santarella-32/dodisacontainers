import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calculator, Sparkles, Send, ShieldCheck, MapPin, Building2, Truck, ClipboardList, PenTool } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function SimuladorOrcamento() {
  const { simulator, whatsapp: systemWhatsapp } = useAppContext();
  
  // Dynamic question inputs
  const qTipo = simulator.questions.find(q => q.id === "q-tipo") || { questionText: "Tipo de Módulo", options: ["Depósito / Almoxarifado", "Escritório / Comercial", "Sanitário / Banheiro", "Habitacional / Studio", "Projeto Customizado"] };
  const qTamanho = simulator.questions.find(q => q.id === "q-tamanho") || { questionText: "Tamanho", options: ["Pequeno (3 metros / 10 pés)", "Padrão (6 metros / 20 pés)", "Grande (12 metros / 40 pés)", "Módulos acoplados sob medida"] };
  const qPrazo = simulator.questions.find(q => q.id === "q-prazo") || { questionText: "Prazo Desejado", options: ["Urgente (Esta semana)", "Próximas semanas", "Apenas cotação futura"] };

  const [containerType, setContainerType] = useState(qTipo.options[0] || "Depósito / Almoxarifado");
  const [dealType, setDealType] = useState("Compra");
  const [cityState, setCityState] = useState("");
  const [timeframe, setTimeframe] = useState(qPrazo.options[0] || "Urgente");
  const [selectedSize, setSelectedSize] = useState(qTamanho.options[1] || "Padrão (6 metros)");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isDetected, setIsDetected] = useState(false);

  // Sync to loaded options if they change in AdminPanel
  useEffect(() => {
    if (qTipo.options[0]) setContainerType(qTipo.options[0]);
    if (qPrazo.options[0]) setTimeframe(qPrazo.options[0]);
    if (qTamanho.options[1]) setSelectedSize(qTamanho.options[1]);
  }, [simulator]);

  // Listen for detected location events
  useEffect(() => {
    const handleLocationDetected = (e: Event) => {
      const customEvent = e as CustomEvent<{ city: string; state: string }>;
      if (customEvent.detail && customEvent.detail.city) {
        const locString = `${customEvent.detail.city} - ${customEvent.detail.state}`;
        setCityState(locString);
        setIsDetected(true);
      }
    };

    window.addEventListener("location-detected", handleLocationDetected);
    return () => {
      window.removeEventListener("location-detected", handleLocationDetected);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !whatsapp) {
      alert("Por favor, preencha seu Nome e WhatsApp de contato.");
      return;
    }

    const answersComp = `Tipo: ${containerType}
Dimensões: ${selectedSize}
Modalidade: ${dealType}
Local: ${cityState || "Não informado"}
Prazo Desejado: ${timeframe}
Cliente: ${name}
Celular: ${whatsapp}`;

    const message = simulator.whatsappTemplate.replace("{answers}", answersComp);
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${systemWhatsapp.number}?text=${encoded}`, "_blank");
  };

  const getIconForOption = (name: string) => {
    if (name.includes("Comercial") || name.includes("Escritório")) return Building2;
    if (name.includes("Depósito") || name.includes("Almoxarifado")) return ClipboardList;
    if (name.includes("Sanitário") || name.includes("Banheiro")) return PenTool;
    if (name.includes("Habitacional") || name.includes("Studio")) return Truck;
    return Sparkles;
  };

  return (
    <section id="simulador-orcamento" className="relative bg-[#0B0F14] py-28 border-b border-white/5 scroll-mt-20 overflow-hidden">
      
      {/* Background Tech Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,212,0,0.03),transparent_50%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-yellow/10 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-brand-yellow/10 border border-brand-yellow/20 text-[10px] font-mono font-black text-brand-yellow uppercase tracking-widest mb-4">
            ORÇAMENTO RÁPIDO
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display uppercase tracking-tight text-white leading-none">
            Simulador de <span className="text-brand-yellow">Orçamento</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-brand-yellow to-brand-orange mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-stone-400 font-sans text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Monte seu orçamento em poucos cliques e fale direto com um especialista.
          </p>
        </motion.div>

        {/* Dashboard Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch max-w-6xl mx-auto">
          
          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 bg-[#111827]/30 backdrop-blur border border-white/5 p-6 sm:p-10 rounded-2xl relative flex flex-col justify-between shadow-2xl"
          >
            {/* Corner Bracket Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-brand-yellow/30 rounded-tl" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-brand-yellow/30 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-brand-yellow/30 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-brand-yellow/30 rounded-br" />

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Box 1: Container Type */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 mb-3">
                  1. Selecione o Tipo de Módulo
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {qTipo.options.map((opt) => {
                    const IconComp = getIconForOption(opt);
                    const isSelected = containerType === opt;
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setContainerType(opt)}
                        className={`p-3 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between h-24 cursor-pointer ${
                          isSelected
                            ? "bg-brand-yellow/10 border-brand-yellow text-white shadow-lg shadow-brand-yellow/5"
                            : "bg-[#0B0F14]/50 border-white/5 text-stone-400 hover:border-white/10 hover:text-stone-200"
                        }`}
                      >
                        <IconComp className={`w-5 h-5 ${isSelected ? "text-brand-yellow" : "text-stone-600"}`} />
                        <span className="text-xs font-black uppercase tracking-tight leading-tight block mt-2">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Box 2: Deal Type (Compra ou Aluguel) */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 mb-3 block">
                  2. Modalidade de Contrato
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Compra", "Aluguel"].map((mode) => {
                    const isSelected = dealType === mode;
                    return (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => setDealType(mode)}
                        className={`py-3.5 px-4 rounded-xl font-black text-xs tracking-widest uppercase border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-brand-yellow text-brand-black border-brand-yellow shadow-md"
                            : "bg-[#0B0F14]/50 border-white/5 text-stone-400 hover:border-white/10"
                        }`}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Box 3: Destination City State & Delivery Frame */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5 pt-5 pb-2">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 mb-2">
                    3. Local de Entrega
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full py-3 pl-9 pr-4 rounded-xl bg-[#0B0F14] border border-white/5 focus:border-brand-yellow text-white text-xs placeholder-stone-700 focus:outline-none transition-colors"
                      placeholder="Ex: Porto Alegre - RS"
                      value={cityState}
                      onChange={(e) => setCityState(e.target.value)}
                    />
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-stone-600" />
                    {isDetected && (
                      <span className="absolute right-2 top-2 px-1.5 py-0.5 rounded text-[8px] bg-brand-yellow/10 text-brand-yellow font-mono font-black tracking-widest uppercase border border-brand-yellow/20">
                        GPS
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 mb-2">
                    4. Dimensões do Container
                  </label>
                  <select
                    className="w-full py-3.5 px-3 rounded-xl bg-[#0B0F14] border border-white/5 focus:border-brand-yellow text-stone-300 text-xs focus:outline-none transition-colors font-bold font-sans"
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    {qTamanho.options.map((sz) => (
                      <option key={sz} value={sz}>{sz}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 mb-2">
                    5. Prazo Técnico
                  </label>
                  <select
                    className="w-full py-3.5 px-3 rounded-xl bg-[#0B0F14] border border-white/5 focus:border-brand-yellow text-stone-300 text-xs focus:outline-none transition-colors font-sans"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                  >
                    {qPrazo.options.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Box 4: Contact details */}
              <div className="border-t border-white/5 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Nome do Solicitante / Empresa
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full py-3 px-4 rounded-xl bg-[#0B0F14] border border-white/5 focus:border-brand-yellow text-white text-xs placeholder-stone-750 focus:outline-none transition-colors"
                    placeholder="Ex: João Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 mb-2">
                    WhatsApp Comercial
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full py-3 px-4 rounded-xl bg-[#0B0F14] border border-white/5 focus:border-brand-yellow text-white text-xs placeholder-stone-750 focus:outline-none transition-colors"
                    placeholder="Ex: (51) 99999-9999"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 py-4 px-6 bg-brand-yellow hover:bg-brand-orange text-brand-black font-black text-xs uppercase tracking-widest rounded-xl shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 cursor-pointer border-none font-display"
              >
                <Calculator className="w-4.5 h-4.5 stroke-[2.5]" />
                Receber orçamento no WhatsApp
                <Send className="w-3.5 h-3.5 ml-1" />
              </button>

            </form>
          </motion.div>

          {/* Interactive Simulation Summary / Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-b from-[#111827]/40 to-[#0B0F14]/40 border border-white/5 rounded-2xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-md shadow-2xl"
          >
            {/* Visual Design Container Accent Ribbon */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/5 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center text-brand-yellow">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white text-xs font-black uppercase tracking-wider font-display">Resumo da Especificação</h3>
                  <p className="text-[10px] text-brand-yellow flex items-center gap-1.5 font-mono font-bold mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse" /> PRONTO PARA ENVIAR
                  </p>
                </div>
              </div>

              <div className="space-y-4 font-mono text-sm border-y border-white/5 py-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-stone-500 text-[10px] font-bold uppercase font-mono">TIPO_MÓDULO:</span>
                  <span className="text-brand-yellow font-black text-right text-xs uppercase">{containerType}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-stone-500 text-[10px] font-bold uppercase font-mono">DIMENSÕES:</span>
                  <span className="text-white font-black text-right text-xs truncate max-w-[170px] uppercase">{selectedSize}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-stone-500 text-[10px] font-bold uppercase font-mono">CONTRATO_MODAL:</span>
                  <span className="text-brand-black font-black bg-brand-yellow px-2 py-0.5 rounded-lg text-[10px] uppercase">{dealType}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-stone-500 text-[10px] font-bold uppercase font-mono">REGIAO_ENTREGA:</span>
                  <span className="text-brand-orange font-black text-right text-xs truncate max-w-[180px] uppercase">{cityState || "Digitando..."}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-stone-500 text-[10px] font-bold uppercase font-mono">PRAZO_MONTAGEM:</span>
                  <span className="text-stone-300 font-bold text-right text-xs uppercase">{timeframe}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-stone-500 text-[10px] font-bold uppercase font-mono">SOLICITANTE_LEAD:</span>
                  <span className="text-white font-black text-right text-xs truncate max-w-[180px] uppercase">{name || "Aguardando..."}</span>
                </div>
              </div>

              {/* Bullet notes of safety & compliance */}
              <div className="mt-6 space-y-2.5 text-stone-400 font-sans text-xs">
                <p className="flex items-center gap-2 text-stone-300">
                  <ShieldCheck className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                  Orçamento de engenharia sem custo ou compromisso.
                </p>
                <p className="flex items-center gap-2 text-stone-300">
                  <ShieldCheck className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                  Dentro das normas NR-18 e NR-24.
                </p>
                <p className="flex items-center gap-2 text-stone-300">
                  <ShieldCheck className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                  Entrega expressa com frota pesada de caminhões munck.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 text-[9px] text-stone-500 font-mono flex items-center justify-between">
              <span>* Retorno em até 60 minutos em horário comercial</span>
              <strong className="uppercase text-brand-yellow/70 font-black tracking-widest font-mono">DODISA S.A</strong>
            </div>

          </motion.div>

        </div>

      </div>

    </section>
  );
}

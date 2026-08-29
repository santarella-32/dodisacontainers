import React, { useState } from "react";
import { motion } from "motion/react";
import { Calculator, AlertTriangle, ShieldCheck, HelpCircle, MessageSquare, Building, ArrowRight, Table, Info, Check, RefreshCw, Award } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function CalculadoraEconomia() {
  const { whatsapp: systemWhatsapp, economyCalculator } = useAppContext();
  const { projectTypes, sizes, timeframes, comparisons } = economyCalculator;
  const [projectType, setProjectType] = useState(projectTypes[0]);
  const [size, setSize] = useState(sizes[1] ?? sizes[0]);
  const [timeframe, setTimeframe] = useState(timeframes[0]);

  const handleCalculateWhatsapp = () => {
    const message = `Olá, fiz uma simulação de economia no site da Dodisa Containers:
Tipo de Projeto: ${projectType}
Área Estimada: ${size}
Prazo Desejado: ${timeframe}
Gostaria de calcular os valores exatos de economia e parcelas para a minha região.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${systemWhatsapp.number}?text=${encoded}`, "_blank");
  };

  return (
    <section id="economia-comparativo" className="relative bg-[#0B0F14] py-28 border-b border-white/5 scroll-mt-20 overflow-hidden">
      
      {/* Heavy mechanical lines decoration */}
      <div className="absolute top-0 left-4 w-[1px] h-full bg-white/[0.02]" />
      <div className="absolute top-0 right-4 w-[1px] h-full bg-white/[0.02]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-brand-yellow/10 border border-brand-yellow/20 text-[10px] font-mono font-black text-brand-yellow uppercase tracking-widest mb-4">
            {economyCalculator.eyebrow}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display uppercase tracking-tight text-white leading-none">
            {economyCalculator.titleLine1} <span className="text-brand-yellow">{economyCalculator.titleHighlight}</span> {economyCalculator.titleLine2}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-brand-yellow to-brand-orange mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-stone-400 font-sans text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            {economyCalculator.subtitle}
          </p>
        </motion.div>

        {/* 5. ECONOMY CALCULATOR SUB-SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-20 max-w-6xl mx-auto animate-fade-in">
          
          {/* Config column inputs */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 bg-[#111827]/30 border border-white/5 p-6 sm:p-8 rounded-2xl flex flex-col justify-between backdrop-blur shadow-2xl"
          >
            <div>
              <div className="flex items-center gap-2 text-brand-yellow mb-6">
                <Calculator className="w-5 h-5" />
                <span className="text-xs font-mono font-black uppercase tracking-wider">Simulador de Projeto</span>
              </div>

              <div className="space-y-6">
                {/* Field 1 */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Tipo do seu Projeto:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {projectTypes.map((t) => {
                      const isSel = projectType === t;
                      return (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setProjectType(t)}
                          className={`py-2 px-3 rounded-xl text-[10px] font-extrabold uppercase font-mono text-center border transition-all cursor-pointer ${
                            isSel
                              ? "bg-brand-yellow text-brand-black border-brand-yellow font-black shadow-lg shadow-brand-yellow/5"
                              : "bg-[#0B0F14]/50 border-white/5 text-[#9CA3AF] hover:text-white"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Field 2 */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 mb-2 font-mono">
                    Área Estimada Necessária:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sizes.map((s) => {
                      const isSel = size === s;
                      return (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setSize(s)}
                          className={`p-3 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer ${
                            isSel
                              ? "bg-[#0B0F14]/95 border-brand-yellow text-brand-yellow font-black"
                              : "bg-[#0B0F14]/50 border-white/5 text-stone-400 hover:text-stone-300"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Field 3 */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Prazo Comercial Requerido:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {timeframes.map((t) => {
                      const isSel = timeframe === t;
                      return (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setTimeframe(t)}
                          className={`py-2 px-2.5 rounded-xl text-[10px] font-extrabold font-mono text-center border transition-all cursor-pointer ${
                            isSel
                              ? "bg-brand-yellow text-brand-black border-brand-yellow font-black"
                              : "bg-[#0B0F14]/50 border-white/5 text-stone-400"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5">
              <button
                onClick={handleCalculateWhatsapp}
                className="w-full py-4 px-6 bg-brand-yellow hover:bg-brand-orange text-brand-black font-black text-xs uppercase tracking-widest rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer border-none font-display shadow-lg shadow-brand-yellow/5"
              >
                <MessageSquare className="w-4 h-4 text-brand-black" />
                Calcular meu projeto no WhatsApp
              </button>
            </div>

          </motion.div>

          {/* Estimates Comparison Visual Meter */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 bg-[#111827]/20 border border-white/5 p-6 sm:p-8 rounded-2xl flex flex-col justify-between backdrop-blur shadow-2xl"
          >
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <span className="text-[9px] text-stone-550 font-mono font-bold block">DIAGNÓSTICO TÉCNICO LOGÍSTICO</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-brand-yellow/10 text-brand-yellow text-[9px] font-mono font-black tracking-widest uppercase border border-brand-yellow/20">MÉTRICAS ESTIMADAS</span>
              </div>

              <div className="space-y-4">
                
                {/* Traditional masonry card */}
                <div className="p-4 rounded-xl bg-[#0B0F14]/40 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-stone-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-display">
                      <Building className="w-4 h-4 text-stone-600" /> Construção Tradicional
                    </h4>
                    <span className="text-brand-orange/80 text-[9px] font-mono font-black uppercase">❌ BAIXA OTIMIZAÇÃO</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-stone-400 font-sans list-none pl-0">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-orange/40" /> Maior prazo de entrega devido a clima/escassez civis.
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-orange/40" /> Perdas de insumos e desperdícios mecânicos de alvenaria.
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-orange/40" /> Mobilidade zero (patrimônio imobilizado de forma permanente).
                    </li>
                  </ul>
                </div>

                {/* Modern Container Option card */}
                <div className="p-4 rounded-xl bg-brand-yellow/5 border border-brand-yellow/20 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-display">
                      <RefreshCw className="w-3.5 h-3.5 text-brand-yellow animate-spin" style={{ animationDuration: "10s" }} /> Dodisa Módulo Container
                    </h4>
                    <span className="text-brand-yellow text-[9px] font-mono font-black uppercase">✅ ALTA PERFORMANCE</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-stone-200 font-sans list-none pl-0">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-brand-yellow stroke-[3]" /> Menor prazo operacional (içamento veloz pronto em horas).
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-brand-yellow stroke-[3]" /> Previsibilidade de custos fixos sem aditivos ou surpresas.
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-brand-yellow stroke-[3]" /> Mobilidade total (leve toda a estrutura corporativa p/ onde quiser).
                    </li>
                  </ul>
                </div>

              </div>

              {/* Required specific legal and technical translation disclaimer */}
              <div className="mt-5 p-3 rounded-xl bg-[#0B0F14]/80 border border-white/5 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-stone-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-stone-500 font-sans leading-relaxed">
                  <strong>Nota sobre Economia:</strong> A economia estimada e prazos podem variar significativamente conforme as especificidades estruturais de cada projeto, complexidade dos acabamentos vinílicos/vidraçarias adicionais solicitadas e taxas municipais geográficas de transporte.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 font-mono text-[9px] text-stone-500 flex items-center justify-between uppercase">
              <span>* Base de cálculo: Normas NR-18 e NR-24 vigentes</span>
              <strong>ENG DODISA S.A</strong>
            </div>

          </motion.div>

        </div>

        {/* 6. TECHNICAL COMPARATIVE TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-[#111827]/20 border border-white/5 rounded-2xl overflow-hidden shadow-2xl max-w-6xl mx-auto backdrop-blur-md"
        >
          {/* Table Header Banner */}
          <div className="bg-[#0B0F14] px-6 py-4.5 border-b border-white/5 flex items-center gap-3">
            <Table className="w-4.5 h-4.5 text-brand-yellow" />
            <h3 className="text-white text-xs font-black uppercase tracking-widest font-mono">
              Laudo Comparativo Técnico Comercial de Engenharia
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
              
              <thead>
                <tr className="bg-[#0B0F14]/90 border-b border-white/5 uppercase text-[9px] font-mono font-bold text-stone-500 tracking-wider">
                  <th className="py-4 px-6 w-[20%]">Critério de Avaliação</th>
                  <th className="py-4 px-6 bg-brand-yellow/3 text-brand-yellow w-[40%]">Solução Módulo Container Dodisa</th>
                  <th className="py-4 px-6 text-stone-400 w-[40%]">Construção em Alvenaria Civis</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.03] font-normal">
                {comparisons.map((item) => (
                  <tr key={item.id} className="hover:bg-[#111827]/30 transition-colors">
                    
                    {/* Attribute */}
                    <td className="py-4 px-6 font-black text-stone-200">
                      {item.attribute}
                    </td>

                    {/* Container column */}
                    <td className="py-4 px-6 bg-brand-yellow/[0.015] text-stone-300 font-sans leading-relaxed">
                      <span className="inline-flex items-center gap-1 text-brand-yellow font-black text-[10px] uppercase font-mono mb-1">
                        <Check className="w-3.5 h-3.5 text-brand-yellow stroke-[3]" /> ALTAMENTE OTIMIZADO
                      </span>
                      <p className="text-xs text-stone-300 leading-normal">
                        {item.container}
                      </p>
                    </td>

                    {/* Masonry column */}
                    <td className="py-4 px-6 text-stone-400 leading-relaxed font-sans text-xs">
                      {item.masonry}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          <div className="bg-[#0B0F14] p-4.5 border-t border-white/5 text-center">
            <p className="text-[9px] font-mono text-stone-500">
              * Tabela baseada em relatórios internos de engenharia civil comparativa e canteiros industriais (Exercício financeiro 2024-2026).
            </p>
          </div>

        </motion.div>

      </div>

    </section>
  );
}

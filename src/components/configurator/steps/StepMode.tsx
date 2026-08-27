import { Wand2, SlidersHorizontal, ArrowRight } from "lucide-react";
import type { ConfiguratorMode } from "../types";

export default function StepMode({ onChoose }: { onChoose: (mode: ConfiguratorMode) => void }) {
  return (
    <div>
      <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">Como você quer montar?</h3>
      <p className="text-zinc-500 text-xs mb-6">Duas formas de chegar ao seu container ideal</p>

      <div className="grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={() => onChoose("guided")}
          className="group relative p-5 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-brand-yellow/50 hover:bg-brand-yellow/5 text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow flex items-center justify-center flex-shrink-0">
              <Wand2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black uppercase tracking-tight text-white">Montagem recomendada</p>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Conte o que você precisa e sugerimos uma configuração completa em segundos.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-brand-yellow group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChoose("custom")}
          className="group relative p-5 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-zinc-600 hover:bg-zinc-900 text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center flex-shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black uppercase tracking-tight text-white">Montagem personalizada</p>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Escolha cada detalhe do seu container, do zero, no seu ritmo.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
          </div>
        </button>
      </div>
    </div>
  );
}

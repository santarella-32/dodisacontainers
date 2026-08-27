import { CheckCircle2, ArrowRight, Pencil } from "lucide-react";
import type { ContainerConfig, StepId } from "../types";
import { buildSummaryLines } from "../ConfigurationSummary";

export default function StepReview({
  config, onEditProject, onRequestQuote,
}: {
  config: ContainerConfig;
  onEditProject: (step: StepId) => void;
  onRequestQuote: () => void;
}) {
  const lines = buildSummaryLines(config);

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <CheckCircle2 className="w-5 h-5 text-brand-yellow" />
        <h3 className="text-white font-black text-xl uppercase tracking-tight">Container pronto para orçamento</h3>
      </div>
      <p className="text-zinc-500 text-xs mb-6">Revise sua configuração completa antes de enviar</p>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 mb-6">
        <ul className="text-[11px] text-zinc-300 leading-relaxed space-y-1.5">
          {lines.map((line) => {
            const [label, ...rest] = line.split(": ");
            return (
              <li key={line} className="flex justify-between gap-3 border-b border-zinc-900 pb-1.5 last:border-0 last:pb-0">
                <span className="text-zinc-600 font-mono text-[9px] uppercase tracking-wider shrink-0 pt-0.5">{label}</span>
                <span className="text-right text-zinc-200 font-semibold">{rest.join(": ")}</span>
              </li>
            );
          })}
          {lines.length === 0 && <li className="text-zinc-600">Nenhuma seleção ainda — volte e configure seu container.</li>}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          onClick={() => onEditProject("size")}
          className="flex-1 flex items-center justify-center gap-1.5 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 font-black text-[11px] uppercase tracking-widest px-4 py-3 min-h-[44px] rounded-xl transition-colors cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5" /> Alterar projeto
        </button>
        <button
          type="button"
          onClick={onRequestQuote}
          className="flex-1 flex items-center justify-center gap-1.5 bg-brand-yellow text-zinc-950 font-black text-[11px] uppercase tracking-widest px-4 py-3 min-h-[44px] rounded-xl hover:bg-amber-400 transition-colors cursor-pointer"
        >
          Solicitar orçamento <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

import { AnimatePresence, motion } from "motion/react";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { PURPOSES } from "../../../data/materials";
import type { ContainerConfig, ConfiguratorMode, StepId } from "../types";
import type { Action } from "../reducer";
import { buildSummaryLines } from "../ConfigurationSummary";

export default function StepPurpose({
  config, dispatch, mode, onJumpToStep,
}: {
  config: ContainerConfig;
  dispatch: (a: Action) => void;
  mode: ConfiguratorMode;
  onJumpToStep: (step: StepId) => void;
}) {
  const purpose = PURPOSES.find((p) => p.id === config.purpose);
  const showRecommendation = mode === "guided" && !!purpose;

  const handleSelect = (id: string) => {
    if (mode === "guided") {
      dispatch({ type: "APPLY_RECOMMENDED", purposeId: id });
    } else {
      dispatch({ type: "SET_FIELD", field: "purpose", value: id });
    }
  };

  return (
    <div>
      <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">Qual a finalidade?</h3>
      <p className="text-zinc-500 text-xs mb-6">
        {mode === "guided" ? "Escolha o uso principal e sugerimos a configuração ideal" : "Selecione o uso principal do container"}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {PURPOSES.map((opt) => {
          const Icon = opt.icon;
          const sel = config.purpose === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              aria-pressed={sel}
              className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-3 min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow ${
                sel ? "border-brand-yellow bg-brand-yellow/10" : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900"
              }`}
            >
              {sel && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-brand-yellow rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-zinc-950" />
                </span>
              )}
              <Icon className={`w-5 h-5 ${sel ? "text-brand-yellow" : "text-zinc-500"}`} />
              <p className={`text-xs font-black uppercase tracking-tight ${sel ? "text-white" : "text-zinc-300"}`}>{opt.name}</p>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {showRecommendation && purpose && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-xl border border-brand-yellow/30 bg-brand-yellow/5 p-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-yellow" />
                <p className="text-[10px] font-mono font-black uppercase tracking-widest text-brand-yellow">Configuração recomendada</p>
              </div>
              <ul className="text-[10px] text-zinc-400 leading-relaxed mb-4 space-y-0.5">
                {buildSummaryLines(config).slice(0, 6).map((line) => <li key={line}>{line}</li>)}
              </ul>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => onJumpToStep("review")}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-brand-yellow text-zinc-950 font-black text-[10px] uppercase tracking-widest px-4 py-2.5 min-h-[40px] rounded-lg hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  Usar esta configuração <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onJumpToStep("size")}
                  className="flex-1 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 font-black text-[10px] uppercase tracking-widest px-4 py-2.5 min-h-[40px] rounded-lg transition-colors cursor-pointer"
                >
                  Personalizar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { motion } from "motion/react";
import { RotateCcw } from "lucide-react";
import type { StepId } from "./types";
import { STEP_LABELS } from "./types";

/** "Passo N de 12" header + progress bar — deliberately not 12 permanent
 * circles (spec section 3: "navegação elegante e não poluída"). */
export default function ConfiguratorProgress({
  stepIndex, total, stepId, onReset,
}: {
  stepIndex: number; // 0-based
  total: number;
  stepId: StepId;
  onReset: () => void;
}) {
  return (
    <div className="mb-7">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] font-mono font-bold text-zinc-600 uppercase tracking-widest">
          Passo {String(stepIndex + 1).padStart(2, "0")} de {total} · {STEP_LABELS[stepId]}
        </span>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[9px] font-mono text-zinc-700 hover:text-zinc-400 transition-colors cursor-pointer uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow rounded"
        >
          <RotateCcw className="w-3 h-3" /> Recomeçar
        </button>
      </div>
      <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-brand-yellow rounded-full"
          animate={{ width: `${((stepIndex + 1) / total) * 100}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

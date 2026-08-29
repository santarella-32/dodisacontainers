import { Suspense, useEffect, useRef, useState } from "react";
import { Box } from "lucide-react";
import type { ContainerConfig, StepId } from "./types";
import { resolveViewerProps } from "./resolveViewerProps";
import ConfigurationSummary from "./ConfigurationSummary";
import { lazyWithReload } from "../../lib/lazyWithReload";

const ContainerVisualizer3D = lazyWithReload(() => import("../ContainerVisualizer3D"));

/** Wraps the real 3D viewer + a tiny "Atualizando visualização" pulse (never a
 * full reload/flash — the viewer itself only patches materials, see spec
 * section 20/48) + the compact clickable configuration summary. */
export default function ContainerViewerPanel({
  config, stepId, onJumpToStep, totalSteps, currentStepIndex,
}: {
  config: ContainerConfig;
  stepId: StepId | null;
  onJumpToStep: (step: StepId) => void;
  totalSteps: number;
  currentStepIndex: number;
}) {
  const viewerProps = resolveViewerProps(config, stepId);
  const [updating, setUpdating] = useState(false);
  const firstRun = useRef(true);
  const serialized = JSON.stringify(viewerProps);

  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    setUpdating(true);
    const t = setTimeout(() => setUpdating(false), 320);
    return () => clearTimeout(t);
  }, [serialized]);

  const remaining = totalSteps - 1 - currentStepIndex;

  return (
    <>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/8 text-[8px] font-black text-zinc-500 uppercase tracking-widest font-mono w-fit">
        <Box className="w-3 h-3" /> Visualização 3D em tempo real
      </div>

      <div className="relative bg-gradient-to-b from-zinc-900/50 to-zinc-950 rounded-2xl border border-white/6 overflow-hidden" style={{ height: 380 }}>
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest animate-pulse">
              Carregando visualizador 3D...
            </span>
          </div>
        }>
          <ContainerVisualizer3D {...viewerProps} />
        </Suspense>
        {updating && (
          <div className="absolute top-2.5 right-3 flex items-center gap-1.5 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse" />
            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Atualizando...</span>
          </div>
        )}
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4">
        <p className="text-[8px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-3">Sua configuração</p>
        <ConfigurationSummary config={config} onJump={onJumpToStep} />
      </div>

      <p className="text-[8px] font-mono text-zinc-700 text-center">
        {stepId === null
          ? "Escolha como deseja montar seu container para começar"
          : remaining > 0
          ? `${remaining} etapa${remaining !== 1 ? "s" : ""} restante${remaining !== 1 ? "s" : ""}`
          : "Configuração completa — pronto para orçamento!"}
      </p>
    </>
  );
}

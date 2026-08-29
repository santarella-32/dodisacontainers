import { useEffect, useReducer, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, MessageSquare, X } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { configReducer, loadPersistedConfig, persistConfig, clearPersistedConfig } from "./reducer";
import { getStepOrder, INITIAL_CONFIG, type ConfiguratorMode, type StepId } from "./types";
import { buildSummaryLines } from "./ConfigurationSummary";
import ConfiguratorProgress from "./ConfiguratorProgress";
import ContainerViewerPanel from "./ContainerViewerPanel";
import StepMode from "./steps/StepMode";
import StepSize from "./steps/StepSize";
import StepPurpose from "./steps/StepPurpose";
import StepStructure from "./steps/StepStructure";
import StepFloor from "./steps/StepFloor";
import StepInternalWall from "./steps/StepInternalWall";
import StepPaint from "./steps/StepPaint";
import StepDoorsWindows from "./steps/StepDoorsWindows";
import StepElectrical from "./steps/StepElectrical";
import StepClimate from "./steps/StepClimate";
import StepExtras from "./steps/StepExtras";
import StepReview from "./steps/StepReview";
import StepContact from "./steps/StepContact";

function initConfig() {
  return loadPersistedConfig() ?? INITIAL_CONFIG;
}

const STEP_STORAGE_KEY = "dodisa_container_step_v1";

/** Resumes exactly the step the visitor was on, not just step 1 of their mode
 * — falls back gracefully if the saved step doesn't belong to this mode's order. */
function initStepId(mode: ConfiguratorMode): StepId | null {
  if (!mode) return null;
  const order = getStepOrder(mode);
  try {
    const saved = localStorage.getItem(STEP_STORAGE_KEY);
    if (saved && (order as string[]).includes(saved)) return saved as StepId;
  } catch {
    // ignore
  }
  return order[0];
}

export default function ContainerConfigurator() {
  const { whatsapp: systemWhatsapp } = useAppContext();
  const [config, dispatch] = useReducer(configReducer, undefined, initConfig);

  const [currentStepId, setCurrentStepId] = useState<StepId | null>(() => initStepId(config.mode));
  const [dir, setDir] = useState(1);
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => { persistConfig(config); }, [config]);

  useEffect(() => {
    try {
      if (currentStepId) localStorage.setItem(STEP_STORAGE_KEY, currentStepId);
      else localStorage.removeItem(STEP_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [currentStepId]);

  // Preserve the site-wide GPS auto-detect integration (dispatched elsewhere, e.g. MapaAtendimento.tsx).
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ city: string; state: string }>;
      if (ev.detail?.city) {
        dispatch({ type: "SET_LOCATION", location: { city: ev.detail.city, state: ev.detail.state, detected: true } });
      }
    };
    window.addEventListener("location-detected", handler);
    return () => window.removeEventListener("location-detected", handler);
  }, []);

  // Lets the "Catálogo de Materiais" showcase (MaterialsCatalog.tsx) jump the
  // wizard straight to a given step when a photo card is clicked — same
  // cross-component event pattern as the GPS auto-detect above.
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ step: StepId }>;
      const step = ev.detail?.step;
      if (!step) return;
      if (!config.mode) dispatch({ type: "SET_MODE", mode: "custom" });
      setDir(1);
      setCurrentStepId(step);
    };
    window.addEventListener("configurator-jump-step", handler);
    return () => window.removeEventListener("configurator-jump-step", handler);
  }, [config.mode]);

  const stepOrder = getStepOrder(config.mode);
  const stepIndex = currentStepId ? stepOrder.indexOf(currentStepId) : -1;

  const goToStep = (step: StepId) => {
    const targetIndex = stepOrder.indexOf(step);
    setDir(targetIndex > stepIndex ? 1 : -1);
    setCurrentStepId(step);
  };

  const goNext = () => {
    if (stepIndex < stepOrder.length - 1) goToStep(stepOrder[stepIndex + 1]);
  };
  const goBack = () => {
    if (stepIndex > 0) goToStep(stepOrder[stepIndex - 1]);
    else { setCurrentStepId(null); dispatch({ type: "SET_MODE", mode: null }); }
  };

  const chooseMode = (mode: ConfiguratorMode) => {
    if (!mode) return;
    dispatch({ type: "SET_MODE", mode });
    setDir(1);
    setCurrentStepId(getStepOrder(mode)[0]);
  };

  const doReset = () => {
    dispatch({ type: "RESET" });
    clearPersistedConfig();
    try { localStorage.removeItem(STEP_STORAGE_KEY); } catch { /* ignore */ }
    setCurrentStepId(null);
    setConfirmingReset(false);
  };

  const canProceed = (() => {
    switch (currentStepId) {
      case "size": return !!config.size;
      case "purpose": return !!config.purpose;
      case "structure": return !!config.structure;
      case "floor": return !!config.floor;
      case "internalWall": return !!config.internalWall;
      case "paint": return !!config.externalPaint;
      case "contact": return !!(config.customer.name.trim() && config.customer.phone.trim());
      default: return true;
    }
  })();

  const handleSubmit = () => {
    const lines = buildSummaryLines(config);
    const timelineLabel: Record<string, string> = {
      imediato: "O mais rápido possível",
      "30dias": "Até 30 dias",
      "30-60dias": "30 a 60 dias",
      "60mais": "60+ dias",
      pesquisando: "Apenas pesquisando",
    };
    const locationLine = config.deliveryLocation.city
      ? `${config.deliveryLocation.city}${config.deliveryLocation.state ? " - " + config.deliveryLocation.state : ""}`
      : "A informar";

    const msg = `Olá! Configurei meu container pelo site da Dodisa Containers:

${lines.map((l) => `• ${l}`).join("\n")}
• Local de entrega: ${locationLine}
${config.customer.timeline ? `• Prazo desejado: ${timelineLabel[config.customer.timeline]}\n` : ""}${config.customer.observation ? `• Observação: ${config.customer.observation}\n` : ""}
Nome: ${config.customer.name}
WhatsApp: ${config.customer.phone}${config.customer.email ? `\nE-mail: ${config.customer.email}` : ""}

Gostaria de receber um orçamento!`;

    window.open(`https://wa.me/${systemWhatsapp.number}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const isLastStep = stepIndex === stepOrder.length - 1;

  const renderStep = () => {
    switch (currentStepId) {
      case "size": return <StepSize config={config} dispatch={dispatch} />;
      case "purpose": return <StepPurpose config={config} dispatch={dispatch} mode={config.mode} onJumpToStep={goToStep} />;
      case "structure": return <StepStructure config={config} dispatch={dispatch} />;
      case "floor": return <StepFloor config={config} dispatch={dispatch} />;
      case "internalWall": return <StepInternalWall config={config} dispatch={dispatch} />;
      case "paint": return <StepPaint config={config} dispatch={dispatch} />;
      case "doorsWindows": return <StepDoorsWindows config={config} dispatch={dispatch} />;
      case "electrical": return <StepElectrical config={config} dispatch={dispatch} />;
      case "climate": return <StepClimate config={config} dispatch={dispatch} />;
      case "extras": return <StepExtras config={config} dispatch={dispatch} />;
      case "review": return <StepReview config={config} onEditProject={goToStep} onRequestQuote={goNext} />;
      case "contact": return <StepContact config={config} dispatch={dispatch} />;
      default: return null;
    }
  };

  return (
    <div className="relative z-10 flex flex-col lg:flex-row max-w-screen-xl mx-auto">
      {/* Mobile: preview at top */}
      <div className="lg:hidden px-4 mb-6">
        <div className="flex flex-col gap-4">
          <ContainerViewerPanel
            config={config}
            stepId={currentStepId}
            onJumpToStep={goToStep}
            totalSteps={stepOrder.length}
            currentStepIndex={Math.max(stepIndex, 0)}
          />
        </div>
      </div>

      {/* LEFT — Wizard */}
      <div className="lg:w-[42%] lg:border-r border-zinc-800/50">
        <div className="px-5 sm:px-8 lg:px-10 pb-10 flex flex-col">
          {currentStepId ? (
            <>
              <ConfiguratorProgress
                stepIndex={Math.max(stepIndex, 0)}
                total={stepOrder.length}
                stepId={currentStepId}
                onReset={() => setConfirmingReset(true)}
              />

              <AnimatePresence>
                {confirmingReset && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/25 bg-amber-500/5 px-3.5 py-2.5">
                      <span className="text-[10px] text-amber-200/90">Recomeçar do zero? Sua configuração atual será perdida.</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={doReset} className="text-[9px] font-black uppercase px-2 py-1 rounded bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 transition-colors cursor-pointer">
                          Sim, recomeçar
                        </button>
                        <button onClick={() => setConfirmingReset(false)} aria-label="Cancelar" className="text-amber-200/60 hover:text-amber-200 cursor-pointer">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="min-h-[300px]">
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={currentStepId}
                    custom={dir}
                    initial={{ opacity: 0, x: dir * 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -28 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800/50">
                <button
                  type="button" onClick={goBack}
                  className="flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow rounded"
                >
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </button>

                {isLastStep ? (
                  <button
                    type="button" onClick={() => { if (canProceed) handleSubmit(); }} disabled={!canProceed}
                    className="flex items-center gap-2 bg-brand-yellow text-zinc-950 font-black text-xs uppercase tracking-widest px-6 py-3 min-h-[44px] rounded-xl hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" /> Solicitar orçamento
                  </button>
                ) : (
                  <button
                    type="button" onClick={() => { if (canProceed) goNext(); }} disabled={!canProceed}
                    className="flex items-center gap-2 bg-brand-yellow text-zinc-950 font-black text-xs uppercase tracking-widest px-6 py-3 min-h-[44px] rounded-xl hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Continuar <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="min-h-[300px]">
              <StepMode onChoose={chooseMode} />
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — Preview (desktop only) */}
      <div className="hidden lg:flex flex-1 flex-col">
        <div className="sticky top-20 overflow-y-auto" style={{ maxHeight: "calc(100vh - 5rem)" }}>
          <div className="p-10 flex flex-col gap-5">
            <ContainerViewerPanel
              config={config}
              stepId={currentStepId}
              onJumpToStep={goToStep}
              totalSteps={stepOrder.length}
              currentStepIndex={Math.max(stepIndex, 0)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

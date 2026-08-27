import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Check } from "lucide-react";
import type { MaterialItem } from "../../data/materials/types";
import { generateSwatch } from "../../data/materials/swatch";

/** "Ver detalhes" panel — bigger image + description + metric bars + recommended-for. Section 9. */
export default function MaterialDetails({
  item, selected, onSelect, onClose,
}: {
  item: MaterialItem | null;
  selected: boolean;
  onSelect: () => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!item) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  const swatchUrl = useMemo(() => {
    if (!item) return "";
    if (item.thumbnail) return item.thumbnail;
    if (item.swatch) return generateSwatch(item.swatch);
    return "";
  }, [item]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Detalhes: ${item.name}`}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full sm:max-w-md bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
          >
            <div className="relative h-44 sm:h-52 flex-shrink-0 bg-zinc-900">
              {swatchUrl && <img src={swatchUrl} alt={item.name} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/20" />
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Fechar detalhes"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-zinc-950/80 border border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-4 right-4">
                <p className="text-lg font-black uppercase tracking-tight text-white">{item.name}</p>
                <p className="text-[11px] text-zinc-400">{item.shortDescription}</p>
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {item.description && (
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">{item.description}</p>
              )}

              {item.technicalData && item.technicalData.length > 0 && (
                <div className="space-y-2.5 mb-4">
                  {item.technicalData.map((m) => (
                    <div key={m.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">{m.label}</span>
                        <span className="text-[9px] font-mono text-zinc-600">{m.value}/100</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-yellow rounded-full" style={{ width: `${m.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {item.features.length > 0 && (
                <ul className="space-y-1.5 mb-4">
                  {item.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[11px] text-zinc-400">
                      <Check className="w-3 h-3 text-brand-yellow mt-0.5 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              )}

              {item.recommendedFor && item.recommendedFor.length > 0 && (
                <p className="text-[10px] font-mono text-zinc-600 mb-4">
                  Recomendado para: <span className="text-zinc-400">{item.recommendedFor.join(", ")}</span>
                </p>
              )}
            </div>

            <div className="p-4 border-t border-zinc-800/60 flex-shrink-0">
              <button
                type="button"
                onClick={() => { onSelect(); onClose(); }}
                className={`w-full flex items-center justify-center gap-2 py-3 min-h-[44px] rounded-xl font-black text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                  selected
                    ? "bg-zinc-800 text-zinc-400"
                    : "bg-brand-yellow text-zinc-950 hover:bg-amber-400"
                }`}
              >
                {selected ? <><Check className="w-4 h-4" /> Selecionado</> : "Selecionar este material"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

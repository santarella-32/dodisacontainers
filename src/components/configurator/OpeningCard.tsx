import { useMemo } from "react";
import { Check } from "lucide-react";
import type { MaterialItem } from "../../data/materials/types";
import { POSITIONS, POSITION_LABELS, type Position } from "../../data/materials/types";
import { generateSwatch } from "../../data/materials/swatch";
import type { OpeningSelection } from "./types";
import QuantitySelector from "./QuantitySelector";

/** Door/window type card with an integrated quantity stepper and position
 * chips (Frente/Fundo/Lateral esq/dir) — section 13-14. Position/type choices
 * are always recorded correctly in state even where the 3D viewer can't yet
 * represent them (only window *count* currently drives the viewer — see
 * resolveViewerProps.ts and the final report for the honest gap list). */
export default function OpeningCard({
  item, selection, onToggle, onQuantityChange, onTogglePosition,
}: {
  item: MaterialItem;
  selection: OpeningSelection | undefined;
  onToggle: () => void;
  onQuantityChange: (n: number) => void;
  onTogglePosition: (p: Position) => void;
}) {
  const swatchUrl = useMemo(() => (item.thumbnail || (item.swatch ? generateSwatch(item.swatch) : "")), [item]);
  const active = !!selection;

  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${active ? "border-brand-yellow shadow-sm shadow-brand-yellow/10" : "border-zinc-800 hover:border-zinc-700"}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
        aria-pressed={active}
        aria-label={`Selecionar ${item.name}`}
        className="flex items-stretch cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-inset"
      >
        <div className="w-16 flex-shrink-0 relative overflow-hidden bg-zinc-900">
          {swatchUrl && <img src={swatchUrl} alt="" aria-hidden="true" className="w-full h-full object-cover" loading="lazy" />}
        </div>
        <div className={`flex-1 px-3.5 py-3 flex items-center justify-between gap-3 transition-colors ${active ? "bg-brand-yellow/10" : "bg-zinc-950"}`}>
          <div className="min-w-0">
            <p className={`text-xs font-black uppercase tracking-tight truncate ${active ? "text-white" : "text-zinc-300"}`}>{item.name}</p>
            <p className="text-[10px] text-zinc-600 mt-0.5 truncate">{item.shortDescription}</p>
          </div>
          <span className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${active ? "bg-brand-yellow border-brand-yellow" : "border-zinc-700"}`}>
            {active && <Check className="w-3 h-3 text-zinc-950" />}
          </span>
        </div>
      </div>

      {active && selection && (
        <div className="px-3.5 py-3 border-t border-zinc-800/60 bg-zinc-950/60 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Quantidade</span>
            <QuantitySelector value={selection.quantity} onChange={onQuantityChange} min={1} max={6} label={`Quantidade de ${item.name}`} />
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Posição</span>
            <div className="flex flex-wrap gap-1.5">
              {POSITIONS.map((p) => {
                const on = selection.positions.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onTogglePosition(p); }}
                    aria-pressed={on}
                    className={`text-[9px] font-bold px-2 py-1 rounded border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow ${
                      on ? "bg-brand-yellow/15 border-brand-yellow/40 text-brand-yellow" : "border-zinc-700 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {POSITION_LABELS[p]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

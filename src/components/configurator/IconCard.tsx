import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import RecommendationBadge from "./RecommendationBadge";
import QuantitySelector from "./QuantitySelector";

/** Compact icon-based card for electrical / climate / extras / purpose items
 * — section 15-17 call these "cards compactos" rather than texture swatches. */
export default function IconCard({
  icon: Icon, name, sub, selected, recommended, onToggle, quantity, onQuantityChange, compact, disabled,
}: {
  icon: LucideIcon;
  name: string;
  sub?: string;
  selected: boolean;
  recommended?: boolean;
  onToggle: () => void;
  quantity?: number;
  onQuantityChange?: (n: number) => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onToggle}
      onKeyDown={(e) => { if (disabled) return; if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
      aria-pressed={selected}
      aria-disabled={disabled}
      aria-label={disabled ? `${name} — indisponível` : name}
      className={`relative rounded-xl border p-3.5 text-left transition-all flex items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow ${
        disabled
          ? "border-zinc-900 opacity-40 grayscale cursor-not-allowed"
          : selected
          ? "border-brand-yellow/40 bg-brand-yellow/5 cursor-pointer"
          : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border flex-shrink-0 ${
          selected ? "bg-brand-yellow/10 border-brand-yellow/20 text-brand-yellow" : "bg-zinc-900 border-zinc-800 text-zinc-500"
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className={`text-xs font-black uppercase tracking-tight truncate ${selected ? "text-white" : "text-zinc-400"}`}>{name}</p>
            {recommended && !compact && <RecommendationBadge compact />}
          </div>
          {sub && <p className="text-[10px] text-zinc-600 truncate">{sub}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {selected && quantity !== undefined && onQuantityChange ? (
          <QuantitySelector value={quantity} onChange={onQuantityChange} min={1} label={`Quantidade de ${name}`} />
        ) : (
          <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${
            selected ? "bg-brand-yellow border-brand-yellow" : "border-zinc-700"
          }`}>
            {selected && <Check className="w-3 h-3 text-zinc-950" />}
          </span>
        )}
      </div>
    </div>
  );
}

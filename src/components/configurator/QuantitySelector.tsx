import { Minus, Plus } from "lucide-react";

export default function QuantitySelector({
  value, onChange, min = 0, max = 6, label,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0" role="group" aria-label={label ?? "Quantidade"}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onChange(Math.max(min, value - 1)); }}
        disabled={value <= min}
        aria-label="Diminuir quantidade"
        className="w-8 h-8 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-6 text-center font-black text-sm text-white tabular-nums" aria-live="polite">{value}</span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onChange(Math.min(max, value + 1)); }}
        disabled={value >= max}
        aria-label="Aumentar quantidade"
        className="w-8 h-8 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

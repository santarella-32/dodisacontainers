import { useMemo } from "react";
import { motion } from "motion/react";
import { Check, Info } from "lucide-react";
import type { MaterialItem } from "../../data/materials/types";
import { generateSwatch } from "../../data/materials/swatch";
import RecommendationBadge from "./RecommendationBadge";

interface MaterialCardProps {
  item: MaterialItem;
  selected: boolean;
  recommended?: boolean;
  onSelect: () => void;
  onDetails?: () => void;
  size?: "sm" | "md";
}

/** Visual card for materials with a photographic/procedural swatch — floor, wall,
 * paint, doors, windows. Section 8/24: image/texture first, name second, short
 * info third; explicit SELECTED / RECOMMENDED / PREMIUM states. */
export default function MaterialCard({ item, selected, recommended, onSelect, onDetails, size = "md" }: MaterialCardProps) {
  const swatchUrl = useMemo(() => {
    if (item.thumbnail) return item.thumbnail;
    if (item.swatch) return generateSwatch(item.swatch);
    return "";
  }, [item.thumbnail, item.swatch]);

  const imgH = size === "sm" ? "h-16" : "h-24 sm:h-28";
  const hasDetails = !!onDetails && !!(item.description || item.technicalData);
  const disabled = item.available === false;

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onSelect}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={selected}
      aria-disabled={disabled}
      aria-label={disabled ? `${item.name} — indisponível no momento` : `Selecionar ${item.name}`}
      className={`relative rounded-xl border overflow-hidden transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow ${
        disabled
          ? "border-zinc-900 opacity-40 grayscale cursor-not-allowed"
          : selected
          ? "border-brand-yellow shadow-sm shadow-brand-yellow/10 cursor-pointer"
          : "border-zinc-800 hover:border-zinc-700 cursor-pointer"
      }`}
    >
      <div className={`relative w-full ${imgH} overflow-hidden bg-zinc-900`}>
        {swatchUrl && (
          <img src={swatchUrl} alt="" aria-hidden="true" className="w-full h-full object-cover" loading="lazy" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        {selected && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="absolute top-2 right-2 w-5 h-5 bg-brand-yellow rounded-full flex items-center justify-center"
          >
            <Check className="w-3 h-3 text-zinc-950" />
          </motion.span>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {disabled && (
            <span className="text-[7px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-zinc-950/90 text-zinc-400 border border-zinc-700">
              Indisponível
            </span>
          )}
          {!disabled && item.premium && (
            <span className="text-[7px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-zinc-950/80 text-brand-yellow border border-brand-yellow/30">
              Premium
            </span>
          )}
          {!disabled && recommended && <RecommendationBadge compact />}
        </div>
        {hasDetails && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDetails!(); }}
            aria-label={`Ver detalhes de ${item.name}`}
            className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-zinc-950/80 border border-zinc-700 text-zinc-300 hover:text-brand-yellow hover:border-brand-yellow/40 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
          >
            <Info className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className={`px-3 py-2.5 transition-colors ${selected ? "bg-brand-yellow/10" : "bg-zinc-950"}`}>
        <p className={`text-xs font-black uppercase tracking-tight leading-tight truncate ${selected ? "text-white" : "text-zinc-300"}`}>
          {item.name}
        </p>
        <p className="text-[10px] text-zinc-600 mt-0.5 leading-snug line-clamp-2">{item.shortDescription}</p>
      </div>
    </div>
  );
}

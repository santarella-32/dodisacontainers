import { Sparkles } from "lucide-react";

export default function RecommendationBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border border-brand-yellow/25 bg-brand-yellow/10 text-brand-yellow font-mono font-black uppercase tracking-widest ${
        compact ? "text-[7px] px-1 py-0.5" : "text-[8px] px-1.5 py-0.5"
      }`}
    >
      <Sparkles className="w-2.5 h-2.5" /> Recomendado
    </span>
  );
}

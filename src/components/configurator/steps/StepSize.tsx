import { motion } from "motion/react";
import { Check } from "lucide-react";
import { SIZES } from "../../../data/materials";
import type { ContainerConfig } from "../types";
import type { Action } from "../reducer";

const MAX_LENGTH = Math.max(...SIZES.map((s) => s.lengthMeters));

/** Tiny inline "scale" glyph — a simple corrugated silhouette whose width is
 * proportional to the real container length, so sizes read at a glance
 * without needing a real product photo (section 6). */
function SizeGlyph({ lengthMeters, active }: { lengthMeters: number; active: boolean }) {
  const widthPct = 22 + (lengthMeters / MAX_LENGTH) * 78;
  return (
    <div className="w-full h-9 flex items-end">
      <div
        className={`h-6 rounded-[3px] border transition-all ${active ? "bg-brand-yellow/20 border-brand-yellow/60" : "bg-zinc-800 border-zinc-700"}`}
        style={{
          width: `${widthPct}%`,
          backgroundImage: `repeating-linear-gradient(90deg, transparent 0 6px, rgba(255,255,255,0.06) 6px 8px)`,
        }}
      />
    </div>
  );
}

export default function StepSize({ config, dispatch }: { config: ContainerConfig; dispatch: (a: Action) => void }) {
  return (
    <div>
      <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">Qual o tamanho?</h3>
      <p className="text-zinc-500 text-xs mb-6">Escolha as dimensões do seu container</p>
      <div className="grid grid-cols-2 gap-3">
        {SIZES.map((opt) => {
          const sel = config.size === opt.id;
          return (
            <motion.div
              key={opt.id}
              role="button"
              tabIndex={0}
              whileTap={{ scale: 0.97 }}
              onClick={() => dispatch({ type: "SET_FIELD", field: "size", value: opt.id })}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); dispatch({ type: "SET_FIELD", field: "size", value: opt.id }); } }}
              aria-pressed={sel}
              aria-label={`Selecionar tamanho ${opt.name}`}
              className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow ${
                sel ? "border-brand-yellow bg-brand-yellow/10 shadow-md shadow-brand-yellow/10"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900"
              }`}
            >
              {sel && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-brand-yellow rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-zinc-950" />
                </span>
              )}
              {opt.premium && (
                <span className="absolute top-2.5 left-2.5 text-[7px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-brand-yellow border border-brand-yellow/30">
                  Premium
                </span>
              )}
              <SizeGlyph lengthMeters={opt.lengthMeters} active={sel} />
              <p className={`text-xl font-black leading-none mt-1 ${sel ? "text-brand-yellow" : "text-white"}`}>{opt.name}</p>
              <p className="text-[10px] text-zinc-500">{opt.shortDescription}</p>
              <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-wide">{opt.recommendedUse}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

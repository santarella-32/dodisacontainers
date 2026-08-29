import { Check } from "lucide-react";
import { STRUCTURE_OPTIONS, MODALITIES } from "../../../data/materials";
import type { ContainerConfig } from "../types";
import type { Action } from "../reducer";
import { useAppContext, applyMaterialImageOverrides } from "../../../context/AppContext";

export default function StepStructure({ config, dispatch }: { config: ContainerConfig; dispatch: (a: Action) => void }) {
  const { materialImages } = useAppContext();
  const structureOptions = applyMaterialImageOverrides(STRUCTURE_OPTIONS, materialImages);
  return (
    <div>
      <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">Tipo de estrutura</h3>
      <p className="text-zinc-500 text-xs mb-6">Escolha a base estrutural e a modalidade do contrato</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {structureOptions.map((opt) => {
          const sel = config.structure === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => dispatch({ type: "SET_FIELD", field: "structure", value: opt.id })}
              aria-pressed={sel}
              className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 min-h-[108px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow overflow-hidden ${
                sel ? "border-brand-yellow bg-brand-yellow/10" : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900"
              }`}
            >
              {opt.thumbnail && (
                <img src={opt.thumbnail} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-25" loading="lazy" />
              )}
              {sel && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-brand-yellow rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-zinc-950" />
                </span>
              )}
              {opt.premium && (
                <span className="relative self-start text-[7px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-brand-yellow border border-brand-yellow/30">
                  Premium
                </span>
              )}
              <p className={`relative text-xs font-black uppercase tracking-tight ${sel ? "text-white" : "text-zinc-300"}`}>{opt.name}</p>
              <p className="relative text-[10px] text-zinc-600 leading-tight">{opt.shortDescription}</p>
            </button>
          );
        })}
      </div>

      <p className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-3">Modalidade</p>
      <div className="grid grid-cols-2 gap-3">
        {MODALITIES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => dispatch({ type: "SET_MODALITY", value: m })}
            className={`py-3 min-h-[44px] rounded-xl border font-black text-xs uppercase tracking-widest text-center transition-all cursor-pointer ${
              config.modality === m
                ? "bg-brand-yellow border-brand-yellow text-zinc-950"
                : "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

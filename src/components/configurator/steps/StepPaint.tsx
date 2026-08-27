import { useState } from "react";
import { PAINT_COLORS, PURPOSE_MAP } from "../../../data/materials";
import type { ContainerConfig } from "../types";
import type { Action } from "../reducer";
import type { MaterialItem } from "../../../data/materials/types";
import MaterialGrid from "../MaterialGrid";
import MaterialDetails from "../MaterialDetails";

type Target = "external" | "internal";

export default function StepPaint({ config, dispatch }: { config: ContainerConfig; dispatch: (a: Action) => void }) {
  const [target, setTarget] = useState<Target>("external");
  const [detailsItem, setDetailsItem] = useState<MaterialItem | null>(null);

  const selection = target === "external" ? config.externalPaint : config.internalPaint;
  const recommendedId = config.purpose
    ? PURPOSE_MAP.get(config.purpose)?.recommended[target === "external" ? "externalPaintId" : "internalPaintId"]
    : null;

  const handleSelect = (id: string) => {
    dispatch({
      type: "SET_PAINT",
      target,
      selection: { colorId: id, customHex: id === "custom" ? selection?.customHex : undefined },
    });
  };

  const handleHexChange = (hex: string) => {
    dispatch({ type: "SET_PAINT", target, selection: { colorId: "custom", customHex: hex } });
  };

  return (
    <div>
      <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">Pintura</h3>
      <p className="text-zinc-500 text-xs mb-4">Cor da chapa do container — separe exterior e interior se quiser</p>

      <div className="grid grid-cols-2 gap-2 mb-5" role="tablist" aria-label="Face a pintar">
        {(["external", "internal"] as Target[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={target === t}
            onClick={() => setTarget(t)}
            className={`py-2.5 min-h-[40px] rounded-lg border font-black text-[10px] uppercase tracking-widest text-center transition-all cursor-pointer ${
              target === t ? "bg-brand-yellow border-brand-yellow text-zinc-950" : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            {t === "external" ? "Exterior" : "Interior"}
          </button>
        ))}
      </div>

      <MaterialGrid
        items={PAINT_COLORS}
        selectedId={selection?.colorId ?? null}
        recommendedId={recommendedId}
        onSelect={handleSelect}
        onDetails={setDetailsItem}
        columns={3}
      />

      {selection?.colorId === "custom" && (
        <div className="mt-4">
          <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">
            HEX ou código RAL
          </label>
          <input
            type="text"
            value={selection.customHex ?? ""}
            onChange={(e) => handleHexChange(e.target.value)}
            placeholder="#2B2E33 ou RAL 7016"
            className="w-full py-3 px-4 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand-yellow text-white text-sm placeholder-zinc-700 focus:outline-none transition-colors"
          />
        </div>
      )}

      <MaterialDetails
        item={detailsItem}
        selected={detailsItem?.id === selection?.colorId}
        onSelect={() => detailsItem && handleSelect(detailsItem.id)}
        onClose={() => setDetailsItem(null)}
      />
    </div>
  );
}

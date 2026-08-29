import { DOOR_TYPES, WINDOW_TYPES } from "../../../data/materials";
import type { ContainerConfig } from "../types";
import type { Action } from "../reducer";
import { useAppContext, applyMaterialImageOverrides } from "../../../context/AppContext";
import OpeningCard from "../OpeningCard";

export default function StepDoorsWindows({ config, dispatch }: { config: ContainerConfig; dispatch: (a: Action) => void }) {
  const { materialImages } = useAppContext();
  const doorTypes = applyMaterialImageOverrides(DOOR_TYPES, materialImages);
  const windowTypes = applyMaterialImageOverrides(WINDOW_TYPES, materialImages);
  return (
    <div>
      <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">Portas e janelas</h3>
      <p className="text-zinc-500 text-xs mb-6">Escolha o tipo, quantidade e posição de cada abertura</p>

      <p className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2.5">Portas</p>
      <div className="space-y-2 mb-6">
        {doorTypes.map((item) => {
          const selection = config.doors.find((d) => d.typeId === item.id);
          return (
            <OpeningCard
              key={item.id}
              item={item}
              selection={selection}
              onToggle={() => dispatch({ type: "SET_OPENING", kind: "doors", typeId: item.id, quantity: selection ? 0 : 1 })}
              onQuantityChange={(n) => dispatch({ type: "SET_OPENING", kind: "doors", typeId: item.id, quantity: n })}
              onTogglePosition={(p) => dispatch({ type: "TOGGLE_OPENING_POSITION", kind: "doors", typeId: item.id, position: p })}
            />
          );
        })}
      </div>

      <p className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2.5">Janelas</p>
      <div className="space-y-2">
        {windowTypes.map((item) => {
          const selection = config.windows.find((w) => w.typeId === item.id);
          return (
            <OpeningCard
              key={item.id}
              item={item}
              selection={selection}
              onToggle={() => dispatch({ type: "SET_OPENING", kind: "windows", typeId: item.id, quantity: selection ? 0 : 1 })}
              onQuantityChange={(n) => dispatch({ type: "SET_OPENING", kind: "windows", typeId: item.id, quantity: n })}
              onTogglePosition={(p) => dispatch({ type: "TOGGLE_OPENING_POSITION", kind: "windows", typeId: item.id, position: p })}
            />
          );
        })}
      </div>
    </div>
  );
}

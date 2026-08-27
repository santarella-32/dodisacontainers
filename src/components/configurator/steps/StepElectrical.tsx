import { ELECTRICAL_ITEMS, PURPOSE_MAP } from "../../../data/materials";
import type { ContainerConfig } from "../types";
import type { Action } from "../reducer";
import IconCard from "../IconCard";

export default function StepElectrical({ config, dispatch }: { config: ContainerConfig; dispatch: (a: Action) => void }) {
  const recommended = config.purpose ? PURPOSE_MAP.get(config.purpose)?.recommended.electricalIds ?? [] : [];

  return (
    <div>
      <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">Elétrica</h3>
      <p className="text-zinc-500 text-xs mb-6">Selecione os itens elétricos do seu container</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {ELECTRICAL_ITEMS.map((item) => {
          const selected = config.electrical.includes(item.id);
          const quantity = config.quantities[item.id] ?? 2;
          return (
            <IconCard
              key={item.id}
              icon={item.icon!}
              name={item.name}
              sub={item.shortDescription}
              selected={selected}
              recommended={recommended.includes(item.id)}
              disabled={!item.available}
              onToggle={() => dispatch({ type: "TOGGLE_LIST", list: "electrical", id: item.id })}
              quantity={item.quantifiable ? quantity : undefined}
              onQuantityChange={item.quantifiable ? (n) => dispatch({ type: "SET_QUANTITY", id: item.id, quantity: n }) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

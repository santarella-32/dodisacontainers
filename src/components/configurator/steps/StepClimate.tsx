import { CLIMATE_ITEMS, PURPOSE_MAP } from "../../../data/materials";
import type { ContainerConfig } from "../types";
import type { Action } from "../reducer";
import IconCard from "../IconCard";

export default function StepClimate({ config, dispatch }: { config: ContainerConfig; dispatch: (a: Action) => void }) {
  const recommended = config.purpose ? PURPOSE_MAP.get(config.purpose)?.recommended.climateIds ?? [] : [];

  return (
    <div>
      <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">Climatização</h3>
      <p className="text-zinc-500 text-xs mb-6">Prepare ou instale o conforto térmico do container</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {CLIMATE_ITEMS.map((item) => (
          <IconCard
            key={item.id}
            icon={item.icon!}
            name={item.name}
            sub={item.shortDescription}
            selected={config.climate.includes(item.id)}
            recommended={recommended.includes(item.id)}
            disabled={!item.available}
            onToggle={() => dispatch({ type: "TOGGLE_LIST", list: "climate", id: item.id })}
          />
        ))}
      </div>
    </div>
  );
}

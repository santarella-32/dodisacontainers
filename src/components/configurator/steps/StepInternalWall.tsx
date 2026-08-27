import { INTERNAL_WALLS, PURPOSE_MAP } from "../../../data/materials";
import type { ContainerConfig } from "../types";
import type { Action } from "../reducer";
import MaterialPickerStep from "./MaterialPickerStep";

export default function StepInternalWall({ config, dispatch }: { config: ContainerConfig; dispatch: (a: Action) => void }) {
  const recommendedId = config.purpose ? PURPOSE_MAP.get(config.purpose)?.recommended.internalWallId : null;
  return (
    <MaterialPickerStep
      title="Revestimento interno"
      subtitle="Como serão acabadas as paredes internas"
      items={INTERNAL_WALLS}
      selectedId={config.internalWall}
      recommendedId={recommendedId}
      onSelect={(id) => dispatch({ type: "SET_FIELD", field: "internalWall", value: id })}
    />
  );
}

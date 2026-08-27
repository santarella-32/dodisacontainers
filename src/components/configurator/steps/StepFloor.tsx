import { FLOORS, PURPOSE_MAP } from "../../../data/materials";
import type { ContainerConfig } from "../types";
import type { Action } from "../reducer";
import MaterialPickerStep from "./MaterialPickerStep";

export default function StepFloor({ config, dispatch }: { config: ContainerConfig; dispatch: (a: Action) => void }) {
  const recommendedId = config.purpose ? PURPOSE_MAP.get(config.purpose)?.recommended.floorId : null;
  return (
    <MaterialPickerStep
      title="Tipo de piso"
      subtitle="Escolha o revestimento do piso interno"
      items={FLOORS}
      selectedId={config.floor}
      recommendedId={recommendedId}
      onSelect={(id) => dispatch({ type: "SET_FIELD", field: "floor", value: id })}
    />
  );
}

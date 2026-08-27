import { PURPOSE_MAP } from "../../data/materials";
import type { Position } from "../../data/materials/types";
import {
  ContainerConfig, ConfiguratorMode, INITIAL_CONFIG, OpeningSelection,
  PaintSelection, CustomerInfo, DeliveryLocation,
} from "./types";
import type { Modality } from "../../data/materials";

export type Action =
  | { type: "SET_MODE"; mode: ConfiguratorMode }
  | { type: "SET_FIELD"; field: "size" | "purpose" | "structure" | "floor" | "internalWall"; value: string | null }
  | { type: "SET_MODALITY"; value: Modality }
  | { type: "SET_PAINT"; target: "external" | "internal"; selection: PaintSelection | null }
  | { type: "SET_OPENING"; kind: "doors" | "windows"; typeId: string; quantity: number }
  | { type: "TOGGLE_OPENING_POSITION"; kind: "doors" | "windows"; typeId: string; position: Position }
  | { type: "TOGGLE_LIST"; list: "electrical" | "climate" | "extras"; id: string }
  | { type: "SET_QUANTITY"; id: string; quantity: number }
  | { type: "SET_LOCATION"; location: Partial<DeliveryLocation> }
  | { type: "SET_CUSTOMER"; customer: Partial<CustomerInfo> }
  | { type: "APPLY_RECOMMENDED"; purposeId: string }
  | { type: "RESET" }
  | { type: "HYDRATE"; config: ContainerConfig };

function upsertOpening(list: OpeningSelection[], typeId: string, quantity: number): OpeningSelection[] {
  const existing = list.find((o) => o.typeId === typeId);
  if (quantity <= 0) return list.filter((o) => o.typeId !== typeId);
  if (existing) {
    return list.map((o) => (o.typeId === typeId ? { ...o, quantity } : o));
  }
  return [...list, { typeId, quantity, positions: [] }];
}

function togglePosition(list: OpeningSelection[], typeId: string, position: Position): OpeningSelection[] {
  return list.map((o) => {
    if (o.typeId !== typeId) return o;
    const has = o.positions.includes(position);
    return { ...o, positions: has ? o.positions.filter((p) => p !== position) : [...o.positions, position] };
  });
}

function toggleInList(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function configReducer(state: ContainerConfig, action: Action): ContainerConfig {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.mode };

    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "SET_MODALITY":
      return { ...state, modality: action.value };

    case "SET_PAINT":
      return action.target === "external"
        ? { ...state, externalPaint: action.selection }
        : { ...state, internalPaint: action.selection };

    case "SET_OPENING":
      return { ...state, [action.kind]: upsertOpening(state[action.kind], action.typeId, action.quantity) };

    case "TOGGLE_OPENING_POSITION":
      return { ...state, [action.kind]: togglePosition(state[action.kind], action.typeId, action.position) };

    case "TOGGLE_LIST": {
      const nextList = toggleInList(state[action.list], action.id);
      return { ...state, [action.list]: nextList };
    }

    case "SET_QUANTITY":
      return { ...state, quantities: { ...state.quantities, [action.id]: Math.max(0, action.quantity) } };

    case "SET_LOCATION":
      return { ...state, deliveryLocation: { ...state.deliveryLocation, ...action.location } };

    case "SET_CUSTOMER":
      return { ...state, customer: { ...state.customer, ...action.customer } };

    case "APPLY_RECOMMENDED": {
      const purpose = PURPOSE_MAP.get(action.purposeId);
      if (!purpose) return { ...state, purpose: action.purposeId };
      const r = purpose.recommended;
      return {
        ...state,
        purpose: action.purposeId,
        size: r.sizeId ?? state.size,
        structure: r.structureId ?? state.structure,
        modality: r.modality ?? state.modality,
        floor: r.floorId ?? state.floor,
        internalWall: r.internalWallId ?? state.internalWall,
        externalPaint: r.externalPaintId ? { colorId: r.externalPaintId } : state.externalPaint,
        internalPaint: r.internalPaintId ? { colorId: r.internalPaintId } : state.internalPaint,
        doors: r.doors ? r.doors.map((d) => ({ typeId: d.typeId, quantity: d.quantity, positions: ["front"] as Position[] })) : state.doors,
        windows: r.windows ? r.windows.map((w) => ({ typeId: w.typeId, quantity: w.quantity, positions: ["left", "right"] as Position[] })) : state.windows,
        electrical: r.electricalIds ?? state.electrical,
        climate: r.climateIds ?? state.climate,
        extras: r.extraIds ?? state.extras,
      };
    }

    case "RESET":
      return { ...INITIAL_CONFIG };

    case "HYDRATE":
      return action.config;

    default:
      return state;
  }
}

// ── Persistence (spec section 43) ────────────────────────────────────────────

const STORAGE_KEY = "dodisa_container_config_v1";

export function loadPersistedConfig(): ContainerConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ContainerConfig>;
    // Merge over defaults so new fields introduced later don't break old saves.
    return { ...INITIAL_CONFIG, ...parsed };
  } catch {
    return null;
  }
}

export function persistConfig(config: ContainerConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Storage full/unavailable — silently skip, not critical.
  }
}

export function clearPersistedConfig() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

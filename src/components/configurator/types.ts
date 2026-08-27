import type { Modality } from "../../data/materials";
import type { Position } from "../../data/materials/types";

export type ConfiguratorMode = "guided" | "custom" | null;

export interface PaintSelection {
  colorId: string;
  customHex?: string;
}

export interface OpeningSelection {
  typeId: string;
  quantity: number;
  positions: Position[];
}

export type Timeline = "imediato" | "30dias" | "30-60dias" | "60mais" | "pesquisando";

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  observation: string;
  timeline: Timeline | null;
}

export interface DeliveryLocation {
  city: string;
  state: string;
  detected: boolean;
}

/** The single coherent piece of state for the whole configurator — see spec section 44. */
export interface ContainerConfig {
  mode: ConfiguratorMode;
  size: string | null;
  purpose: string | null;
  structure: string | null;
  modality: Modality;
  floor: string | null;
  internalWall: string | null;
  externalPaint: PaintSelection | null;
  internalPaint: PaintSelection | null;
  doors: OpeningSelection[];
  windows: OpeningSelection[];
  electrical: string[];
  climate: string[];
  extras: string[];
  quantities: Record<string, number>; // per-id quantity for quantifiable electrical/extra items
  deliveryLocation: DeliveryLocation;
  customer: CustomerInfo;
}

export const INITIAL_CONFIG: ContainerConfig = {
  mode: null,
  size: null,
  purpose: null,
  structure: null,
  modality: "Compra",
  floor: null,
  internalWall: null,
  externalPaint: null,
  internalPaint: null,
  doors: [],
  windows: [],
  electrical: [],
  climate: [],
  extras: [],
  quantities: {},
  deliveryLocation: { city: "", state: "", detected: false },
  customer: { name: "", phone: "", email: "", observation: "", timeline: null },
};

// ── Step definitions ────────────────────────────────────────────────────────

export type StepId =
  | "size" | "purpose" | "structure" | "floor" | "internalWall" | "paint"
  | "doorsWindows" | "electrical" | "climate" | "extras" | "review" | "contact";

export const STEP_LABELS: Record<StepId, string> = {
  size: "Tamanho",
  purpose: "Finalidade",
  structure: "Estrutura",
  floor: "Piso",
  internalWall: "Revestimento interno",
  paint: "Pintura",
  doorsWindows: "Portas e janelas",
  electrical: "Elétrica",
  climate: "Climatização",
  extras: "Extras",
  review: "Revisão",
  contact: "Dados e orçamento",
};

const CUSTOM_ORDER: StepId[] = [
  "size", "purpose", "structure", "floor", "internalWall", "paint",
  "doorsWindows", "electrical", "climate", "extras", "review", "contact",
];

// Guided mode asks "para que você vai usar?" first (spec section 5), then
// walks the remaining steps with a recommended config already pre-filled.
const GUIDED_ORDER: StepId[] = [
  "purpose", "size", "structure", "floor", "internalWall", "paint",
  "doorsWindows", "electrical", "climate", "extras", "review", "contact",
];

export function getStepOrder(mode: ConfiguratorMode): StepId[] {
  return mode === "guided" ? GUIDED_ORDER : CUSTOM_ORDER;
}

import type { LucideIcon } from "lucide-react";
import type { SwatchSpec } from "./swatch";

export type MaterialCategory =
  | "size"
  | "purpose"
  | "structure"
  | "floor"
  | "internalWall"
  | "paint"
  | "door"
  | "window"
  | "electrical"
  | "climate"
  | "extra";

/** Visual bar metrics shown in the "Ver detalhes" panel (0-100). */
export interface TechnicalMetric {
  label: string;
  value: number;
}

/**
 * A single selectable item in the material library. Not every field applies
 * to every category — e.g. `swatch` drives the visual card for floor/wall/
 * paint/door/window items, while electrical/climate/extra items are simpler
 * icon-based cards (see Technical Grounding / report: photographic swatches
 * were prioritized for the categories the spec calls out explicitly).
 */
export interface MaterialItem {
  id: string;
  name: string;
  category: MaterialCategory;
  /** One short line shown directly on the card. */
  shortDescription: string;
  /** Longer copy for the "Ver detalhes" panel. */
  description?: string;
  /** Real photo URL — empty today. When present, wins over the swatch. */
  thumbnail?: string;
  /** Procedural texture swatch spec (floor/wall/paint/door/window). */
  swatch?: SwatchSpec;
  /** Icon for categories without a texture swatch (electrical/climate/extra/purpose). */
  icon?: LucideIcon;
  /** Hex color — used for UI chips and fed into the 3D viewer where applicable. */
  color?: string;
  /** Hints for the 3D material (roughness/metalness), when this item drives the viewer. */
  finish?: { roughness: number; metalness: number };
  /** 2-3 short bullet features shown on the card / details panel. */
  features: string[];
  /** Purpose ids this item is recommended for (drives the "Recomendado" badge). */
  recommendedFor?: string[];
  available: boolean;
  premium?: boolean;
  /** Whether this item's card should offer a quantity stepper. */
  quantifiable?: boolean;
  technicalData?: TechnicalMetric[];
}

export interface SizeOption extends MaterialItem {
  category: "size";
  lengthMeters: number;
  scaleHint: string; // e.g. "1x" "2x" "4x" relative bar
  recommendedUse: string;
}

export interface RecommendedConfig {
  sizeId?: string;
  structureId?: string;
  modality?: "Compra" | "Aluguel";
  floorId?: string;
  internalWallId?: string;
  externalPaintId?: string;
  internalPaintId?: string;
  doors?: { typeId: string; quantity: number }[];
  windows?: { typeId: string; quantity: number }[];
  electricalIds?: string[];
  climateIds?: string[];
  extraIds?: string[];
}

export interface PurposeOption extends MaterialItem {
  category: "purpose";
  icon: LucideIcon;
  recommended: RecommendedConfig;
}

export const POSITIONS = ["front", "back", "left", "right"] as const;
export type Position = (typeof POSITIONS)[number];

export const POSITION_LABELS: Record<Position, string> = {
  front: "Frente",
  back: "Fundo",
  left: "Lateral esq.",
  right: "Lateral dir.",
};

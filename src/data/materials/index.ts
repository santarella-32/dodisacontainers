// Central material library — see spec section 22/23. Add a new floor, wall,
// paint color, door, window, size or extra by adding one object to the
// relevant file in this folder; nothing else needs to change for it to show
// up in the configurator UI.
export * from "./types";
export * from "./swatch";
export { SIZES } from "./sizes";
export { STRUCTURE_OPTIONS, MODALITIES } from "./structure";
export type { Modality } from "./structure";
export { FLOORS } from "./floors";
export { INTERNAL_WALLS } from "./walls";
export { PAINT_COLORS } from "./paint";
export { DOOR_TYPES } from "./doors";
export { WINDOW_TYPES } from "./windows";
export { ELECTRICAL_ITEMS } from "./electrical";
export { CLIMATE_ITEMS } from "./climate";
export { EXTRA_CATEGORIES, ALL_EXTRAS } from "./extras";
export type { ExtraCategory } from "./extras";
export { PURPOSES } from "./purposes";

import { SIZES } from "./sizes";
import { STRUCTURE_OPTIONS } from "./structure";
import { FLOORS } from "./floors";
import { INTERNAL_WALLS } from "./walls";
import { PAINT_COLORS } from "./paint";
import { DOOR_TYPES } from "./doors";
import { WINDOW_TYPES } from "./windows";
import { ELECTRICAL_ITEMS } from "./electrical";
import { CLIMATE_ITEMS } from "./climate";
import { ALL_EXTRAS } from "./extras";
import { PURPOSES } from "./purposes";
import type { MaterialItem } from "./types";

function byId<T extends { id: string }>(list: T[]): Map<string, T> {
  return new Map(list.map((i) => [i.id, i]));
}

export const SIZE_MAP = byId(SIZES);
export const STRUCTURE_MAP = byId(STRUCTURE_OPTIONS);
export const FLOOR_MAP = byId(FLOORS);
export const WALL_MAP = byId(INTERNAL_WALLS);
export const PAINT_MAP = byId(PAINT_COLORS);
export const DOOR_MAP = byId(DOOR_TYPES);
export const WINDOW_MAP = byId(WINDOW_TYPES);
export const ELECTRICAL_MAP = byId(ELECTRICAL_ITEMS);
export const CLIMATE_MAP = byId(CLIMATE_ITEMS);
export const EXTRA_MAP = byId(ALL_EXTRAS);
export const PURPOSE_MAP = byId(PURPOSES);

/** Looks up a material's display name by category + id — used by the summary/WhatsApp message. */
export function materialName(category: keyof typeof MAPS_BY_CATEGORY, id: string | undefined | null): string {
  if (!id) return "";
  const map = MAPS_BY_CATEGORY[category];
  return (map.get(id) as MaterialItem | undefined)?.name ?? id;
}

const MAPS_BY_CATEGORY = {
  size: SIZE_MAP,
  structure: STRUCTURE_MAP,
  floor: FLOOR_MAP,
  internalWall: WALL_MAP,
  paint: PAINT_MAP,
  door: DOOR_MAP,
  window: WINDOW_MAP,
  electrical: ELECTRICAL_MAP,
  climate: CLIMATE_MAP,
  extra: EXTRA_MAP,
  purpose: PURPOSE_MAP,
} as const;

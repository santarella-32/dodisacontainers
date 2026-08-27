import { FLOOR_MAP, PAINT_MAP, WALL_MAP, DOOR_MAP } from "../../data/materials";
import type { ContainerConfig, StepId } from "./types";
import type { ContainerVisualizer3DProps } from "../ContainerVisualizer3D";

const HEX_RE = /^#?[0-9a-fA-F]{6}$/;

function normalizeHex(v: string | undefined): string | undefined {
  if (!v) return undefined;
  if (!HEX_RE.test(v.trim())) return undefined;
  const clean = v.trim().replace("#", "");
  return `#${clean}`;
}

/** Steps where the interior cut-away view is more useful than the exterior shot. */
const INTERIOR_STEPS: StepId[] = ["floor", "internalWall", "paint"];

/**
 * Maps the coherent ContainerConfig state onto the flat prop shape the 3D
 * viewer expects. Section 50: this is also where we're honest that not every
 * selection can drive the viewer — door/window *type* and *position* are
 * recorded correctly in state and the summary, but the viewer only reflects
 * window *count* and the exterior/interior paint + floor + wall + AC + LED.
 */
export function resolveViewerProps(config: ContainerConfig, stepId: StepId | null): ContainerVisualizer3DProps {
  const extPaint = config.externalPaint
    ? normalizeHex(config.externalPaint.customHex) ?? PAINT_MAP.get(config.externalPaint.colorId)?.color
    : undefined;
  const intPaint = config.internalPaint
    ? normalizeHex(config.internalPaint.customHex) ?? PAINT_MAP.get(config.internalPaint.colorId)?.color
    : undefined;

  const floor = config.floor ? FLOOR_MAP.get(config.floor) : undefined;
  const wall = config.internalWall && config.internalWall !== "none" ? WALL_MAP.get(config.internalWall) : undefined;

  const windowCount = config.windows.reduce((s, w) => s + w.quantity, 0);
  const hasAC = config.climate.includes("ac-installed") || config.climate.includes("ac-prep");
  const hasLed = config.electrical.includes("led");

  // One panel per selected position per door type (quantity mainly drives the
  // text summary — a door type toggled onto 2 walls renders 2 panels here).
  const doorPanels = config.doors.flatMap((d) => {
    const item = DOOR_MAP.get(d.typeId);
    if (!item) return [];
    const positions = d.positions.length > 0 ? d.positions : (["front"] as const);
    return positions.map((position) => ({ color: item.color ?? "#52525b", position }));
  });

  return {
    exteriorColor: extPaint,
    interiorColor: wall?.color ?? intPaint ?? extPaint,
    floorColor: floor?.color,
    floorFinish: floor?.finish,
    wallFinish: wall?.finish,
    janelas: windowCount,
    temAC: hasAC,
    temEletrica: hasLed,
    forceInteriorView: stepId ? INTERIOR_STEPS.includes(stepId) : false,
    doorPanels,
    extras: config.extras,
  };
}

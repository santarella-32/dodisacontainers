import { AnimatePresence, motion } from "motion/react";
import {
  SIZE_MAP, STRUCTURE_MAP, FLOOR_MAP, WALL_MAP, PAINT_MAP,
  DOOR_MAP, WINDOW_MAP, ELECTRICAL_MAP, CLIMATE_MAP, EXTRA_MAP, PURPOSE_MAP,
} from "../../data/materials";
import type { ContainerConfig, StepId } from "./types";

interface Row {
  step: StepId;
  label: string;
  value: string;
  chipColor?: string;
}

function Chip({ color }: { color?: string }) {
  if (!color) return null;
  return <span className="w-3 h-3 rounded-sm flex-shrink-0 inline-block border border-white/10" style={{ backgroundColor: color }} />;
}

export default function ConfigurationSummary({ config, onJump }: { config: ContainerConfig; onJump: (step: StepId) => void }) {
  const size = config.size ? SIZE_MAP.get(config.size) : undefined;
  const purpose = config.purpose ? PURPOSE_MAP.get(config.purpose) : undefined;
  const structure = config.structure ? STRUCTURE_MAP.get(config.structure) : undefined;
  const floor = config.floor ? FLOOR_MAP.get(config.floor) : undefined;
  const wall = config.internalWall ? WALL_MAP.get(config.internalWall) : undefined;
  const extPaint = config.externalPaint ? PAINT_MAP.get(config.externalPaint.colorId) : undefined;

  const doorsCount = config.doors.reduce((s, d) => s + d.quantity, 0);
  const windowsCount = config.windows.reduce((s, w) => s + w.quantity, 0);

  const rows: Row[] = [
    { step: "size", label: "Tamanho", value: size?.name ?? "" },
    { step: "purpose", label: "Finalidade", value: purpose?.name ?? "" },
    { step: "structure", label: "Estrutura", value: structure ? `${structure.name} · ${config.modality}` : "" },
    { step: "floor", label: "Piso", value: floor?.name ?? "", chipColor: floor?.color },
    { step: "internalWall", label: "Revestimento", value: wall?.name ?? "", chipColor: wall?.color },
    {
      step: "paint",
      label: "Pintura",
      value: config.externalPaint?.customHex ? "Cor personalizada" : extPaint?.name ?? "",
      chipColor: config.externalPaint?.customHex ?? extPaint?.color,
    },
    {
      step: "doorsWindows",
      label: "Portas/Janelas",
      value: doorsCount || windowsCount ? `${doorsCount} porta${doorsCount === 1 ? "" : "s"} · ${windowsCount} janela${windowsCount === 1 ? "" : "s"}` : "",
    },
    { step: "electrical", label: "Elétrica", value: config.electrical.length ? `${config.electrical.length} item${config.electrical.length > 1 ? "s" : ""}` : "" },
    { step: "climate", label: "Climatização", value: config.climate.length ? `${config.climate.length} item${config.climate.length > 1 ? "s" : ""}` : "" },
    { step: "extras", label: "Extras", value: config.extras.length ? `${config.extras.length} extra${config.extras.length > 1 ? "s" : ""}` : "" },
  ];

  return (
    <div className="divide-y divide-zinc-800/50">
      {rows.map(({ step, label, value, chipColor }) => (
        <button
          key={step}
          type="button"
          onClick={() => onJump(step)}
          className="w-full flex items-center justify-between gap-3 py-2 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow rounded"
        >
          <span className="text-[9px] font-mono font-bold text-zinc-600 uppercase tracking-widest shrink-0 group-hover:text-zinc-400 transition-colors">
            {label}
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={value || "empty"}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.12 }}
              className={`flex items-center gap-1.5 text-[10px] font-black text-right max-w-[160px] ${value ? "text-white group-hover:text-brand-yellow" : "text-zinc-700"} transition-colors`}
            >
              <Chip color={chipColor} />
              <span className="truncate">{value || "—"}</span>
            </motion.span>
          </AnimatePresence>
        </button>
      ))}
    </div>
  );
}

/** Builds the plain-text list used both on-screen and in the WhatsApp message. */
export function buildSummaryLines(config: ContainerConfig): string[] {
  const size = config.size ? SIZE_MAP.get(config.size) : undefined;
  const purpose = config.purpose ? PURPOSE_MAP.get(config.purpose) : undefined;
  const structure = config.structure ? STRUCTURE_MAP.get(config.structure) : undefined;
  const floor = config.floor ? FLOOR_MAP.get(config.floor) : undefined;
  const wall = config.internalWall ? WALL_MAP.get(config.internalWall) : undefined;
  const extPaint = config.externalPaint?.customHex
    ? `Cor personalizada (${config.externalPaint.customHex})`
    : (config.externalPaint ? PAINT_MAP.get(config.externalPaint.colorId)?.name : undefined);
  const intPaint = config.internalPaint?.customHex
    ? `Cor personalizada (${config.internalPaint.customHex})`
    : (config.internalPaint ? PAINT_MAP.get(config.internalPaint.colorId)?.name : undefined);

  const doorsLine = config.doors
    .map((d) => `${d.quantity}x ${DOOR_MAP.get(d.typeId)?.name ?? d.typeId}`)
    .join(", ");
  const windowsLine = config.windows
    .map((w) => `${w.quantity}x ${WINDOW_MAP.get(w.typeId)?.name ?? w.typeId}`)
    .join(", ");
  const electricalLine = config.electrical.map((id) => ELECTRICAL_MAP.get(id)?.name ?? id).join(", ");
  const climateLine = config.climate.map((id) => CLIMATE_MAP.get(id)?.name ?? id).join(", ");
  const extrasLine = config.extras.map((id) => EXTRA_MAP.get(id)?.name ?? id).join(", ");

  const lines: string[] = [];
  if (size) lines.push(`Tamanho: ${size.name}`);
  if (purpose) lines.push(`Finalidade: ${purpose.name}`);
  if (structure) lines.push(`Estrutura: ${structure.name} (${config.modality})`);
  if (floor) lines.push(`Piso: ${floor.name}`);
  if (wall) lines.push(`Revestimento interno: ${wall.name}`);
  if (extPaint) lines.push(`Pintura externa: ${extPaint}`);
  if (intPaint) lines.push(`Pintura interna: ${intPaint}`);
  if (doorsLine) lines.push(`Portas: ${doorsLine}`);
  if (windowsLine) lines.push(`Janelas: ${windowsLine}`);
  if (electricalLine) lines.push(`Elétrica: ${electricalLine}`);
  if (climateLine) lines.push(`Climatização: ${climateLine}`);
  if (extrasLine) lines.push(`Extras: ${extrasLine}`);
  return lines;
}

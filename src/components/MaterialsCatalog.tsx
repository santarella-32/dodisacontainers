import { motion } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { STRUCTURE_OPTIONS, FLOORS, INTERNAL_WALLS, PAINT_COLORS, DOOR_TYPES, WINDOW_TYPES, ALL_EXTRAS } from "../data/materials";
import type { MaterialItem } from "../data/materials/types";
import type { StepId } from "./configurator/types";

const GROUPS: { label: string; step: StepId; items: MaterialItem[] }[] = [
  { label: "Estrutura", step: "structure", items: STRUCTURE_OPTIONS },
  { label: "Pisos", step: "floor", items: FLOORS },
  { label: "Paredes Internas", step: "internalWall", items: INTERNAL_WALLS },
  { label: "Pintura", step: "paint", items: PAINT_COLORS },
  { label: "Portas", step: "doorsWindows", items: DOOR_TYPES },
  { label: "Janelas", step: "doorsWindows", items: WINDOW_TYPES },
  { label: "Acessórios", step: "extras", items: ALL_EXTRAS },
];

/** Visual showcase of the real material photos uploaded in the admin (Containers
 * > Materiais). Only shows items that actually have a photo — stays hidden
 * entirely until the admin uploads the first one. Clicking a card jumps the
 * "Monte seu Container" wizard straight to that item's step, via the same
 * window-event pattern ContainerConfigurator already uses for GPS auto-detect
 * (see "location-detected" in MapaAtendimento.tsx / ContainerConfigurator.tsx). */
export default function MaterialsCatalog() {
  const { materialImages } = useAppContext();

  const photographed = GROUPS.flatMap((g) =>
    g.items
      .filter((item) => materialImages[item.id])
      .map((item) => ({ item, groupLabel: g.label, step: g.step }))
  );

  if (photographed.length === 0) return null;

  const jumpToStep = (step: StepId) => {
    window.dispatchEvent(new CustomEvent("configurator-jump-step", { detail: { step } }));
    document.getElementById("simulador-orcamento")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-10"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-white/5" />
        <span className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-[0.25em]">
          Catálogo de Materiais Reais
        </span>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {photographed.map(({ item, groupLabel, step }) => (
          <button
            key={item.id}
            type="button"
            onClick={() => jumpToStep(step)}
            className="group relative rounded-xl overflow-hidden border border-zinc-800 hover:border-brand-yellow/40 transition-all text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-zinc-900">
              <img
                src={materialImages[item.id]}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-zinc-950/90 text-[7px] font-black uppercase text-brand-yellow tracking-widest border border-zinc-800">
                {groupLabel}
              </span>
              <span className="absolute bottom-1.5 left-1.5 right-1.5 text-white text-[10px] font-black uppercase tracking-tight leading-tight truncate">
                {item.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { EXTRA_CATEGORIES, PURPOSE_MAP } from "../../../data/materials";
import type { ContainerConfig } from "../types";
import type { Action } from "../reducer";
import { useAppContext, applyMaterialImageOverrides } from "../../../context/AppContext";
import IconCard from "../IconCard";

export default function StepExtras({ config, dispatch }: { config: ContainerConfig; dispatch: (a: Action) => void }) {
  const { materialImages } = useAppContext();
  const categories = EXTRA_CATEGORIES.map((cat) => ({ ...cat, items: applyMaterialImageOverrides(cat.items, materialImages) }));
  const [open, setOpen] = useState<Set<string>>(new Set([EXTRA_CATEGORIES[0]?.id]));
  const recommended = config.purpose ? PURPOSE_MAP.get(config.purpose)?.recommended.extraIds ?? [] : [];

  const toggleCategory = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">Extras</h3>
      <p className="text-zinc-500 text-xs mb-6">Complementos organizados por categoria — tudo opcional</p>

      <div className="space-y-2.5">
        {categories.map((cat) => {
          const isOpen = open.has(cat.id);
          const selectedCount = cat.items.filter((i) => config.extras.includes(i.id)).length;
          return (
            <div key={cat.id} className="rounded-xl border border-zinc-800 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-zinc-950 hover:bg-zinc-900 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-tight text-zinc-200">{cat.label}</span>
                  {selectedCount > 0 && (
                    <span className="text-[8px] font-mono font-black bg-brand-yellow/10 text-brand-yellow px-1.5 py-0.5 rounded border border-brand-yellow/20">
                      {selectedCount}
                    </span>
                  )}
                </span>
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-zinc-950/60">
                      {cat.items.map((item) => (
                        <IconCard
                          key={item.id}
                          icon={item.icon!}
                          thumbnail={item.thumbnail}
                          name={item.name}
                          sub={item.shortDescription}
                          selected={config.extras.includes(item.id)}
                          recommended={recommended.includes(item.id)}
                          disabled={!item.available}
                          onToggle={() => dispatch({ type: "TOGGLE_LIST", list: "extras", id: item.id })}
                          compact
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from "react";
import type { MaterialItem } from "../../../data/materials/types";
import MaterialGrid from "../MaterialGrid";
import MaterialDetails from "../MaterialDetails";

/** Shared "pick one material from a visual grid" step body — used by Piso and
 * Revestimento interno (Pintura has its own component due to the exterior/
 * interior toggle + custom color input). */
export default function MaterialPickerStep({
  title, subtitle, items, selectedId, recommendedId, onSelect,
}: {
  title: string;
  subtitle: string;
  items: MaterialItem[];
  selectedId: string | null;
  recommendedId?: string | null;
  onSelect: (id: string) => void;
}) {
  const [detailsItem, setDetailsItem] = useState<MaterialItem | null>(null);

  return (
    <div>
      <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">{title}</h3>
      <p className="text-zinc-500 text-xs mb-6">{subtitle}</p>
      <MaterialGrid
        items={items}
        selectedId={selectedId}
        recommendedId={recommendedId}
        onSelect={onSelect}
        onDetails={setDetailsItem}
      />
      <MaterialDetails
        item={detailsItem}
        selected={detailsItem?.id === selectedId}
        onSelect={() => detailsItem && onSelect(detailsItem.id)}
        onClose={() => setDetailsItem(null)}
      />
    </div>
  );
}

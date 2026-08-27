import type { MaterialItem } from "../../data/materials/types";
import MaterialCard from "./MaterialCard";

export default function MaterialGrid({
  items, selectedId, onSelect, onDetails, recommendedId, columns = 2,
}: {
  items: MaterialItem[];
  selectedId: string | null | undefined;
  onSelect: (id: string) => void;
  onDetails?: (item: MaterialItem) => void;
  recommendedId?: string | null;
  columns?: 2 | 3;
}) {
  return (
    <div className={`grid grid-cols-2 ${columns === 3 ? "sm:grid-cols-3" : ""} gap-3`}>
      {items.map((item) => (
        <MaterialCard
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          recommended={recommendedId === item.id && recommendedId !== selectedId}
          onSelect={() => onSelect(item.id)}
          onDetails={onDetails ? () => onDetails(item) : undefined}
        />
      ))}
    </div>
  );
}

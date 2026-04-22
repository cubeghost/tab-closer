import { useShallow } from "zustand/shallow";
import { useTabsStore } from "./store";

export default function BulkActions() {
  const { selectedTabs, clearSelected } = useTabsStore(
    useShallow((state) => ({
      selectedTabs: state.selectedTabs,
      clearSelected: state.clearSelected,
    })),
  );

  if (selectedTabs.length === 0) return null;

  return (
    <div className="flex">
      {selectedTabs.length} tabs selected
      <button>do something</button>
    </div>
  );
}

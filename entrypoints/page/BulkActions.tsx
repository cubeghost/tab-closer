import { useShallow } from "zustand/shallow";
import { type Tab, useTabsStore } from "./store";
import { Service } from "@/lib/services";
import { SERVICE_ICONS, SERVICE_NAMES, useServices } from "./services";
import { sendMessage } from "@/lib/messaging";
import { X } from "@untitledui/icons";

export default function BulkActions() {
  const { anytype, instapaper } = useServices();
  const { selectedTabs, clearSelected, closeTabs } = useTabsStore(
    useShallow((state) => ({
      selectedTabs: state.selectedTabs,
      clearSelected: state.clearSelected,
      closeTabs: state.closeTabs,
    })),
  );

  function closeSelectedTabs() {
    const tabIds = useTabsStore.getState().selectedTabs;
    if (tabIds.length === 0) return;
    closeTabs(tabIds);
  }

  return (
    <div className="flex">
      <span>{selectedTabs.length} tabs selected</span>
      <div className="not-prose flex items-center ml-2">
        {selectedTabs.length > 0 && (
          <>
            {anytype && <BulkSaveAction service="anytype" />}
            {instapaper && <BulkSaveAction service="instapaper" />}
            <button
              onClick={closeSelectedTabs}
              className="block bg-red-100 text-red-400 rounded mx-1 size-4 cursor-pointer hover:bg-red-200"
              title="Close"
            >
              <X className="size-4" />
            </button>
          </>
        )}
      </div>
      {selectedTabs.length > 0 && (
        <button
          onClick={clearSelected}
          className="ml-auto text-sm bg-gray-200 rounded px-2"
        >
          Clear selected
        </button>
      )}
    </div>
  );
}

function BulkSaveAction({ service }: { service: Service }) {
  const serviceName = SERVICE_NAMES[service];
  const { addLogs, autoCloseTabs } = useTabsStore(
    useShallow((state) => ({
      addLogs: state.addLogs,
      autoCloseTabs: state.autoCloseTabs,
    })),
  );
  const [loading, setLoading] = useState<boolean>(false);

  function log(tab: Tab, error?: Error) {
    addLogs([
      {
        type: error ? "error" : "success",
        message: error
          ? `Error saving to ${serviceName}: ${error.message}`
          : `Saved to ${serviceName}`,
        service,
        tab: tab,
      },
    ]);
  }

  async function save() {
    setLoading(true);
    const { windows, selectedTabs } = useTabsStore.getState();
    const tabs = windows
      .flatMap((window) => window.tabs)
      .filter((tab) => tab.id && selectedTabs.includes(tab.id));
    const results = await Promise.allSettled(
      tabs.map(async (tab) => {
        try {
          const saved = await sendMessage("save", {
            service,
            tab,
          });
          console.log("saved", service, saved);

          if (saved) {
            log(tab);
          }
        } catch (err) {
          log(tab, err as Error);
        } finally {
          return tab.id;
        }
      }),
    );
    const fulfilled = results.filter(isFulfilled);
    autoCloseTabs(fulfilled.map((p) => p.value));
    setLoading(false);
  }

  return (
    <button
      onClick={save}
      disabled={loading}
      className="cursor-pointer relative mx-1 opacity-80 hover:opacity-100"
      title={`Save to ${serviceName}`}
    >
      <img
        src={SERVICE_ICONS[service]}
        alt={`Save to ${serviceName}`}
        className="size-4"
      />
      {loading && (
        <div className="absolute top-0 left-0">
          <Spinner />
        </div>
      )}
    </button>
  );
}

const isFulfilled = <T,>(
  p: PromiseSettledResult<T>,
): p is PromiseFulfilledResult<T> => p.status === "fulfilled";
const isRejected = <T,>(
  p: PromiseSettledResult<T>,
): p is PromiseRejectedResult => p.status === "rejected";

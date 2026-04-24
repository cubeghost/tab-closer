import { useShallow } from "zustand/shallow";
import { type Tab, useTabsStore } from "./store";
import { Service } from "@/lib/services";
import { useEnabledServices, SERVICE_ICONS, SERVICE_NAMES } from "./services";
import { sendMessage } from "@/lib/messaging";
import { X } from "@untitledui/icons";
import Button from "@/components/Button";

export default function BulkActions() {
  const services = useEnabledServices();
  const [selectedTabs, clearSelected, closeTabs] = useTabsStore(
    useShallow((state) => [
      state.selectedTabs,
      state.clearSelected,
      state.closeTabs,
    ]),
  );

  function closeSelectedTabs() {
    const tabIds = useTabsStore.getState().selectedTabs;
    if (tabIds.length === 0) return;
    closeTabs(tabIds);
  }

  return (
    <div className="flex gap-4 border-b-1 border-gray-100">
      <div className="my-3">
        {selectedTabs.length} tab{selectedTabs.length === 1 ? "" : "s"} selected
        {selectedTabs.length > 0 && (
          <Button
            onClick={clearSelected}
            variant="secondary"
            size="small"
            className="ml-4"
          >
            Clear
          </Button>
        )}
      </div>
      {selectedTabs.length > 0 && (
        <div className="not-prose flex gap-1 items-center ml-auto pl-3 py-3 border-l-1 border-gray-100">
          {services.map((service) => (
            <BulkSaveAction service={service} key={service} />
          ))}
          <button
            onClick={closeSelectedTabs}
            className="bg-red-100 text-red-400 rounded mx-1 cursor-pointer border-1 border-red-200 hover:bg-red-200"
            title="Close"
          >
            <X className="size-5" />
          </button>
        </div>
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
      className="cursor-pointer relative mx-1 border-1 border-gray-200 rounded overflow-hidden opacity-80 hover:opacity-100"
      title={`Save to ${serviceName}`}
    >
      <img
        src={SERVICE_ICONS[service]}
        alt={`Save to ${serviceName}`}
        className="size-5"
      />
      {loading && (
        <div className="absolute size-5 top-0 left-0 bg-[rgb(255,255,255,0.6)] flex items-center justify-center">
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

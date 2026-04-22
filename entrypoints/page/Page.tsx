import { use, useMemo, useState, useEffect, CSSProperties } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/shallow";

import { sendMessage } from "@/lib/messaging";
import { anytypeApiKey, instapaperUsername } from "@/lib/storage";

import instapaperIcon from "@/assets/instapaper.png";
import anytypeIcon from "@/assets/anytype.png";

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

type BrowserWindow = WithRequired<Browser.windows.Window, "tabs">;
type Tab = Browser.tabs.Tab;
type TabGroup = Browser.tabGroups.TabGroup;

interface Log {
  message: string;
  url: string;
}

interface TabsStore {
  windows: BrowserWindow[];
  groups: TabGroup[];

  logs: Log[];
  search: string;
  autoClose: boolean;
  selectedTabs: NonNullable<Tab["id"]>[];

  fetchWindows: () => Promise<void>;
  fetchGroups: () => Promise<void>;

  toggleSelected: (id: Tab["id"]) => void;
  clearSelected: () => void;
  toggleAutoClose: () => void;
  addLogs: (newLogs: Log[]) => void;
  clearLogs: () => void;
}

const useTabsStore = create<TabsStore>((set) => ({
  windows: [],
  fetchWindows: async () => {
    const windows = await browser.windows.getAll({ populate: true });
    set({
      windows: windows.map((window) => ({
        ...window,
        tabs: window.tabs!.filter(
          (tab) => !tab.url?.startsWith("chrome-extension://"),
        ),
      })),
    });
  },

  groups: [],
  fetchGroups: async () => {
    const groups = await browser.tabGroups.query({});
    set({
      groups,
    });
  },

  search: "",
  autoClose: true,
  toggleAutoClose: () => set((state) => ({ autoClose: !state.autoClose })),

  selectedTabs: [],
  toggleSelected: (id: Tab["id"]) => {
    if (!id) return;
    set((state) => {
      const index = state.selectedTabs.indexOf(id);
      if (index > -1) {
        return { selectedTabs: state.selectedTabs.toSpliced(index, 1) };
      } else {
        return { selectedTabs: [...state.selectedTabs, id] };
      }
    });
  },
  clearSelected: () => set({ selectedTabs: [] }),

  logs: [],
  addLogs: (newLogs: Log[]) =>
    set((state) => ({
      logs: [...state.logs, ...newLogs],
    })),
  clearLogs: () => set({ logs: [] }),
}));

function App() {
  return (
    <div className="p-2 prose flex flex-col h-full max-w-full">
      <Options />
      <BulkActions />
      <Tabs />
      <Logs />
    </div>
  );
}

export default App;

function Tabs() {
  const { windows, fetchWindows, fetchGroups } = useTabsStore(
    useShallow((state) => ({
      windows: state.windows,
      fetchWindows: state.fetchWindows,
      fetchGroups: state.fetchGroups,
    })),
  );

  useEffect(() => {
    fetchWindows();
    fetchGroups();
  }, [fetchWindows, fetchGroups]);

  return windows.map((w, index) => (
    <div key={w.id}>
      <h3 className="font-bold flex items-center">
        Window {index + 1}{" "}
        <span className="rounded bg-gray-200 text-xs font-normal px-1 py-0.5 ml-2">
          {w.tabs.length} tab{w.tabs.length !== 1 && "s"}
        </span>
      </h3>
      <ul className="not-prose">
        {w.tabs.map((tab, tabIndex) => (
          <Tab tab={tab} key={tab.id} />
        ))}
      </ul>
    </div>
  ));
}

function Options() {
  const { autoClose, toggleAutoClose } = useTabsStore(
    useShallow((state) => ({
      autoClose: state.autoClose,
      toggleAutoClose: state.toggleAutoClose,
    })),
  );

  return (
    <div className="flex">
      <label className="flex my-1 mx-2 items-center">
        <span>Search</span>
        <input type="text" className="p-1 ml-2" />
      </label>
      <label className="flex my-1 mx-2 items-center">
        <input
          type="checkbox"
          checked={autoClose}
          onChange={() => toggleAutoClose()}
          className="mr-1"
        />
        <span>Close tabs on save</span>
      </label>
    </div>
  );
}

function Logs() {
  const { logs, clearLogs } = useTabsStore(
    useShallow((state) => ({ logs: state.logs, clearLogs: state.clearLogs })),
  );

  return (
    <div className="overflow-y-scroll no-prose">
      <table>
        <tbody>
          {logs.map((log, i) => (
            <tr key={`log-${i}`}>
              <td>{log.message}</td>
              <td>{log.url}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TAB_GROUP_COLORS = {
  grey: "#5f6368",
  blue: "#2376e5",
  red: "#d7322d",
  yellow: "#f7aa29",
  green: "#1f7f3b",
  pink: "#ce2184",
  purple: "#a04bf1",
  cyan: "#107b82",
  orange: "#f89048",
};

function Tab({ tab }: { tab: Tab }) {
  const selected = useTabsStore(
    useShallow((state) =>
      tab.id ? state.selectedTabs.includes(tab.id) : false,
    ),
  );
  const toggleSelected = useTabsStore(
    useShallow((state) => state.toggleSelected),
  );

  const focusTab = (event: React.MouseEvent) => {
    event.preventDefault();
    browser.windows.update(tab.windowId, { focused: true });
    browser.tabs.update(tab.id, { active: true });
  };

  const { group, firstInGroup } = useTabsStore(
    useShallow((state) => {
      const group = tab.groupId
        ? state.groups.find((g) => g.id === tab.groupId)
        : undefined;
      const firstInGroup = group
        ? state.windows
            .find((w) => w.id === tab.windowId)!
            .tabs.find((t) => t.groupId === group.id)?.id === tab.id
        : false;
      return {
        group,
        firstInGroup,
      };
    }),
  );
  const style = useMemo(
    () =>
      ({
        "--tab-group-color": group
          ? TAB_GROUP_COLORS[group.color]
          : "transparent",
      }) as CSSProperties,
    [group],
  );
  console.log(group);

  return (
    <>
      {firstInGroup && (
        <li
          className="pl-2 border-l-4 border-(--tab-group-color)"
          style={style}
        >
          {group?.title}
        </li>
      )}
      <li
        key={tab.id}
        className="group flex items-center gap-1 hover:bg-gray-50 pl-2 border-l-4 border-(--tab-group-color)"
        style={style}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={() => toggleSelected(tab.id)}
        />
        {tab.favIconUrl ? (
          <img src={tab.favIconUrl} className="size-4" />
        ) : (
          <div className="size-4 bg-linear-to-b from-gray-100 to-gray-300" />
        )}
        <div className="min-w-56">
          <a href={tab.url} target="_blank" onClick={focusTab}>
            {tab.title}
          </a>
        </div>
        <Actions tab={tab} className="opacity-0 group-hover:opacity-100" />
      </li>
    </>
  );
}

const instapaperUsernamePromise = instapaperUsername.getValue();
const anytypeApiKeyPromise = anytypeApiKey.getValue();

function Actions({ tab, className }: { tab: Tab; className?: string }) {
  const { addLogs } = useTabsStore(
    useShallow((state) => ({ addLogs: state.addLogs })),
  );
  const enableInstagram = use(instapaperUsernamePromise);
  const enableAnytype = use(anytypeApiKeyPromise);

  function onSave(message: string) {
    addLogs([{ message, url: tab.url ?? "" }]);
  }

  if (!tab.url) return null;

  return (
    <div className={className}>
      {enableInstagram && (
        <SaveAction
          service="instapaper"
          icon={instapaperIcon}
          tab={tab}
          onSave={() => onSave("Saved to Instapaper")}
        />
      )}
      {enableAnytype && (
        <SaveAction
          service="anytype"
          icon={anytypeIcon}
          tab={tab}
          onSave={() => onSave("Saved to Anytype")}
        />
      )}
    </div>
  );
}

function SaveAction({
  service,
  icon,
  tab,
  onSave,
}: {
  service: "instapaper" | "anytype";
  icon: string;
  tab: Tab;
  onSave?: () => void;
}) {
  const [status, setStatus] = useState<"loading" | "success" | "error" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setStatus("loading");
    try {
      const response = await sendMessage("save", {
        service,
        tab,
      });
      await sleep(1000);
      console.log("save response", response);
      onSave?.();
      setStatus("success");
      setError(null);
      setTimeout(() => setStatus(null), 2000);
    } catch (err) {
      setStatus("error");
      setError((err as Error).message);
    }
  }

  return (
    <button
      onClick={save}
      disabled={status === "loading"}
      className="cursor-pointer relative"
    >
      <img src={icon} alt={`Save to ${service}`} className="size-4" />
      <div className="absolute">
        {status === "loading" ? (
          <Spinner />
        ) : status === "success" ? (
          <span>✅</span>
        ) : null}
      </div>
    </button>
  );
}

function BulkActions() {
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

/**
 * Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE
 */
function Spinner() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="size-4 animate-spin"
    >
      <path
        fill="currentColor"
        d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
        opacity=".25"
      />
      <path
        fill="currentColor"
        d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z"
      />
    </svg>
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

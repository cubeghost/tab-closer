import { Service } from "@/lib/services";
import { anytypeApiKey, arenaToken, instapaperUsername } from "@/lib/storage";
import { use } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { EnabledServices } from "./services";

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

type Window = Browser.windows.Window;
export type WindowWithTabs = WithRequired<Browser.windows.Window, "tabs">;
export type Tab = Browser.tabs.Tab;
export type TabGroup = Browser.tabGroups.TabGroup;

export interface Log {
  type: "success" | "error";
  tab: Tab;
  service: Service;
  message: string;
}

interface TabsStore {
  services: EnabledServices;

  windows: WindowWithTabs[];
  groups: TabGroup[];

  logs: Log[];
  search: string;
  autoClose: boolean;
  selectedTabs: NonNullable<Tab["id"]>[];

  setServices: (services: EnabledServices) => void;
  setService: (service: Service, enabled: boolean) => void;

  setWindows: (windows: Window[]) => void;
  setGroups: (groups: TabGroup[]) => void;

  toggleSelected: (id: Tab["id"]) => void;
  clearSelected: () => void;

  toggleAutoClose: () => void;
  autoCloseTabs: (ids: Tab["id"][]) => Promise<void>;
  closeTabs: (ids: Tab["id"][]) => Promise<void>;

  addLogs: (newLogs: Log[]) => void;
  clearLogs: () => void;
}

export const useTabsStore = create<TabsStore>((set, get) => ({
  services: { anytype: false, arena: false, instapaper: false },
  setServices: (services: EnabledServices) => set({ services }),
  setService: (service: Service, enabled: boolean) =>
    set((state) => ({ services: { ...state.services, [service]: enabled } })),

  windows: [],
  setWindows: (windows: Window[]) =>
    set((state) => {
      const filtered = windows.map((window) => ({
        ...window,
        tabs: window.tabs!.filter(
          (tab) => !tab.url?.startsWith("chrome-extension://"),
        ),
      }));
      const closedTabs = detectClosedTabs(state.windows, filtered);

      return {
        windows: filtered,
        selectedTabs:
          closedTabs.length > 0
            ? state.selectedTabs.filter((id) => !closedTabs.includes(id))
            : state.selectedTabs,
      };
    }),

  groups: [],
  setGroups: (groups: TabGroup[]) => set({ groups }),

  search: "",
  autoClose: false,
  toggleAutoClose: () => set((state) => ({ autoClose: !state.autoClose })),
  autoCloseTabs: async (maybeIds: Tab["id"][]) => {
    const ids = maybeIds.filter((id) => id !== undefined);
    if (get().autoClose) {
      await browser.tabs.remove(ids);
      set((state) => ({
        selectedTabs: state.selectedTabs.filter((id) => !ids.includes(id)),
      }));
    }
  },
  closeTabs: async (maybeIds: Tab["id"][]) => {
    const ids = maybeIds.filter((id) => id !== undefined);
    await browser.tabs.remove(ids);
    set((state) => ({
      selectedTabs: state.selectedTabs.filter((id) => !ids.includes(id)),
    }));
  },

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

const servicesPromise: Promise<EnabledServices> = (async () => {
  const anytype = !!(await anytypeApiKey.getValue());
  const arena = !!(await arenaToken.getValue());
  const instapaper = !!(await instapaperUsername.getValue());
  return { anytype, arena, instapaper } satisfies EnabledServices;
})();
const windowsPromise = browser.windows.getAll({
  populate: true,
});
const groupsPromise = browser.tabGroups.query({});

export function useSyncStore() {
  const initialServices = use(servicesPromise);
  const initialWindows = use(windowsPromise);
  const initialGroups = use(groupsPromise);
  const init = useRef(false);

  const { setServices, setService, setWindows, setGroups } = useTabsStore(
    useShallow((state) => ({
      setServices: state.setServices,
      setService: state.setService,
      setWindows: state.setWindows,
      setGroups: state.setGroups,
    })),
  );

  useEffect(() => {
    if (!init.current) {
      setServices(initialServices);
      setWindows(initialWindows);
      setGroups(initialGroups);
      init.current = true;
    }
  }, []);

  // subscribe to service options
  useEffect(() => {
    const unwatchAnytype = storage.watch(anytypeApiKey.key, (newValue) => {
      setService("anytype", !!newValue);
    });
    const unwatchArena = storage.watch(arenaToken.key, (newValue) => {
      setService("arena", !!newValue);
    });
    const unwatchInstapaper = storage.watch(
      instapaperUsername.key,
      (newValue) => {
        setService("instapaper", !!newValue);
      },
    );

    return () => {
      unwatchAnytype();
      unwatchArena();
      unwatchInstapaper();
    };
  }, []);

  // subscribe to windows and tab groups
  useEffect(() => {
    const update = async () => {
      setWindows(
        await browser.windows.getAll({
          populate: true,
        }),
      );
      setGroups(await browser.tabGroups.query({}));
    };
    const updateGroups = async () =>
      setGroups(await browser.tabGroups.query({}));

    const events = [
      browser.tabs.onUpdated,
      browser.tabs.onMoved,
      browser.tabs.onRemoved,
      browser.windows.onCreated,
      browser.windows.onRemoved,
    ];
    events.forEach((event) => event.addListener(update));
    browser.tabGroups.onUpdated.addListener(updateGroups);

    return () => {
      events.forEach((event) => event.removeListener(update));
      browser.tabGroups.onUpdated.removeListener(updateGroups);
    };
  }, []);
}

function detectClosedTabs(
  prevWindows: WindowWithTabs[],
  windows: WindowWithTabs[],
) {
  const prevTabIds = new Set(allTabIds(prevWindows));
  const newTabIds = new Set(allTabIds(windows));
  return [...prevTabIds.difference(newTabIds)];
}

const allTabIds = (windows: WindowWithTabs[]) =>
  windows
    .flatMap((w) => w.tabs)
    .map((t) => t.id)
    .filter(notUndefined);

function notUndefined<T>(val: T | undefined): val is T {
  return val !== undefined;
}

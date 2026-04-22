import { Service } from "@/lib/services";
import { create } from "zustand";

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type BrowserWindow = WithRequired<Browser.windows.Window, "tabs">;
export type Tab = Browser.tabs.Tab;
export type TabGroup = Browser.tabGroups.TabGroup;

export interface Log {
  type: "success" | "error";
  tab: Tab;
  service: Service;
  message: string;
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
  autoCloseTabs: (ids: Tab["id"][]) => Promise<void>;

  addLogs: (newLogs: Log[]) => void;
  clearLogs: () => void;
}

export const useTabsStore = create<TabsStore>((set, get) => ({
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
  autoClose: false,
  toggleAutoClose: () => set((state) => ({ autoClose: !state.autoClose })),
  autoCloseTabs: async (maybeIds: Tab["id"][]) => {
    const ids = maybeIds.filter((id) => id !== undefined);
    if (get().autoClose) {
      await browser.tabs.remove(ids);
      set((state) => ({
        windows: state.windows.map((window) => ({
          ...window,
          tabs: window.tabs.filter((tab) =>
            tab.id ? !ids.includes(tab.id) : true,
          ),
        })),
        selectedTabs: state.selectedTabs.filter((id) => !ids.includes(id)),
      }));
    }
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

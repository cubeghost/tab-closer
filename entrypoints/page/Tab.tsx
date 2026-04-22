import { CSSProperties } from "react";

import { useTabsStore } from "./store";
import type { Tab } from "./store";
import { useShallow } from "zustand/shallow";
import Actions from "./Actions";

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

export default function Tab({ tab }: { tab: Tab }) {
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

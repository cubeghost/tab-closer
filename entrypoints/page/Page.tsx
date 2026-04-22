import { useEffect } from "react";
import { useShallow } from "zustand/shallow";

import { useTabsStore } from "./store";
import BulkActions from "./BulkActions";
import Tab from "./Tab";

function App() {
  return (
    <div className="p-3 prose flex flex-col h-full max-w-full">
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
        {w.tabs.map((tab) => (
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
    <>
      <h4 className="mt-auto flex">
        Logs{" "}
        <button
          onClick={clearLogs}
          className="ml-auto font-normal text-sm bg-gray-200 rounded px-2"
        >
          Clear
        </button>
      </h4>
      <div className="max-h-1/3 overflow-y-scroll no-prose">
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
    </>
  );
}

import { useShallow } from "zustand/shallow";
import { useTabsStore } from "./store";
import { SERVICE_ICONS } from "./services";
import Favicon from "./Favicon";

export default function Logs() {
  const [logs, clearLogs] = useTabsStore(
    useShallow((state) => [state.logs, state.clearLogs]),
  );

  return (
    <>
      <h4 className="mt-auto flex">
        Logs{" "}
        <button
          onClick={clearLogs}
          className="ml-auto font-normal text-sm bg-gray-200 hover:bg-gray-300 rounded px-2 cursor-pointer"
        >
          Clear
        </button>
      </h4>
      <div className="max-h-1/3 overflow-y-scroll">
        <table className="mt-0 mb-0">
          <tbody>
            {logs.map((log, i) => (
              <tr key={`log-${i}`}>
                <td className="w-6 not-prose">
                  <img
                    src={SERVICE_ICONS[log.service]}
                    className="size-4 rounded border-1 border-gray-200 overflow-hidden"
                  />
                </td>
                <td>{log.message}</td>
                <td>
                  <Favicon
                    tab={log.tab}
                    className="not-prose inline-block mr-1"
                  />
                  <a href={log.tab.url} target="_blank">
                    {log.tab.title}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

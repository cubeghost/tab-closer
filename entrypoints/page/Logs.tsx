import { useShallow } from "zustand/shallow";
import { useTabsStore } from "./store";
import { SERVICE_ICONS } from "./services";
import Favicon from "./Favicon";
import Button from "@/components/Button";
import { ChevronDown, Maximize01, Minimize01 } from "@untitledui/icons";
import { twJoin } from "tailwind-merge";

export default function Logs() {
  const [open, setOpen] = useState(true);
  const [logs, clearLogs] = useTabsStore(
    useShallow((state) => [state.logs, state.clearLogs]),
  );

  return (
    <>
      <h4 className="mt-auto pt-2 flex border-t-1 border-gray-100">
        Logs{" "}
        <Button
          onClick={clearLogs}
          variant="secondary"
          size="small"
          className={twJoin("font-normal ml-2")}
        >
          Clear
        </Button>
        <button
          onClick={() => setOpen((s) => !s)}
          className="ml-auto cursor-pointer"
        >
          <ChevronDown
            className={twJoin("size-6", open ? "rotate-0" : "rotate-180")}
          />
        </button>
      </h4>
      <div
        className={twJoin(
          "max-h-1/3 overflow-y-scroll shrink-0",
          open ? "block" : "hidden",
        )}
      >
        <table className="mt-0 mb-0">
          <tbody>
            {logs.map((log, i) => (
              <tr key={`log-${i}`}>
                <td className="w-6 not-prose">
                  <img
                    src={SERVICE_ICONS[log.service]}
                    className="size-4 max-w-4 rounded border-1 border-gray-200 overflow-hidden"
                  />
                </td>
                <td className="whitespace-pre">{log.message}</td>
                <td className="truncate">
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

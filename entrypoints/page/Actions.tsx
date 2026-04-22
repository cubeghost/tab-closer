import { useState } from "react";
import { useShallow } from "zustand/shallow";

import { sendMessage } from "@/lib/messaging";
import Spinner from "@/components/Spinner";
import { Tab, useTabsStore } from "./store";
import { SERVICE_ICONS, SERVICE_NAMES, useServices } from "./services";
import { Service } from "@/lib/services";

export default function Actions({
  tab,
  className,
}: {
  tab: Tab;
  className?: string;
}) {
  const { anytype, instapaper } = useServices();

  if (!tab.url) return null;

  return (
    <div className={className}>
      {anytype && <SaveAction service="anytype" tab={tab} />}
      {instapaper && <SaveAction service="instapaper" tab={tab} />}
    </div>
  );
}

function SaveAction({ service, tab }: { service: Service; tab: Tab }) {
  const serviceName = SERVICE_NAMES[service];
  const { addLogs, autoCloseTabs } = useTabsStore(
    useShallow((state) => ({
      addLogs: state.addLogs,
      autoCloseTabs: state.autoCloseTabs,
    })),
  );
  const [status, setStatus] = useState<"loading" | "success" | "error" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  function log(error?: Error) {
    addLogs([
      {
        type: error ? "error" : "success",
        message: error
          ? `Error saving to ${serviceName}: ${error.message}`
          : `Saved to ${serviceName}`,
        service,
        tab,
      },
    ]);
  }

  async function save() {
    setStatus("loading");
    try {
      const saved = await sendMessage("save", {
        service,
        tab,
      });

      if (saved) {
        log();
        setStatus("success");
        setError(null);
        autoCloseTabs([tab.id]);
        setTimeout(() => setStatus(null), 5000);
      }
    } catch (err) {
      setStatus("error");
      log(err as Error);
    }
  }

  return (
    <button
      onClick={save}
      disabled={status === "loading"}
      className="cursor-pointer relative mx-1"
    >
      <img
        src={SERVICE_ICONS[service]}
        alt={`Save to ${serviceName}`}
        className="size-4"
      />
      {status === "loading" && (
        <div className="absolute top-0 left-0">
          <Spinner />
        </div>
      )}
      <span
        className={`absolute top-0 left-0 transition transition-opacity opacity-0 ${status === "success" ? "opacity-100" : ""}`}
      >
        ✅
      </span>
      <span
        className={`absolute top-0 left-0 transition transition-opacity opacity-0 ${status === "error" ? "opacity-100" : ""}`}
      >
        ❌
      </span>
    </button>
  );
}

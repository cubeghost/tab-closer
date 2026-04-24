import { useState } from "react";
import { useShallow } from "zustand/shallow";
import { X } from "@untitledui/icons";

import { sendMessage } from "@/lib/messaging";
import type { Service } from "@/lib/services";
import Spinner from "@/components/Spinner";
import { SERVICE_ICONS, SERVICE_NAMES, useEnabledServices } from "./services";
import { Tab, useTabsStore } from "./store";
import { twJoin, twMerge } from "tailwind-merge";

export default function Actions({
  tab,
  className,
}: {
  tab: Tab;
  className?: string;
}) {
  const services = useEnabledServices();
  const [closeTabs] = useTabsStore(useShallow((state) => [state.closeTabs]));

  function close() {
    closeTabs([tab.id]);
  }

  if (!tab.url) return null;

  return (
    <div className={twMerge("flex items-center gap-2", className)}>
      {services.map((service) => (
        <SaveAction service={service} tab={tab} key={service} />
      ))}
      <button
        onClick={close}
        className="block bg-red-100 text-red-400 rounded border-1 border-red-200 cursor-pointer hover:bg-red-200"
        title="Close"
      >
        <X className="size-4" />
      </button>
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
        autoCloseTabs([tab.id]);
        setTimeout(() => setStatus(null), 3000);
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
      className={twJoin(
        "cursor-pointer relative rounded border-1 overflow-hidden opacity-80 hover:opacity-100",
        status === "success"
          ? "border-green-500"
          : status === "error"
            ? "border-red-500"
            : "border-gray-200",
      )}
      title={`Save to ${serviceName}`}
    >
      <img
        src={SERVICE_ICONS[service]}
        alt={`Save to ${serviceName}`}
        className="size-4"
      />
      {status === "loading" && (
        <div className="absolute size-4 top-0 left-0 bg-[rgb(255,255,255,0.6)] flex items-center justify-center">
          <Spinner className="size-3.5" />
        </div>
      )}
    </button>
  );
}

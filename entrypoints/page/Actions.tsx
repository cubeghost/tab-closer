import { use, useState } from "react";
import { useShallow } from "zustand/shallow";

import { sendMessage } from "@/lib/messaging";
import { anytypeApiKey, instapaperUsername } from "@/lib/storage";
import Spinner from "@/components/Spinner";

import instapaperIcon from "@/assets/instapaper.png";
import anytypeIcon from "@/assets/anytype.png";
import { Tab, useTabsStore } from "./store";

const instapaperUsernamePromise = instapaperUsername.getValue();
const anytypeApiKeyPromise = anytypeApiKey.getValue();

const SERVICE_NAMES = {
  anytype: "Anytype",
  instapaper: "Instapaper",
} as const;

export default function Actions({
  tab,
  className,
}: {
  tab: Tab;
  className?: string;
}) {
  const enableInstagram = use(instapaperUsernamePromise);
  const enableAnytype = use(anytypeApiKeyPromise);

  if (!tab.url) return null;

  return (
    <div className={className}>
      {enableInstagram && (
        <SaveAction service="instapaper" icon={instapaperIcon} tab={tab} />
      )}
      {enableAnytype && (
        <SaveAction service="anytype" icon={anytypeIcon} tab={tab} />
      )}
    </div>
  );
}

function SaveAction({
  service,
  icon,
  tab,
}: {
  service: "instapaper" | "anytype";
  icon: string;
  tab: Tab;
}) {
  const { addLogs } = useTabsStore(
    useShallow((state) => ({ addLogs: state.addLogs })),
  );
  const [status, setStatus] = useState<"loading" | "success" | "error" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  function log(error?: Error) {
    const serviceName = SERVICE_NAMES[service];
    if (error) {
      addLogs([
        {
          message: `Error saving to ${serviceName}: ${error.message}`,
          url: tab.url ?? "",
        },
      ]);
    } else {
      addLogs([{ message: `Saved to ${serviceName}`, url: tab.url ?? "" }]);
    }
  }

  async function save() {
    setStatus("loading");
    try {
      const response = await sendMessage("save", {
        service,
        tab,
      });
      setTimeout(() => {
        log();
        setStatus("success");
        setError(null);
        setTimeout(() => setStatus(null), 5000);
      }, 3000);
    } catch (err) {
      setStatus("error");
      log(err as Error);
    }
  }

  console.log(status);

  return (
    <button
      onClick={save}
      disabled={status === "loading"}
      className="cursor-pointer relative mx-1"
    >
      <img src={icon} alt={`Save to ${service}`} className="size-4" />
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

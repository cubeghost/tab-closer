import { use, useSyncExternalStore } from "react";
import { anytypeApiKey, instapaperUsername } from "@/lib/storage";
import { Service } from "@/lib/services";

import instapaperIcon from "@/assets/instapaper.png";
import anytypeIcon from "@/assets/anytype.png";

export const SERVICE_NAMES: Record<Service, string> = {
  anytype: "Anytype",
  instapaper: "Instapaper",
} as const;

export const SERVICE_ICONS: Record<Service, string> = {
  anytype: anytypeIcon,
  instapaper: instapaperIcon,
} as const;

type EnabledServices = {
  [K in Service]: boolean;
};

const initialPromise: Promise<EnabledServices> = (async () => {
  const anytype = !!(await anytypeApiKey.getValue());
  const instapaper = !!(await anytypeApiKey.getValue());
  return { anytype, instapaper };
})();

export const useServices = () => {
  const initialValue = use(initialPromise);
  const ref = useRef<EnabledServices>(initialValue);

  const subscribe = useCallback((callback: () => void) => {
    const unwatchAnytype = storage.watch(anytypeApiKey.key, (newValue) => {
      ref.current = { ...ref.current, anytype: !!newValue };
      return callback();
    });
    const unwatchInstapaper = storage.watch(
      instapaperUsername.key,
      (newValue) => {
        ref.current = { ...ref.current, instapaper: !!newValue };
        return callback();
      },
    );

    return () => {
      unwatchAnytype();
      unwatchInstapaper();
    };
  }, []);

  const getSnapshot = useCallback(() => {
    return ref.current;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot);
};

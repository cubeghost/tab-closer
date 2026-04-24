import type { Service } from "@/lib/services";

import anytypeIcon from "@/assets/anytype.png";
import arenaIcon from "@/assets/arena.png";
import instapaperIcon from "@/assets/instapaper.png";
import { useShallow } from "zustand/shallow";
import { useTabsStore } from "./store";

export const SERVICE_NAMES: Record<Service, string> = {
  anytype: "Anytype",
  arena: "Are.na",
  instapaper: "Instapaper",
} as const;

export const SERVICE_ICONS: Record<Service, string> = {
  anytype: anytypeIcon,
  arena: arenaIcon,
  instapaper: instapaperIcon,
} as const;

export type EnabledServices = {
  [service in Service]: boolean;
};

const mapEnabledServices = (services: EnabledServices) =>
  (Object.keys(services) as Service[]).filter((key) => services[key] === true);

export const useEnabledServices = () =>
  useTabsStore(useShallow((state) => mapEnabledServices(state.services)));

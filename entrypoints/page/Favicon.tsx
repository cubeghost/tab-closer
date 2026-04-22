import type { Tab } from "./store";

export default function Favicon({
  tab,
  className,
}: {
  tab: Tab;
  className?: string;
}) {
  return tab.favIconUrl ? (
    <img src={tab.favIconUrl} className={`size-4 ${className ?? ""}`} />
  ) : (
    <div
      className={`size-4 bg-linear-to-b from-gray-100 to-gray-300 ${className ?? ""}`}
    />
  );
}

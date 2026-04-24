import { twMerge } from "tailwind-merge";

export default function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={twMerge(
        "size-4 animate-spin rounded-full border-3 border-gray-300 border-t-gray-600",
        className,
      )}
    />
  );
}

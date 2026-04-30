import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "small" | "medium";
  className?: string;
}

export default function Button({
  variant = "primary",
  size = "medium",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={twMerge(
        "rounded cursor-pointer disabled:cursor-not-allowed",
        size === "medium" && "px-4 py-1.5 text-base",
        size === "small" && "px-2 py-1 text-sm",
        variant === "primary" &&
          "bg-indigo-600 text-white hover:not-disabled:bg-indigo-700 focus:not-disabled:bg-indigo-700 disabled:bg-indigo-100 disabled:text-gray-600",
        variant === "secondary" &&
          "bg-gray-200 hover:not-disabled:bg-gray-300 focus:not-disabled:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-600",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

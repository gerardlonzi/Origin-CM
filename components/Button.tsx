import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export default function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50",
        variant === "primary" && "bg-origin-blue text-white hover:bg-blue-600",
        variant === "secondary" && "bg-white/5 text-white border border-origin-border hover:bg-white/10",
        variant === "danger" && "bg-origin-red/10 text-origin-red hover:bg-origin-red/20",
        className
      )}
      {...props}
    />
  );
}

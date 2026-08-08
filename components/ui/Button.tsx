import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * components/ui/Button.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Native <button> element. For a link styled as a button, use LinkButton —
 * they share the same class-building logic (buttonClasses, exported below)
 * so the two never visually drift apart.
 */

export type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-cyan-400 text-navy-950 hover:opacity-90",
  outline: "border border-white/20 text-slate-100 hover:border-cyan-400",
  ghost: "text-slate-400 hover:bg-white/5 hover:text-slate-100",
  danger: "bg-coral-500 text-navy-950 hover:opacity-90",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-3 text-sm",
  lg: "px-6 py-3 text-base",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  fullWidth = false,
  className?: string,
): string {
  return cn(
    "focus-ring inline-flex items-center justify-center gap-2 rounded font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && "w-full",
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={buttonClasses(variant, size, fullWidth, className)} {...rest}>
      {children}
    </button>
  );
}

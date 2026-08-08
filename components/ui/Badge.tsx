import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "accent" | "muted" | "outline";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  accent: "bg-navy-950 text-cyan-400",
  muted: "bg-navy-950 text-slate-400",
  outline: "border border-white/15 text-slate-400",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

export default function Badge({
  variant = "accent",
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded px-2 py-1 font-mono text-xs",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

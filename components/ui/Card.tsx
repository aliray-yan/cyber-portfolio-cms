import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * components/ui/Card.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * The bordered navy-800 container used for project cards, certification
 * cards, skill rows, dashboard stat cards, and settings sections. For a
 * card that's also a link (blog post cards), use CardLink — both share
 * cardClasses() so they stay visually identical.
 */

export function cardClasses(
  interactive = false,
  padding: "sm" | "md" = "md",
  className?: string,
): string {
  return cn(
    "rounded-lg border border-white/10 bg-navy-800",
    padding === "md" ? "p-6" : "p-4",
    interactive && "transition-colors hover:border-cyan-400",
    className,
  );
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padding?: "sm" | "md";
  children: ReactNode;
}

export default function Card({
  interactive = false,
  padding = "md",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div className={cardClasses(interactive, padding, className)} {...rest}>
      {children}
    </div>
  );
}

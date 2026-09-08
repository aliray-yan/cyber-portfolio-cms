import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * components/ui/Select.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Native <select>, styled to match Input/Textarea's label + tone pattern
 * exactly, so a form mixing all three reads as one consistent set of
 * fields rather than a bolted-on dropdown.
 */
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  tone?: "default" | "inset";
}

export default function Select({ label, id, tone = "default", className, children, ...rest }: SelectProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <select
        id={id}
        className={cn(
          "focus-ring mt-2 w-full rounded-lg border border-border px-4 py-2.5 text-sm text-foreground transition-colors hover:border-primary/50 disabled:opacity-60 disabled:hover:border-border",
          tone === "inset" ? "bg-background" : "bg-card",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}

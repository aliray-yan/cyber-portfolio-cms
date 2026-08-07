import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** "default" sits on the page background; "inset" is for use inside a Card (e.g. the login form). */
  tone?: "default" | "inset";
}

export default function Input({
  label,
  id,
  tone = "default",
  className,
  ...rest
}: InputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-100">
        {label}
      </label>
      <input
        id={id}
        className={cn(
          "focus-ring mt-2 w-full rounded border border-navy-800 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-400 disabled:opacity-60",
          tone === "inset" ? "bg-navy-950" : "bg-navy-900",
          className,
        )}
        {...rest}
      />
    </div>
  );
}

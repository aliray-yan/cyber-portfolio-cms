import { cn } from "@/lib/utils";

interface EmptyStateProps {
  message: string;
  className?: string;
}

export default function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-navy-800 p-12 text-center",
        className,
      )}
    >
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

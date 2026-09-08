"use client";

import { useTransition } from "react";
import { buttonClasses } from "@/components/ui/Button";

/**
 * components/dashboard/DeleteButton.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * One reusable delete control for every dashboard list page. `action` is a
 * server action already bound to a specific row's id — e.g.
 * `deleteProjectAction.bind(null, project.id)` — so this component itself
 * has no idea what resource it's deleting.
 *
 * A native `confirm()` in onSubmit, not a custom modal: this is an
 * internal single-admin tool, not visitor-facing UI, so the platform
 * dialog is the pragmatic choice — no extra component, and it blocks
 * synchronously the one time that actually matters (before the request
 * fires).
 */
interface DeleteButtonProps {
  action: () => Promise<void>;
  confirmMessage?: string;
  label?: string;
}

export default function DeleteButton({
  action,
  confirmMessage = "Delete this? This can't be undone.",
  label = "Delete",
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={() => startTransition(action)}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        disabled={isPending}
        className={buttonClasses("ghost", "sm", false, "text-destructive hover:bg-destructive/10")}
      >
        {isPending ? "Deleting…" : label}
      </button>
    </form>
  );
}

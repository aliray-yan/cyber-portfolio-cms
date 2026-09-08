"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import type { ExperienceEntry } from "@/lib/data/experience";
import type { ExperienceFormState } from "@/app/(dashboard)/dashboard/experience/actions";

interface ExperienceFormProps {
  action: (state: ExperienceFormState, formData: FormData) => Promise<ExperienceFormState>;
  entry?: ExperienceEntry;
  submitLabel: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

export default function ExperienceForm({ action, entry, submitLabel }: ExperienceFormProps) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-8 max-w-xl space-y-5">
      <Input id="role" name="role" label="Role" defaultValue={entry?.role} required />
      <Input id="organization" name="organization" label="Organization" defaultValue={entry?.organization} required />
      <Input
        id="period"
        name="period"
        label="Period"
        placeholder="Mar – May 2026"
        defaultValue={entry?.period}
        required
      />
      <Textarea
        id="description"
        name="description"
        label="Description"
        rows={4}
        defaultValue={entry?.description}
        required
      />

      <div className="flex items-center gap-4 pt-2">
        <SubmitButton label={submitLabel} />
        {state?.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { SkillCategoryFormState } from "@/app/(dashboard)/dashboard/skills/actions";

interface SkillCategoryFormProps {
  action: (state: SkillCategoryFormState, formData: FormData) => Promise<SkillCategoryFormState>;
  defaultTitle?: string;
  submitLabel: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

export default function SkillCategoryForm({ action, defaultTitle, submitLabel }: SkillCategoryFormProps) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[16rem] flex-1">
        <Input id="title" name="title" label="Category title" defaultValue={defaultTitle} required />
      </div>
      <SubmitButton label={submitLabel} />
      {state?.error && (
        <p role="alert" className="w-full text-sm text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}

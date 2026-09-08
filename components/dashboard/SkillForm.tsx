"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { PROFICIENCY_LEVELS } from "@/lib/validations/skill";
import type { Skill } from "@/lib/data/skills";
import type { SkillFormState } from "@/app/(dashboard)/dashboard/skills/actions";

interface SkillFormProps {
  action: (state: SkillFormState, formData: FormData) => Promise<SkillFormState>;
  skill?: Skill;
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

export default function SkillForm({ action, skill, submitLabel }: SkillFormProps) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[12rem] flex-1">
        <Input id="name" name="name" label="Skill name" defaultValue={skill?.name} required />
      </div>
      <div className="w-44">
        <Select id="level" name="level" label="Level" defaultValue={skill?.level} required>
          {PROFICIENCY_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </Select>
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

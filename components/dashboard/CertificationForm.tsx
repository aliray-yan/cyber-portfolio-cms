"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Certification } from "@/lib/data/certifications";
import type { CertificationFormState } from "@/app/(dashboard)/dashboard/certifications/actions";

interface CertificationFormProps {
  action: (state: CertificationFormState, formData: FormData) => Promise<CertificationFormState>;
  certification?: Certification;
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

export default function CertificationForm({ action, certification, submitLabel }: CertificationFormProps) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-8 max-w-xl space-y-5">
      <Input id="name" name="name" label="Name" defaultValue={certification?.name} required />
      <Input id="issuer" name="issuer" label="Issuer" defaultValue={certification?.issuer} required />
      <Input id="year" name="year" label="Year" defaultValue={certification?.year} required />
      <Input
        id="credentialUrl"
        name="credentialUrl"
        type="url"
        label="Credential URL"
        placeholder="https://..."
        defaultValue={certification?.credentialUrl}
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

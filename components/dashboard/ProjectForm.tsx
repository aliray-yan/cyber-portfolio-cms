"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import ImageUploadField from "@/components/dashboard/ImageUploadField";
import { PROJECT_CATEGORIES } from "@/lib/validations/project";
import type { Project } from "@/lib/data/projects";
import type { ProjectFormState } from "@/app/(dashboard)/dashboard/projects/actions";

/**
 * components/dashboard/ProjectForm.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * One form, two callers: app/(dashboard)/dashboard/projects/new/page.tsx
 * passes createProjectAction directly; .../[id]/edit/page.tsx passes
 * updateProjectAction already bound to that project's id via
 * `.bind(null, project.id)` (a Server Action can't take a plain closure
 * over `id` from the page otherwise — `bind` is the supported way to
 * pre-fill an argument). Either way this component's own props are
 * identical: an action of the same useActionState shape, plus optional
 * `project` to prefill from.
 */
interface ProjectFormProps {
  action: (state: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  project?: Project;
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

export default function ProjectForm({ action, project, submitLabel }: ProjectFormProps) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-8 max-w-2xl space-y-5">
      <Input
        id="title"
        name="title"
        label="Title"
        defaultValue={project?.title}
        required
      />
      <Input
        id="slug"
        name="slug"
        label="Slug"
        placeholder="my-project"
        defaultValue={project?.slug}
        required
      />
      <Textarea
        id="description"
        name="description"
        label="Description"
        rows={4}
        defaultValue={project?.description}
        required
      />
      <Select id="category" name="category" label="Category" defaultValue={project?.category} required>
        <option value="" disabled>
          Choose a category…
        </option>
        {PROJECT_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>
      <Input
        id="tags"
        name="tags"
        label="Tags"
        placeholder="React, FastAPI, EDR Ingest"
        defaultValue={project?.tags.join(", ")}
      />
      <p className="-mt-3 text-xs text-muted-foreground">Comma-separated.</p>
      <Input
        id="githubUrl"
        name="githubUrl"
        type="url"
        label="GitHub URL"
        placeholder="https://github.com/..."
        defaultValue={project?.githubUrl}
      />
      <ImageUploadField name="image" label="Project image" currentImageUrl={project?.imageUrl} />

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={project?.featured}
          className="focus-ring h-4 w-4 rounded border-border text-primary"
        />
        Featured on the homepage
      </label>

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

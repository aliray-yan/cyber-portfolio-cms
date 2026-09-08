import { z } from "zod";

/**
 * lib/validations/project.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Server-side validation for the project create/edit form. The form
 * itself relies on `required`/`type="url"` etc. for immediate feedback,
 * but this is the actual source of truth — a request can always bypass
 * client-side HTML validation.
 */
export const PROJECT_CATEGORIES = ["Security", "Development", "Research"] as const;

export const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only (e.g. my-project)."),
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().min(1, "Description is required."),
  category: z.enum(PROJECT_CATEGORIES, { message: "Choose a category." }),
  // Comma-separated in the form; split into a real array here.
  tags: z
    .string()
    .trim()
    .transform((value) =>
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  githubUrl: z
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value))
    .pipe(z.string().url("Enter a valid URL, or leave this blank.").optional()),
  featured: z.boolean(),
});

export type ProjectInput = z.infer<typeof projectSchema>;

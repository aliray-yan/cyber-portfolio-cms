import { z } from "zod";

export const blogPostSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only (e.g. my-post)."),
  title: z.string().trim().min(1, "Title is required."),
  date: z.string().trim().min(1, "Date is required."),
  excerpt: z.string().trim().min(1, "Excerpt is required."),
  content: z.string().trim(),
  tags: z
    .string()
    .trim()
    .transform((value) =>
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;

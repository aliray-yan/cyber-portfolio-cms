import { z } from "zod";

export const PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export const skillCategorySchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
});

export const skillSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  level: z.enum(PROFICIENCY_LEVELS, { message: "Choose a proficiency level." }),
});

export type SkillCategoryInput = z.infer<typeof skillCategorySchema>;
export type SkillInput = z.infer<typeof skillSchema>;

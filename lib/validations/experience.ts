import { z } from "zod";

export const experienceSchema = z.object({
  role: z.string().trim().min(1, "Role is required."),
  organization: z.string().trim().min(1, "Organization is required."),
  period: z.string().trim().min(1, "Period is required."),
  description: z.string().trim().min(1, "Description is required."),
});

export type ExperienceInput = z.infer<typeof experienceSchema>;

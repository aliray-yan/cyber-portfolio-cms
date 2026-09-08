import { z } from "zod";

export const certificationSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  issuer: z.string().trim().min(1, "Issuer is required."),
  year: z.string().trim().min(1, "Year is required."),
  credentialUrl: z
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value))
    .pipe(z.string().url("Enter a valid URL, or leave this blank.").optional()),
});

export type CertificationInput = z.infer<typeof certificationSchema>;

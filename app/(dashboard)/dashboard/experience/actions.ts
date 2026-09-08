"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin";
import { experienceSchema } from "@/lib/validations/experience";

export type ExperienceFormState = { error: string } | undefined;

function revalidateExperiencePaths() {
  revalidatePath("/dashboard/experience");
  revalidatePath("/dashboard");
  revalidatePath("/about");
}

export async function createExperienceAction(
  _prevState: ExperienceFormState,
  formData: FormData,
): Promise<ExperienceFormState> {
  await requireAdminSession();

  const parsed = experienceSchema.safeParse({
    role: formData.get("role"),
    organization: formData.get("organization"),
    period: formData.get("period"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const maxOrder = await prisma.experienceEntry.aggregate({ _max: { order: true } });

  await prisma.experienceEntry.create({
    data: { ...parsed.data, order: (maxOrder._max.order ?? -1) + 1 },
  });

  revalidateExperiencePaths();
  redirect("/dashboard/experience");
}

export async function updateExperienceAction(
  id: string,
  _prevState: ExperienceFormState,
  formData: FormData,
): Promise<ExperienceFormState> {
  await requireAdminSession();

  const parsed = experienceSchema.safeParse({
    role: formData.get("role"),
    organization: formData.get("organization"),
    period: formData.get("period"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await prisma.experienceEntry.update({ where: { id }, data: parsed.data });

  revalidateExperiencePaths();
  redirect("/dashboard/experience");
}

export async function deleteExperienceAction(id: string) {
  await requireAdminSession();
  await prisma.experienceEntry.delete({ where: { id } });
  revalidateExperiencePaths();
}

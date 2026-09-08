"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin";
import { skillCategorySchema, skillSchema } from "@/lib/validations/skill";

export type SkillCategoryFormState = { error: string } | undefined;
export type SkillFormState = { error: string } | undefined;

function revalidateSkillPaths() {
  revalidatePath("/dashboard/skills");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath("/skills");
}

// ─────────────────────────── Categories ───────────────────────────

export async function createCategoryAction(
  _prevState: SkillCategoryFormState,
  formData: FormData,
): Promise<SkillCategoryFormState> {
  await requireAdminSession();

  const parsed = skillCategorySchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const existing = await prisma.skillCategory.findUnique({ where: { title: parsed.data.title } });
  if (existing) {
    return { error: `A category named "${parsed.data.title}" already exists.` };
  }

  const maxOrder = await prisma.skillCategory.aggregate({ _max: { order: true } });
  const category = await prisma.skillCategory.create({
    data: { title: parsed.data.title, order: (maxOrder._max.order ?? -1) + 1 },
  });

  revalidateSkillPaths();
  redirect(`/dashboard/skills/${category.id}`);
}

export async function updateCategoryAction(
  id: string,
  _prevState: SkillCategoryFormState,
  formData: FormData,
): Promise<SkillCategoryFormState> {
  await requireAdminSession();

  const parsed = skillCategorySchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const current = await prisma.skillCategory.findUnique({ where: { id } });
  if (!current) return { error: "This category no longer exists." };

  if (parsed.data.title !== current.title) {
    const titleTaken = await prisma.skillCategory.findUnique({ where: { title: parsed.data.title } });
    if (titleTaken) return { error: `A category named "${parsed.data.title}" already exists.` };
  }

  await prisma.skillCategory.update({ where: { id }, data: { title: parsed.data.title } });

  revalidateSkillPaths();
  redirect(`/dashboard/skills/${id}`);
}

export async function deleteCategoryAction(id: string) {
  await requireAdminSession();
  // onDelete: Cascade on Skill.category (see schema.prisma) removes every
  // skill in this category along with it — no separate cleanup needed.
  await prisma.skillCategory.delete({ where: { id } });
  revalidateSkillPaths();
}

// ─────────────────────────────── Skills ───────────────────────────────

export async function createSkillAction(
  categoryId: string,
  _prevState: SkillFormState,
  formData: FormData,
): Promise<SkillFormState> {
  await requireAdminSession();

  const parsed = skillSchema.safeParse({ name: formData.get("name"), level: formData.get("level") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const maxOrder = await prisma.skill.aggregate({
    where: { categoryId },
    _max: { order: true },
  });

  await prisma.skill.create({
    data: { ...parsed.data, categoryId, order: (maxOrder._max.order ?? -1) + 1 },
  });

  revalidateSkillPaths();
  redirect(`/dashboard/skills/${categoryId}`);
}

export async function updateSkillAction(
  categoryId: string,
  skillId: string,
  _prevState: SkillFormState,
  formData: FormData,
): Promise<SkillFormState> {
  await requireAdminSession();

  const parsed = skillSchema.safeParse({ name: formData.get("name"), level: formData.get("level") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await prisma.skill.update({ where: { id: skillId }, data: parsed.data });

  revalidateSkillPaths();
  redirect(`/dashboard/skills/${categoryId}`);
}

export async function deleteSkillAction(categoryId: string, skillId: string) {
  await requireAdminSession();
  await prisma.skill.delete({ where: { id: skillId } });
  revalidateSkillPaths();
}

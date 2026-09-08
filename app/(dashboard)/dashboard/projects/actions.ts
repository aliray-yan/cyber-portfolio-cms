"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin";
import { uploadImage, ImageUploadError } from "@/lib/cloudinary";
import { projectSchema, type ProjectInput } from "@/lib/validations/project";

/**
 * app/(dashboard)/dashboard/projects/actions.ts
 * ─────────────────────────────────────────────────────────────────────────
 * revalidatePath covers both the dashboard list (so a create/edit/delete
 * shows up there immediately) and every public route that reads projects
 * (home's featured section, /projects, /projects/[slug]) — the public
 * pages are already `force-dynamic` (see app/(public)/layout.tsx) so they
 * always hit the database fresh regardless, but revalidating the
 * dashboard's own cache still matters since Server Component fetches can
 * be cached within a single render pass.
 */
function revalidateProjectPaths(slug?: string) {
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath("/projects");
  if (slug) revalidatePath(`/projects/${slug}`);
}

export type ProjectFormState = { error: string } | undefined;

type ParsedProjectForm =
  | { error: string }
  | { data: ProjectInput; imageUrl: string | undefined };

async function parseProjectForm(formData: FormData): Promise<ParsedProjectForm> {
  const parsed = projectSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    tags: formData.get("tags") ?? "",
    githubUrl: formData.get("githubUrl") ?? "",
    featured: formData.get("featured") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." } as const;
  }

  const imageFile = formData.get("image");
  let imageUrl: string | undefined;
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imageUrl = await uploadImage(imageFile, "projects");
    } catch (error) {
      const message = error instanceof ImageUploadError ? error.message : "Image upload failed.";
      return { error: message } as const;
    }
  }

  return { data: parsed.data, imageUrl } as const;
}

export async function createProjectAction(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdminSession();

  const parsed = await parseProjectForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const existing = await prisma.project.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return { error: `A project with the slug "${parsed.data.slug}" already exists.` };
  }

  const maxOrder = await prisma.project.aggregate({ _max: { order: true } });

  await prisma.project.create({
    data: {
      slug: parsed.data.slug,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      tags: parsed.data.tags,
      githubUrl: parsed.data.githubUrl ?? null,
      imageUrl: parsed.imageUrl ?? null,
      featured: parsed.data.featured,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidateProjectPaths(parsed.data.slug);
  redirect("/dashboard/projects");
}

export async function updateProjectAction(
  id: string,
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdminSession();

  const current = await prisma.project.findUnique({ where: { id } });
  if (!current) return { error: "This project no longer exists." };

  const parsed = await parseProjectForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  if (parsed.data.slug !== current.slug) {
    const slugTaken = await prisma.project.findUnique({ where: { slug: parsed.data.slug } });
    if (slugTaken) {
      return { error: `A project with the slug "${parsed.data.slug}" already exists.` };
    }
  }

  await prisma.project.update({
    where: { id },
    data: {
      slug: parsed.data.slug,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      tags: parsed.data.tags,
      githubUrl: parsed.data.githubUrl ?? null,
      // Only overwrite the image if a new one was uploaded — otherwise
      // leave the existing one alone. There's no "remove image" control
      // yet; replacing is upload-a-new-one only for now.
      ...(parsed.imageUrl ? { imageUrl: parsed.imageUrl } : {}),
      featured: parsed.data.featured,
    },
  });

  revalidateProjectPaths(current.slug);
  if (parsed.data.slug !== current.slug) revalidateProjectPaths(parsed.data.slug);
  redirect("/dashboard/projects");
}

export async function deleteProjectAction(id: string) {
  await requireAdminSession();

  const project = await prisma.project.delete({ where: { id } });

  revalidateProjectPaths(project.slug);
}

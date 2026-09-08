"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin";
import { uploadImage, ImageUploadError } from "@/lib/cloudinary";
import { blogPostSchema, type BlogPostInput } from "@/lib/validations/blog";

export type BlogPostFormState = { error: string } | undefined;

function revalidateBlogPaths(slug?: string) {
  revalidatePath("/dashboard/blog");
  revalidatePath("/dashboard");
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

type ParsedBlogForm = { error: string } | { data: BlogPostInput; imageUrl: string | undefined };

async function parseBlogForm(formData: FormData): Promise<ParsedBlogForm> {
  const parsed = blogPostSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    date: formData.get("date"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content") ?? "",
    tags: formData.get("tags") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const imageFile = formData.get("coverImage");
  let imageUrl: string | undefined;
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imageUrl = await uploadImage(imageFile, "blog");
    } catch (error) {
      const message = error instanceof ImageUploadError ? error.message : "Image upload failed.";
      return { error: message };
    }
  }

  return { data: parsed.data, imageUrl };
}

export async function createBlogPostAction(
  _prevState: BlogPostFormState,
  formData: FormData,
): Promise<BlogPostFormState> {
  await requireAdminSession();

  const parsed = await parseBlogForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const existing = await prisma.blogPost.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { error: `A post with the slug "${parsed.data.slug}" already exists.` };

  await prisma.blogPost.create({
    data: {
      slug: parsed.data.slug,
      title: parsed.data.title,
      date: new Date(parsed.data.date),
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      tags: parsed.data.tags,
      coverImageUrl: parsed.imageUrl ?? null,
    },
  });

  revalidateBlogPaths(parsed.data.slug);
  redirect("/dashboard/blog");
}

export async function updateBlogPostAction(
  id: string,
  _prevState: BlogPostFormState,
  formData: FormData,
): Promise<BlogPostFormState> {
  await requireAdminSession();

  const current = await prisma.blogPost.findUnique({ where: { id } });
  if (!current) return { error: "This post no longer exists." };

  const parsed = await parseBlogForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  if (parsed.data.slug !== current.slug) {
    const slugTaken = await prisma.blogPost.findUnique({ where: { slug: parsed.data.slug } });
    if (slugTaken) return { error: `A post with the slug "${parsed.data.slug}" already exists.` };
  }

  await prisma.blogPost.update({
    where: { id },
    data: {
      slug: parsed.data.slug,
      title: parsed.data.title,
      date: new Date(parsed.data.date),
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      tags: parsed.data.tags,
      // Only overwrite the cover image if a new one was uploaded — same
      // reasoning as updateProjectAction in the projects resource.
      ...(parsed.imageUrl ? { coverImageUrl: parsed.imageUrl } : {}),
    },
  });

  revalidateBlogPaths(current.slug);
  if (parsed.data.slug !== current.slug) revalidateBlogPaths(parsed.data.slug);
  redirect("/dashboard/blog");
}

export async function deleteBlogPostAction(id: string) {
  await requireAdminSession();
  const post = await prisma.blogPost.delete({ where: { id } });
  revalidateBlogPaths(post.slug);
}

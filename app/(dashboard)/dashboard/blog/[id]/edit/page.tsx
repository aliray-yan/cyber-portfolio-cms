import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import BlogPostForm from "@/components/dashboard/BlogPostForm";
import { getPostById } from "@/lib/data/blog";
import { updateBlogPostAction } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Blog Post",
};

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <PageHeader title="Edit Blog Post" size="panel" />
      <BlogPostForm action={updateBlogPostAction.bind(null, id)} post={post} submitLabel="Save Changes" />
    </div>
  );
}

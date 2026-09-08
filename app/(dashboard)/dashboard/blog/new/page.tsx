import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import BlogPostForm from "@/components/dashboard/BlogPostForm";
import { createBlogPostAction } from "../actions";

export const metadata: Metadata = {
  title: "New Blog Post",
};

export default function NewBlogPostPage() {
  return (
    <div>
      <PageHeader title="New Blog Post" size="panel" />
      <BlogPostForm action={createBlogPostAction} submitLabel="Publish Post" />
    </div>
  );
}

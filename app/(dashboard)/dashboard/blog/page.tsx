import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import LinkButton from "@/components/ui/LinkButton";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import DeleteButton from "@/components/dashboard/DeleteButton";
import { getAllBlogPosts } from "@/lib/data/blog";
import { deleteBlogPostAction } from "./actions";

export const metadata: Metadata = {
  title: "Manage Blog",
};

export default async function DashboardBlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div>
      <PageHeader
        title="Manage Blog"
        size="panel"
        action={<LinkButton href="/dashboard/blog/new">+ New Post</LinkButton>}
      />
      <div className="mt-10">
        {posts.length === 0 ? (
          <EmptyState message="No posts yet. Write your first one." />
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Card key={post.id} padding="sm" className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{post.title}</p>
                    {!post.content && <Badge variant="muted">Draft — no full write-up yet</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{post.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <LinkButton href={`/dashboard/blog/${post.id}/edit`} variant="outline" size="sm">
                    Edit
                  </LinkButton>
                  <DeleteButton
                    action={deleteBlogPostAction.bind(null, post.id)}
                    confirmMessage={`Delete "${post.title}"? This can't be undone.`}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

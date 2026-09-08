import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import CardLink from "@/components/ui/CardLink";
import Badge from "@/components/ui/Badge";
import { getAllBlogPosts } from "@/lib/data/blog";

export const metadata: Metadata = {
  title: "Blog | Cyber Portfolio CMS",
  description: "CTF solutions, security research, and technical tutorials.",
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <PageHeader
        title="Blog & Write-ups"
        subtitle="CTF solutions, security research, and technical tutorials."
      />

      <div className="mt-10 space-y-6">
        {posts.map((post) => (
          <CardLink key={post.slug} href={`/blog/${post.slug}`}>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{post.date}</span>
              {post.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
            <h2 className="mt-3 text-lg font-semibold text-foreground">
              {post.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
          </CardLink>
        ))}
      </div>
    </div>
  );
}

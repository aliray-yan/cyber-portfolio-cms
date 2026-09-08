import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import PlaceholderBanner from "@/components/ui/PlaceholderBanner";
import { getPostBySlug } from "@/lib/data/blog";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs font-medium uppercase tracking-wide text-primary">Article</p>
      <PageHeader title={post.title} className="mt-2" />

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{post.date}</span>
        {post.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>

      <article className="mt-10 max-w-none leading-relaxed text-muted-foreground">
        {post.content ? (
          <p className="whitespace-pre-line">{post.content}</p>
        ) : (
          <>
            <p>{post.excerpt}</p>
            <div className="mt-8">
              <PlaceholderBanner
                message="The full write-up for this post hasn't been published yet."
                phase="Phase 5"
              />
            </div>
          </>
        )}
      </article>
    </div>
  );
}

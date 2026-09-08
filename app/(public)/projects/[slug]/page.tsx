import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import LinkButton from "@/components/ui/LinkButton";
import { getProjectBySlug } from "@/lib/data/projects";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-mono text-xs font-medium uppercase tracking-wide text-primary">Project</p>
      <PageHeader
        title={project.title}
        className="mt-2"
        action={
          project.githubUrl && (
            <LinkButton href={project.githubUrl} external variant="outline">
              View on GitHub
            </LinkButton>
          )
        }
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge>{project.category}</Badge>
        {project.tags.map((tag) => (
          <Badge key={tag} variant="muted">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="font-mono text-xs font-medium uppercase tracking-wide text-primary">Overview</h2>
          <p className="mt-2 text-muted-foreground">{project.description}</p>
        </section>

        <section>
          <h2 className="font-mono text-xs font-medium uppercase tracking-wide text-primary">Tech Stack</h2>
          <p className="mt-2 text-muted-foreground">{project.tags.join(", ")}</p>
        </section>

        <section>
          <h2 className="font-mono text-xs font-medium uppercase tracking-wide text-primary">Links</h2>
          {project.githubUrl ? (
            <LinkButton href={project.githubUrl} external variant="outline" className="mt-2">
              GitHub Repository
            </LinkButton>
          ) : (
            <p className="mt-2 text-muted-foreground">
              No public repository link for this project yet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

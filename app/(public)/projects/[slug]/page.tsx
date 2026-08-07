import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import LinkButton from "@/components/ui/LinkButton";
import PlaceholderBanner from "@/components/ui/PlaceholderBanner";
import { getProjectBySlug } from "@/lib/data/projects";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-mono text-sm text-cyan-400">Project</p>
      <PageHeader
        title={project?.title ?? slug}
        className="mt-2"
        action={
          project?.githubUrl && (
            <LinkButton href={project.githubUrl} external variant="outline">
              View on GitHub
            </LinkButton>
          )
        }
      />

      {project && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>{project.category}</Badge>
          {project.tags.map((tag) => (
            <Badge key={tag} variant="muted">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-8">
        <PlaceholderBanner
          message="Full project details coming in Phase 3 when database is connected."
          phase="Phase 3"
        />
      </div>

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="font-mono text-sm text-cyan-400">Overview</h2>
          <p className="mt-2 text-slate-400">
            {project?.description ??
              "A high-level summary of the project will appear here once content is sourced from the database."}
          </p>
        </section>

        <section>
          <h2 className="font-mono text-sm text-cyan-400">Problem</h2>
          <p className="mt-2 text-slate-400">
            The problem this project set out to solve will be described here.
          </p>
        </section>

        <section>
          <h2 className="font-mono text-sm text-cyan-400">Solution</h2>
          <p className="mt-2 text-slate-400">
            The approach taken to solve the problem will be described here.
          </p>
        </section>

        <section>
          <h2 className="font-mono text-sm text-cyan-400">Tech Stack</h2>
          <p className="mt-2 text-slate-400">
            {project ? project.tags.join(", ") : "Technologies used in this project will be listed here."}
          </p>
        </section>

        <section>
          <h2 className="font-mono text-sm text-cyan-400">Links</h2>
          {project?.githubUrl ? (
            <LinkButton href={project.githubUrl} external variant="outline" className="mt-2">
              GitHub Repository
            </LinkButton>
          ) : (
            <p className="mt-2 text-slate-400">
              GitHub repository and live demo links will appear here.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Image from "next/image";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LinkButton from "@/components/ui/LinkButton";
import { getAllProjects } from "@/lib/data/projects";

export const metadata: Metadata = buildMetadata({
  title: "Projects",
  description: "Security tools, development projects, and research work.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <PageHeader
        title="Projects"
        subtitle="Security tools, development projects, and research work."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.slug} interactive className="flex flex-col">
            {project.imageUrl && (
              <div className="relative -mx-6 -mt-6 mb-4 h-40 overflow-hidden rounded-t-xl">
                <Image
                  src={project.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            )}
            <Badge className="w-fit">{project.category}</Badge>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              {project.title}
            </h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">
              {project.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="muted">
                  {tag}
                </Badge>
              ))}
            </div>
            <LinkButton
              href={`/projects/${project.slug}`}
              variant="outline"
              className="mt-6"
              fullWidth
            >
              View Details &rarr;
            </LinkButton>
          </Card>
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import LinkButton from "@/components/ui/LinkButton";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import DeleteButton from "@/components/dashboard/DeleteButton";
import { getAllProjects } from "@/lib/data/projects";
import { deleteProjectAction } from "./actions";

export const metadata: Metadata = {
  title: "Manage Projects",
};

export default async function DashboardProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div>
      <PageHeader
        title="Manage Projects"
        size="panel"
        action={<LinkButton href="/dashboard/projects/new">+ Add Project</LinkButton>}
      />

      <div className="mt-10">
        {projects.length === 0 ? (
          <EmptyState message="No projects yet. Add your first one." />
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <Card key={project.id} padding="sm" className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{project.title}</p>
                    <Badge variant={project.featured ? "accent" : "muted"}>
                      {project.featured ? "Featured" : project.category}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">/{project.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <LinkButton href={`/dashboard/projects/${project.id}/edit`} variant="outline" size="sm">
                    Edit
                  </LinkButton>
                  <DeleteButton
                    action={deleteProjectAction.bind(null, project.id)}
                    confirmMessage={`Delete "${project.title}"? This can't be undone.`}
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

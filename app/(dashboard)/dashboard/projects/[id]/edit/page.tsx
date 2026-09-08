import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import ProjectForm from "@/components/dashboard/ProjectForm";
import { getProjectById } from "@/lib/data/projects";
import { updateProjectAction } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Project",
};

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <div>
      <PageHeader title="Edit Project" size="panel" />
      <ProjectForm
        action={updateProjectAction.bind(null, id)}
        project={project}
        submitLabel="Save Changes"
      />
    </div>
  );
}

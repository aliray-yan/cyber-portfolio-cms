import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import ProjectForm from "@/components/dashboard/ProjectForm";
import { createProjectAction } from "../actions";

export const metadata: Metadata = {
  title: "New Project",
};

export default function NewProjectPage() {
  return (
    <div>
      <PageHeader title="New Project" size="panel" />
      <ProjectForm action={createProjectAction} submitLabel="Create Project" />
    </div>
  );
}

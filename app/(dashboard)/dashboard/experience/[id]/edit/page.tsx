import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import ExperienceForm from "@/components/dashboard/ExperienceForm";
import { getExperienceById } from "@/lib/data/experience";
import { updateExperienceAction } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Experience Entry",
};

interface EditExperiencePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExperiencePage({ params }: EditExperiencePageProps) {
  const { id } = await params;
  const entry = await getExperienceById(id);

  if (!entry) {
    notFound();
  }

  return (
    <div>
      <PageHeader title="Edit Experience Entry" size="panel" />
      <ExperienceForm action={updateExperienceAction.bind(null, id)} entry={entry} submitLabel="Save Changes" />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import LinkButton from "@/components/ui/LinkButton";
import SkillForm from "@/components/dashboard/SkillForm";
import { getSkillCategoryById } from "@/lib/data/skills";
import { updateSkillAction } from "../../../../actions";

export const metadata: Metadata = {
  title: "Edit Skill",
};

interface EditSkillPageProps {
  params: Promise<{ id: string; skillId: string }>;
}

export default async function EditSkillPage({ params }: EditSkillPageProps) {
  const { id, skillId } = await params;
  const category = await getSkillCategoryById(id);
  const skill = category?.skills.find((s) => s.id === skillId);

  if (!category || !skill) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={`Edit Skill — ${category.title}`}
        size="panel"
        action={
          <LinkButton href={`/dashboard/skills/${id}`} variant="outline">
            ← Back
          </LinkButton>
        }
      />
      <div className="mt-8 max-w-xl">
        <SkillForm action={updateSkillAction.bind(null, id, skillId)} skill={skill} submitLabel="Save Changes" />
      </div>
    </div>
  );
}

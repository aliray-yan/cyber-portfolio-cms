import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import LinkButton from "@/components/ui/LinkButton";
import DeleteButton from "@/components/dashboard/DeleteButton";
import SkillCategoryForm from "@/components/dashboard/SkillCategoryForm";
import SkillForm from "@/components/dashboard/SkillForm";
import { getSkillCategoryById } from "@/lib/data/skills";
import { updateCategoryAction, createSkillAction, deleteSkillAction } from "../actions";

export const metadata: Metadata = {
  title: "Manage Skill Category",
};

interface SkillCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function SkillCategoryPage({ params }: SkillCategoryPageProps) {
  const { id } = await params;
  const category = await getSkillCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={category.title}
        size="panel"
        action={
          <LinkButton href="/dashboard/skills" variant="outline">
            ← All Categories
          </LinkButton>
        }
      />

      <Card className="mt-8 max-w-xl">
        <h2 className="font-mono text-xs font-medium uppercase tracking-wide text-primary">Rename Category</h2>
        <div className="mt-4">
          <SkillCategoryForm
            action={updateCategoryAction.bind(null, id)}
            defaultTitle={category.title}
            submitLabel="Save"
          />
        </div>
      </Card>

      <div className="mt-8">
        <h2 className="font-mono text-xs font-medium uppercase tracking-wide text-primary">Skills</h2>
        <div className="mt-4">
          {category.skills.length === 0 ? (
            <EmptyState message="No skills in this category yet." />
          ) : (
            <div className="space-y-3">
              {category.skills.map((skill) => (
                <Card key={skill.id} padding="sm" className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{skill.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{skill.level}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkButton href={`/dashboard/skills/${id}/skills/${skill.id}/edit`} variant="outline" size="sm">
                      Edit
                    </LinkButton>
                    <DeleteButton
                      action={deleteSkillAction.bind(null, id, skill.id)}
                      confirmMessage={`Delete "${skill.name}"?`}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Card className="mt-8 max-w-xl">
        <h2 className="font-mono text-xs font-medium uppercase tracking-wide text-primary">Add a Skill</h2>
        <div className="mt-4">
          <SkillForm action={createSkillAction.bind(null, id)} submitLabel="Add Skill" />
        </div>
      </Card>
    </div>
  );
}

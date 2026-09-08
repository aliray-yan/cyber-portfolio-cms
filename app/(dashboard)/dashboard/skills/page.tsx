import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import LinkButton from "@/components/ui/LinkButton";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import DeleteButton from "@/components/dashboard/DeleteButton";
import { getSkillCategories } from "@/lib/data/skills";
import { deleteCategoryAction } from "./actions";

export const metadata: Metadata = {
  title: "Manage Skills",
};

export default async function DashboardSkillsPage() {
  const categories = await getSkillCategories();

  return (
    <div>
      <PageHeader
        title="Manage Skills"
        size="panel"
        action={<LinkButton href="/dashboard/skills/new">+ Add Category</LinkButton>}
      />
      <div className="mt-10">
        {categories.length === 0 ? (
          <EmptyState message="No skill categories yet. Add your first one." />
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <Card key={category.id} padding="sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="font-medium text-foreground">{category.title}</p>
                  <div className="flex items-center gap-2">
                    <LinkButton href={`/dashboard/skills/${category.id}`} variant="outline" size="sm">
                      Manage
                    </LinkButton>
                    <DeleteButton
                      action={deleteCategoryAction.bind(null, category.id)}
                      confirmMessage={`Delete "${category.title}" and all ${category.skills.length} of its skills? This can't be undone.`}
                    />
                  </div>
                </div>
                {category.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <Badge key={skill.id} variant="muted">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

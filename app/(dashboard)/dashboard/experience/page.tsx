import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import LinkButton from "@/components/ui/LinkButton";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import DeleteButton from "@/components/dashboard/DeleteButton";
import { getExperience } from "@/lib/data/experience";
import { deleteExperienceAction } from "./actions";

export const metadata: Metadata = {
  title: "Manage Experience",
};

export default async function DashboardExperiencePage() {
  const entries = await getExperience();

  return (
    <div>
      <PageHeader
        title="Manage Experience"
        size="panel"
        action={<LinkButton href="/dashboard/experience/new">+ Add Entry</LinkButton>}
      />
      <div className="mt-10">
        {entries.length === 0 ? (
          <EmptyState message="No experience entries yet. Add your first one." />
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <Card key={entry.id} padding="sm" className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{entry.role}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {entry.organization} · {entry.period}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <LinkButton href={`/dashboard/experience/${entry.id}/edit`} variant="outline" size="sm">
                    Edit
                  </LinkButton>
                  <DeleteButton
                    action={deleteExperienceAction.bind(null, entry.id)}
                    confirmMessage={`Delete "${entry.role}"? This can't be undone.`}
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

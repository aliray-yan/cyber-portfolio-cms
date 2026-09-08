import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import LinkButton from "@/components/ui/LinkButton";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import DeleteButton from "@/components/dashboard/DeleteButton";
import { getAllCertifications } from "@/lib/data/certifications";
import { deleteCertificationAction } from "./actions";

export const metadata: Metadata = {
  title: "Manage Certifications",
};

export default async function DashboardCertificationsPage() {
  const certifications = await getAllCertifications();

  return (
    <div>
      <PageHeader
        title="Manage Certifications"
        size="panel"
        action={<LinkButton href="/dashboard/certifications/new">+ Add Certification</LinkButton>}
      />
      <div className="mt-10">
        {certifications.length === 0 ? (
          <EmptyState message="No certifications yet. Add your first one." />
        ) : (
          <div className="space-y-3">
            {certifications.map((cert) => (
              <Card key={cert.id} padding="sm" className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{cert.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {cert.issuer} · {cert.year}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <LinkButton href={`/dashboard/certifications/${cert.id}/edit`} variant="outline" size="sm">
                    Edit
                  </LinkButton>
                  <DeleteButton
                    action={deleteCertificationAction.bind(null, cert.id)}
                    confirmMessage={`Delete "${cert.name}"? This can't be undone.`}
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

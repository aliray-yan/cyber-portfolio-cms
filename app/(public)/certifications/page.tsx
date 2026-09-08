import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { getAllCertifications } from "@/lib/data/certifications";

export const metadata: Metadata = buildMetadata({
  title: "Certifications",
  description: "Professional development and verified credentials.",
  path: "/certifications",
});

export default async function CertificationsPage() {
  const certifications = await getAllCertifications();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <PageHeader
        title="Certifications"
        subtitle="Professional development and verified credentials."
      />

      <div className="mt-10 space-y-4">
        {certifications.map((cert) => (
          <Card key={cert.name}>
            <p className="font-semibold text-foreground">{cert.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Issuer: {cert.issuer} &middot; Completed: {cert.year}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

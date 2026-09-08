import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import CertificationForm from "@/components/dashboard/CertificationForm";
import { getCertificationById } from "@/lib/data/certifications";
import { updateCertificationAction } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Certification",
};

interface EditCertificationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCertificationPage({ params }: EditCertificationPageProps) {
  const { id } = await params;
  const certification = await getCertificationById(id);

  if (!certification) {
    notFound();
  }

  return (
    <div>
      <PageHeader title="Edit Certification" size="panel" />
      <CertificationForm
        action={updateCertificationAction.bind(null, id)}
        certification={certification}
        submitLabel="Save Changes"
      />
    </div>
  );
}

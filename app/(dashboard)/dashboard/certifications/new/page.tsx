import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import CertificationForm from "@/components/dashboard/CertificationForm";
import { createCertificationAction } from "../actions";

export const metadata: Metadata = {
  title: "New Certification",
};

export default function NewCertificationPage() {
  return (
    <div>
      <PageHeader title="New Certification" size="panel" />
      <CertificationForm action={createCertificationAction} submitLabel="Add Certification" />
    </div>
  );
}

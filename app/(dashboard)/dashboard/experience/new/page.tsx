import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import ExperienceForm from "@/components/dashboard/ExperienceForm";
import { createExperienceAction } from "../actions";

export const metadata: Metadata = {
  title: "New Experience Entry",
};

export default function NewExperiencePage() {
  return (
    <div>
      <PageHeader title="New Experience Entry" size="panel" />
      <ExperienceForm action={createExperienceAction} submitLabel="Add Entry" />
    </div>
  );
}

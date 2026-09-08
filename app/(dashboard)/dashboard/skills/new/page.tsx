import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import SkillCategoryForm from "@/components/dashboard/SkillCategoryForm";
import { createCategoryAction } from "../actions";

export const metadata: Metadata = {
  title: "New Skill Category",
};

export default function NewSkillCategoryPage() {
  return (
    <div>
      <PageHeader title="New Skill Category" size="panel" />
      <div className="mt-8 max-w-xl">
        <SkillCategoryForm action={createCategoryAction} submitLabel="Create Category" />
      </div>
    </div>
  );
}

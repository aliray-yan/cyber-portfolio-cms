import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import LinkButton from "@/components/ui/LinkButton";
import { getAllProjects } from "@/lib/data/projects";
import { getAllBlogPosts } from "@/lib/data/blog";
import { getAllCertifications } from "@/lib/data/certifications";
import { getSkillCategories } from "@/lib/data/skills";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const [projects, posts, certifications, skillCategories] = await Promise.all([
    getAllProjects(),
    getAllBlogPosts(),
    getAllCertifications(),
    getSkillCategories(),
  ]);

  const skillCount = skillCategories.reduce((total, category) => total + category.skills.length, 0);

  const stats = [
    { label: "Projects", value: projects.length },
    { label: "Blog Posts", value: posts.length },
    { label: "Certifications", value: certifications.length },
    { label: "Skills", value: skillCount },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" size="panel" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <LinkButton href="/dashboard/projects/new" variant="outline">
          + New Project
        </LinkButton>
        <LinkButton href="/dashboard/blog/new" variant="outline">
          + New Post
        </LinkButton>
      </div>
    </div>
  );
}

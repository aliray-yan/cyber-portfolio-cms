import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

// Applies to every /dashboard/* page below (none of them override
// `robots` themselves) — admin screens have no business in a search
// index, on top of already being auth-gated. Backed up by the Disallow
// rule in app/robots.ts; this covers the (unlikely, but free to prevent)
// case of a crawler that ignores robots.txt but respects the meta tag.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middleware.ts already gates /dashboard/* — this is defense in depth,
  // not the primary check. Rendering sensitive layout (the sidebar's admin
  // email, whatever CMS content lands here in Phase 5) should never depend
  // on a single check succeeding.
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <DashboardSidebar adminEmail={session.user.email ?? "Admin"} />
      <div className="flex-1">
        <main className="px-6 py-10 md:px-10">{children}</main>
      </div>
    </div>
  );
}

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";

/**
 * Every page in this route group reads live from Postgres (lib/data/*.ts,
 * Phase 3). Without this, Next would statically prerender them at build
 * time and freeze that content until the next deploy — defeating the
 * point of a CMS whose whole promise is that an edit shows up on the live
 * site immediately. Set once here rather than repeated per page: this
 * `dynamic` export cascades to every route nested under (public),
 * including ones added later.
 */
export const dynamic = "force-dynamic";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

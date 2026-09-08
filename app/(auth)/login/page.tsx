import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SITE_NAME } from "@/lib/constants";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Login | Cyber Portfolio CMS",
  description: "Sign in to manage your portfolio content.",
};

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-xl border border-border/70 bg-card p-8 shadow-sm shadow-black/3 dark:shadow-black/20">
        <p className="font-mono text-xs font-medium uppercase tracking-wide text-primary">{SITE_NAME}</p>
        <h1 className="font-display mt-2 text-2xl font-semibold text-foreground">
          Admin Login
        </h1>

        <LoginForm />
      </div>
    </div>
  );
}

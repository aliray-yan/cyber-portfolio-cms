import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import ContactForm from "@/components/contact/ContactForm";
import { GITHUB_URL, LINKEDIN_URL, SITE_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact | Cyber Portfolio CMS",
  description: "Get in touch.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <PageHeader title="Contact" />

      <div className="mt-8 flex flex-wrap gap-6 text-sm">
        <a
          href={`mailto:${SITE_EMAIL}`}
          className="focus-ring rounded text-primary hover:underline"
        >
          {SITE_EMAIL}
        </a>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring rounded text-muted-foreground hover:text-primary"
        >
          LinkedIn
        </a>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring rounded text-muted-foreground hover:text-primary"
        >
          GitHub
        </a>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Typical response time: within 2–3 business days.
      </p>

      <ContactForm />
    </div>
  );
}

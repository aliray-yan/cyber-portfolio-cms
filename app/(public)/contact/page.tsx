import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
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
          className="focus-ring rounded text-cyan-400 hover:underline"
        >
          {SITE_EMAIL}
        </a>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring rounded text-slate-400 hover:text-cyan-400"
        >
          LinkedIn
        </a>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring rounded text-slate-400 hover:text-cyan-400"
        >
          GitHub
        </a>
      </div>

      <p className="mt-4 text-sm text-slate-400">
        Typical response time: within 2–3 business days.
      </p>

      <form className="mt-10 space-y-5">
        <Input id="name" name="name" type="text" label="Name" disabled placeholder="Your name" />
        <Input id="email" name="email" type="email" label="Email" disabled placeholder="you@example.com" />
        <Input id="subject" name="subject" type="text" label="Subject" disabled placeholder="What's this about?" />
        <Textarea
          id="message"
          name="message"
          label="Message"
          rows={5}
          disabled
          placeholder="Your message"
        />

        <Button type="button" disabled fullWidth className="md:w-auto">
          Send Message
        </Button>

        <p className="text-xs text-slate-400">
          Form submission coming in a future phase.
        </p>
      </form>
    </div>
  );
}

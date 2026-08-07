import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import PlaceholderBanner from "@/components/ui/PlaceholderBanner";
import { EXPERIENCE } from "@/lib/data/experience";

export const metadata: Metadata = {
  title: "About | Cyber Portfolio CMS",
  description: "Professional background, education, and career goals.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <PageHeader title="About Me" />

      <section className="mt-10">
        <h2 className="font-mono text-sm text-cyan-400">
          Professional Summary
        </h2>
        <p className="mt-3 leading-relaxed text-slate-400">
          I&apos;m a software engineering student and aspiring cybersecurity
          professional with hands-on SOC, blue-team, threat research, and
          digital forensics experience. My strongest work combines
          investigation, documentation, automation, and clear reporting —
          turning technical findings into decisions someone can actually
          act on.
        </p>
        <p className="mt-3 leading-relaxed text-slate-400">
          I&apos;ve worked across Wazuh, FortiGate, Microsoft Sentinel, Sumo
          Logic, Elastic SIEM, Suricata, Nessus, Nmap, Autopsy, FTK Imager,
          Volatility 3, Tines, and n8n through internships, labs, and
          personal projects. This portfolio itself is part of that
          practice: a production-style platform built to demonstrate real
          engineering discipline, not just a tutorial exercise.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-mono text-sm text-cyan-400">Education</h2>
        <Card className="mt-3">
          <p className="font-semibold text-slate-100">
            BS Software Engineering
          </p>
          <p className="text-sm text-slate-400">
            Government College University Faisalabad (GCUF) &mdash; 2023–2027
          </p>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="font-mono text-sm text-cyan-400">Experience</h2>
        <div className="mt-3 space-y-4">
          {EXPERIENCE.map((entry) => (
            <Card key={`${entry.organization}-${entry.period}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-slate-100">
                  {entry.role} &middot; {entry.organization}
                </p>
                <p className="font-mono text-xs text-slate-400">
                  {entry.period}
                </p>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                {entry.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-mono text-sm text-cyan-400">Interests</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {["Cybersecurity", "Frontend Development", "Security Research"].map(
            (interest) => (
              <li
                key={interest}
                className="rounded bg-navy-800 px-3 py-1 text-sm text-slate-100"
              >
                {interest}
              </li>
            ),
          )}
        </ul>
      </section>

      <div className="mt-12">
        <PlaceholderBanner
          message="Content managed via CMS."
          phase="Phase 5"
        />
      </div>
    </div>
  );
}

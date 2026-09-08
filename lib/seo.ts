import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

/**
 * lib/seo.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Phase 6 — one place for the metadata every page needs: canonical URL,
 * OpenGraph, Twitter card. Falls back to the real deployed URL so
 * metadataBase always resolves to something valid even when
 * NEXT_PUBLIC_SITE_URL isn't set locally (see .env.example).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://cyber-portfolio-cms.vercel.app").replace(
  /\/$/,
  "",
);

interface PageMetadataInput {
  title: string;
  description: string;
  /** e.g. "/projects" — defaults to the homepage. */
  path?: string;
}

export function buildMetadata({ title, description, path = "/" }: PageMetadataInput): Metadata {
  const url = new URL(path, SITE_URL).toString();

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * JSON-LD Person schema for the homepage — helps search engines connect
 * this site to Ali as a person/professional (knowledge panel eligibility,
 * richer search snippets) rather than reading it as an anonymous
 * template site.
 */
export function buildPersonJsonLd({
  name,
  jobTitle,
  sameAs,
}: {
  name: string;
  jobTitle: string;
  sameAs: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle,
    url: SITE_URL,
    sameAs,
  };
}

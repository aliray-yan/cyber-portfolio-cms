import { ImageResponse } from "next/og";
import { SITE_OWNER, SITE_TAGLINE } from "@/lib/constants";

/**
 * app/opengraph-image.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Next.js's file-based convention: this renders automatically as the
 * `og:image`/Twitter card image for the homepage (and anywhere else that
 * doesn't define its own), no static asset or external image host needed.
 * Deliberately no custom font loading (no fetch(), no bundled font file)
 * — a system sans-serif keeps this dependency-free and avoids the request
 * ever failing because of a slow or unreachable font source.
 */
export const alt = `${SITE_OWNER} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0a0d13",
          backgroundImage: "radial-gradient(circle at 25px 25px, #1a2030 2px, transparent 0)",
          backgroundSize: "50px 50px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 500,
            color: "#7ea2ff",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Cyber Portfolio CMS
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 72,
            fontWeight: 600,
            color: "#e7eaf0",
          }}
        >
          {SITE_OWNER}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 36,
            color: "#9aa3b5",
          }}
        >
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    { ...size },
  );
}

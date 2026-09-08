import { ImageResponse } from "next/og";

/**
 * app/icon.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Next.js's file-based convention: this renders automatically as the
 * site's favicon. A plain monogram, not a static file — there's no
 * existing logo asset to work from, and a generated one is one less file
 * to keep in sync with the brand colors in app/globals.css.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1d4ed8",
          borderRadius: 7,
          color: "#ffffff",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        AR
      </div>
    ),
    { ...size },
  );
}

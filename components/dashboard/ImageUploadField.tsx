"use client";

import { useState } from "react";

/**
 * components/dashboard/ImageUploadField.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * A plain <input type="file">, styled, with a live preview — either the
 * existing image (editing) or the newly-picked file (createObjectURL,
 * revoked on the next change). The actual upload happens server-side in
 * the owning form's server action (see lib/cloudinary.ts) once the form
 * submits; this component never uploads anything itself.
 */
interface ImageUploadFieldProps {
  name: string;
  label: string;
  currentImageUrl?: string;
}

export default function ImageUploadField({ name, label, currentImageUrl }: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | undefined>(currentImageUrl);

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-foreground">
        {label}
      </label>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element -- local blob:/remote preview, not an optimizable static asset
        <img
          src={preview}
          alt=""
          className="mt-2 h-32 w-full max-w-xs rounded-lg border border-border object-cover"
        />
      )}

      <input
        id={name}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) setPreview(URL.createObjectURL(file));
        }}
        className="focus-ring mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
      />
      <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG, WebP, or GIF — up to 5MB.</p>
    </div>
  );
}

/**
 * lib/cloudinary.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Phase 5 — image upload for the CMS forms (project screenshots, blog
 * cover images). One helper, used from server actions only (never the
 * client) — `CLOUDINARY_API_SECRET` must never reach the browser.
 *
 * Uploads as a base64 data URI rather than streaming — simplest correct
 * option for a single-admin CMS uploading one image at a time from a
 * form; not the right call for a high-volume upload pipeline, but this
 * isn't one.
 */
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export class ImageUploadError extends Error {}

/**
 * Uploads one image file to Cloudinary and returns its secure (https) URL.
 * Throws ImageUploadError for anything a form should show back to the
 * admin (wrong file type, too large, missing config) — callers catch this
 * specifically to turn it into a field-level form error rather than a
 * generic 500.
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new ImageUploadError(
      "Image upload isn't configured yet — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new ImageUploadError("Please upload a JPEG, PNG, WebP, or GIF image.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ImageUploadError("Image is too large — please keep it under 5MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `cyber-portfolio-cms/${folder}`,
      resource_type: "image",
    });
    return result.secure_url;
  } catch (error) {
    console.error("[cloudinary] upload failed:", error);
    throw new ImageUploadError("Image upload failed. Please try again.");
  }
}

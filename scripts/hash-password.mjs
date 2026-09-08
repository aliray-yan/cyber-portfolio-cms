/**
 * scripts/hash-password.mjs
 * ─────────────────────────────────────────────────────────────────────────
 * One-off CLI helper for setting or changing the CMS admin password. Run:
 *
 *   npm run hash-password -- "your-new-password"
 *
 * and paste the printed hash into ADMIN_PASSWORD_HASH in .env.local (and,
 * for production, into Vercel's project environment variables). The
 * plaintext password itself is never stored anywhere — only this hash.
 *
 * Plain .mjs, not .ts: this is a standalone dev-time CLI script, not part
 * of the app or its test suite, so it doesn't need the project's
 * `--experimental-strip-types` setup — just something you run directly
 * with `node`.
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Usage: npm run hash-password -- \"your-new-password\"");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Pick a password with at least 8 characters.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);

console.log("\nADMIN_PASSWORD_HASH=" + hash + "\n");
console.log("Paste the line above into .env.local (and your production env vars).");

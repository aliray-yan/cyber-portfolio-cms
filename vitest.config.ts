import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * vitest.config.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Component-level tests only (React + jsdom). Deliberately scoped to
 * components/** and app/** — the existing lib/ai/*.test.ts unit tests keep
 * running on Node's own built-in test runner (see package.json's
 * "test:unit" script) and are excluded here so the two runners never both
 * pick up the same file.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["components/**/*.test.tsx", "app/**/*.test.tsx"],
    css: false,
  },
});

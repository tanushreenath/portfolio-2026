import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { imagetools } from "vite-imagetools";

// The six source paintings are ~14MB of PNG against a 2.2MB scene budget.
//
// They are never rewritten on disk. imagetools transforms them during the
// build, driven by query parameters at each import site (see
// src/assets/registry.ts), so `reference/` and `src/assets/objects/` stay
// byte-for-byte as delivered while the bundle ships WebP at the size each
// object is actually drawn.
export default defineConfig({
  plugins: [react(), imagetools()],
  build: {
    // Inlining would defeat the point; keep paintings separately cacheable.
    assetsInlineLimit: 0,
  },
});

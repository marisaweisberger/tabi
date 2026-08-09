import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// public/ (sw.js, manifest.json, icon.svg) is copied into dist/ as-is.
export default defineConfig({
  plugins: [react()],
});

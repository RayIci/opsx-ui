import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// The web app lives in src/web and is built into dist/web, which the
// production server serves statically. In dev, Vite proxies /api and /ws
// to the local opsx-ui server.
export default defineConfig({
  root: path.resolve(rootDir, "src/web"),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src/web"),
      "@shared": path.resolve(rootDir, "src/shared"),
    },
  },
  build: {
    outDir: path.resolve(rootDir, "dist/web"),
    emptyOutDir: true,
  },
  server: {
    port: 5273,
    proxy: {
      "/api": "http://localhost:4573",
      "/ws": { target: "ws://localhost:4573", ws: true },
    },
  },
});

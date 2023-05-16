import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
  ],
  server: { host: true },
  define: { "process.env": {} },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    base: "/",
    minify: true,
    chunkSizeWarningLimit: 1500,
  },
  mode: "production",
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react":  ["react", "react-dom", "react-router-dom"],
          "vendor-motion": ["motion/react"],
          "vendor-i18n":   ["i18next", "react-i18next", "i18next-browser-languagedetector"],
          "vendor-db":     ["dexie"],
          "vendor-store":  ["zustand"],
        },
      },
    },
  },
  server: {
    proxy: {
      "/api/v4": {
        target: "https://linkskool.net",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});

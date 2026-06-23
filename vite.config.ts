import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "icon-192.png",
        "icon-512.png",
        "icon-maskable-512.png",
      ],
      manifest: {
        name: "TriviaX — Become a Millionaire Champion",
        short_name: "TriviaX",
        description:
          "Challenge your knowledge, answer exciting trivia questions, climb the leaderboards, unlock new levels, compete in daily challenges, and prove you have what it takes to become a Millionaire Champion. Play now and see how far your intelligence can take you!",
        theme_color: "#070A1A",
        background_color: "#04060d",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        // Large, crawler/social-only assets — ship them but keep them out of the
        // offline precache to keep the service worker lean.
        globIgnores: ["**/logo.png", "**/og-image.png"],
        // Largest chunk is ~360 kB; raise the cap so it precaches for offline.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // Serve the cached app shell for every navigation so client-side routes
        // (bookmarks, reloads, direct URLs) work offline.
        navigateFallback: "index.html",
        // Don't apply the navigation fallback to the API or to file requests.
        navigateFallbackDenylist: [/^\/api\//, /\.[a-z]{2,4}$/i],
        runtimeCaching: [
          {
            // Trivia API — keep data fresh but fall back to cache when offline.
            urlPattern: /^https:\/\/linkskool\.net\/api\/v4\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Remote images/assets served from linkskool.net.
            urlPattern: /^https:\/\/linkskool\.net\/(?!api\/).*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "asset-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Web fonts (Fontshare + Google Fonts).
            urlPattern: /^https:\/\/(api\.fontshare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\/.*/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "font-cache",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-motion": ["motion/react"],
          "vendor-i18n": ["i18next", "react-i18next", "i18next-browser-languagedetector"],
          "vendor-db": ["dexie"],
          "vendor-store": ["zustand"],
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

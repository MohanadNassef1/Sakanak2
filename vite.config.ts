import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon-v3.png", "apple-touch-icon-v3.png", "robots.txt"],
      manifest: {
        name: "Sakanak - Find Your Perfect Room or Roommate",
        short_name: "Sakanak",
        description: "Find rooms, find roommates - no brokers, no scams, just trusted connections in Egypt.",
        theme_color: "#FF7A00",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192-v3.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512-v3.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512-v3.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/, /^\/sitemap\.xml/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/lmjivfayjyskriikcyzg\.supabase\.co\/auth\/.*/i,
            handler: "NetworkOnly",
          },
          {
            urlPattern: /^https:\/\/lmjivfayjyskriikcyzg\.supabase\.co\/rest\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-rest-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

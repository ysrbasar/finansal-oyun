/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // Göreli taban: uygulama alt klasörde veya kök dizinde barındırılabilir
  base: "./",
  // Üst klasördeki (form360) PostCSS ayarının devreye girmesini engeller
  css: { postcss: {} },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        id: "./",
        name: "Minik Finans Kaşifleri",
        short_name: "Finans Kaşifleri",
        description: "Paranı tanı, geleceğini keşfet! 8 yaş çocuklar için oyunlu finansal okuryazarlık.",
        lang: "tr",
        dir: "ltr",
        start_url: "./",
        scope: "./",
        display: "standalone",
        orientation: "portrait",
        background_color: "#FFF9F0",
        theme_color: "#192744",
        categories: ["education", "kids"],
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2,webmanifest}"],
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

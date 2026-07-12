import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      "/chat": {
        target: "http://localhost:3001",
        changeOrigin: true,
        // Don't crash the dev server if the backend is temporarily down
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.warn("[vite proxy] /chat error:", err.message);
          });
        },
      },
      "/upload": {
        target: "http://localhost:3001",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.warn("[vite proxy] /upload error:", err.message);
          });
        },
      },
      "/analyze": {
        target: "http://localhost:3001",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.warn("[vite proxy] /analyze error:", err.message);
          });
        },
      },
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.warn("[vite proxy] /api error:", err.message);
          });
        },
      },
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    // Ensure chunks get fresh hashes every build so browsers don't use stale JS
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});

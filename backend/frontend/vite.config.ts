import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      "/chat": "http://localhost:3001",
      "/upload": "http://localhost:3001",
      "/analyze": "http://localhost:3001",
      "/api": "http://localhost:3001",
    },
  },
});
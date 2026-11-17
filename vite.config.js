import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "public",
  publicDir: false,
  plugins: [react()],
  server: {
    port: 5173,
    host: "localhost",
  },
});
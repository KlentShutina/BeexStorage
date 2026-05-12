import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: { port: 5173, host: true, https: true },
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2018",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
  },
});

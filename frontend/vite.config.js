import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Evita problemas de CORS durante o desenvolvimento local:
      // qualquer chamada do frontend para /api é redirecionada para o backend.
      "/api": {
        target: "http://localhost:3333",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:3333",
        changeOrigin: true,
      },
    },
  },
});

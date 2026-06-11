import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// En producción el sitio se sirve desde GitHub Pages bajo /integrationsuite-lab/.
// Si algún día se usa un dominio propio, cambiar base a "/".
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/integrationsuite-lab/" : "/",
  plugins: [react(), tailwindcss()],
}));

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// El sitio se sirve desde el dominio propio https://sapintegrationlab.com
// (GitHub Pages con custom domain), por eso base "/".
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
});

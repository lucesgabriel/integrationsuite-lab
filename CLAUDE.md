# IntegrationSuite LAB — Guía para Claude

Página personal de Gabriel Luces (consultor SAP, Chile) enfocada en contenido sobre **SAP Integration Suite**. El objetivo es publicar artículos mientras se prepara para la certificación SAP Integration Developer (C_CPI_15) y posicionar su marca personal.

## Stack

React 19 + TypeScript + Vite + Tailwind CSS 4 (plugin `@tailwindcss/vite`, tema en `src/index.css` vía `@theme`) + React Router 7 + react-markdown.

## Comandos

- `npm run dev` — servidor de desarrollo
- `npm run build` — `tsc --noEmit` + build de Vite (usar para verificar cambios)

## Arquitectura y convenciones

- **Contenido desacoplado del código**: los artículos son `.md` en `src/content/posts/` con frontmatter (`title`, `description`, `date` ISO, `tags` separados por coma). `src/lib/posts.ts` los carga con `import.meta.glob` y parsea el frontmatter a mano (sin dependencia extra). El slug = nombre del archivo.
- **Datos personales centralizados** en `src/data/profile.ts`. Nunca hardcodear nombre, email, experiencia o certificaciones en componentes — siempre leer de ahí.
- **Idioma**: todo el contenido y la UI están en **español** (audiencia LATAM). El usuario habla español; responderle en español.
- **Tema visual**: fondo oscuro (`ink-950`), acento azul SAP (`--color-sap-blue: #0070f2`). Los tokens viven en el bloque `@theme` de `src/index.css`. Mantener consistencia con esos tokens, no inventar colores sueltos.
- **Prosa de artículos**: clases `.prose-post` en `index.css` (no usamos el plugin typography).
- Páginas en `src/pages/`, componentes reutilizables en `src/components/`. Rutas declaradas en `App.tsx` dentro de `Layout` (navbar + footer + scroll-to-top).

## Contexto del dueño

- Perfil LinkedIn de referencia en `context/` (PDFs).
- Certificaciones clave: SAP Integration Suite (Logali Group), Claude Code (Vanderbilt).
- LinkedIn: https://www.linkedin.com/in/lucesgabriel — Email: lucesgabriel@gmail.com

## Al agregar features

- SPA con React Router: si se agrega deploy, configurar rewrites a `index.html` (404 fallback).
- El roadmap de ideas pendientes está al final de `README.md` — revisar antes de proponer features nuevas.

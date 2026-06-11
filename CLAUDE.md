# SAPIntegrationLab — Guía para Claude

La marca del sitio es **SAPIntegrationLab** (dominio sapintegrationlab.com); en la UI se renderiza como `SAPIntegration` + `Lab` en azul acento, con el chip "SIL".

Página personal de Gabriel Luces (consultor SAP, Chile) enfocada en contenido sobre **SAP Integration Suite**. El objetivo es publicar artículos mientras se prepara para la certificación SAP Integration Developer (C_CPI_15) y posicionar su marca personal.

## Stack

React 19 + TypeScript + Vite + Tailwind CSS 4 (plugin `@tailwindcss/vite`, tema en `src/index.css` vía `@theme`) + React Router 7 + react-markdown.

## Comandos

- `npm run dev` — servidor de desarrollo
- `npm run build` — `tsc --noEmit` + build de Vite (usar para verificar cambios)

## Arquitectura y convenciones

- **Contenido desacoplado del código**: los artículos son `.md` en `src/content/posts/` con frontmatter (`title`, `description`, `date` ISO, `tags` separados por coma). `src/lib/posts.ts` los carga con `import.meta.glob` y parsea el frontmatter a mano (sin dependencia extra). El slug = nombre del archivo.
- **Imágenes de los posts**: viven en `public/images/posts/<slug>/` y se referencian en el Markdown como `![alt](/images/posts/<slug>/imagen.png)`. Una línea en cursiva inmediatamente después de la imagen (sin línea en blanco) se estiliza como caption. Las capturas provienen de los casos resueltos del repo "SAP-INTEGRATION-SUITE-CODEX-LAB - copia" (carpetas `work/cases/*/evidence/` y `artifacts/diagrams/`) — siempre curar/sanitizar antes de copiar.
- **Datos personales centralizados** en `src/data/profile.ts`. Nunca hardcodear nombre, email, experiencia o certificaciones en componentes — siempre leer de ahí.
- **Idioma**: todo el contenido y la UI están en **español** (audiencia LATAM). El usuario habla español; responderle en español.
- **Tema dual (dark/light)**: los componentes usan SOLO tokens semánticos (`bg-base`, `bg-card`, `bg-raised`, `border-line`, `text-strong`, `text-body`, `text-muted`, `text-faint`, `text-accent-text`) — nunca colores fijos como `slate-*` o `ink-*`. Las variables `--c-*` cambian entre `:root` (claro) y `.dark` (oscuro) en `src/index.css`; el azul de marca `sap-blue` (#0070f2) es fijo. Toggle en Navbar vía `src/hooks/useTheme.ts` (persiste en localStorage, default dark, script anti-FOUC en index.html). Excepciones válidas de `text-white`: sobre botones azules sólidos y en el Lightbox (overlay negro).
- **Efectos**: glow con clases `.glow`/`.hover-glow` (intensidad por tema), spotlight en tarjetas (`spotlight-card` + `trackSpotlight` de `src/lib/spotlight.ts`), reveal al scroll (`useReveal` + clase `reveal`), ticker marquee (`TechTicker`), pipeline SVG animado del hero (`PipelineGraphic`). Las imágenes de posts abren en `Lightbox` (clic = zoom, Escape/clic = cerrar).
- **Prosa de artículos**: clases `.prose-post` en `index.css` (no usamos el plugin typography).
- Páginas en `src/pages/`, componentes reutilizables en `src/components/`. Rutas declaradas en `App.tsx` dentro de `Layout` (navbar + footer + scroll-to-top).

## Contexto del dueño

- Perfil LinkedIn de referencia en `context/` (PDFs).
- Certificaciones clave: SAP Integration Suite (Logali Group), Claude Code (Vanderbilt).
- LinkedIn: https://www.linkedin.com/in/lucesgabriel — Email: lucesgabriel@gmail.com

## Al agregar features

- SPA con React Router: si se agrega deploy, configurar rewrites a `index.html` (404 fallback).
- El roadmap de ideas pendientes está al final de `README.md` — revisar antes de proponer features nuevas.

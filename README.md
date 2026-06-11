# IntegrationSuite LAB

Página personal de **Gabriel Luces** — contenido práctico sobre **SAP Integration Suite** (Cloud Integration, API Management, Event Mesh) y bitácora de preparación para la certificación SAP Integration Developer.

Inspirada en sitios de contenido como sapintegrationhub.com, construida con:

- ⚛️ **React 19** + **TypeScript**
- ⚡ **Vite**
- 🎨 **Tailwind CSS 4**
- 🧭 **React Router 7**
- 📝 Artículos en **Markdown** (render con react-markdown)

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # type-check + build de producción (dist/)
npm run preview  # previsualizar el build
```

## Estructura

```
src/
├── data/profile.ts       # Datos personales (experiencia, certs, skills) — única fuente de verdad
├── content/posts/*.md    # Artículos del blog (Markdown + frontmatter)
├── lib/posts.ts          # Cargador de posts (import.meta.glob + frontmatter parser)
├── components/           # Navbar, Footer, Layout, PostCard
├── pages/                # Home, Blog, BlogPost, About, NotFound
├── App.tsx               # Rutas
└── index.css             # Tema Tailwind + estilos de prosa para Markdown
```

## Cómo publicar un artículo nuevo

Crear un archivo `.md` en `src/content/posts/` con este frontmatter:

```markdown
---
title: Título del artículo
description: Resumen corto para tarjetas y SEO
date: 2026-06-15
tags: cloud-integration, tutorial
---

Contenido en Markdown...
```

El nombre del archivo se convierte en la URL (`mi-articulo.md` → `/blog/mi-articulo`). No hay que tocar código.

## Cómo actualizar el perfil

Editar [src/data/profile.ts](src/data/profile.ts) — experiencia, certificaciones, skills e idiomas se renderizan automáticamente en la página "Sobre mí" y el footer.

## Roadmap (ideas para futuras iteraciones)

- [ ] Foto de perfil y assets de marca personal
- [ ] Sección de recursos/descargas (cheatsheets, colecciones Postman)
- [ ] Resaltado de sintaxis en bloques de código (shiki / prism)
- [ ] SEO por página (react-helmet o meta tags dinámicos) + sitemap
- [ ] Versión en inglés (i18n)
- [ ] Newsletter / formulario de contacto
- [ ] Deploy automático (Vercel / Netlify / GitHub Pages)
- [ ] Dark/light mode toggle

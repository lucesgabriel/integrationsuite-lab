# SAPIntegrationLab

🌐 **En línea:** https://sapintegrationlab.com

Página personal de **Gabriel Luces** — contenido práctico sobre **SAP Integration Suite** (Cloud Integration, API Management, Event Mesh): casos reales resueltos, errores documentados y patrones de integración.

El deploy es automático: cada push a `master` publica a GitHub Pages vía [GitHub Actions](.github/workflows/deploy.yml).

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

## Activar contacto y newsletter

El sitio es estático: el formulario de contacto y el newsletter usan servicios externos gratuitos. Ambos quedan **inactivos con fallback elegante** hasta configurar las keys en [src/data/services.ts](src/data/services.ts):

1. **Formulario de contacto (Web3Forms)**: en https://web3forms.com pide un *Access Key* con tu email de contacto (30 segundos, sin cuenta) y pégalo en `web3formsAccessKey`. Gratis 250 mensajes/mes; los mensajes llegan a tu correo.
2. **Newsletter (Kit / ConvertKit)**: crea cuenta gratis en https://kit.com → *Grow → Landing Pages & Forms* → crea un form **inline** → en el HTML de embed copia la action URL (`https://app.kit.com/forms/XXXXXXX/subscriptions`) y pégala en `kitFormAction`. Gratis hasta 10.000 suscriptores, con double opt-in.
3. Commit + push — el deploy es automático.

Estas keys están diseñadas para ser públicas en el front-end (no son secretos).

## Roadmap (ideas para futuras iteraciones)

- [ ] Foto de perfil y assets de marca personal
- [ ] Sección de recursos/descargas (cheatsheets, colecciones Postman)
- [ ] Resaltado de sintaxis en bloques de código (shiki / prism)
- [ ] SEO por página (react-helmet o meta tags dinámicos) + sitemap
- [x] Versión en inglés (i18n) — UI y perfil bilingües; los artículos siguen en español (soporte para traducirlos pendiente)
- [x] Newsletter (Kit) / formulario de contacto (Web3Forms) — ver "Activar contacto y newsletter"
- [x] Deploy automático (GitHub Pages + Actions)
- [x] Dark/light mode toggle

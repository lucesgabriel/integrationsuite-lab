/**
 * Post-build SEO para GitHub Pages.
 *
 * Una SPA en Pages responde 404 en las rutas profundas (sirve 404.html),
 * y los buscadores no indexan páginas 404. Este script genera, después
 * del build de Vite:
 *   1. Un index.html ESTÁTICO por ruta (dist/<ruta>/index.html) con sus
 *      meta tags inyectados (title, description, OG, canonical) → cada
 *      URL responde 200 con SEO correcto. React toma el control al cargar.
 *   2. dist/sitemap.xml con lastmod desde el frontmatter de los posts.
 *   3. dist/robots.txt.
 *
 * Se ejecuta desde npm run build (ver package.json).
 */
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import headingIds from "../src/lib/heading-ids.mjs";

const SITE = "https://sapintegrationlab.com";
const DIST = "dist";
const POSTS_DIR = "src/content/posts";

// --- Posts: parsear frontmatter (mismo formato que src/lib/posts.ts)
function parsePost(file) {
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  const meta = {};
  if (fm) {
    for (const line of fm[1].split(/\r?\n/)) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      let value = line.slice(idx + 1).trim();
      if (/^".*"$/.test(value) || /^'.*'$/.test(value)) value = value.slice(1, -1);
      meta[line.slice(0, idx).trim()] = value;
    }
  }
  const firstImage = /!\[[^\]]*\]\(([^)]+)\)/.exec(raw)?.[1];
  return {
    slug: file.replace(/\.md$/, ""),
    title: meta.title ?? file,
    description: meta.description ?? "",
    date: meta.date ?? "",
    content: fm ? raw.slice(fm[0].length).trim() : raw,
    image: firstImage ? `${SITE}${firstImage}` : undefined,
  };
}

const posts = fs
  .readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith(".md"))
  .map(parsePost)
  .sort((a, b) => b.date.localeCompare(a.date));

// --- Rutas del sitio (canónicas con slash final: así las sirve Pages con 200)
const today = new Date().toISOString().slice(0, 10);
const DEFAULT_DESC =
  "Casos reales de SAP Integration Suite: Cloud Integration (CPI), API Management y SAP BTP, documentados pantalla a pantalla por Gabriel Luces.";

const routes = [
  {
    path: "/",
    title: "SAPIntegrationLab | SAP Integration Suite en la práctica",
    description: DEFAULT_DESC,
    lastmod: today,
    priority: "1.0",
  },
  {
    path: "/blog/",
    title: "Artículos | SAPIntegrationLab",
    description:
      "Guías prácticas y notas técnicas sobre SAP Integration Suite, escritas desde proyectos de integración reales.",
    lastmod: posts[0]?.date ?? today,
    priority: "0.9",
  },
  {
    path: "/recursos/",
    title: "Recursos | SAPIntegrationLab",
    description:
      "Colecciones Postman, esquemas XSD, plantillas Groovy y diagramas listos para descargar — artefactos de casos resueltos de SAP Integration Suite.",
    lastmod: today,
    priority: "0.8",
  },
  {
    path: "/sobre-mi/",
    title: "Sobre mí | SAPIntegrationLab",
    description:
      "Gabriel Luces — consultor SAP con +12 años de experiencia en MM, PM e Integration Suite (BTP/CPI). Experiencia, certificaciones y especialidades.",
    lastmod: today,
    priority: "0.7",
  },
  {
    path: "/contacto/",
    title: "Contacto | SAPIntegrationLab",
    description:
      "¿Hablamos de integración SAP? Escríbeme sobre proyectos, dudas técnicas de SAP Integration Suite o propuestas.",
    lastmod: today,
    priority: "0.5",
  },
  ...posts.map((p) => ({
    path: `/blog/${p.slug}/`,
    title: `${p.title} | SAPIntegrationLab`,
    description: p.description,
    lastmod: p.date,
    priority: "0.8",
    image: p.image,
    type: "article",
    post: p,
  })),
];

// --- Inyección de meta tags en el HTML
const esc = (s) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");

const template = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

// Useful content and real links even before JavaScript runs. createRoot replaces
// this initial HTML once the interactive app is ready (no hydration mismatch).
function staticContent(route) {
  const nav = '<nav aria-label="Navegación"><a href="/">Inicio</a> · <a href="/blog/">Artículos</a> · <a href="/recursos/">Recursos</a> · <a href="/sobre-mi/">Sobre mí</a> · <a href="/contacto/">Contacto</a></nav>';
  let body = `<h1>${esc(route.title.replace(" | SAPIntegrationLab", ""))}</h1><p>${esc(route.description)}</p>`;
  if (route.post) {
    body += renderToStaticMarkup(React.createElement(ReactMarkdown, {
      remarkPlugins: [remarkGfm, headingIds],
      components: {
        table: ({ children }) => React.createElement("div", { className: "table-scroll", tabIndex: 0, role: "region", "aria-label": "Tabla del artículo" }, React.createElement("table", null, children)),
      },
    }, route.post.content));
  } else if (route.path === "/" || route.path === "/blog/") {
    body += posts.map((post) => `<section><h2><a href="/blog/${post.slug}/">${esc(post.title)}</a></h2><p>${esc(post.description)}</p></section>`).join("");
  }
  return `<main id="main-content" class="prose-post mx-auto max-w-3xl px-4 py-12" lang="es">${nav}${body}</main>`;
}

function htmlFor(route) {
  const url = `${SITE}${route.path}`;
  const image = route.image ?? `${SITE}/og-default.png`;
  const head = [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:site_name" content="SAPIntegrationLab" />`,
    `<meta property="og:type" content="${route.type ?? "website"}" />`,
    `<meta property="og:title" content="${esc(route.title)}" />`,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:locale" content="es_CL" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(route.title)}" />`,
    `<meta name="twitter:description" content="${esc(route.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ].join("\n    ");

  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(route.title)}</title>`)
    .replace(
      /<meta\s+name="description"[\s\S]*?\/>/,
      `<meta name="description" content="${esc(route.description)}" />`
    )
    .replace("</head>", `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', () => `<div id="root">${staticContent(route)}</div>`);
}

for (const route of routes) {
  const dir = path.join(DIST, route.path);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), htmlFor(route));
}

// --- sitemap.xml
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${SITE}${r.path}</loc>
    <lastmod>${r.lastmod}</lastmod>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(DIST, "sitemap.xml"), sitemap);

// --- robots.txt
fs.writeFileSync(
  path.join(DIST, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`
);

console.log(
  `SEO postbuild: ${routes.length} rutas con meta tags, sitemap.xml y robots.txt generados.`
);

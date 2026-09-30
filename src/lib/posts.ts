/**
 * Cargador de artículos del blog.
 *
 * Cada artículo es un archivo .md en src/content/posts/ con frontmatter:
 *
 * ---
 * title: Título del artículo
 * description: Resumen corto para las tarjetas y el SEO
 * date: 2026-06-11
 * tags: cloud-integration, certificacion
 * ---
 *
 * Para publicar un artículo nuevo basta con agregar el archivo .md;
 * no hay que tocar ningún componente.
 */

export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string;
}

const rawPosts = import.meta.glob("../content/posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const rawEnglishPosts = import.meta.glob("../content/posts/en/*.md", {
  query: "?raw", import: "default", eager: true,
}) as Record<string, string>;

function parseFrontmatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { meta: {}, body: raw };

  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    let value = line.slice(idx + 1).trim();
    // Quitar comillas envolventes estilo YAML: title: "Mi título"
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[line.slice(0, idx).trim()] = value;
  }
  return { meta, body: raw.slice(match[0].length) };
}

function loadPosts(raw: Record<string, string>): Post[] { return Object.entries(raw)
  .map(([path, raw]) => {
    const slug = path.split("/").pop()!.replace(/\.md$/, "");
    const { meta, body } = parseFrontmatter(raw);
    return {
      slug,
      title: meta.title ?? slug,
      description: meta.description ?? "",
      date: meta.date ?? "",
      tags: meta.tags ? meta.tags.split(",").map((t) => t.trim()) : [],
      content: body,
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date)); }

export const posts = loadPosts(rawPosts);
const englishPosts = loadPosts(rawEnglishPosts);
export function getPosts(lang: "es" | "en" = "es"): Post[] {
  return lang === "en" ? englishPosts : posts;
}

export function getPost(slug: string, lang: "es" | "en" = "es"): Post | undefined {
  return getPosts(lang).find((p) => p.slug === slug);
}

export function formatDate(iso: string, lang: "es" | "en" = "es"): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(
    lang === "es" ? "es-CL" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );
}

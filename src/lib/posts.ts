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

export const posts: Post[] = Object.entries(rawPosts)
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
  .sort((a, b) => b.date.localeCompare(a.date));

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

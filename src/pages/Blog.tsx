import { useMemo, useState } from "react";
import { posts } from "../lib/posts";
import PostCard from "../components/PostCard";

export default function Blog() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tags = useMemo(
    () => [...new Set(posts.flatMap((p) => p.tags))].sort(),
    []
  );

  const visible = activeTag
    ? posts.filter((p) => p.tags.includes(activeTag))
    : posts;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl font-extrabold text-strong">Artículos</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Guías prácticas y notas técnicas sobre SAP Integration Suite, escritas
        desde proyectos de integración reales.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTag(null)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeTag === null
              ? "bg-sap-blue text-white"
              : "bg-raised text-muted hover:text-strong"
          }`}
        >
          Todos
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTag === tag
                ? "bg-sap-blue text-white"
                : "bg-raised text-muted hover:text-strong"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-10 text-faint">
          Aún no hay artículos con esta etiqueta.
        </p>
      )}
    </section>
  );
}

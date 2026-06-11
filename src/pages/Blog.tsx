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
      <h1 className="text-4xl font-extrabold text-white">Artículos</h1>
      <p className="mt-3 max-w-2xl text-slate-400">
        Guías prácticas y notas de estudio sobre SAP Integration Suite,
        escritas mientras construyo integraciones reales y me preparo para la
        certificación.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTag(null)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeTag === null
              ? "bg-sap-blue text-white"
              : "bg-ink-800 text-slate-400 hover:text-white"
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
                : "bg-ink-800 text-slate-400 hover:text-white"
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
        <p className="mt-10 text-slate-500">
          Aún no hay artículos con esta etiqueta.
        </p>
      )}
    </section>
  );
}

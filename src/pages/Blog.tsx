import { useMemo, useState } from "react";
import { posts } from "../lib/posts";
import PostCard from "../components/PostCard";
import Seo from "../components/Seo";
import { useLang } from "../i18n";

export default function Blog() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const { t, lang } = useLang();

  const tags = useMemo(
    () => [...new Set(posts.flatMap((p) => p.tags))].sort(),
    []
  );

  const visible = activeTag
    ? posts.filter((p) => p.tags.includes(activeTag))
    : posts;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <Seo title={t.seo.blogTitle} description={t.blog.description} path="/blog/" />
      <span className="eyebrow">~/blog</span>
      <h1 className="text-4xl font-extrabold text-strong">{t.blog.title}</h1>
      <p className="mt-3 max-w-2xl text-muted">{t.blog.description}</p>

      {lang === "en" && (
        <p className="mt-4 max-w-2xl rounded-xl border border-sap-blue/30 bg-sap-blue/10 px-4 py-3 text-sm text-accent-text">
          {t.blog.spanishOnly}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTag(null)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeTag === null
              ? "bg-sap-blue text-white"
              : "bg-raised text-muted hover:text-strong"
          }`}
        >
          {t.blog.all}
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
        <p className="mt-10 text-faint">{t.blog.empty}</p>
      )}
    </section>
  );
}

import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { matchesSearch } from "../lib/search";
import { posts } from "../lib/posts";
import PostCard from "../components/PostCard";
import Seo from "../components/Seo";
import { useLang } from "../i18n";

export default function Blog() {
  const [params, setParams] = useSearchParams();
  const activeTag = params.get("tag");
  const query = params.get("q") ?? "";
  function updateFilter(key: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace: true });
  }
  const { t, lang } = useLang();

  const tags = useMemo(
    () => [...new Set(posts.flatMap((p) => p.tags))].sort(),
    []
  );

  const visible = posts.filter((p) => (!activeTag || p.tags.includes(activeTag)) && matchesSearch(p, query));

  return (
    <section className="site-shell page-section">
      <Seo title={t.seo.blogTitle} description={t.blog.description} path="/blog/" />
      <h1 className="page-title font-extrabold text-strong">{t.blog.title}</h1>
      <p className="page-intro mt-4 max-w-2xl text-muted">{t.blog.description}</p>

      {lang === "en" && (
        <p className="mt-4 max-w-2xl rounded-xl border border-sap-blue/30 bg-sap-blue/10 px-4 py-3 text-sm text-accent-text">
          {t.blog.spanishOnly}
        </p>
      )}

      <div className="search-panel mt-8 max-w-2xl">
        <label htmlFor="article-search" className="block text-sm font-semibold text-strong">{t.blog.search}</label>
        <input id="article-search" type="search" value={query}
          onChange={(event) => updateFilter("q", event.target.value)}
          placeholder={t.blog.searchPlaceholder}
          className="mt-2 w-full rounded-xl border border-line bg-card px-4 py-3 text-base text-strong" />
      </div>
      <div className="filter-list mt-6 flex flex-wrap gap-2" role="group" aria-label={t.blog.filterLabel}>
        <button
          onClick={() => updateFilter("tag", "")}
          aria-pressed={activeTag === null}
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
            onClick={() => updateFilter("tag", tag)}
            aria-pressed={activeTag === tag}
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

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-muted">{visible.length} {t.blog.results}</p>
        {(query || activeTag) && <button onClick={() => setParams({})} className="text-sm font-semibold text-accent-text">{t.blog.clear}</button>}
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

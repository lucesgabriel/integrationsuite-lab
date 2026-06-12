import { Link } from "react-router-dom";
import type { Post } from "../lib/posts";
import { formatDate } from "../lib/posts";
import { trackSpotlight } from "../lib/spotlight";
import { useLang } from "../i18n";

export default function PostCard({ post }: { post: Post }) {
  const { t, lang } = useLang();

  return (
    <Link
      to={`/blog/${post.slug}`}
      onMouseMove={trackSpotlight}
      className="spotlight-card hover-glow group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-1 hover:border-sap-blue"
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sap-blue to-sap-blue-light opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-raised px-3 py-1 font-mono text-[11px] font-medium text-accent-text"
          >
            #{tag}
          </span>
        ))}
      </div>
      <h3 className="mt-4 text-lg font-bold text-strong group-hover:text-accent-text">
        {post.title}
      </h3>
      <p className="mt-2 flex-1 text-sm text-muted">{post.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <p className="font-mono text-[11px] text-faint">
          {formatDate(post.date, lang)}
        </p>
        <span className="text-sm font-semibold text-accent-text opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 md:-translate-x-2">
          {t.posts.read}
        </span>
      </div>
    </Link>
  );
}

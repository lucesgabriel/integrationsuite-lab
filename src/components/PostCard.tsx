import { Link } from "react-router-dom";
import type { Post } from "../lib/posts";
import { formatDate } from "../lib/posts";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-ink-700 bg-ink-900 p-6 transition-all hover:-translate-y-1 hover:border-sap-blue"
    >
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-ink-800 px-3 py-1 text-xs font-medium text-sap-blue-light"
          >
            {tag}
          </span>
        ))}
      </div>
      <h3 className="mt-4 text-lg font-bold text-white group-hover:text-sap-blue-light">
        {post.title}
      </h3>
      <p className="mt-2 flex-1 text-sm text-slate-400">{post.description}</p>
      <p className="mt-4 text-xs text-slate-500">{formatDate(post.date)}</p>
    </Link>
  );
}

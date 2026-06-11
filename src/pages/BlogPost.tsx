import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { getPost, formatDate } from "../lib/posts";

export default function BlogPost() {
  const { slug } = useParams();
  const post = slug ? getPost(slug) : undefined;

  if (!post) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-white">
          Artículo no encontrado
        </h1>
        <Link
          to="/blog"
          className="mt-6 inline-block text-sap-blue-light hover:text-white"
        >
          ← Volver a artículos
        </Link>
      </section>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <Link
        to="/blog"
        className="text-sm text-sap-blue-light hover:text-white"
      >
        ← Volver a artículos
      </Link>

      <header className="mt-6">
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
        <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white">
          {post.title}
        </h1>
        <p className="mt-4 text-sm text-slate-500">{formatDate(post.date)}</p>
      </header>

      <div className="prose-post mt-10">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}

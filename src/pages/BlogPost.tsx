import { profile } from "../data/profile";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import headingIds from "../lib/heading-ids.mjs";
import { getPost, formatDate } from "../lib/posts";
import { rehypePrism } from "../lib/highlight";
import Lightbox from "../components/Lightbox";
import CodeBlock from "../components/CodeBlock";
import NewsletterSignup from "../components/NewsletterSignup";
import Seo from "../components/Seo";
import { useLang } from "../i18n";

export default function BlogPost() {
  const { slug } = useParams();
  const post = slug ? getPost(slug) : undefined;
  const [zoom, setZoom] = useState<{ src: string; alt?: string } | null>(null);
  const { t, lang } = useLang();

  if (!post) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-strong">{t.blog.notFound}</h1>
        <Link
          to="/blog"
          className="mt-6 inline-block text-accent-text hover:text-sap-blue"
        >
          {t.blog.back}
        </Link>
      </section>
    );
  }

  const firstImage = /!\[[^\]]*\]\(([^)]+)\)/.exec(post.content)?.[1];

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <Seo
        title={`${post.title} | SAPIntegrationLab`}
        description={post.description}
        path={`/blog/${post.slug}/`}
        image={firstImage}
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          inLanguage: "es",
          image: firstImage
            ? `https://sapintegrationlab.com${firstImage}`
            : undefined,
          author: {
            "@type": "Person",
            name: profile.name,
            url: "https://sapintegrationlab.com/sobre-mi/",
          },
        }}
      />
      <Link
        to="/blog"
        className="text-sm text-accent-text hover:text-sap-blue"
      >
        {t.blog.back}
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-raised px-3 py-1 font-mono text-xs font-medium text-accent-text"
            >
              #{tag}
            </span>
          ))}
        </div>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight text-strong">
          {post.title}
        </h1>
        <p className="mt-4 font-mono text-xs text-faint">
          {formatDate(post.date, lang)} · {Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200))} {t.blog.readingTime}
        </p>
        {lang === "en" && (
          <p className="mt-4 rounded-xl border border-sap-blue/30 bg-sap-blue/10 px-4 py-3 text-sm text-accent-text">
            {t.blog.spanishOnly}
          </p>
        )}
      </header>

      <div className="prose-post mt-10" lang="es">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, headingIds]}
          rehypePlugins={[[rehypePrism, { ignoreMissing: true }]]}
          components={{
            pre: CodeBlock,
            table: ({ children }) => <div className="table-scroll" role="region" tabIndex={0} aria-label={t.blog.tableLabel}><table>{children}</table></div>,
            img: ({ src, alt }) =>
              src ? (
                <img
                  src={src}
                  alt={alt ?? ""}
                  loading="lazy"
                  onClick={() => setZoom({ src, alt })}
                />
              ) : null,
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      <div className="mt-16">
        <NewsletterSignup />
      </div>

      {zoom && (
        <Lightbox src={zoom.src} alt={zoom.alt} onClose={() => setZoom(null)} />
      )}
    </article>
  );
}

import { profile } from "../data/profile";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { LocalizedLink as Link } from "../components/LocalizedLink";
import { localePath } from "../i18n/paths.mjs";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import headingIds from "../lib/heading-ids.mjs";
import { getPost, formatDate } from "../lib/posts";
import { rehypePrism } from "../lib/highlight";
import Lightbox from "../components/Lightbox";
import CodeBlock from "../components/CodeBlock";
import NewsletterSignup from "../components/NewsletterSignup";
import Seo from "../components/Seo";
import { useLang } from "../i18n";
import { tagLabel } from "../i18n/tags";

export default function BlogPost() {
  const { slug } = useParams();
  const [zoom, setZoom] = useState<{ src: string; alt?: string } | null>(null);
  const { t, lang } = useLang();
  const post = slug ? getPost(slug, lang) : undefined;
  // Stable component types keep image DOM nodes and keyboard focus intact
  // when the lightbox opens or closes.
  const markdownComponents = useMemo<Components>(() => ({
    a: ({ href, children, ...props }) => <a href={href ? localePath(href, lang) : undefined} {...props}>{children}</a>,
    pre: CodeBlock,
    table: ({ children }) => <div className="table-scroll" role="region" tabIndex={0} aria-label={t.blog.tableLabel}><table>{children}</table></div>,
    img: ({ src, alt }) => src ? <img src={src} alt={alt ?? ""} loading="lazy"
      role="button" tabIndex={0} aria-label={`${t.media.zoom}: ${alt ?? ""}`}
      onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setZoom({ src, alt }); } }}
      onClick={() => setZoom({ src, alt })} /> : null,
  }), [lang, t.blog.tableLabel, t.media.zoom]);

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
    <article className="article-page site-shell page-section">
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
          inLanguage: lang,
          image: firstImage
            ? `https://sapintegrationlab.com${firstImage}`
            : undefined,
          author: {
            "@type": "Person",
            name: profile.name,
            url: `https://sapintegrationlab.com${localePath("/sobre-mi/", lang)}`,
          },
        }}
      />
      <Link
        to="/blog"
        className="text-sm text-accent-text hover:text-sap-blue"
      >
        {t.blog.back}
      </Link>

      <header className="article-header mt-6">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-raised px-3 py-1 font-mono text-xs font-medium text-accent-text"
            >
              {tagLabel(tag, lang)}
            </span>
          ))}
        </div>
        <h1 className="article-title mt-5 font-extrabold text-strong">
          {post.title}
        </h1>
        <p className="article-summary mt-5 text-lg text-muted">{post.description}</p>
        <p className="mt-6 border-t border-line pt-5 text-sm text-muted">
          {formatDate(post.date, lang)} · {Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200))} {t.blog.readingTime}
        </p>
      </header>

      <div className="prose-post article-body mt-9" lang={lang}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, headingIds]}
          rehypePlugins={[[rehypePrism, { ignoreMissing: true }]]}
          components={markdownComponents}
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

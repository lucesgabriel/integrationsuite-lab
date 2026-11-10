import { LocalizedLink as Link } from "../components/LocalizedLink";
import { profile } from "../data/profile";
import { formatDate, getPosts, postCover } from "../lib/posts";
import IntegrationMap from "../components/IntegrationMap";
import NewsletterSignup from "../components/NewsletterSignup";
import Seo from "../components/Seo";
import { useReveal } from "../hooks/useReveal";
import { useLang } from "../i18n";
import { tagLabel } from "../i18n/tags";

/** Iconos SVG de los 6 temas (mismo orden que t.topics.items) */
const topicIcons = [
  // Flechas circulares: flujo de integración
  <path key="cpi" d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6" />,
  // Escudo: gobierno y seguridad de APIs
  <path key="apim" d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3zM9 12l2 2 4-4" />,
  // Enchufe / conexión
  <path key="conn" d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-5 5 5 5 0 0 1-5-5V7zM12 16v5" />,
  // Código < / >
  <path key="groovy" d="M8 8l-5 4 5 4M16 8l5 4-5 4M13 5l-2 14" />,
  // Nodos conectados: malla de eventos
  <path key="mesh" d="M5 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM19 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6.5 6.5L11 16M17.5 6.5L13 16M7 5h10" />,
  // Birrete de graduación
  <path key="cert" d="M12 4l10 5-10 5L2 9l10-5zM6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 9v5" />,
];

function TopicIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--c-accent-text)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}

export default function Home() {
  const topicsRef = useReveal<HTMLElement>();
  const postsRef = useReveal<HTMLElement>();
  const newsletterRef = useReveal<HTMLElement>();
  const ctaRef = useReveal<HTMLElement>();
  const { t, lang } = useLang();
  const [lead, ...rest] = getPosts(lang).slice(0, 6);
  const leadCover = lead ? postCover(lead) : undefined;

  return (
    <>
      <Seo
        title={t.seo.homeTitle}
        description={t.seo.homeDesc}
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "SAPIntegrationLab",
          url: "https://sapintegrationlab.com",
          author: {
            "@type": "Person",
            name: profile.name,
            jobTitle: "SAP Integration Suite Consultant",
            sameAs: [profile.linkedin],
          },
        }}
      />
      {/* La home se lee como un iFlow: evento de inicio → pasos → evento de fin */}
      <div className="flow-page">
        <span className="flow-token" aria-hidden="true" />

        {/* Hero */}
        <section className="home-hero relative overflow-hidden">
          <div className="bg-grid pointer-events-none absolute inset-0" />

          <div className="site-shell flow-first relative grid items-center gap-10 py-12 lg:grid-cols-[3fr_2fr] lg:gap-14 lg:py-20">
            <span className="flow-node" data-kind="start" aria-hidden="true" />
            <div>
              <p className="hero-credential">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3zM9 12l2 2 4-4" />
                </svg>
                {t.hero.badge}
              </p>

              <h1 className="hero-title mt-5 text-strong">
                {t.hero.titlePre}
                {t.hero.titleHighlight}
                {t.hero.titlePost}
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                {t.hero.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/blog"
                  className="rounded-xl bg-sap-blue px-6 py-3 font-semibold text-white transition-colors hover:bg-sap-blue/90"
                >
                  {t.hero.ctaBlog}
                </Link>
                <Link
                  to="/sobre-mi"
                  className="rounded-xl border border-line-strong bg-card px-6 py-3 font-semibold text-body transition-colors hover:border-sap-blue hover:text-strong"
                >
                  {t.hero.ctaAbout}
                </Link>
              </div>

              <dl className="hero-stats">
                {profile.stats.map((stat) => (
                  <div key={stat.label.es}>
                    <dt>{stat.label[lang]}</dt>
                    <dd>{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <IntegrationMap />
          </div>
        </section>

        {/* Artículos: caso destacado + registro */}
        <section ref={postsRef} className="reveal">
          <div className="site-shell py-12 md:py-16">
            <span className="flow-node" aria-hidden="true" />
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-strong">
                  {t.posts.heading}
                </h2>
                <p className="mt-2 text-muted">{t.posts.subheading}</p>
              </div>
              <Link
                to="/blog"
                className="text-sm font-semibold text-accent-text hover:text-sap-blue"
              >
                {t.posts.viewAll}
              </Link>
            </div>

            {lead && (
              <Link to={`/blog/${lead.slug}`} className="case-lead">
                {leadCover && (
                  <div className="case-lead-cover">
                    <img src={leadCover} alt="" loading="lazy" />
                  </div>
                )}
                <div className="case-lead-body">
                  <p className="case-meta">
                    <time dateTime={lead.date}>{formatDate(lead.date, lang)}</time>
                    {lead.tags.slice(0, 2).map((tag) => (
                      <span key={tag}>{tagLabel(tag, lang)}</span>
                    ))}
                  </p>
                  <h3>{lead.title}</h3>
                  <p className="case-lead-summary">{lead.description}</p>
                  <span className="case-lead-link">{t.posts.read}</span>
                </div>
              </Link>
            )}

            <ol className="case-log">
              {rest.map((post) => (
                <li key={post.slug}>
                  <Link to={`/blog/${post.slug}`}>
                    <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
                    <span className="case-log-title">{post.title}</span>
                    {post.tags[0] && (
                      <span className="case-log-tag">{tagLabel(post.tags[0], lang)}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Temas */}
        <section ref={topicsRef} className="reveal border-t border-line">
          <div className="site-shell py-12 md:py-16">
            <span className="flow-node" aria-hidden="true" />
            <h2 className="text-3xl font-bold text-strong">{t.topics.heading}</h2>
            <p className="mt-2 text-muted">{t.topics.subheading}</p>
            <div className="topic-sheet">
              {t.topics.items.map((topic, i) => (
                <div key={topic.title}>
                  <h3>
                    <TopicIcon>{topicIcons[i]}</TopicIcon>
                    {topic.title}
                  </h3>
                  <p>{topic.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section ref={newsletterRef} className="reveal">
          <div className="site-shell">
            <NewsletterSignup />
          </div>
        </section>

        {/* CTA: evento de fin del flujo */}
        <section ref={ctaRef} className="reveal">
          <div className="site-shell flow-last py-14 md:py-20">
            <span className="flow-node" data-kind="end" aria-hidden="true" />
            <div className="cta-band">
              <div>
                <h2>{t.cta.heading}</h2>
                <p>{t.cta.description}</p>
              </div>
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                {t.cta.button}
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

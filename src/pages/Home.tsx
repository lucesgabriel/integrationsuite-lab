import { Link } from "react-router-dom";
import { profile } from "../data/profile";
import { posts } from "../lib/posts";
import PostCard from "../components/PostCard";
import PipelineGraphic from "../components/PipelineGraphic";
import TechTicker from "../components/TechTicker";
import NewsletterSignup from "../components/NewsletterSignup";
import { useReveal } from "../hooks/useReveal";
import { trackSpotlight } from "../lib/spotlight";

const topics = [
  {
    title: "Cloud Integration (CPI)",
    description:
      "Diseño de iFlows, Content Modifier, Router, Splitter, Message Mapping y manejo de errores con Exception Subprocess.",
    icon: (
      // Flechas circulares: flujo de integración
      <path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6" />
    ),
  },
  {
    title: "API Management",
    description:
      "API Proxies, políticas de seguridad (API Key, OAuth, rate limiting) y publicación de productos en el Developer Hub.",
    icon: (
      // Escudo: gobierno y seguridad de APIs
      <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3zM9 12l2 2 4-4" />
    ),
  },
  {
    title: "Conectividad & Adaptadores",
    description:
      "OData, SFTP, HTTP, RFC, IDoc y conexión on-premise con Cloud Connector y Location ID.",
    icon: (
      // Enchufe / conexión
      <path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-5 5 5 5 0 0 1-5-5V7zM12 16v5" />
    ),
  },
  {
    title: "Groovy Scripting",
    description:
      "Scripts para transformación de mensajes, logging de payloads y manipulación de headers y properties.",
    icon: (
      // Código < / >
      <path d="M8 8l-5 4 5 4M16 8l5 4-5 4M13 5l-2 14" />
    ),
  },
  {
    title: "Event Mesh & EDA",
    description:
      "Arquitecturas orientadas a eventos, colas JMS y patrones de integración asíncrona en SAP BTP.",
    icon: (
      // Nodos conectados: malla de eventos
      <path d="M5 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM19 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6.5 6.5L11 16M17.5 6.5L13 16M7 5h10" />
    ),
  },
  {
    title: "Certificación C_CPI_15",
    description:
      "Guías de estudio, ejercicios prácticos y simulacros para la certificación SAP Integration Developer.",
    icon: (
      // Birrete de graduación
      <path d="M12 4l10 5-10 5L2 9l10-5zM6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 9v5" />
    ),
  },
];

function TopicIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-sap-blue/30 bg-gradient-to-br from-sap-blue/25 to-sap-blue/5">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--c-accent-text)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </span>
  );
}

export default function Home() {
  const featured = posts.slice(0, 3);
  const topicsRef = useReveal<HTMLElement>();
  const postsRef = useReveal<HTMLElement>();
  const newsletterRef = useReveal<HTMLElement>();
  const ctaRef = useReveal<HTMLElement>();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="hero-bg pointer-events-none absolute inset-0" />
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div
          className="animate-float pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "var(--orb)" }}
        />
        <div
          className="animate-float pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full blur-3xl [animation-delay:2s]"
          style={{ background: "var(--orb)" }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-24 md:grid-cols-[3fr_2fr] md:py-28">
          <div>
            <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-sap-blue/40 bg-sap-blue/10 px-4 py-1.5 text-sm text-accent-text backdrop-blur">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
              </svg>
              SAP Integration Suite · BTP/CPI Consultant
            </span>

            <h1 className="animate-fade-up delay-100 mt-6 text-4xl font-extrabold leading-tight text-strong md:text-6xl">
              Domina <span className="text-gradient">SAP Integration Suite</span>{" "}
              con contenido práctico
            </h1>

            <p className="animate-fade-up delay-200 mt-6 max-w-2xl text-lg text-muted">
              Soy {profile.name}, consultor SAP con +12 años de experiencia.
              Comparto guías, ejercicios y lecciones reales sobre Cloud
              Integration, API Management y arquitectura de integración en SAP
              BTP.
            </p>

            <div className="animate-fade-up delay-300 mt-8 flex flex-wrap gap-4">
              <Link
                to="/blog"
                className="glow rounded-xl bg-sap-blue px-6 py-3 font-semibold text-white transition-all hover:bg-sap-blue-light"
              >
                Ver artículos
              </Link>
              <Link
                to="/sobre-mi"
                className="rounded-xl border border-line bg-card/60 px-6 py-3 font-semibold text-body backdrop-blur transition-colors hover:border-sap-blue hover:text-strong"
              >
                Sobre mí
              </Link>
            </div>

            {/* Stats */}
            <div className="animate-fade-up delay-400 mt-14 grid max-w-2xl grid-cols-3 gap-4">
              {profile.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-line bg-card/60 px-4 py-5 text-center backdrop-blur"
                >
                  <p className="font-display text-2xl font-extrabold text-accent-text md:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-faint md:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline animado */}
          <div className="animate-fade-up delay-300 hidden justify-center md:flex">
            <PipelineGraphic />
          </div>
        </div>
      </section>

      <TechTicker />

      {/* Temas */}
      <section ref={topicsRef} className="reveal mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold text-strong">¿Qué encontrarás aquí?</h2>
        <p className="mt-2 text-muted">
          Los pilares de SAP Integration Suite, explicados desde la práctica.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <div
              key={t.title}
              onMouseMove={trackSpotlight}
              className="spotlight-card hover-glow group rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-1 hover:border-sap-blue/60"
            >
              <TopicIcon>{t.icon}</TopicIcon>
              <h3 className="mt-4 text-lg font-bold text-strong group-hover:text-accent-text">
                {t.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{t.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Artículos destacados */}
      <section ref={postsRef} className="reveal border-t border-line bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-strong">
                Últimos artículos
              </h2>
              <p className="mt-2 text-muted">
                Guías y lecciones desde proyectos de integración reales.
              </p>
            </div>
            <Link
              to="/blog"
              className="hidden text-sm font-semibold text-accent-text hover:text-sap-blue md:block"
            >
              Ver todos →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {featured.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section ref={newsletterRef} className="reveal mx-auto max-w-6xl px-4 pt-16">
        <NewsletterSignup />
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="reveal mx-auto max-w-6xl px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-sap-blue/30 bg-gradient-to-br from-raised to-card p-10 text-center md:p-16">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
            style={{ background: "var(--orb)" }}
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full blur-3xl"
            style={{ background: "var(--orb)" }}
          />
          <div className="relative">
            <h2 className="text-3xl font-bold text-strong">
              ¿Hablamos de integración SAP?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Si trabajas con SAP BTP o necesitas apoyo en un proyecto de
              integración, conectemos.
            </p>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="glow mt-8 inline-block rounded-xl bg-sap-blue px-8 py-3 font-semibold text-white transition-all hover:bg-sap-blue-light"
            >
              Conectar en LinkedIn
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

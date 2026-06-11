import { Link } from "react-router-dom";
import { profile } from "../data/profile";
import { posts } from "../lib/posts";
import PostCard from "../components/PostCard";

const topics = [
  {
    title: "Cloud Integration (CPI)",
    description:
      "Diseño de iFlows, Content Modifier, Router, Splitter, Message Mapping y manejo de errores con Exception Subprocess.",
    icon: "🔄",
  },
  {
    title: "API Management",
    description:
      "API Proxies, políticas de seguridad (API Key, OAuth, rate limiting) y publicación de productos en el Developer Hub.",
    icon: "🔐",
  },
  {
    title: "Conectividad & Adaptadores",
    description:
      "OData, SFTP, HTTP, RFC, IDoc y conexión on-premise con Cloud Connector y Location ID.",
    icon: "🔌",
  },
  {
    title: "Groovy Scripting",
    description:
      "Scripts para transformación de mensajes, logging de payloads y manipulación de headers y properties.",
    icon: "📜",
  },
  {
    title: "Event Mesh & EDA",
    description:
      "Arquitecturas orientadas a eventos, colas JMS y patrones de integración asíncrona en SAP BTP.",
    icon: "📡",
  },
  {
    title: "Certificación C_CPI_15",
    description:
      "Guías de estudio, ejercicios prácticos y simulacros para la certificación SAP Integration Developer.",
    icon: "🎓",
  },
];

export default function Home() {
  const featured = posts.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 70% 20%, rgba(0,112,242,0.25), transparent), radial-gradient(ellipse 40% 40% at 20% 80%, rgba(0,112,242,0.12), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-sap-blue/40 bg-sap-blue/10 px-4 py-1.5 text-sm text-sap-blue-light">
            <span className="h-2 w-2 animate-pulse rounded-full bg-sap-blue-light" />
            {profile.certificationGoal.status}
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-6xl">
            Domina <span className="text-sap-blue-light">SAP Integration Suite</span>{" "}
            con contenido práctico
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400">
            Soy {profile.name}, consultor SAP con +12 años de experiencia.
            Comparto guías, ejercicios y lecciones reales sobre Cloud
            Integration, API Management y arquitectura de integración en SAP
            BTP.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/blog"
              className="rounded-xl bg-sap-blue px-6 py-3 font-semibold text-white transition-colors hover:bg-sap-blue-light"
            >
              Ver artículos
            </Link>
            <Link
              to="/sobre-mi"
              className="rounded-xl border border-ink-700 px-6 py-3 font-semibold text-slate-300 transition-colors hover:border-sap-blue hover:text-white"
            >
              Sobre mí
            </Link>
          </div>
        </div>
      </section>

      {/* Temas */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold text-white">¿Qué encontrarás aquí?</h2>
        <p className="mt-2 text-slate-400">
          Los pilares de SAP Integration Suite, explicados desde la práctica.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => (
            <div
              key={t.title}
              className="rounded-2xl border border-ink-700 bg-ink-900 p-6 transition-colors hover:border-sap-blue/60"
            >
              <span className="text-3xl">{t.icon}</span>
              <h3 className="mt-4 text-lg font-bold text-white">{t.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{t.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Artículos destacados */}
      <section className="border-t border-ink-800 bg-ink-900/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">
                Últimos artículos
              </h2>
              <p className="mt-2 text-slate-400">
                Contenido nuevo mientras me preparo para la certificación.
              </p>
            </div>
            <Link
              to="/blog"
              className="hidden text-sm font-semibold text-sap-blue-light hover:text-white md:block"
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

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="rounded-3xl border border-sap-blue/30 bg-gradient-to-br from-ink-800 to-ink-900 p-10 text-center md:p-16">
          <h2 className="text-3xl font-bold text-white">
            ¿Hablamos de integración SAP?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Si trabajas con SAP BTP, estás preparando la certificación o
            necesitas apoyo en un proyecto de integración, conectemos.
          </p>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block rounded-xl bg-sap-blue px-8 py-3 font-semibold text-white transition-colors hover:bg-sap-blue-light"
          >
            Conectar en LinkedIn
          </a>
        </div>
      </section>
    </>
  );
}

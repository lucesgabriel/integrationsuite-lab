import { Link } from "react-router-dom";
import { profile } from "../data/profile";
import { posts } from "../lib/posts";

const topTags = [...new Set(posts.flatMap((p) => p.tags))].slice(0, 6);

export default function Footer() {
  return (
    <footer className="relative bg-card">
      {/* Línea superior de gradiente animado */}
      <div className="gradient-line h-px w-full" />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        {/* Marca */}
        <div>
          <p className="flex items-center gap-2 font-display font-bold text-strong">
            <span className="glow flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sap-blue to-sap-blue-light text-xs text-white">
              IS
            </span>
            IntegrationSuite<span className="text-accent-text"> LAB</span>
          </p>
          <p className="mt-3 text-sm text-muted">
            Contenido práctico sobre SAP Integration Suite: casos reales,
            errores documentados y patrones de integración empresarial.
          </p>
          <p className="mt-4 flex items-center gap-1.5 text-sm text-faint">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {profile.location}
          </p>
        </div>

        {/* Navegación */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-faint">
            Navegación
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { to: "/", label: "Inicio" },
              { to: "/blog", label: "Artículos" },
              { to: "/sobre-mi", label: "Sobre mí" },
            ].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="group inline-flex items-center gap-1.5 text-muted transition-colors hover:text-strong"
                >
                  <span className="h-1 w-1 rounded-full bg-sap-blue opacity-0 transition-opacity group-hover:opacity-100" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Temas (tags reales de los posts) */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-faint">
            Temas
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {topTags.map((tag) => (
              <Link
                key={tag}
                to="/blog"
                className="rounded-full border border-line bg-raised/50 px-3 py-1 text-xs text-muted transition-colors hover:border-sap-blue hover:text-strong"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Contacto */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-faint">
            Contacto
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="hover-glow inline-flex items-center gap-2.5 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-muted hover:border-sap-blue hover:text-strong"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              LinkedIn
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="hover-glow inline-flex items-center gap-2.5 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-muted hover:border-sap-blue hover:text-strong"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 7L22 7" />
              </svg>
              {profile.email}
            </a>
          </div>
        </div>
      </div>

      {/* Disclaimer de marca */}
      <div className="mx-auto max-w-6xl px-4 pb-6">
        <p className="text-center text-xs text-faint">
          Sitio independiente de la comunidad — no afiliado, asociado ni
          respaldado por SAP SE. SAP, SAP BTP y SAP Integration Suite son
          marcas registradas de SAP SE en Alemania y otros países.
        </p>
      </div>

      {/* Status bar estilo terminal */}
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 font-mono text-xs text-faint">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="animate-blink h-2 w-2 rounded-full bg-emerald-500" />
              operational
            </span>
            <span>v0.1.0</span>
            <span className="hidden sm:inline">React · Vite · Tailwind</span>
            <span>
              © {new Date().getFullYear()} {profile.name}
            </span>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Volver arriba"
            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 transition-colors hover:border-sap-blue hover:text-strong"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            top
          </button>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";
import { profile } from "../data/profile";

export default function Footer() {
  return (
    <footer className="border-t border-ink-800 bg-ink-900">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-bold text-white">
            IntegrationSuite<span className="text-sap-blue-light"> LAB</span>
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Contenido práctico sobre SAP Integration Suite: Cloud Integration,
            API Management y arquitectura de integración empresarial.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Navegación
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/" className="text-slate-400 hover:text-white">
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/blog" className="text-slate-400 hover:text-white">
                Artículos
              </Link>
            </li>
            <li>
              <Link to="/sobre-mi" className="text-slate-400 hover:text-white">
                Sobre mí
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Contacto
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-white"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href={`mailto:${profile.email}`}
                className="text-slate-400 hover:text-white"
              >
                {profile.email}
              </a>
            </li>
            <li className="text-slate-500">{profile.location}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {profile.name} — Hecho con React + Vite
      </div>
    </footer>
  );
}

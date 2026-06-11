import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/blog", label: "Artículos" },
  { to: "/sobre-mi", label: "Sobre mí" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "text-white bg-ink-800"
        : "text-slate-400 hover:text-white hover:bg-ink-800/60"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-ink-800 bg-ink-950/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sap-blue text-sm">
            IS
          </span>
          <span>
            IntegrationSuite<span className="text-sap-blue-light"> LAB</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          <a
            href="https://www.linkedin.com/in/lucesgabriel"
            target="_blank"
            rel="noreferrer"
            className="ml-2 rounded-lg bg-sap-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sap-blue-light"
          >
            LinkedIn
          </a>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-slate-300 hover:bg-ink-800 md:hidden"
          aria-label="Abrir menú"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink-800 px-4 pb-4 pt-2 md:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              <div className="py-1">{l.label}</div>
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}

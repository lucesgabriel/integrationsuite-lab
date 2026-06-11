import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { useLang } from "../i18n";

function ThemeToggle({
  theme,
  toggle,
}: {
  theme: "dark" | "light";
  toggle: () => void;
}) {
  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:border-sap-blue hover:text-strong"
    >
      {theme === "dark" ? (
        // Sol
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // Luna
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}

function LangToggle() {
  const { lang, setLang } = useLang();
  const next = lang === "es" ? "en" : "es";
  return (
    <button
      onClick={() => setLang(next)}
      aria-label={lang === "es" ? "Switch to English" : "Cambiar a español"}
      className="flex h-9 items-center justify-center rounded-lg border border-line px-2.5 text-xs font-bold tracking-wide text-muted transition-colors hover:border-sap-blue hover:text-strong"
    >
      {next.toUpperCase()}
    </button>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { t } = useLang();

  const links = [
    { to: "/", label: t.nav.home },
    { to: "/blog", label: t.nav.blog },
    { to: "/sobre-mi", label: t.nav.about },
    { to: "/contacto", label: t.nav.contact },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "text-strong after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-sap-blue after:to-sap-blue-light"
        : "text-muted hover:text-strong hover:bg-raised/60"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-base/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-strong">
          <span className="glow flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sap-blue to-sap-blue-light text-xs text-white">
            SIL
          </span>
          <span className="font-display">
            SAPIntegration<span className="text-accent-text">Lab</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          <div className="ml-2 flex items-center gap-2">
            <LangToggle />
            <ThemeToggle theme={theme} toggle={toggle} />
            <a
              href="https://www.linkedin.com/in/lucesgabriel"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-sap-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sap-blue-light"
            >
              LinkedIn
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LangToggle />
          <ThemeToggle theme={theme} toggle={toggle} />
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-muted hover:bg-raised"
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
        </div>
      </nav>

      {open && (
        <div className="border-t border-line px-4 pb-4 pt-2 md:hidden">
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

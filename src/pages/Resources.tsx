import { Link } from "react-router-dom";
import { resources, type ResourceCategory } from "../data/resources";
import Seo from "../components/Seo";
import { useLang } from "../i18n";
import { trackSpotlight } from "../lib/spotlight";

/** Iconos por categoría */
const categoryIcons: Record<ResourceCategory, React.ReactNode> = {
  // Avión de papel (Postman)
  postman: <path d="M21 3L3 10.5l6.5 2.5L12 21l3-6.5L21 3zM9.5 13L21 3" />,
  // Documento con etiquetas (XSD)
  schemas: (
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6zM14 3v6h6M9 13h6M9 17h4" />
  ),
  // Código (Groovy)
  groovy: <path d="M8 8l-5 4 5 4M16 8l5 4-5 4M13 5l-2 14" />,
  // Formas (diagramas)
  diagrams: (
    <path d="M4 4h6v6H4zM14 5.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0zM7 14l-4 7h8l-4-7zM14 14h6v6h-6z" />
  ),
};

const categoryOrder: ResourceCategory[] = [
  "postman",
  "groovy",
  "schemas",
  "diagrams",
];

export default function Resources() {
  const { t, lang } = useLang();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <Seo
        title={t.seo.resourcesTitle}
        description={t.resources.description}
        path="/recursos/"
      />
      <h1 className="text-4xl font-extrabold text-strong">
        {t.resources.title}
      </h1>
      <p className="mt-3 max-w-2xl text-muted">{t.resources.description}</p>
      <p className="mt-4 inline-flex max-w-2xl items-center gap-2 rounded-xl border border-line bg-card px-4 py-2.5 text-sm text-faint">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
        </svg>
        {t.resources.note}
      </p>

      {categoryOrder.map((cat) => {
        const items = resources.filter((r) => r.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat} className="mt-12">
            <h2 className="text-2xl font-bold text-strong">
              {t.resources.categories[cat]}
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {items.map((res) => (
                <div
                  key={res.file}
                  onMouseMove={trackSpotlight}
                  className="spotlight-card hover-glow flex flex-col rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-1 hover:border-sap-blue/60"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-sap-blue/30 bg-gradient-to-br from-sap-blue/25 to-sap-blue/5">
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
                        {categoryIcons[res.category]}
                      </svg>
                    </span>
                    <div className="flex-1">
                      <h3 className="font-bold text-strong">
                        {res.title[lang]}
                      </h3>
                      <p className="mt-1 text-xs text-faint">
                        ZIP · {res.size}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 flex-1 text-sm text-muted">
                    {res.description[lang]}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <a
                      href={res.file}
                      download
                      className="glow inline-flex items-center gap-2 rounded-xl bg-sap-blue px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-sap-blue-light"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3v12M6 11l6 6 6-6M4 21h16" />
                      </svg>
                      {t.resources.download}
                    </a>
                    {res.post && (
                      <Link
                        to={`/blog/${res.post}`}
                        className="text-sm font-semibold text-accent-text hover:text-sap-blue"
                      >
                        {t.resources.fromCase}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

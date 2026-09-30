const SITE = "https://sapintegrationlab.com";
import { useLang } from "../i18n";
import { localePath } from "../i18n/paths.mjs";

interface SeoProps {
  title: string;
  description: string;
  /** Ruta canónica con slash final, ej. "/blog/" o "/blog/mi-post/" */
  path: string;
  image?: string;
  type?: "website" | "article";
  /** Datos estructurados JSON-LD opcionales */
  jsonLd?: Record<string, unknown>;
}

/**
 * Meta tags por página (React 19 los eleva al <head> automáticamente).
 * En navegación SPA actualiza título/OG al cambiar de ruta; para los
 * crawlers, el postbuild (scripts/seo-postbuild.mjs) inyecta lo mismo
 * en el HTML estático de cada ruta.
 */
export default function Seo({
  title,
  description,
  path,
  image,
  type = "website",
  jsonLd,
}: SeoProps) {
  const { lang } = useLang();
  const url = `${SITE}${localePath(path, lang)}`;
  const img = image ? `${SITE}${image}` : `${SITE}/og-default.png`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="es" href={`${SITE}${localePath(path, "es")}`} />
      <link rel="alternate" hrefLang="en" href={`${SITE}${localePath(path, "en")}`} />
      <link rel="alternate" hrefLang="x-default" href={`${SITE}${localePath(path, "es")}`} />
      <meta property="og:locale" content={lang === "es" ? "es_CL" : "en_US"} />
      <meta property="og:site_name" content="SAPIntegrationLab" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </>
  );
}

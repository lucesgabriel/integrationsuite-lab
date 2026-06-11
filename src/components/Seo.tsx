const SITE = "https://sapintegrationlab.com";

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
  const url = `${SITE}${path}`;
  const img = image ? `${SITE}${image}` : `${SITE}/og-default.png`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
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

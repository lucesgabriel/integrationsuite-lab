import type { Localized } from "../i18n";

/**
 * Recursos descargables de /recursos. Los archivos viven en public/downloads/.
 * Importante: todo lo que se publique aquí debe estar sanitizado
 * (placeholders en lugar de tenants, usuarios o API keys reales).
 */

export type ResourceCategory = "postman" | "schemas" | "groovy" | "diagrams";

export interface Resource {
  category: ResourceCategory;
  file: string;
  size: string;
  title: Localized;
  description: Localized;
  /** Slug del artículo relacionado (opcional) */
  post?: string;
}

export const resources: Resource[] = [
  {
    category: "postman",
    file: "/downloads/maintenance-order-simple-postman.zip",
    size: "2 KB",
    title: { es: "Orden de mantenimiento — versión simple", en: "Maintenance order — simple version" },
    description: {
      es: "Caso MIX-002: CPI directo, APIM, prueba sin API key y diagnósticos. Incluye environment y comprobaciones del JSON de ocho campos.",
      en: "MIX-002: direct CPI, APIM, missing API key and diagnostic requests. Includes an environment and eight-field JSON checks.",
    },
    post: "maintenance-order-lookup-simple-postman",
  },
  {
    category: "postman",
    file: "/downloads/globex-catalog-postman.zip",
    size: "4 KB",
    title: {
      es: "API de catálogo gobernada (Globex)",
      en: "Governed catalog API (Globex)",
    },
    description: {
      es: "Colecciones para probar la API vía APIM y vía CPI directo, con environments y los 5 escenarios: 200, 400, 404 y 401 (sin key / key inválida).",
      en: "Collections to test the API through APIM and directly via CPI, with environments and all 5 scenarios: 200, 400, 404 and 401 (missing/invalid key).",
    },
    post: "api-gobernada-cpi-api-management",
  },
  {
    category: "postman",
    file: "/downloads/logali-message-mapping-postman.zip",
    size: "3 KB",
    title: {
      es: "Message Mapping por lotes (Logali)",
      en: "Batch Message Mapping (Logali)",
    },
    description: {
      es: "Colecciones de los casos MAP-001 y MAP-002 con el lote de 3 oportunidades y template de environment con variables seguras.",
      en: "Collections for cases MAP-001 and MAP-002 with the 3-opportunity batch and an environment template using safe variables.",
    },
    post: "message-mapping-splitter-error-wrapper",
  },
  {
    category: "schemas",
    file: "/downloads/logali-xsd-pack.zip",
    size: "1 KB",
    title: {
      es: "XSDs del caso Logali",
      en: "Logali case XSDs",
    },
    description: {
      es: "Opportunity.xsd, OpportunitiesSplit.xsd (con el wrapper post-splitter) y ProductDraft.xsd — listos para usar como source/target del Message Mapping.",
      en: "Opportunity.xsd, OpportunitiesSplit.xsd (with the post-splitter wrapper) and ProductDraft.xsd — ready to use as Message Mapping source/target.",
    },
    post: "disenar-iflow-splitter-sin-sorpresas",
  },
  {
    category: "groovy",
    file: "/downloads/groovy-mapping-templates.zip",
    size: "77 KB",
    title: {
      es: "14 plantillas de mapeo Groovy",
      en: "14 Groovy mapping templates",
    },
    description: {
      es: "Transformaciones IDoc ↔ JSON/XML (tree y flat) y CSV ↔ JSON/XML con y sin cabecera, documentadas paso a paso para usar en CPI.",
      en: "IDoc ↔ JSON/XML transformations (tree and flat) plus CSV ↔ JSON/XML with and without headers, documented step by step for CPI.",
    },
  },
  {
    category: "diagrams",
    file: "/downloads/diagramas-excalidraw-api-gobernada.zip",
    size: "9 KB",
    title: {
      es: "Diagramas de la API gobernada",
      en: "Governed API diagrams",
    },
    description: {
      es: "Arquitectura end-to-end, detalle del iFlow y diagrama de secuencia en formato .excalidraw — edítalos en excalidraw.com.",
      en: "End-to-end architecture, iFlow detail and sequence diagram in .excalidraw format — edit them at excalidraw.com.",
    },
    post: "api-gobernada-cpi-api-management",
  },
];

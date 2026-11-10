import type { Lang } from "./index";

const labels: Record<string, { es: string; en: string }> = {
  fundamentos: { es: "Fundamentos", en: "Fundamentals" },
  certificacion: { es: "Certificación", en: "Certification" },
  "casos-reales": { es: "Casos del laboratorio", en: "Lab cases" },
  "caso-practico": { es: "Caso práctico", en: "Hands-on case" },
  "buenas-practicas": { es: "Buenas prácticas", en: "Best practices" },
  simulacro: { es: "Simulacro", en: "Practice drill" },
  "error-handling": { es: "Manejo de errores", en: "Error handling" },
  tutorial: { es: "Tutorial", en: "Tutorial" },
  ...Object.fromEntries(
    Object.entries({
      "api-management": "API Management",
      btp: "SAP BTP",
      "c-cpi-15": "C_CPI_15",
      "cloud-connector": "Cloud Connector",
      "cloud-integration": "Cloud Integration",
      groovy: "Groovy",
      mcp: "MCP",
      "message-mapping": "Message Mapping",
      odata: "OData",
      "open-connectors": "Open Connectors",
      "sap-pm": "SAP PM",
      servicenow: "ServiceNow",
    }).map(([tag, name]) => [tag, { es: name, en: name }]),
  ),
};
export function tagLabel(tag: string, lang: Lang) {
  return labels[tag]?.[lang] ?? tag;
}

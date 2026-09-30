import type { Lang } from "./index";

const labels: Record<string, { es: string; en: string }> = {
  fundamentos: { es: "Fundamentos", en: "Fundamentals" },
  certificacion: { es: "Certificación", en: "Certification" },
  "casos-reales": { es: "Casos del laboratorio", en: "Lab cases" },
  "caso-practico": { es: "Caso práctico", en: "Hands-on case" },
  "buenas-practicas": { es: "Buenas prácticas", en: "Best practices" },
  simulacro: { es: "Simulacro", en: "Practice drill" },
};
export function tagLabel(tag: string, lang: Lang) {
  return labels[tag]?.[lang] ?? tag;
}

/**
 * Fuente única de verdad para los datos personales que se muestran en el sitio.
 * Actualiza este archivo cuando cambie tu perfil (nuevas certificaciones,
 * experiencia, etc.) y todas las páginas se actualizan solas.
 */

export const profile = {
  name: "Gabriel Luces",
  headline:
    "SAP MM | PM | Integration Suite (BTP/CPI) Consultant — Passionate about AI, ML & Automation",
  location: "Santiago, Chile",
  email: "lucesgabriel@gmail.com",
  linkedin: "https://www.linkedin.com/in/lucesgabriel",
  about: [
    "Consultor SAP Senior con más de 12 años de experiencia entregando soluciones empresariales SAP en los módulos MM y PM, y soportando operaciones de organizaciones de gran escala como Walmart Chile.",
    "Durante el último año me he especializado en SAP Integration Suite (BTP/CPI), construyendo y soportando integraciones con Cloud Integration (iFlows), APIs y herramientas de conectividad SAP para fortalecer la automatización cross-system y las capacidades de integración empresarial.",
    "Combino una profunda experiencia funcional SAP con especialización creciente en integración, para conectar procesos de negocio con arquitectura SAP moderna.",
  ],
  certificationGoal: {
    name: "SAP Certified Associate — Integration Developer (C_CPI_15)",
    status: "En preparación — certificación próxima",
  },
  experience: [
    {
      role: "Senior SAP Consultant",
      company: "Infosys",
      period: "Abr 2023 — Presente",
      location: "Santiago, Chile · Remoto",
      summary:
        "Cliente: Walmart Chile. Soporte funcional SAP MM/PM e integraciones con SAP Integration Suite (CPI, APIs, conectividad SAP).",
    },
    {
      role: "SAP MM Functional Consultant",
      company: "SNP Group",
      period: "Ene 2022 — Feb 2023",
      location: "Santiago, Chile",
      summary:
        "Transformación digital y migraciones SAP con enfoque automatizado sobre el ecosistema ERP.",
    },
    {
      role: "SAP PM MM Functional Consultant",
      company: "Infosys",
      period: "Jul 2019 — Ene 2022",
      location: "Santiago, Chile",
      summary:
        "Cliente: Walmart Chile. Soporte funcional, planes de trabajo detallados y mejora continua de procesos logísticos y de mantenimiento.",
    },
    {
      role: "SAP Functional Consultant",
      company: "BC Tecnología",
      period: "Ene 2019 — Jun 2019",
      location: "Huechuraba, Chile",
      summary: "Cliente: Walmart Chile. Soporte funcional SAP.",
    },
    {
      role: "SAP Functional Consultant PM, MM",
      company: "VMCA (Valor Máximo Consultores y Asesores)",
      period: "Abr 2017 — Ene 2019",
      location: "Santiago, Chile",
      summary:
        "Configuraciones base, ABAP y soporte funcional en proyectos de implementación.",
    },
  ],
  education: [
    {
      school: "Universidad de Chile",
      degree: "Ingeniero Civil en Electricidad (Revalida de Título)",
      period: "2017",
    },
    {
      school: "Universidad del Zulia",
      degree: "Ingeniero Electricista, Electrical and Electronics Engineering",
      period: "2004 — 2011",
    },
  ],
  certifications: [
    {
      name: "SAP Integration Suite",
      issuer: "Logali Group",
      year: "2026",
    },
    {
      name: "Claude Code: Software Engineering with Generative AI Agents",
      issuer: "Vanderbilt University",
      year: "2025",
    },
  ],
  skills: [
    "SAP Integration Suite (CPI)",
    "Cloud Integration / iFlows",
    "API Management",
    "SAP BTP",
    "Groovy Scripting",
    "SAP MM",
    "SAP PM",
    "OData & APIs",
    "Cloud Connector",
    "AI & Automation",
  ],
  languages: [
    { name: "Español", level: "Nativo" },
    { name: "Inglés", level: "Profesional completo" },
  ],
};

export type Profile = typeof profile;

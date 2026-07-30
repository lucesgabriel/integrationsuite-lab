/**
 * Fuente única de verdad para los datos personales que se muestran en el sitio.
 * Los campos con texto libre son bilingües ({ es, en }); los técnicos
 * (skills, nombres de empresas, headline) se comparten entre idiomas.
 */

export const profile = {
  name: "Gabriel Luces",
  photo: "/images/gabriel-luces.jpg",
  headline:
    "SAP Certified — Integration Developer | SAP MM · PM Consultant — Passionate about AI, ML & Automation",
  location: "Santiago, Chile",
  email: "LucesLab@gmail.com",
  linkedin: "https://www.linkedin.com/in/lucesgabriel",
  about: {
    es: [
      "Consultor SAP Senior con más de 12 años de experiencia entregando soluciones empresariales SAP en los módulos MM y PM, soportando operaciones de organizaciones retail de gran escala.",
      "Soy SAP Certified Associate — Integration Developer (certificación oficial de SAP, 2026, aprobada con el examen práctico System-based Assessment). Me especializo en SAP Integration Suite (BTP/CPI): construyo y soporto integraciones con Cloud Integration (iFlows), API Management y herramientas de conectividad SAP para fortalecer la automatización cross-system.",
      "Combino una profunda experiencia funcional SAP con especialización certificada en integración, para conectar procesos de negocio con arquitectura SAP moderna.",
    ],
    en: [
      "Senior SAP Consultant with 12+ years of experience delivering enterprise SAP solutions across the MM and PM modules, supporting operations for large-scale retail organizations.",
      "I am a SAP Certified Associate — Integration Developer (official SAP certification, 2026, earned through the hands-on System-based Assessment). I specialize in SAP Integration Suite (BTP/CPI): building and supporting integrations with Cloud Integration (iFlows), API Management and SAP connectivity tools to strengthen cross-system automation.",
      "I combine deep functional SAP expertise with certified integration specialization to bridge business processes and modern SAP architecture.",
    ],
  },
  stats: [
    {
      value: "+12",
      label: { es: "Años de experiencia SAP", en: "Years of SAP experience" },
    },
    {
      value: "22",
      label: { es: "Licencias y certificaciones", en: "Licenses & certifications" },
    },
    {
      value: "3",
      label: { es: "Áreas: MM · PM · CPI", en: "Areas: MM · PM · CPI" },
    },
  ],
  experience: [
    {
      role: "Senior SAP Consultant",
      company: "Infosys",
      period: { es: "Abr 2023 — Presente", en: "Apr 2023 — Present" },
      location: { es: "Santiago, Chile · Remoto", en: "Santiago, Chile · Remote" },
      summary: {
        es: "Cliente: cadena de retail líder en Chile. Soporte funcional SAP MM/PM e integraciones con SAP Integration Suite (CPI, APIs, conectividad SAP).",
        en: "Client: leading retail chain in Chile. SAP MM/PM functional support and integrations with SAP Integration Suite (CPI, APIs, SAP connectivity).",
      },
    },
    {
      role: "SAP MM Functional Consultant",
      company: "SNP Group",
      period: { es: "Ene 2022 — Feb 2023", en: "Jan 2022 — Feb 2023" },
      location: { es: "Santiago, Chile", en: "Santiago, Chile" },
      summary: {
        es: "Transformación digital y migraciones SAP con enfoque automatizado sobre el ecosistema ERP.",
        en: "Digital transformation and SAP migrations with an automated approach across the ERP ecosystem.",
      },
    },
    {
      role: "SAP PM MM Functional Consultant",
      company: "Infosys",
      period: { es: "Jul 2019 — Ene 2022", en: "Jul 2019 — Jan 2022" },
      location: { es: "Santiago, Chile", en: "Santiago, Chile" },
      summary: {
        es: "Cliente: cadena de retail líder en Chile. Soporte funcional, planes de trabajo detallados y mejora continua de procesos logísticos y de mantenimiento.",
        en: "Client: leading retail chain in Chile. Functional support, detailed work plans and continuous improvement of logistics and maintenance processes.",
      },
    },
    {
      role: "SAP Functional Consultant",
      company: "BC Tecnología",
      period: { es: "Ene 2019 — Jun 2019", en: "Jan 2019 — Jun 2019" },
      location: { es: "Huechuraba, Chile", en: "Huechuraba, Chile" },
      summary: {
        es: "Cliente: cadena de retail líder en Chile. Soporte funcional SAP.",
        en: "Client: leading retail chain in Chile. SAP functional support.",
      },
    },
    {
      role: "SAP Functional Consultant PM, MM",
      company: "VMCA (Valor Máximo Consultores y Asesores)",
      period: { es: "Abr 2017 — Ene 2019", en: "Apr 2017 — Jan 2019" },
      location: { es: "Santiago, Chile", en: "Santiago, Chile" },
      summary: {
        es: "Configuraciones base, ABAP y soporte funcional en proyectos de implementación.",
        en: "Baseline configuration, ABAP and functional support on implementation projects.",
      },
    },
  ],
  education: [
    {
      school: "Universidad de Chile",
      degree: {
        es: "Ingeniero Civil en Electricidad (Revalida de Título)",
        en: "Civil Electrical Engineer (degree revalidation)",
      },
      period: "2017",
    },
    {
      school: "Universidad del Zulia",
      degree: {
        es: "Ingeniero Electricista, Electrical and Electronics Engineering",
        en: "Electrical Engineer, Electrical and Electronics Engineering",
      },
      period: "2004 — 2011",
    },
  ],
  certifications: [
    {
      name: "SAP Certified Associate — Integration Developer",
      issuer: "SAP",
      year: "2026",
    },
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
    {
      name: { es: "Español", en: "Spanish" },
      level: { es: "Nativo", en: "Native" },
    },
    {
      name: { es: "Inglés", en: "English" },
      level: { es: "Profesional completo", en: "Full professional" },
    },
  ],
};

export type Profile = typeof profile;

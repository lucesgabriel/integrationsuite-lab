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
      "Consultor SAP Senior con más de 12 años de trayectoria diseñando, implementando y soportando soluciones SAP en los módulos MM y PM para operaciones de retail de gran escala — entornos donde la continuidad operacional y la precisión de los procesos logísticos son críticas para el negocio.",
      "SAP Certified Associate — Integration Developer (2026), certificación obtenida mediante el System-based Assessment: un examen 100% práctico, resuelto construyendo artefactos reales en un tenant de SAP Integration Suite. Mi foco actual es la integración empresarial sobre SAP BTP: diseño iFlows en Cloud Integration, publico y gobierno APIs con API Management, y conecto sistemas cloud y on-premise con la seguridad, trazabilidad y monitoreo que exige un entorno productivo.",
      "Mi diferencial es una combinación poco frecuente: dominio funcional del negocio y especialización técnica certificada en integración. Entiendo el proceso que vive detrás de cada interfaz — y eso se traduce en integraciones que resuelven problemas reales, documentadas caso a caso en este sitio.",
    ],
    en: [
      "Senior SAP Consultant with over 12 years of experience designing, implementing and supporting SAP solutions across the MM and PM modules for large-scale retail operations — environments where operational continuity and logistics process accuracy are business-critical.",
      "SAP Certified Associate — Integration Developer (2026), earned through the System-based Assessment: a 100% hands-on exam solved by building real artifacts on a live SAP Integration Suite tenant. My current focus is enterprise integration on SAP BTP: designing iFlows in Cloud Integration, publishing and governing APIs with API Management, and connecting cloud and on-premise systems with the security, traceability and monitoring a productive landscape demands.",
      "What sets me apart is an uncommon combination: functional command of the business and certified technical specialization in integration. I understand the process living behind every interface — and that translates into integrations that solve real problems, documented case by case on this site.",
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

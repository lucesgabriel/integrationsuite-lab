/**
 * Diccionario de traducciones de la UI. Los artículos (.md) se publican en
 * español; en inglés se muestra un aviso (ver blog.spanishOnly).
 * Para agregar un idioma: añadir la clave y completar el mismo objeto.
 */

const es = {
  nav: {
    home: "Inicio",
    skip: "Saltar al contenido",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    blog: "Artículos",
    resources: "Recursos",
    about: "Sobre mí",
    contact: "Contacto",
  },
  resources: {
    title: "Recursos",
    description:
      "Colecciones Postman, esquemas, plantillas y diagramas listos para descargar — los mismos artefactos de los casos resueltos del laboratorio.",
    note: "Todos los archivos usan placeholders (<tenant>, <TU_APIKEY>…) — sin credenciales ni datos de sistemas reales.",
    download: "Descargar",
    fromCase: "Ver el caso →",
    categories: {
      postman: "Colecciones Postman",
      schemas: "Esquemas XSD",
      groovy: "Plantillas Groovy",
      diagrams: "Diagramas editables",
    },
  },
  hero: {
    badge: "SAP Certified — Integration Developer",
    titlePre: "Domina ",
    titleHighlight: "SAP Integration Suite",
    titlePost: " con contenido práctico",
    description:
      "Soy Gabriel Luces, consultor SAP con +12 años de experiencia. Comparto guías, ejercicios y lecciones reales sobre Cloud Integration, API Management y arquitectura de integración en SAP BTP.",
    ctaBlog: "Ver artículos",
    ctaAbout: "Sobre mí",
  },
  topics: {
    heading: "¿Qué encontrarás aquí?",
    subheading: "Los pilares de SAP Integration Suite, explicados desde la práctica.",
    items: [
      {
        title: "Cloud Integration (CPI)",
        description:
          "Diseño de iFlows, Content Modifier, Router, Splitter, Message Mapping y manejo de errores con Exception Subprocess.",
      },
      {
        title: "API Management",
        description:
          "API Proxies, políticas de seguridad (API Key, OAuth, rate limiting) y publicación de productos en el Developer Hub.",
      },
      {
        title: "Conectividad & Adaptadores",
        description:
          "OData, SFTP, HTTP, RFC, IDoc y conexión on-premise con Cloud Connector y Location ID.",
      },
      {
        title: "Groovy Scripting",
        description:
          "Scripts para transformación de mensajes, logging de payloads y manipulación de headers y properties.",
      },
      {
        title: "Event Mesh & EDA",
        description:
          "Arquitecturas orientadas a eventos, colas JMS y patrones de integración asíncrona en SAP BTP.",
      },
      {
        title: "Certificación C_CPI_15",
        description:
          "Guías de estudio, ejercicios prácticos y simulacros para la certificación SAP Integration Developer.",
      },
    ],
  },
  posts: {
    heading: "Últimos artículos",
    subheading: "Guías y lecciones desde proyectos de integración reales.",
    viewAll: "Ver todos →",
    read: "Leer →",
  },
  cta: {
    heading: "¿Hablamos de integración SAP?",
    description:
      "Si trabajas con SAP BTP o necesitas apoyo en un proyecto de integración, conectemos.",
    button: "Conectar en LinkedIn",
  },
  blog: {
    title: "Artículos",
    description:
      "Guías prácticas y notas técnicas sobre SAP Integration Suite, escritas desde proyectos de integración reales.",
    all: "Todos",
    search: "Buscar artículos",
    searchPlaceholder: "Ej.: OData, mantenimiento, API Management…",
    filterLabel: "Filtrar por tema",
    results: "artículos encontrados",
    clear: "Limpiar filtros",
    readingTime: "min de lectura",
    tableLabel: "Tabla del artículo: desplaza horizontalmente para ver más columnas",
    empty: "No hay artículos que coincidan. Prueba otra búsqueda o limpia los filtros.",
    back: "← Volver a artículos",
    notFound: "Artículo no encontrado",
    spanishOnly: "",
    copy: "Copiar",
    copied: "¡Copiado!",
  },
  about: {
    skills: "Especialidades",
    experience: "Experiencia",
    certifications: "Certificaciones destacadas",
    education: "Educación",
    languages: "Idiomas",
    contactHeading: "Contacto",
    contactText: "¿Tienes un proyecto de integración o quieres intercambiar ideas?",
    sendMessage: "Enviar mensaje",
    photoAlt: "Foto de",
  },
  contact: {
    title: "¿Hablamos de integración SAP?",
    description:
      "Proyectos de integración, dudas técnicas sobre SAP Integration Suite, propuestas o simplemente intercambiar ideas — escríbeme y te respondo.",
    linkedinNote: "La vía más rápida — suelo responder el mismo día.",
    emailLabel: "Email",
    locationLabel: "Ubicación",
    locationNote: "Trabajo remoto con toda LATAM",
    form: {
      name: "Nombre",
      namePlaceholder: "Tu nombre",
      email: "Email",
      emailPlaceholder: "tu@correo.com",
      message: "Mensaje",
      messagePlaceholder: "Cuéntame sobre tu proyecto de integración, duda o propuesta…",
      send: "Enviar mensaje",
      sending: "Enviando…",
      successTitle: "¡Mensaje enviado!",
      successText: "Gracias por escribir — te responderé pronto a tu correo.",
      sendAnother: "Enviar otro mensaje",
      error: "No se pudo enviar el mensaje. Inténtalo de nuevo o escríbeme a",
      pending: "El formulario estará disponible pronto. Mientras tanto, escríbeme directamente:",
    },
  },
  newsletter: {
    heading: "Nuevos casos en tu correo",
    description:
      "Recibe los nuevos casos resueltos y guías de SAP Integration Suite. Sin spam, date de baja cuando quieras.",
    placeholder: "tu@correo.com",
    subscribe: "Suscribirme",
    sending: "Enviando…",
    success: "¡Casi listo! Revisa tu correo para confirmar la suscripción.",
    error: "No se pudo completar la suscripción. Inténtalo de nuevo en un momento.",
  },
  footer: {
    tagline:
      "Contenido práctico sobre SAP Integration Suite: casos reales, errores documentados y patrones de integración empresarial.",
    navigation: "Navegación",
    topics: "Temas",
    contact: "Contacto",
    disclaimer:
      "Sitio independiente de la comunidad — no afiliado, asociado ni respaldado por SAP SE. SAP, SAP BTP y SAP Integration Suite son marcas registradas de SAP SE en Alemania y otros países.",
  },
  notFound: {
    title: "Página no encontrada",
    description: "La ruta que buscas no existe o fue movida.",
    backHome: "Volver al inicio",
  },
  seo: {
    homeTitle: "SAPIntegrationLab | SAP Integration Suite en la práctica",
    homeDesc:
      "Casos reales de SAP Integration Suite: Cloud Integration (CPI), API Management y SAP BTP, documentados pantalla a pantalla por Gabriel Luces.",
    blogTitle: "Artículos | SAPIntegrationLab",
    resourcesTitle: "Recursos | SAPIntegrationLab",
    aboutTitle: "Sobre mí | SAPIntegrationLab",
    aboutDesc:
      "Gabriel Luces — consultor SAP con +12 años de experiencia en MM, PM e Integration Suite (BTP/CPI). Experiencia, certificaciones y especialidades.",
    contactTitle: "Contacto | SAPIntegrationLab",
  },
};

const en: Translation = {
  nav: {
    home: "Home",
    skip: "Skip to content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    blog: "Articles",
    resources: "Resources",
    about: "About",
    contact: "Contact",
  },
  resources: {
    title: "Resources",
    description:
      "Postman collections, schemas, templates and diagrams ready to download — the same artifacts from the lab's solved cases.",
    note: "All files use placeholders (<tenant>, <YOUR_APIKEY>…) — no credentials or real system data.",
    download: "Download",
    fromCase: "Read the case →",
    categories: {
      postman: "Postman Collections",
      schemas: "XSD Schemas",
      groovy: "Groovy Templates",
      diagrams: "Editable Diagrams",
    },
  },
  hero: {
    badge: "SAP Certified — Integration Developer",
    titlePre: "Master ",
    titleHighlight: "SAP Integration Suite",
    titlePost: " with hands-on content",
    description:
      "I'm Gabriel Luces, an SAP consultant with 12+ years of experience. I share guides, exercises and real-world lessons on Cloud Integration, API Management and integration architecture on SAP BTP.",
    ctaBlog: "Browse articles",
    ctaAbout: "About me",
  },
  topics: {
    heading: "What you'll find here",
    subheading: "The pillars of SAP Integration Suite, explained from real practice.",
    items: [
      {
        title: "Cloud Integration (CPI)",
        description:
          "iFlow design, Content Modifier, Router, Splitter, Message Mapping and error handling with Exception Subprocess.",
      },
      {
        title: "API Management",
        description:
          "API Proxies, security policies (API Key, OAuth, rate limiting) and product publishing on the Developer Hub.",
      },
      {
        title: "Connectivity & Adapters",
        description:
          "OData, SFTP, HTTP, RFC, IDoc and on-premise connectivity with Cloud Connector and Location ID.",
      },
      {
        title: "Groovy Scripting",
        description:
          "Scripts for message transformation, payload logging and header/property manipulation.",
      },
      {
        title: "Event Mesh & EDA",
        description:
          "Event-driven architectures, JMS queues and asynchronous integration patterns on SAP BTP.",
      },
      {
        title: "C_CPI_15 Certification",
        description:
          "Study guides, hands-on exercises and mock exams for the SAP Integration Developer certification.",
      },
    ],
  },
  posts: {
    heading: "Latest articles",
    subheading: "Guides and lessons from real integration projects.",
    viewAll: "View all →",
    read: "Read →",
  },
  cta: {
    heading: "Shall we talk SAP integration?",
    description:
      "If you work with SAP BTP or need support on an integration project, let's connect.",
    button: "Connect on LinkedIn",
  },
  blog: {
    title: "Articles",
    description:
      "Practical guides and technical notes on SAP Integration Suite, written from real integration projects.",
    all: "All",
    search: "Search articles",
    searchPlaceholder: "E.g. OData, maintenance, API Management…",
    filterLabel: "Filter by topic",
    results: "articles found",
    clear: "Clear filters",
    readingTime: "min read",
    tableLabel: "Article table: scroll horizontally for more columns",
    empty: "No matching articles. Try another search or clear the filters.",
    back: "← Back to articles",
    notFound: "Article not found",
    spanishOnly:
      "📝 This article is currently available in Spanish only. English versions are coming soon.",
    copy: "Copy",
    copied: "Copied!",
  },
  about: {
    skills: "Specialties",
    experience: "Experience",
    certifications: "Featured certifications",
    education: "Education",
    languages: "Languages",
    contactHeading: "Contact",
    contactText: "Got an integration project or want to exchange ideas?",
    sendMessage: "Send a message",
    photoAlt: "Photo of",
  },
  contact: {
    title: "Shall we talk SAP integration?",
    description:
      "Integration projects, technical questions about SAP Integration Suite, proposals or just exchanging ideas — write to me and I'll reply.",
    linkedinNote: "The fastest channel — I usually reply the same day.",
    emailLabel: "Email",
    locationLabel: "Location",
    locationNote: "Working remotely across LATAM",
    form: {
      name: "Name",
      namePlaceholder: "Your name",
      email: "Email",
      emailPlaceholder: "you@email.com",
      message: "Message",
      messagePlaceholder: "Tell me about your integration project, question or proposal…",
      send: "Send message",
      sending: "Sending…",
      successTitle: "Message sent!",
      successText: "Thanks for writing — I'll get back to you soon.",
      sendAnother: "Send another message",
      error: "The message could not be sent. Try again or email me at",
      pending: "The form will be available soon. In the meantime, email me directly:",
    },
  },
  newsletter: {
    heading: "New case studies in your inbox",
    description:
      "Get new solved cases and SAP Integration Suite guides. No spam, unsubscribe anytime.",
    placeholder: "you@email.com",
    subscribe: "Subscribe",
    sending: "Sending…",
    success: "Almost there! Check your inbox to confirm your subscription.",
    error: "The subscription could not be completed. Please try again shortly.",
  },
  footer: {
    tagline:
      "Hands-on content about SAP Integration Suite: real cases, documented errors and enterprise integration patterns.",
    navigation: "Navigation",
    topics: "Topics",
    contact: "Contact",
    disclaimer:
      "Independent community site — not affiliated with, associated with or endorsed by SAP SE. SAP, SAP BTP and SAP Integration Suite are registered trademarks of SAP SE in Germany and other countries.",
  },
  notFound: {
    title: "Page not found",
    description: "The route you're looking for doesn't exist or was moved.",
    backHome: "Back to home",
  },
  seo: {
    homeTitle: "SAPIntegrationLab | Hands-on SAP Integration Suite",
    homeDesc:
      "Real SAP Integration Suite cases: Cloud Integration (CPI), API Management and SAP BTP, documented screen by screen by Gabriel Luces.",
    blogTitle: "Articles | SAPIntegrationLab",
    resourcesTitle: "Resources | SAPIntegrationLab",
    aboutTitle: "About | SAPIntegrationLab",
    aboutDesc:
      "Gabriel Luces — SAP consultant with 12+ years of experience in MM, PM and Integration Suite (BTP/CPI). Experience, certifications and specialties.",
    contactTitle: "Contact | SAPIntegrationLab",
  },
};

export type Translation = typeof es;

export const translations = { es, en };

---
title: "Aprobé la certificación SAP Integration Developer: así es el examen práctico"
description: Mi experiencia con el System-based Assessment C_CPI — cómo es el formato hands-on en un tenant real, cómo me preparé con casos prácticos y las lecciones que le daría a cualquiera que va a rendirlo.
date: 2026-07-27
tags: certificacion, c-cpi-15
---

El 24 de julio de 2026 aprobé el **System-based Assessment de SAP Certified Associate — Integration Developer**. Certificado emitido, vigente hasta julio de 2027, y una convicción reforzada: **la única forma de preparar un examen práctico es practicando**.

En [mi ruta de preparación](/blog/ruta-certificacion-cpi) prometí contar la experiencia completa cuando aprobara. Aquí está — con una aclaración importante primero.

> **Nota de confidencialidad**: el contenido específico del examen (tareas, datos, soluciones) está protegido por el acuerdo de certificación de SAP. Este post comparte el **formato, la preparación y lecciones generales** — no las respuestas. Si alguien te ofrece "las soluciones del examen", desconfía: usarlas puede costarte la certificación.

## Qué es el System-based Assessment

A diferencia del clásico examen de opción múltiple, el assessment práctico te entrega **un tenant real de SAP Integration Suite** (efímero, solo para tu sesión) y un conjunto de tareas que debes **construir de verdad**: configurar, desplegar y verificar artefactos funcionando. Nada de memorizar opciones — o sabes usar la herramienta, o no.

Lo que me encontré, a grandes rasgos:

- **Tareas independientes** que cubren las capabilities principales de Integration Suite: API Management (el ciclo completo de exposición de un servicio) y Cloud Integration (diseño de iFlows con transformación y persistencia).
- **Conectividad realista**: escenarios que involucran sistemas on-premise vía Cloud Connector, como en un proyecto real.
- **Validación automática**: al finalizar, un grader revisa que los artefactos existan, estén desplegados y se llamen exactamente como se pide. El resultado llega después en learning.sap.com → *My Certifications*.

## Cómo me preparé (y por qué funcionó)

Mi preparación fue el **método del laboratorio** que he documentado en este sitio: resolver casos completos de principio a fin, con evidencias y un registro de errores.

1. **[La API gobernada con CPI + API Management](/blog/api-gobernada-cpi-api-management)** me dio soltura con el ciclo Provider → Proxy → Product → publicación — exactamente el tipo de secuencia que un examen práctico puede pedir, contra reloj.
2. **[El caso del wrapper en Message Mapping](/blog/message-mapping-splitter-error-wrapper)** me enseñó a debuggear mappings con el trace y a entender los **contextos** — el concepto de Message Mapping que más cuesta y más se evalúa.
3. **El knowledge base de errores** (CPI-NNN) convirtió cada tropiezo del laboratorio en un reflejo: cuando algo falló durante el examen, ya sabía dónde mirar.

La consecuencia práctica: durante el assessment **no descubrí nada nuevo**. Todo lo que pidió, ya lo había construido antes en mi tenant trial — con otros nombres y otros datos, pero los mismos patrones.

## Lecciones para tu examen (las que sí puedo compartir)

1. **Lee las instrucciones dos veces antes de tocar nada.** Los exámenes prácticos son muy literales: los nombres de artefactos son case-sensitive y la validación es automática. Un typo en un nombre puede costar los puntos de toda la tarea.
2. **Los detalles "administrativos" también puntúan.** Crear un artefacto no basta: hay que desplegarlo, publicarlo o verificarlo según corresponda. En Integration Suite, "terminado" significa *running*, no *saved*.
3. **Domina los contextos del Message Mapping.** Si `removeContexts` o "cambiar el contexto de un nodo" no te dicen nada, practica eso antes que cualquier otra cosa. La simulación del editor de mapping es tu mejor amiga.
4. **Practica el ciclo APIM completo** hasta que te salga de memoria: Provider (con conectividad on-premise y Location ID), Proxy desde el provider, Product, publicación. El orden importa y la relación entre componentes se evalúa.
5. **Conoce tu tenant trial al derecho y al revés.** El entorno del examen es la misma UI de Integration Suite que usas en el trial de BTP. Si practicaste ahí, no pierdes tiempo buscando menús.
6. **Administra el reloj como en un proyecto**: primero lo que asegura puntos (artefactos creados y desplegados), después los refinamientos.
7. **Confirma la finalización.** El paso final del assessment es explícito — no cierres la sesión sin completarlo, y ten paciencia: la validación tarda unos minutos.

## El cierre de una etapa (y el comienzo de otra)

Cuando empecé este sitio, la certificación era el objetivo declarado del roadmap. Hoy el badge del inicio ya no dice "en preparación" — dice **SAP Certified**. Lo que no cambia es el método: seguir resolviendo casos reales, documentar los errores y compartirlos aquí.

Si estás preparando este examen: los [recursos del laboratorio](/recursos) (colecciones Postman, XSDs, plantillas de mapeo) son gratis y salen de los mismos casos con los que me preparé. Y si tienes dudas concretas, [escríbeme](/contacto) — responder preguntas de integración es mi forma favorita de repasar. 🎓

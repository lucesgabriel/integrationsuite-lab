---
title: Mi ruta de preparación para la certificación SAP Integration Developer
description: El plan de estudio que estoy siguiendo para certificarme — temas del examen, recursos, distribución de tiempo y los errores que conviene evitar.
date: 2026-06-08
tags: certificacion, c-cpi-15
---

Estoy en la recta final de mi preparación para la certificación **SAP Certified Associate — Integration Developer**, y quiero documentar el plan que estoy siguiendo. Si estás en el mismo camino, esto te puede ahorrar tiempo.

## Los temas del examen

El examen cubre estas áreas (el peso aproximado varía por versión):

| Área | Qué estudiar |
| --- | --- |
| Cloud Integration | iFlows, pasos de procesamiento, adaptadores, monitoreo |
| API Management | Proxies, políticas, productos, Developer Hub |
| Seguridad | OAuth 2.0, API Key, CSRF, certificados, Keystore |
| Conectividad | Cloud Connector, Location ID, destinos BTP |
| Integration Advisor / B2B | Conceptos de MIG, MAG y TPM |
| Fundamentos BTP | Subaccounts, entitlements, ISA-M |

## Mi plan de estudio

### Fase 1 — Fundamentos (2 semanas)

- SAP Learning Hub / learning.sap.com: learning journey oficial de Integration Suite.
- Cuenta trial de BTP con Integration Suite activada desde el día uno.

### Fase 2 — Práctica intensiva (4 semanas)

Aquí es donde se gana o se pierde el examen. Cada concepto se practica, no se memoriza:

- Un iFlow diario, aunque sea pequeño.
- Recrear los patrones clásicos: Content-Based Router, Splitter + Gather, Request-Reply con OData hacia S/4HANA.
- API Proxies con políticas de API Key, OAuth y rate limiting.
- Escenario on-premise con Cloud Connector y Location ID.

### Fase 3 — Simulación (1-2 semanas)

- Preguntas de muestra oficiales de SAP.
- Ejercicios cronometrados tipo examen.
- Repaso de los temas débiles detectados.

## Errores que conviene evitar

1. **Estudiar solo teoría.** Las preguntas describen escenarios; si nunca configuraste un canal SFTP, las opciones se parecen demasiado.
2. **Ignorar API Management.** Muchos vienen del mundo CPI/PO y subestiman esta sección. Las políticas (verify API Key, quota, spike arrest) caen seguro.
3. **Confundir headers y properties.** Clásico. Property = interna al iFlow; header = viaja con el mensaje.
4. **No leer el Exam Guide oficial.** Define exactamente el alcance de la versión vigente del examen.

## Recursos que estoy usando

- Learning journey oficial en learning.sap.com (gratuito).
- Tenant trial de Integration Suite para práctica diaria.
- Comunidad SAP Community para dudas puntuales.
- Ejercicios prácticos tipo examen generados con IA, con rúbricas estrictas.

**Actualización (julio 2026):** ¡aprobado! ✅ Conté la experiencia completa del examen práctico en [este post](/blog/aprobe-certificacion-sap-integration-developer).

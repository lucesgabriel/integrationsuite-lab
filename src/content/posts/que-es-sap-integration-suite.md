---
title: ¿Qué es SAP Integration Suite? Guía para empezar en 2026
description: Un recorrido por las capacidades principales de SAP Integration Suite en BTP — Cloud Integration, API Management, Event Mesh y más — y por qué es la plataforma de integración estratégica de SAP.
date: 2026-06-10
tags: fundamentos, btp
---

SAP Integration Suite es la **plataforma de integración como servicio (iPaaS)** de SAP, que corre sobre SAP Business Technology Platform (BTP). Es la apuesta estratégica de SAP para conectar aplicaciones SAP y no-SAP, en la nube y on-premise.

## Capacidades principales

### Cloud Integration (CPI)

El corazón de la suite. Aquí diseñas **iFlows** (integration flows): procesos gráficos que reciben un mensaje, lo transforman y lo entregan a uno o más destinos. Los bloques más usados:

- **Content Modifier** — manipula headers, properties y body del mensaje.
- **Router** — enruta el mensaje según condiciones (XPath o expresiones).
- **Message Mapping** — transforma estructuras (por ejemplo, IDoc a JSON).
- **Splitter / Aggregator** — divide y reagrupa mensajes.
- **Exception Subprocess** — manejo centralizado de errores.

### API Management

Publica y gobierna APIs: creas un **API Proxy** sobre tu servicio backend y le aplicas **políticas** (API Key, OAuth 2.0, rate limiting, spike arrest, CORS). Los proxies se agrupan en **API Products** y se publican en el Developer Hub.

### Event Mesh

Comunicación **asíncrona y orientada a eventos** entre aplicaciones, con colas y topics. Es la base para arquitecturas event-driven con S/4HANA.

### Otras capacidades

- **Edge Integration Cell** — corre integraciones dentro de tu propia red (hybrid deployment).
- **Integration Advisor** — acelera escenarios B2B con contenido de mapeo inteligente.
- **Trading Partner Management** — gestión de socios comerciales para EDI.
- **Open Connectors** — +170 conectores a aplicaciones de terceros.

## ¿Por qué aprenderla ahora?

1. **Migración desde PO/PI**: SAP Process Orchestration termina su mantenimiento estándar en 2027/2030. Miles de empresas están migrando a Integration Suite, y faltan especialistas.
2. **Clean Core**: la estrategia de SAP empuja las extensiones e integraciones fuera del ERP, directamente hacia BTP.
3. **Certificación C_CPI_15**: valida tu conocimiento como Integration Developer y es de las certificaciones más demandadas del ecosistema SAP.

## ¿Cómo empezar?

> Mi recomendación: crea una cuenta trial de SAP BTP, activa Integration Suite y construye tu primer iFlow el mismo día. La teoría sin práctica no sirve en integración.

En los próximos artículos construiremos un iFlow paso a paso y veremos los errores más comunes al preparar la certificación.

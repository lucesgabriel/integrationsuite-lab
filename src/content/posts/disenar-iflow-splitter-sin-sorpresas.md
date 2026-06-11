---
title: "Diseñar un iFlow con Splitter sin sorpresas: 7 decisiones antes de construir"
description: La versión preventiva del caso del wrapper — cómo documentar las decisiones de diseño de un patrón Splitter + Message Mapping + Data Store para que el error no ocurra nunca.
date: 2026-06-09
tags: casos-reales, cloud-integration, message-mapping, buenas-practicas
---

En el [post del error del wrapper](/blog/message-mapping-splitter-error-wrapper) conté cómo un Message Mapping falló en runtime porque el General Splitter conserva el elemento padre en cada segmento. Este post es la otra cara: el **mismo patrón diseñado desde cero con las lecciones ya incorporadas**, como caso de entrenamiento de mi laboratorio.

La diferencia entre ambos enfoques es la diferencia entre debuggear en runtime y decidir en diseño.

## El patrón

Lote XML → división por ítem → captura de clave → transformación → persistencia:

![Arquitectura del iFlow](/images/posts/disenar-iflow-splitter-sin-sorpresas/architecture.png)
*HTTPS Sender → General Splitter → Content Modifier → Message Mapping → Write Data Store, con Exception Subprocess.*

## Las 7 decisiones de diseño (con su porqué)

Cada caso de mi laboratorio documenta un **decision log**: qué se decidió, qué alternativas se evaluaron y por qué. Estas son las del patrón Splitter:

### DC-01 — Cloud Integration como capability principal

El caso requiere orquestación y transformación, no gobierno de APIs. Si hubiera consumidores externos con necesidad de API Keys y quotas, API Management entraría al diseño (como en [el caso Globex](/blog/api-gobernada-cpi-api-management)).

### DC-02 — Message Mapping declarativo, no Groovy

Para transformaciones estructura-a-estructura con XSDs disponibles, el Message Mapping estándar gana: es visual, mantenible y no acumula código innecesario. Groovy se reserva para lo que el mapping no puede hacer.

### DC-03 — Capturar la clave ANTES del mapping

La property `ProductId` se extrae con XPath inmediatamente después del Splitter, cuando el body todavía es una `Opportunity`. Después del mapping ese campo ya no existe y la property quedaría vacía — **sin lanzar ningún error**, que es lo peligroso.

### DC-04 — Externalizar el nombre del Data Store

`{{dataStoreName}}` como parámetro externalizado en lugar de hardcodear `DS_Logali_ProductDrafts`. Lo que varía (o podría variar) entre ambientes nunca va fijo en el artefacto.

### DC-05 — Exception Subprocess desde el día uno

No es un "nice to have" para después: sin él, cualquier error queda críptico en el monitor y no hay rama controlada de fallo.

### DC-06 — Stop on Exception desactivado en el Splitter

Decisión de resiliencia: si la oportunidad 2 de 3 falla, las otras dos deben procesarse igual. El registro fallido se diagnostica por separado.

### DC-07 — El source del mapping es el payload REAL post-split

La decisión estrella, heredada directamente del error CPI-014:

> En runtime, `Message before Step` del mapping muestra `<Opportunities><Opportunity>...</Opportunity></Opportunities>` por cada segmento. El mapping debe representar el payload real observado, no el que la lógica sugiere.

Por eso el source es `OpportunitiesSplit.xsd` (con wrapper) y todos los paths parten de `Opportunities/Opportunity/...`. Documentado **antes de construir**, el error ya no puede ocurrir.

## Checklist pre-deploy

Mi rúbrica de validación antes de desplegar cualquier iFlow de este patrón:

- [ ] XPath del Splitter probado contra el payload real de entrada
- [ ] Trace habilitado y payload post-split inspeccionado (¿wrapper conservado?)
- [ ] Source XSD del mapping coincide con el payload post-split
- [ ] Properties de claves capturadas antes de transformar
- [ ] Parámetros externalizados para todo lo que varía por ambiente
- [ ] Exception Subprocess conectado y con fin controlado
- [ ] Colección Postman con variables, sin credenciales literales

## La moraleja

Resolver un caso genera conocimiento; **documentar las decisiones lo hace reutilizable**. El error del wrapper me costó una tarde de debugging la primera vez. La segunda vez ni siquiera fue un error: era la decisión DC-07, escrita antes de abrir el editor de iFlows.

Así funciona el knowledge base de mi laboratorio: cada error se cataloga (CPI-NNN), cada decisión se registra (DC-NN), y el siguiente caso arranca consultando ambos.

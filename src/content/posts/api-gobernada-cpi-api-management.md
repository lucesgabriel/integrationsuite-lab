---
title: "De cero a API gobernada: Cloud Integration + API Management end-to-end"
description: Caso real resuelto — una API de catálogo para 40 distribuidores externos con API Keys, spike arrest, quotas, credenciales en KVM cifrado y manejo de errores con contrato JSON. Con evidencias del tenant.
date: 2026-06-11
tags: casos-reales, api-management, cloud-integration, groovy
---

Este es el caso más completo de mi laboratorio: combina **Cloud Integration** y **API Management** en una sola solución. El escenario: **Globex Beverages** tiene 40 distribuidores que llaman al call center todos los días para confirmar fichas técnicas de productos antes de levantar órdenes. La solución: una API REST gobernada.

```
GET /globex/catalog/v1/products?sku=GBX-0042
```

Cada distribuidor recibe su propia API Key, con un máximo de 100 llamadas por hora, y respuestas JSON estables incluso cuando algo sale mal.

## Arquitectura end-to-end

El consumidor nunca toca CPI directamente: **API Management es la puerta de entrada** y aplica seguridad y límites antes de delegar al iFlow.

![Arquitectura end-to-end](/images/posts/api-gobernada-cpi-api-management/01-arquitectura-e2e.png)
*Partner → API Management (políticas) → Cloud Integration (lógica) → respuesta JSON.*

## Capa 1: el iFlow en Cloud Integration

`IF_Globex_CatalogLookup` recibe el GET, valida el SKU con un Router, busca en un catálogo simulado y construye la respuesta:

![Detalle del iFlow](/images/posts/api-gobernada-cpi-api-management/02-iflow-detalle.png)
*Sender HTTPS → leer inputs (Groovy) → Router de validación → lookup → respuesta JSON. Todo error cae al Exception Subprocess.*

Así quedó en el tenant, desplegado y funcionando:

![Canvas final desplegado](/images/posts/api-gobernada-cpi-api-management/04-iflow-final-canvas.png)
*El canvas final en el tenant trial.*

### Lectura defensiva de inputs en Groovy

El sender expone `/catalog/v1` y el SKU llega como query param. La primera versión del script lanzaba `NoSuchElementException` cuando el path llegaba vacío — la versión final no asume nada:

```groovy
def query    = (message.getHeader('CamelHttpQuery', String) ?: '').trim()
def path     = (message.getHeader('CamelHttpPath', String) ?: '').trim()
def querySku = (message.getHeader('sku', String) ?: '').trim()

// Fallback seguro: query param primero, último segmento del path después
def sku = querySku ?: (path ? path.tokenize('/').last() : '')

def incoming = (message.getHeader('X-Correlation-Id', String) ?: '').trim()
message.setProperty('sku', sku)
message.setProperty('correlationId', incoming ?: UUID.randomUUID().toString())
```

![Groovy de lectura de inputs](/images/posts/api-gobernada-cpi-api-management/10-groovy-read-inputs-script.png)
*Operadores null-safe en cada lectura: nunca asumas que un header existe.*

Detalle importante: si el consumidor no envía `X-Correlation-Id`, el iFlow genera un UUID. **Toda respuesta — éxito o error — devuelve ese correlationId**, lo que permite rastrear cualquier llamada de punta a punta.

### Validación con Router y regex externalizada

El Router `RT_ValidateSku` evalúa `${property.sku} regex '${param.skuPattern}'` donde el patrón `^GBX-\d{4}$` es un **parámetro externalizado**: si mañana Globex agrega prefijos nuevos, se cambia en el deploy sin tocar el iFlow.

### Exception Subprocess: errores funcionales ≠ 500

Mi primer intento devolvía **HTTP 500 para todo**, incluso para un SKU inexistente. La causa: el Exception Subprocess terminaba en **Error End**, que hace que CPI re-lance el error. La regla de oro:

> El Exception Subprocess debe terminar en **Message End** y construir él mismo la respuesta HTTP.

```groovy
def raw = exception?.getMessage() ?: ''
def status = 500; def code = 'INTERNAL_ERROR'

if (raw.contains('INVALID_SKU_FORMAT')) { status = 400; code = 'INVALID_SKU_FORMAT' }
else if (raw.contains('SKU_NOT_FOUND')) { status = 404; code = 'SKU_NOT_FOUND' }

message.setHeader('CamelHttpResponseCode', status)
message.setHeader('Content-Type', 'application/json')
message.setBody(JsonOutput.toJson([code: code, message: text, correlationId: correlationId]))
```

![Groovy del Exception Subprocess](/images/posts/api-gobernada-cpi-api-management/03-groovy-error-response-script.png)
*Excepciones nombradas (SKU_NOT_FOUND) se mapean a códigos HTTP correctos (404).*

## Capa 2: el proxy en API Management

El proxy `Globex_Catalog_v1` aplica 4 políticas en el PreFlow, y **el orden importa**:

```
1. SpikeArrest (5 req/s)     ← frenar PRIMERO, sin gastar en validar
2. VerifyApiKey               ← después, identificar al consumidor
3. Quota (100/hora)           ← con el consumidor identificado, limitar
4. RemoveApiKeyHeader         ← limpiar antes de enviar al backend
```

¿Por qué SpikeArrest primero? Porque un atacante sin API Key válida no debería poder gastar recursos del gateway: se le frena antes de validar nada.

![Política Spike Arrest](/images/posts/api-gobernada-cpi-api-management/13-policy-spike-arrest.png)
*Rate de 5 requests por segundo como primera línea de defensa.*

![Política Verify API Key](/images/posts/api-gobernada-cpi-api-management/14-policy-verify-api-key.png)
*La política lee `request.header.apikey` — ojo: la plantilla default trae una variable que hay que cambiar.*

### Credenciales del backend en KVM cifrado

El error más instructivo del caso: mi primera solución al 401 contra CPI fue pegar el header `Authorization: Basic base64(...)` directo en una política AssignMessage. Funciona… y deja la credencial **expuesta en el XML del proxy**.

La solución correcta: un **Key Value Map cifrado** (`KVM_CPI_BACKEND_AUTH`) guarda usuario y contraseña; una política `KeyValueMapOperations` los lee a variables privadas y `BasicAuthentication` genera el header en runtime:

![Política KVM](/images/posts/api-gobernada-cpi-api-management/26-policy-read-cpi-credentials-kvm.png)
*Las credenciales viven cifradas en el KVM, nunca en el XML. Rotarlas no requiere redeploy.*

Así el consumidor solo conoce su API Key, y APIM autentica silenciosamente contra CPI con credenciales internas.

## La prueba de fuego: 4 códigos HTTP

Toda respuesta sigue el mismo contrato JSON (`code`, `message`, `correlationId`). Las evidencias desde Postman:

**200 — Happy path** con API Key válida y SKU existente:

![Postman 200](/images/posts/api-gobernada-cpi-api-management/01-postman-apim-200.png)
*GBX-0042: Globex Lemonade 1L, con correlationId para trazabilidad.*

**400 — SKU con formato inválido** (lo atrapa el Router en CPI):

![Postman 400](/images/posts/api-gobernada-cpi-api-management/02-postman-apim-400-invalid-sku.png)
*INVALID_SKU_FORMAT: el patrón GBX-\d{4} no se cumple.*

**404 — SKU bien formado pero inexistente** (lo lanza el lookup):

![Postman 404](/images/posts/api-gobernada-cpi-api-management/03-postman-apim-404-sku-not-found.png)
*SKU_NOT_FOUND: error funcional con código HTTP correcto, no un 500 genérico.*

**401 — API Key inválida** (lo corta APIM antes de llegar a CPI):

![Postman 401](/images/posts/api-gobernada-cpi-api-management/05-postman-apim-401-invalid-apikey.png)
*El gateway protege el backend: sin credencial válida, CPI ni se entera.*

## Las 6 lecciones del caso

1. **APIM siempre delante de CPI** cuando hay consumidores externos: gobierno, identidad y límites no son responsabilidad del iFlow.
2. **El orden de las políticas importa**: SpikeArrest → VerifyApiKey → Quota → limpieza de headers.
3. **Secrets nunca en XML**: KVM cifrado + BasicAuthentication. Pegar un Base64 en una política es una credencial filtrada.
4. **Exception Subprocess termina en Message End** — o todos tus errores funcionales serán 500.
5. **Contrato JSON consistente** en todas las respuestas, con correlationId siempre presente.
6. **En tenant Trial, copia la URL del proxy desde la UI**: la URL real incluye un prefijo de cuenta que no adivinas armándola a mano.

Este caso quedó registrado con 8 errores documentados en el error-log — cada uno promovido a mi knowledge base para no repetirlo. Esa es la verdadera ganancia de resolver casos completos: el conocimiento compuesto.

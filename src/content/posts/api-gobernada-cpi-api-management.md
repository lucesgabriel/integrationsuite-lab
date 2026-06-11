---
title: "De cero a API gobernada: Cloud Integration + API Management end-to-end"
description: Caso real resuelto y documentado pantalla a pantalla — una API de catálogo para 40 distribuidores externos con API Keys, spike arrest, quotas, credenciales en KVM cifrado, Developer Portal y manejo de errores con contrato JSON.
date: 2026-06-11
tags: casos-reales, api-management, cloud-integration, groovy
---

Este es el caso más completo de mi laboratorio: combina **Cloud Integration** y **API Management** en una sola solución, documentada pantalla a pantalla en un tenant trial de SAP BTP. El escenario: **Globex Beverages** tiene 40 distribuidores que llaman al call center todos los días para confirmar fichas técnicas de productos antes de levantar órdenes. La solución: una API REST gobernada.

```
GET /globex/catalog/v1/products?sku=GBX-0042
```

Cada distribuidor recibe su propia API Key, con un máximo de 100 llamadas por hora, y respuestas JSON estables incluso cuando algo sale mal.

## Arquitectura end-to-end

El consumidor nunca toca CPI directamente: **API Management es la puerta de entrada** y aplica seguridad y límites antes de delegar al iFlow.

![Arquitectura end-to-end](/images/posts/api-gobernada-cpi-api-management/01-arquitectura-e2e.png)
*Partner → API Management (políticas) → Cloud Integration (lógica) → respuesta JSON.*

## Punto de partida: el tenant en BTP

Todo corre sobre una subaccount trial con **Integration Suite** suscrita y dos capabilities activadas (Cloud Integration y API Management). Desde el cockpit de BTP se ven la suscripción, las instancias de proceso y el entorno Cloud Foundry:

![Subaccount BTP](/images/posts/api-gobernada-cpi-api-management/01-btp-subaccount-instances.png)
*La base: Integration Suite suscrita y las instancias con sus service keys para la conectividad.*

> ⚠️ Del service key salen el usuario y secret con los que APIM se autenticará contra CPI. Trátalo como una credencial productiva: nunca lo pegues en texto plano ni lo dejes visible en capturas.

## Capa 1: el iFlow en Cloud Integration

`IF_Globex_CatalogLookup` recibe el GET, valida el SKU con un Router, busca en un catálogo simulado y construye la respuesta:

![Detalle del iFlow](/images/posts/api-gobernada-cpi-api-management/02-iflow-detalle.png)
*Sender HTTPS → leer inputs (Groovy) → Router de validación → lookup → respuesta JSON. Todo error cae al Exception Subprocess.*

Así quedó en el tenant, desplegado y funcionando:

![Canvas final desplegado](/images/posts/api-gobernada-cpi-api-management/04-iflow-final-canvas.png)
*El canvas final en el tenant trial.*

### El Sender HTTPS

Address `/catalog/v1`, autorización por **User Role** (`ESBMessaging.send`) y CSRF desactivado — es un GET idempotente:

![HTTPS Sender](/images/posts/api-gobernada-cpi-api-management/13-https-sender-address.png)
*El endpoint que solo APIM debería invocar.*

### Lectura defensiva de inputs en Groovy

El SKU llega como query param. La primera versión del script lanzaba `NoSuchElementException` cuando el path llegaba vacío — la versión final no asume nada:

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

### Router con regex externalizada

El Router `RT_ValidateSku` tiene dos rutas: la válida (con condición) y la default (que lanza la excepción `INVALID_SKU_FORMAT`):

![Rutas del Router](/images/posts/api-gobernada-cpi-api-management/09-iflow-router-routes.png)
*Dos caminos: SKU válido sigue al lookup; el resto cae a la ruta de error.*

La condición evalúa `${property.sku}` contra el patrón `^GBX-\d{4}$`, que vive en un **parámetro externalizado** (`param.skuPattern`) — si mañana Globex agrega prefijos nuevos, se cambia en el deploy sin tocar el iFlow:

![Condición de la ruta válida](/images/posts/api-gobernada-cpi-api-management/08-iflow-route-valid-condition.png)
*La regex no está hardcodeada: es configuración, no código.*

### Properties con Content Modifier

Las propiedades del producto encontrado se llevan en **Exchange Properties** (no contaminan el body) y el Content Modifier final arma el JSON de respuesta leyéndolas:

![Content Modifier properties](/images/posts/api-gobernada-cpi-api-management/12-content-modifier-properties.png)
*Properties para la lógica interna; el body se construye al final.*

### Validación extra en Groovy

Además del Router, el script de lookup valida el SKU y lanza excepciones **nombradas** que después se mapean a códigos HTTP:

![Groovy de validación de SKU](/images/posts/api-gobernada-cpi-api-management/05-groovy-invalid-sku-script.png)
*Excepciones con nombre (INVALID_SKU_FORMAT, SKU_NOT_FOUND): el Exception Subprocess las traduce a 400/404.*

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
*Excepciones técnicas convertidas en respuestas HTTP controladas, siempre con el mismo contrato JSON.*

## Capa 2: API Management

### El API Provider: el puente hacia CPI

Antes del proxy, APIM necesita saber dónde vive el backend. El **API Provider** `APIP_CPI_Trial` apunta al runtime de Cloud Integration con autenticación Basic — y las credenciales se guardan por **alias de Security Material**, no pegadas en la UI:

![API Provider](/images/posts/api-gobernada-cpi-api-management/11-api-provider-overview.png)
*El provider conecta APIM con el runtime de CPI del tenant.*

### Las políticas del proxy — el orden importa

El proxy `Globex_Catalog_v1` aplica 4 políticas en el PreFlow, y **el orden no es negociable**:

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

La **Quota** limita a 100 llamadas/hora por producto, usando `apiproduct.name` como identificador — cada producto lleva su propio contador:

![Política Quota](/images/posts/api-gobernada-cpi-api-management/15-policy-quota.png)
*100 llamadas por hora; a la 101 el consumidor recibe 429 QUOTA_EXCEEDED.*

Y antes de delegar al backend, la API Key del consumidor **se elimina del request** — CPI no tiene por qué conocer las credenciales de los distribuidores:

![Política Remove API Key](/images/posts/api-gobernada-cpi-api-management/16-policy-remove-apikey-header.png)
*Higiene de headers: lo que identifica al consumidor se queda en el gateway.*

### Credenciales del backend en KVM cifrado

El error más instructivo del caso: mi primera solución al 401 contra CPI fue pegar el header `Authorization: Basic base64(...)` directo en una política AssignMessage. Funciona… y deja la credencial **expuesta en el XML del proxy**.

La solución correcta: un **Key Value Map cifrado** guarda usuario y contraseña — fíjate cómo la UI ya no muestra los valores:

![KVM entries](/images/posts/api-gobernada-cpi-api-management/24-kvm-cpi-backend-auth-entries.png)
*KVM_CPI_BACKEND_AUTH: las entradas cpi.username y cpi.password viven cifradas (*****).*

En el TargetEndpoint, una política `KeyValueMapOperations` lee esas entradas a variables privadas:

![Política KVM](/images/posts/api-gobernada-cpi-api-management/26-policy-read-cpi-credentials-kvm.png)
*Lectura del KVM hacia variables `private.*` — volátiles, solo en memoria.*

Y `BasicAuthentication` genera el header `Authorization` en runtime:

![Política Basic Auth](/images/posts/api-gobernada-cpi-api-management/27-policy-basic-auth-from-kvm.png)
*El Base64 se construye al vuelo. Rotar credenciales = actualizar el KVM, sin redeploy del proxy.*

Así el consumidor solo conoce su API Key, y APIM autentica silenciosamente contra CPI con credenciales internas.

### Producto y aplicación: el ciclo completo del Developer Portal

El proxy no se consume directo: se empaqueta en el **API Product** `PRD_Globex_Partner_Catalog`…

![API Product](/images/posts/api-gobernada-cpi-api-management/06-api-product-overview.png)
*El producto agrupa el proxy y define qué se publica en el Developer Hub.*

…y cada distribuidor crea su **Application** suscrita al producto, que es donde nace su API Key:

![App en el Developer Portal](/images/posts/api-gobernada-cpi-api-management/01-devportal-demo-app-details.png)
*APP_Demo_Distributor_GBX: key y secret propios por distribuidor (enmascarados). 36 llamadas este mes — el portal también da analytics.*

Este es el ciclo completo que pide la certificación: **API Provider → API Proxy → políticas → API Product → Application → API Key**.

## La prueba de fuego: 5 escenarios HTTP

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

**401 — Sin API Key** (lo corta APIM antes de llegar a CPI):

![Postman 401 sin key](/images/posts/api-gobernada-cpi-api-management/04-postman-apim-401-missing-apikey.png)
*Falta el header apikey: el gateway rechaza sin gastar un solo recurso del backend.*

**401 — API Key inválida**:

![Postman 401 key inválida](/images/posts/api-gobernada-cpi-api-management/05-postman-apim-401-invalid-apikey.png)
*Una key incorrecta recibe exactamente la misma respuesta — sin pistas para un atacante.*

## Las 7 lecciones del caso

1. **APIM siempre delante de CPI** cuando hay consumidores externos: gobierno, identidad y límites no son responsabilidad del iFlow.
2. **El orden de las políticas importa**: SpikeArrest → VerifyApiKey → Quota → limpieza de headers.
3. **Secrets nunca en XML ni en capturas**: KVM cifrado + BasicAuthentication. Pegar un Base64 en una política es una credencial filtrada.
4. **Exception Subprocess termina en Message End** — o todos tus errores funcionales serán 500.
5. **Contrato JSON consistente** en todas las respuestas, con correlationId siempre presente.
6. **El ciclo Provider → Proxy → Product → App** es lo que convierte un endpoint en una API gobernada — y es pregunta segura de certificación.
7. **En tenant Trial, copia la URL del proxy desde la UI**: la URL real incluye un prefijo de cuenta que no adivinas armándola a mano.

Este caso quedó registrado con 8 errores documentados en el error-log — cada uno promovido a mi knowledge base para no repetirlo. Esa es la verdadera ganancia de resolver casos completos: el conocimiento compuesto.

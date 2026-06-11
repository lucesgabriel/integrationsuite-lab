---
title: "Message Mapping + General Splitter: el error del wrapper que casi nadie ve venir"
description: Caso real resuelto — un lote de oportunidades de venta que se divide, se transforma y se persiste en un Data Store. Incluye el error de runtime "Cannot produce target element" y cómo lo diagnostiqué con el trace.
date: 2026-06-10
tags: casos-reales, cloud-integration, message-mapping
---

Este es el primer caso de mi laboratorio que comparto completo, con capturas reales del tenant. El escenario: **Logali Consulting** recibe lotes de oportunidades ganadas desde un sistema de ventas (simulado con Postman) y debe convertir cada una en un borrador de producto, persistido en un Data Store para auditoría antes de sincronizar con S/4HANA.

Parece sencillo. Y lo es — hasta que el General Splitter te enseña algo que no está en la documentación.

## La arquitectura

El iFlow `IF_Logali_Product_Inbound_Batch` (paquete `Pkg_Logali_LeadToOrder`) tiene 5 pasos:

1. **HTTPS Sender** — recibe el lote XML en `/logali/products`
2. **General Splitter** — divide el lote en una rama por oportunidad
3. **Content Modifier** — captura el `ProductId` con XPath
4. **Message Mapping** — transforma `Opportunity` → `ProductDraft`
5. **Write Data Store** — persiste cada borrador con su ID como Entry ID

## Paso a paso con evidencias

### 1. HTTPS Sender

Address `/logali/products`, autorización **User Role** con `ESBMessaging.send` y CSRF desactivado:

![Configuración del HTTPS Sender](/images/posts/message-mapping-splitter-error-wrapper/01-https-sender-logali-products.png)
*Canal HTTPS de entrada con autorización por rol.*

### 2. General Splitter

XPath `/Opportunities/Opportunity`, Grouping `1` y **Stop on Exception desactivado** — si una oportunidad falla, las demás siguen procesándose:

![Configuración del General Splitter](/images/posts/message-mapping-splitter-error-wrapper/02-general-splitter-opportunities-opportunity.png)
*El Splitter genera una rama por cada `<Opportunity>` del lote.*

### 3. Content Modifier ANTES del mapping

Aquí va la primera lección: la property `ProductId` se captura con XPath **antes** de transformar el mensaje, porque después del mapping el body ya es un `ProductDraft` y el path `/Opportunity/Id` no existe:

![Content Modifier con XPath](/images/posts/message-mapping-splitter-error-wrapper/03-content-modifier-productid-xpath.png)
*La clave del Data Store se extrae mientras el XML todavía es una Opportunity.*

### 4. Message Mapping

Y aquí viene **el error del caso**. Mi primer intento usaba `Opportunity.xsd` como source del mapping `MM_SalesforceOpp_to_ProductDraft`. El deploy pasó sin problemas… y el runtime explotó:

```
Cannot produce target element /ProductDraft
```

![Trace del error en runtime](/images/posts/message-mapping-splitter-error-wrapper/07-runtime-error-wrapper-trace.png)
*El monitor mostraba el mapping fallando en cada segmento del split.*

¿La causa? Al inspeccionar **Message before Step → Payload** en el trace del primer segmento, descubrí que el General Splitter **conserva el wrapper** `<Opportunities>` en cada rama. El payload real no era:

```xml
<Opportunity>...</Opportunity>
```

sino:

```xml
<Opportunities>
  <Opportunity>...</Opportunity>
</Opportunities>
```

El mapping esperaba un root `Opportunity` y recibía `Opportunities`. La solución definitiva (evalué normalizar el XML con un paso extra y lo descarté por innecesario):

- Source del mapping: `OpportunitiesSplit.xsd` — un XSD que **incluye el wrapper**
- Root mapping: `Opportunities → ProductDraft`
- Todos los campos desde `Opportunities/Opportunity/...`
- Y el XPath del Content Modifier también: `/Opportunities/Opportunity/Id`

![Schemas del mapping](/images/posts/message-mapping-splitter-error-wrapper/01-mapping-local-schemas-opportunitiessplit-productdraft.png)
*Source corregido: OpportunitiesSplit (con wrapper) → ProductDraft.*

Los 7 campos mapeados, más la constante `USD` para el código de moneda:

![Campos del mapping](/images/posts/message-mapping-splitter-error-wrapper/02-mapping-field-links-final.png)
*Id→ProductId, Name→Name y Description, Amount→Price, Account/Id→SupplierId, Account/Name→SupplierName.*

### 5. Write Data Store con parámetros externalizados

Entry ID `${property.ProductId}` y **Overwrite = Yes** para garantizar idempotencia: reprocesar el mismo lote no genera duplicados.

![Write Data Store](/images/posts/message-mapping-splitter-error-wrapper/05-datastore-write-productdrafts.png)
*Cada ProductDraft se persiste con su ProductId como clave.*

El nombre del Data Store no va hardcodeado — se externaliza como `{{dataStoreName}}` y se configura en el deploy (`DS_Logali_ProductDrafts`), para que el transporte entre ambientes no requiera tocar el iFlow:

![Parámetro externalizado](/images/posts/message-mapping-splitter-error-wrapper/06-externalized-datastore-name.png)
*Externalized parameter: lo que cambia por ambiente nunca se hardcodea.*

## La prueba final

Lote de 3 oportunidades desde Postman → HTTP 200, y las 3 entradas en el Data Store con sus IDs correctos (`OPP-2026-00042/43/44`):

![Postman 200 OK](/images/posts/message-mapping-splitter-error-wrapper/08-postman-200-ok-response.png)
*Happy path validado tras el fix.*

## Lecciones del caso

1. **El General Splitter conserva el wrapper.** Antes de fijar el XSD source de un mapping post-split, revisa `Message before Step → Payload` en el trace del primer segmento. El payload real manda.
2. **Captura las claves antes de transformar.** Un Content Modifier mal ubicado (después del mapping) deja la property vacía sin lanzar ningún error.
3. **Externaliza lo que varía por ambiente.** El nombre del Data Store funcionaba en DEV hardcodeado… y habría fallado el transporte.
4. **Nunca exportes credenciales reales.** Las colecciones Postman van con variables `{{cpi_user}}`/`{{cpi_password}}` marcadas como secret, y las capturas se sanitizan antes de compartir.

Este caso quedó documentado en mi knowledge base como el error CPI-014. En el próximo post: la versión preventiva de este mismo patrón.

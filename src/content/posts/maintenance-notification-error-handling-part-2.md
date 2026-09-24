---
title: Avisos de mantenimiento, parte 2: validación y contrato de errores
description: Evolución del caso MIX-003 de SAP PM en S/4HANA: validaciones, GET con JSON plano y errores 400, 404, 502 y 500 con correlationId, sin Groovy. Incluye el manual PDF v2.
date: 2026-09-24
tags: sap-pm, cloud-integration, error-handling, api-management, caso-practico
---

Crear un aviso de mantenimiento es solo una parte de la integración. La aplicación del técnico también necesita saber si envió un equipo vacío, si el aviso consultado no existe o si el sistema SAP no está disponible.

En la [parte 1 del caso MIX-003](/blog/maintenance-notification-create-query-postman/) conectamos una API con **SAP S/4HANA y el módulo Plant Maintenance (PM)** mediante API Management, Cloud Integration y Cloud Connector. Esta segunda parte desarrolla la **Variante B, Bloque 1**: validar entradas, transformar la consulta en JSON y responder a errores con una estructura reconocible, usando pasos estándar y **sin Groovy**.

**Estado al 24 de septiembre de 2026:** el README y las evidencias actualizadas del laboratorio dan por cerrado el Bloque 1. Se corrigieron los XPath del GET y el mapeo del equipo; el re-test creó el aviso `10000960` y lo recuperó en JSON plano con 15 campos. Los bloques de gobierno adicional en APIM y externalización siguen pendientes.

[Descargar el manual de la parte 2 — English, v2, PDF de 12 páginas](/downloads/maintenance-notification-part-2-guide-en-v2.pdf)

El PDF contiene el diseño, las capturas de configuración, las pruebas en Bruno y los errores encontrados durante el build. También está disponible en [Recursos](/recursos/).

## Qué cambia respecto de la parte 1

| Situación | Resultado documentado en el Bloque 1 |
|---|---|
| POST válido | 201 con número de aviso y equipo sin ceros iniciales |
| GET de un aviso existente | 200 con JSON plano de 15 campos |
| Prioridad fuera de rango o equipo vacío | 400 `INVALID_REQUEST`, antes de llamar a SAP |
| Número válido de un aviso inexistente | 404 `NOTIFICATION_NOT_FOUND` |
| Equipo con formato válido, pero rechazado por SAP | 400 `BACKEND_REJECTED` |
| Cloud Connector desconectado en la prueba | 502 `BACKEND_UNAVAILABLE` |
| JSON malformado | 500 `INTERNAL_ERROR`; convertirlo en 400 queda como mejora |

El contrato común de error tiene tres campos: `code`, `message` y `correlationId`. En este bloque, la correlación utiliza el identificador del MPL; la entrada `X-Correlation-ID` del consumidor pertenece a una etapa posterior.

## El iFlow y sus nuevas rutas

El artefacto sigue siendo `Manage_MaintNotification_Postman_to_S4HANA`. Mantiene las ramas create y query y agrega validación, comprobación de existencia y un Exception Subprocess compartido.

![iFlow del Bloque 1 con validación, comprobación de existencia y Exception Subprocess](/images/posts/maintenance-notification-error-handling-part-2/iflow-bloque-1.png)
*Los pasos resaltados corresponden a la evolución del caso. Haz clic en la imagen para ampliar el diagrama.*

### Validar el POST antes del receiver

Después del JSON to XML Converter y de extraer las properties, `RT_ValidateCreateInput` evalúa una condición **Non-XML**. Las reglas del ejercicio son:

| Campo | Regla del laboratorio |
|---|---|
| Tipo de aviso | `M1`, `M2` o `M3` |
| Prioridad | Un valor entre `1` y `4` |
| Equipo | Entre 1 y 18 dígitos |
| Descripción | Entre 1 y 40 caracteres |
| Reportante | Hasta 12 caracteres alfanuméricos o guion bajo; la expresión de este bloque permite vacío |

Estas reglas reflejan el contrato del ejercicio, no todos los contratos posibles de SAP PM. La existencia del equipo todavía la decide S/4HANA: una cadena numérica puede pasar la validación y ser rechazada por el backend.

Si la entrada no cumple, `CM_RaiseInvalidRequest` fija `errorStatus`, `errorCode` y `errorMessage`; luego un Error End Event dispara el Exception Subprocess. En las pruebas de prioridad inválida y equipo vacío no aparece una llamada al receiver.

La validación ocurre **después de convertir JSON a XML**. Por eso un JSON sintácticamente inválido falla antes de este Router y, en la versión probada, termina como `500 INTERNAL_ERROR`.

### Distinguir un aviso inexistente

La consulta OData utiliza `$filter`. Un resultado vacío puede llegar con HTTP 200: el código HTTP del receiver no basta para confirmar que el documento existe.

`RT_CheckNotificationFound`, con una condición XML basada en `count()`, comprueba los registros de la respuesta. La ruta por defecto pasa por `CM_RaiseNotFound`, establece `404` y `NOTIFICATION_NOT_FOUND`, y lanza un Error End Event.

![Prueba en Bruno: aviso inexistente con respuesta 404 y correlationId](/images/posts/maintenance-notification-error-handling-part-2/test-404.png)
*B-02: el número de prueba 99999999 no existe en el laboratorio. La respuesta conserva el contrato de error a través de APIM.*

Un número con **formato inválido** es otro escenario. Durante el build se probó uno de 14 dígitos y el backend rechazó el filtro con 400. Esa prueba no demuestra el comportamiento del 404.

## Un contrato para los errores

`ES_HandleErrors` captura las excepciones del Integration Process. `CM_CaptureException` copia `${exception.message}` a la property `exMsg`, y `RT_ClassifyError` selecciona la respuesta:

1. **Error de negocio ya definido:** conserva las properties del 400 de validación o del 404.
2. **Fallo de conectividad reconocido:** devuelve `502 BACKEND_UNAVAILABLE`.
3. **Rechazo 400 reconocido del backend:** devuelve `400 BACKEND_REJECTED`.
4. **Resto de excepciones:** devuelve `500 INTERNAL_ERROR`.

La clasificación técnica de este bloque busca palabras clave en el mensaje de excepción. Es la implementación probada en el laboratorio; no garantiza clasificar automáticamente cualquier error de cualquier adapter.

En `CM_BuildError`, el header `CamelHttpResponseCode` utiliza **Type = Expression** y el valor `${property.errorStatus}`. También se establece `Content-Type: application/json`. Este es un ejemplo del contrato:

```json
{
  "code": "NOTIFICATION_NOT_FOUND",
  "message": "El aviso solicitado no existe en S/4HANA.",
  "correlationId": "<MPL_ID>"
}
```

El código se registra en `SAP_MessageProcessingLogCustomStatus` para localizar mensajes por su resultado. El subproceso termina con **Message End**, como está documentado en este caso, para devolver la respuesta construida al consumidor.

La prueba de rechazo del backend devolvió el texto técnico `Bad Request : 400`. Extraer el detalle funcional del error OData es un refinamiento adicional; ese texto por sí solo no explica al técnico por qué SAP rechazó su equipo.

## GET con JSON plano: el re-test que cerró el bloque

El primer intento de `CM_BuildQueryResponse` devolvía 200, pero concatenaba los valores del documento dentro de `maintenanceNotification`. Las properties XPath contenían solo el nombre del campo: `MaintenanceNotification` coincidía con el elemento raíz y su valor de texto incluía todo el contenido.

La corrección documentada utiliza la ruta completa en cada property, sobre el XML observado del receiver:

```text
/MaintenanceNotification/MaintenanceNotificationType/MaintenanceNotification
/MaintenanceNotification/MaintenanceNotificationType/NotificationType
/MaintenanceNotification/MaintenanceNotificationType/NotificationText
```

El 24 de septiembre se aplicaron estas rutas y el ajuste de `TechnicalObjectLabel` en la respuesta de creación. El POST devolvió `equipment = "10000"`; el GET del nuevo aviso devolvió los 15 campos esperados.

![Re-test B-09: GET del aviso 10000960 con JSON plano de 15 campos](/images/posts/maintenance-notification-error-handling-part-2/test-200-json-plano.png)
*La evidencia actualizada muestra prioridad y descripción de prioridad, fase de procesamiento, equipo, ubicación técnica, plantas y puesto de trabajo.*

`maintenanceOrder` está vacío en ese resultado porque el aviso todavía no tiene una orden asociada. Es una distinción funcional de PM: **crear el aviso no crea automáticamente una orden de mantenimiento**.

## Las nueve pruebas del laboratorio

Las pruebas se ejecutaron en Bruno a través del API proxy con `apikey`, los días 23 y 24 de septiembre. El Bloque 1 todavía no incorpora Fault Rules en APIM; los errores de CPI probados atraviesan el proxy con su status y su body.

| Prueba | Resultado documentado |
|---|---|
| B-01 · GET de un aviso existente | 200 con JSON plano después de corregir los XPath |
| B-02 · GET de un número válido inexistente | 404 `NOTIFICATION_NOT_FOUND` |
| B-03 · POST con prioridad 9 | 400 `INVALID_REQUEST`, sin llamada a SAP |
| B-04 · POST con equipo vacío | 400 `INVALID_REQUEST` |
| B-05 · POST con equipo 99999999 | 400 `BACKEND_REJECTED` |
| B-06 · GET con Cloud Connector detenido | 502 `BACKEND_UNAVAILABLE`; el conector se reinició después |
| B-07 · POST con JSON malformado | 500 `INTERNAL_ERROR`, comportamiento aceptado para este bloque |
| B-08 · POST válido | 201; el re-test creó el aviso 10000960 con equipo sin ceros iniciales |
| B-09 · GET del aviso recién creado | 200, mismo número y JSON plano de 15 campos |

Los números de aviso son evidencia histórica del entorno de laboratorio. La colección Postman descargable de la **parte 1** comprueba el contrato anterior, incluido GET en XML; no debe usarse sin adaptar sus assertions para validar esta segunda parte.

## Lecciones del build y siguientes pasos

| Síntoma | Corrección aplicada |
|---|---|
| La condición del Router se interpreta como XPath | Configurar la ruta de validación como Non-XML |
| Un Error End Event termina en `INTERNAL_ERROR` | Completar las tres Exchange Properties antes del evento para que la clasificación reconozca el error de negocio |
| El body indica error, pero HTTP responde 200 | Usar Expression para `CamelHttpResponseCode` |
| El GET concatena campos dentro del número del aviso | Especificar el XPath completo en cada property de respuesta |

**El Bloque 1 está cerrado según el README actualizado y sus pruebas.** La siguiente etapa, Bloque 2, contempla Spike Arrest, Quota por aplicación, eliminación de `apikey` antes del target y Fault Rules en API Management. El Bloque 3 contempla parámetros externalizados y un `X-Correlation-ID` proporcionado por el consumidor.

El salto respecto de la primera parte es concreto: la aplicación ya puede distinguir una entrada inválida, un aviso inexistente y un fallo de conectividad, y el GET devuelve datos utilizables del proceso de mantenimiento.

[Leer la parte 1](/blog/maintenance-notification-create-query-postman/) · [Descargar el manual parte 2 en inglés — v2](/downloads/maintenance-notification-part-2-guide-en-v2.pdf)

---
title: Crear y consultar avisos de mantenimiento en S/4HANA desde una API
description: Caso MIX-003 de SAP PM: crear avisos M2 con equipo y consultarlos desde Postman, usando Cloud Integration, API Management y Cloud Connector. Incluye pruebas y lecciones del laboratorio.
date: 2026-09-22
tags: sap-pm, cloud-integration, api-management, odata, caso-practico
---

Un técnico detecta una avería en terreno. Necesita reportar qué ocurrió, en qué equipo y con qué prioridad, sin esperar a que otra persona transcriba esa información en SAP.

El caso **SIS-CASE-MIX-003** conecta ese proceso de **Plant Maintenance (PM)** con SAP Integration Suite: una aplicación externa crea un aviso de mantenimiento en S/4HANA y luego consulta el número asignado. Es la continuación del caso de [consulta de órdenes de mantenimiento](/blog/maintenance-order-lookup-simple-postman/).

**Un aviso registra la necesidad de mantenimiento; no crea automáticamente una orden.** La planificación y ejecución de la intervención corresponden a pasos posteriores del proceso PM.

[Descargar colección Postman y environment del caso MIX-003](/downloads/maintenance-notification-postman.zip)

**Manual del caso en PDF (11 páginas):** [Español](/downloads/maintenance-notification-guide-es.pdf) · [English](/downloads/maintenance-notification-guide-en.pdf). Incluye arquitectura, capturas, pruebas y lecciones de la implementación inicial. También disponible en [Recursos](/recursos/).

## Qué está probado y qué queda pendiente

Las evidencias del laboratorio del **22 de septiembre de 2026**, tomadas con Bruno, muestran creación directa por CPI y a través de APIM, más consultas posteriores. La colección Postman de esta publicación adapta esas operaciones para reproducirlas en tu entorno.

| Operación | Comportamiento de la prueba inicial |
|---|---|
| POST a CPI o APIM | HTTP 201 con JSON y el número asignado por SAP |
| GET con `notificationNumber` | HTTP 200 con el XML devuelto por el adapter OData |
| Validaciones y errores de negocio | Todavía sin un contrato completo y uniforme |
| Cierre del caso | Pendiente: completar la respuesta del GET y la confirmación funcional en SAP |

El caso también contiene una revisión de diseño con XSD, XSLT, errores controlados y más policies. **Esos recursos revisados no equivalen a una implementación completa validada en el tenant.** Aquí distinguimos la prueba inicial de esa evolución.

## En esta guía

- [El escenario de negocio](#el-escenario-de-negocio)
- [Conectividad y contrato](#conectividad-y-contrato)
- [Un iFlow para POST y GET](#un-iflow-para-post-y-get)
- [Exposición con API Management](#exposicion-con-api-management)
- [Pruebas desde Postman](#pruebas-desde-postman)
- [Errores y lecciones](#errores-y-lecciones)
- [Cómo evolucionar la prueba](#como-evolucionar-la-prueba)

## El escenario de negocio

En la empresa ficticia del ejercicio, los contratistas reportan fallas desde una aplicación externa. El equipo de mantenimiento solicita dos operaciones:

1. Crear un aviso de avería de tipo `M2`, indicando descripción, prioridad, equipo y reportante.
2. Consultar ese aviso por su número para comprobar que quedó registrado.

El equipo es esencial: obtener un 201 con un aviso sin objeto técnico no cumple el objetivo funcional. Deben comprobarse también la asociación al equipo y los datos derivados por S/4HANA, como planta y ubicación técnica.

La API pública recibe al consumidor en API Management. Cloud Integration transforma el mensaje y accede al sistema on-premise mediante Cloud Connector:

```text
Postman / aplicación del técnico
  → API Management: API Key del consumidor
  → Cloud Integration: Router POST / GET
  → Cloud Connector
  → SAP S/4HANA: API_MAINTNOTIFICATION
```

La API Key identifica a la aplicación. El campo `reportedBy` es un dato declarado en el payload, no una identidad autenticada del técnico.

## Conectividad y contrato

### Preparar el acceso al backend

En Cloud Connector habilita el recurso `/sap/opu/odata/sap/API_MAINTNOTIFICATION` con **Path And All Sub-Paths**, sobre el mapping autorizado hacia S/4HANA. No reemplaces el recurso de Maintenance Order del caso anterior.

Confirma el host virtual, el puerto, el Location ID y una credencial de backend con permisos de creación y consulta. En el receiver se usa el host virtual, no el host interno del servidor SAP.

Antes de construir, verifica el EDMX del sistema objetivo. En el laboratorio se trabajó con:

| Elemento | Valor observado |
|---|---|
| Servicio | `API_MAINTNOTIFICATION` |
| EntitySet | `MaintenanceNotification` |
| EntityType | `MaintenanceNotificationType` |
| Equipo al crear | `TechnicalObject` |
| Discriminador del objeto | `TechObjIsEquipOrFuncnlLoc = EAMS_EQUI` |

En el backend del caso, `FunctionalLocation` no se envía como campo modificable del Create: SAP deriva la ubicación a partir del equipo. Estas decisiones deben contrastarse con la metadata, configuración y autorizaciones de tu versión de S/4HANA.

### Entrada para crear un aviso

```http
POST {{apimUrl}}
apikey: {{apikey}}
Content-Type: application/json
```

```json
{
  "notificationType": "M2",
  "description": "Ruido anormal en rodamiento",
  "priority": "2",
  "equipment": "10000",
  "reportedBy": "CONTRATISTA1"
}
```

Los valores pertenecen al ejercicio. Sustituye el equipo y demás datos por valores permitidos en tu laboratorio. La descripción del ejemplo tiene 26 caracteres; el contrato revisado del caso fija un máximo de 40.

### Entrada para consultar

```http
GET {{apimUrl}}
apikey: {{apikey}}
notificationNumber: {{apimLastNotification}}
```

No se envía body. El número se conserva como texto y se toma del POST exitoso de esa misma capa, sin reutilizar un identificador de una ejecución anterior fallida.

## Un iFlow para POST y GET

El artefacto del laboratorio es `Manage_MaintNotification_Postman_to_S4HANA`, dentro del paquete `ACME_MAINTENANCE_NOTIFICATION`.

![Diseño del iFlow inicial con una rama de creación y otra de consulta](/images/posts/maintenance-notification-create-query-postman/iflow-detalle.png)
*Diagrama de la implementación inicial: creación con JSON de salida y consulta con XML. La ruta query por defecto es una limitación de esta versión; la revisión propone GET explícito y 405 para otros métodos.*

### Sender y selección del método

Configura el HTTPS Sender con Address `/maint-notif/v1` y autorización por el rol `ESBMessaging.send`. Declara `notificationNumber` en Allowed Header(s).

La ruta create del Router `RT_ByHttpMethod` utiliza **Expression Type = Non-XML**:

```text
${header.CamelHttpMethod} = 'POST'
```

El build inicial utilizó query como ruta por defecto. Para extenderlo, configura una ruta GET explícita y reserva el default para responder 405. Así un PUT no termina ejecutando una consulta por accidente.

### Rama de creación

La prueba inicial utiliza pasos estándar, sin Groovy:

```text
CM_MarkCreate → JX_RequestToXml → CM_ReadCreateInput
  → CM_BuildODataCreateRequest → RR_CreateNotification
  → CM_BuildCreateResponse
```

El JSON to XML Converter agrega una raíz `request`. El Content Modifier extrae por XPath los cinco campos de entrada. Su correspondencia con el backend es:

| Entrada | Campo OData |
|---|---|
| `notificationType` | `NotificationType` |
| `description` | `NotificationText` |
| `priority` | `MaintPriority` |
| `equipment` | `TechnicalObject` |
| `reportedBy` | `ReportedByUser` |
| Constante `EAMS_EQUI` | `TechObjIsEquipOrFuncnlLoc` |

Este es un ejemplo del XML de entrada al receiver para los datos controlados del ejercicio:

```xml
<MaintenanceNotification>
  <MaintenanceNotificationType>
    <NotificationType>M2</NotificationType>
    <NotificationText>Ruido anormal en rodamiento</NotificationText>
    <MaintPriority>2</MaintPriority>
    <TechnicalObject>10000</TechnicalObject>
    <TechObjIsEquipOrFuncnlLoc>EAMS_EQUI</TechObjIsEquipOrFuncnlLoc>
    <ReportedByUser>CONTRATISTA1</ReportedByUser>
  </MaintenanceNotificationType>
</MaintenanceNotification>
```

La implementación inicial armaba XML y JSON mediante Content Modifiers. Para texto arbitrario, la revisión propone **XSLT y converters con serialización**: interpolar comillas o ampersands directamente puede romper el mensaje.

### Receiver de creación y CSRF

| Configuración | Valor |
|---|---|
| Adapter | OData V2 |
| Proxy Type | On-Premise |
| Address | `http://<VIRTUAL_HOST>:<PORT>/sap/opu/odata/sap/API_MAINTNOTIFICATION` |
| Credential Name | Alias del Security Material del backend |
| Location ID | El configurado en Cloud Connector |
| Operation | Create(POST) |
| Resource Path | `MaintenanceNotification` |
| CSRF Protected | Activado |

Usa el modelo del backend para seleccionar los seis campos del Create. El adapter gestiona el token CSRF y la sesión; el consumidor no necesita obtener el token de S/4HANA. No conviene asumir un número fijo de llamadas internas: puede variar con la versión y configuración. Consulta la [documentación SAP del receiver OData V2](https://help.sap.com/docs/CLOUD_INTEGRATION/sap-cloud-integration/configure-odata-v2-receiver-adapter?locale=en-US).

El POST crea un documento real. La prueba no implementa idempotencia: **no reintentes automáticamente una creación con resultado incierto**; primero reconcilia el resultado en SAP y en el MPL.

### Rama de consulta

`CM_SetNotification` copia el header `notificationNumber` a una Exchange Property. `RR_GetNotification` llama al receiver OData V2 con Query(GET), Resource Path `MaintenanceNotification` y:

```text
$filter=MaintenanceNotification eq '${property.notificationNumber}'
```

La revisión propone validar el número antes de construir el filtro y limitar la consulta con `$top=2` para detectar cardinalidades inesperadas.

En la evidencia inicial el GET devuelve XML con raíz `MaintenanceNotification` y registros `MaintenanceNotificationType`. **Todavía no devuelve el JSON plano del POST.** También falta convertir un resultado vacío en un 404 controlado; un HTTP 200 por sí solo no prueba que exista el aviso buscado.

## Exposición con API Management

El proxy `api-maint-notif-v1` usa el base path `/acme/notifications/v1` y apunta al endpoint CPI `/http/maint-notif/v1`. La configuración inicial reenvía POST y GET hacia el mismo iFlow.

| Ubicación | Policy | Función |
|---|---|---|
| ProxyEndpoint · PreFlow | `PL_VerifyApiKey` | Validar el header `apikey` del consumidor |
| TargetEndpoint · PreFlow | `PL_KvmCpiAuth` | Leer la credencial CPI desde un KVM cifrado |
| TargetEndpoint · PreFlow, después del KVM | `PL_BasicAuthToCpi` | Construir Authorization hacia CPI |

Publica el producto `PRD_Acme_Notifications` y asocia una aplicación en Developer Hub. La Application Key de esa aplicación es la API Key del consumidor.

En Postman, el acceso vía APIM usa **No Auth** y el header `apikey`. Las credenciales Basic de CPI quedan en el proxy; no deben entregarse al consumidor externo.

Esta exposición mínima aún necesita límites de tráfico, eliminación de la API Key antes del target y Fault Rules. Para ese siguiente paso, revisa el caso de [API gobernada con CPI y API Management](/blog/api-gobernada-cpi-api-management/).

## Pruebas desde Postman

El [paquete descargable](/downloads/maintenance-notification-postman.zip) contiene una colección con carpetas CPI y APIM, un environment sin secretos y una guía de ejecución. Sus comprobaciones corresponden al **POST JSON y GET XML de la prueba inicial**.

| Variable | Configuración |
|---|---|
| `cpiUrl` | URL HTTPS completa del endpoint, incluyendo `/http/maint-notif/v1` |
| `apimUrl` | URL HTTPS completa del proxy, incluyendo `/acme/notifications/v1` y cualquier prefijo de tu tenant |
| `clientId`, `clientSecret` | Credencial del runtime CPI; solo para pruebas directas autorizadas |
| `apikey` | Application Key de la app suscrita al producto |
| `equipment`, `reportedBy` | Datos válidos del laboratorio |
| `cpiLastNotification`, `apimLastNotification` | Se guardan después de validar el POST de cada capa |

Ejecuta manualmente el POST de la capa que quieras probar. El script limpia primero el ID previo y comprueba HTTP 201, JSON, número de aviso, descripción y equipo. La comparación del equipo contempla ceros iniciales del formato interno SAP, sin modificar el valor recibido.

Después ejecuta el GET de esa misma carpeta. La colección comprueba HTTP 200 y que el XML incluya exactamente un registro con el número esperado. No uses esa prueba como validación de todos los campos funcionales: contrasta prioridad, reportante, equipo y datos derivados con SAP.

![Respuesta 201 de la creación directa por CPI en la prueba de laboratorio](/images/posts/maintenance-notification-create-query-postman/test-cpi-post-201.png)
*Evidencia del 22 de septiembre: aviso 10000954 creado desde el equipo 10000. El backend devuelve el equipo con ceros iniciales y deriva ubicación técnica y planta. La captura usa variables para el host.*

El registro del caso documenta también el aviso `10000956` creado vía APIM, con equipo `10002`. Esos números son evidencia histórica del laboratorio, no valores que debas reutilizar como resultado de tus propias pruebas.

La descarga incluye además una request sin API Key para comprobar el rechazo del proxy. Esa prueba se entrega preparada; esta publicación no afirma que se hayan ejecutado todos los escenarios negativos de la revisión.

## Errores y lecciones

| Síntoma del build o prueba | Hallazgo y corrección documentados |
|---|---|
| JSON to XML Converter en rojo; Save falla | La ruta create estaba configurada como XML. Cambiarla a Non-XML y evaluar `CamelHttpMethod`. |
| POST falla con `Technical object is invalid` | Un typo en la property `req_equipment` dejaba el objeto técnico vacío. Verificar los nombres en el Trace. |
| El Query Modeler intenta leer un EDMX local inexistente | Revisar Connection Source y utilizar Remote o un EDMX vigente del backend objetivo. |
| POST funciona aunque CSRF Protected esté desmarcado | En la versión probada el adapter recuperó el token después de un 403. Mantener CSRF Protected activado y no asumir ese comportamiento en otros entornos. |
| HTTP 201, pero faltan datos funcionales | Una creación técnicamente exitosa puede incumplir el objetivo PM. Revisar el documento completo, no solo el código HTTP. |

Para investigar, busca el MPL del mensaje y consulta Error Details. Activa Trace de forma temporal cuando necesites ver properties y payload; al compartir evidencias, retira credenciales, tokens y hosts privados.

## Cómo evolucionar la prueba

La revisión del caso prepara estos siguientes pasos:

1. Validar entrada y rechazar descripciones fuera del límite o campos obligatorios vacíos.
2. Sustituir interpolación XML/JSON por XSLT y converters que serialicen los valores.
3. Admitir solo POST y GET, con 405 para otros métodos.
4. Exigir `notificationNumber`, controlar resultados vacíos y devolver un JSON consistente.
5. Incorporar Exception Subprocess, correlation ID y un contrato de errores.
6. Externalizar conexiones y completar Quota, Spike Arrest, limpieza de headers y Fault Rules en APIM.

Cada cambio debe verificarse contra el XML real del receiver y el runtime del tenant. El caso sigue abierto hasta completar esas verificaciones y la revisión funcional en SAP; no se presenta como una solución lista para producción.

La lección principal es funcional y técnica a la vez: **la integración aporta valor cuando el aviso llega a SAP con el objeto técnico y los datos necesarios para continuar el proceso de mantenimiento.**

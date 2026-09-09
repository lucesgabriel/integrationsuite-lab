---
title: Consultar una orden de mantenimiento desde Postman: versión simple con CPI y S/4HANA
description: Caso SIS-CASE-MIX-002, Variante A. Consulta una orden por header con OData V2, devuelve un JSON de ocho campos y expón el flujo con API Management.
date: 2026-09-09
tags: cloud-integration, odata, api-management, cloud-connector, caso-practico
---

Una aplicación externa necesita consultar una orden de mantenimiento de S/4HANA por su número. Antes de construir validaciones y transformaciones más complejas, conviene comprobar el recorrido completo con una orden conocida.

Este es el **caso SIS-CASE-MIX-002, Variante A simple**: tres pasos dentro del iFlow, sin Groovy, sin XSD y sin Message Mapping. Primero probamos CPI directamente desde Postman; después agregamos una exposición mínima con API Management.

**Tiempo orientativo:** 15 minutos para el iFlow y 15 para APIM, si la conectividad, las credenciales y el servicio OData ya están preparados. La preparación del entorno queda fuera de esa estimación.

[Descargar colección Postman y environment de la versión simple](/downloads/maintenance-order-simple-postman.zip)

## En esta guía

- [Preparar el entorno](#preparar-el-entorno)
- [Construir el iFlow](#construir-el-iflow)
- [Probar desde Postman](#probar-desde-postman)
- [Exponer con API Management](#exponer-con-api-management)
- [Diagnosticar errores](#diagnosticar-errores)
- [Límites y siguiente paso](#limites-y-siguiente-paso)

## Preparar el entorno

Necesitas Cloud Integration habilitado, acceso a un backend S/4HANA con el servicio `API_MAINTENANCEORDER` y una orden que exista en ese sistema. El número `1000` es un ejemplo del laboratorio: reemplázalo por uno válido en tu entorno.

Revisa estos puntos antes de crear el flujo:

1. Cloud Connector está conectado a la subcuenta de BTP correspondiente.
2. El mapping de host virtual apunta a tu backend y el recurso `/sap/opu/odata/sap/API_MAINTENANCEORDER` permite sus subrutas.
3. El Location ID del receiver coincide con el configurado en Cloud Connector, si utilizas uno.
4. El Security Material contiene una credencial Basic del backend con permisos para consultar el servicio. En este artículo usaremos el alias de ejemplo `S4H_ODATA_BASIC`.
5. Dispones de credenciales del servicio Process Integration Runtime con el permiso `ESBMessaging.send` para invocar el iFlow. Son distintas de las credenciales de S/4HANA.

Los hosts y credenciales de esta publicación son placeholders. Configura tus valores localmente en Postman; no los incluyas en un export compartido.

## Construir el iFlow

Dentro del paquete `ACME_MAINTENANCE_ORDER`, crea el Integration Flow `Query_MaintenanceOrder_Postman_to_S4HANA` como artefacto separado del caso completo.

```text
Postman → HTTPS Sender → CM_SetOrder → RR_GetOrder → CM_BuildResponse → End
                                         │
                                         └→ OData V2 → Cloud Connector → S/4HANA
```

### 1. HTTPS Sender y header de entrada

Conecta el participante Sender al Start Event mediante HTTPS:

| Campo | Valor |
|---|---|
| Address | `/maint-simple/v1` |
| Authorization | `User Role` |
| User Role | `ESBMessaging.send` |
| CSRF Protected | Desmarcado para esta consulta GET |

En **Runtime Configuration → Allowed Header(s)** del iFlow, agrega `orderNumber`. Es necesario para que el header que envía Postman esté disponible dentro del flujo.

### 2. Content Modifier CM_SetOrder

Después del Start, agrega un Content Modifier llamado `CM_SetOrder`. En Exchange Property configura:

| Name | Source Type | Source Value | Data Type |
|---|---|---|---|
| `orderNumber` | `Header` | `orderNumber` | `java.lang.String` |

Conservamos el número como texto para no perder posibles ceros iniciales. Esta variante presupone un valor válido y conocido; todavía no incorpora validación de entrada.

### 3. Request Reply y receiver OData V2

Agrega `RR_GetOrder` y conéctalo al receiver `OD_S4H_Simple` con el adapter OData V2.

| Connection | Configuración |
|---|---|
| Address | `http://<VIRTUAL_HOST>:<VIRTUAL_PORT>/sap/opu/odata/sap/API_MAINTENANCEORDER` |
| Proxy Type | `On-Premise` |
| Location ID | El de tu Cloud Connector; vacío si no configuraste uno |
| Authentication | `Basic` |
| Credential Name | `S4H_ODATA_BASIC` |
| CSRF Protected | Desmarcado para esta consulta GET |

En Processing usa **Query(GET)**, Resource Path `MaintenanceOrder`, Content Type `Atom` y deja Custom Query Options vacío. No actives Process in Pages para esta prueba.

En **Query Options**, coloca exactamente:

```text
$filter=MaintenanceOrder eq '${property.orderNumber}'
```

El filtro selecciona la orden por su número. Comprueba que el nombre de la property y las comillas estén completos. Por tratarse de un Query, la respuesta sigue siendo una colección aunque solo coincida una orden.

En el primer smoke test omitimos `$select`. Una vez comprobada la consulta, puedes limitar los campos solicitados a los ocho que utiliza la respuesta. La documentación del [receiver OData V2 de SAP](https://help.sap.com/docs/CLOUD_INTEGRATION/sap-cloud-integration/configure-odata-v2-receiver-adapter?locale=en-US) detalla la operación y sus Query Options.

### 4. Content Modifier CM_BuildResponse

Después del Request Reply, agrega `CM_BuildResponse`. El XML observado a la salida del adapter en este laboratorio tiene una raíz `MaintenanceOrder` y registros `MaintenanceOrderType`. Verifica esa estructura en tu propio mensaje antes de reutilizar los XPath.

En Exchange Property, todas las entradas usan Source Type `XPath` y Data Type `java.lang.String`:

| Name | XPath |
|---|---|
| `res_order` | `/MaintenanceOrder/MaintenanceOrderType/MaintenanceOrder` |
| `res_type` | `/MaintenanceOrder/MaintenanceOrderType/MaintenanceOrderType` |
| `res_desc` | `/MaintenanceOrder/MaintenanceOrderType/MaintenanceOrderDesc` |
| `res_priority` | `/MaintenanceOrder/MaintenanceOrderType/MaintPriority` |
| `res_plant` | `/MaintenanceOrder/MaintenanceOrderType/MaintenancePlant` |
| `res_startDate` | `substring(/MaintenanceOrder/MaintenanceOrderType/MaintOrdBasicStartDate,1,10)` |
| `res_equipment` | `/MaintenanceOrder/MaintenanceOrderType/Equipment` |
| `res_equipmentName` | `/MaintenanceOrder/MaintenanceOrderType/EquipmentName` |

En Message Header define `Content-Type` con Source Type Constant y valor `application/json`. En Message Body selecciona **Expression** y pega:

```json
{
  "maintenanceOrder": "${property.res_order}",
  "orderType": "${property.res_type}",
  "description": "${property.res_desc}",
  "priority": "${property.res_priority}",
  "plant": "${property.res_plant}",
  "basicStartDate": "${property.res_startDate}",
  "equipment": "${property.res_equipment}",
  "equipmentName": "${property.res_equipmentName}"
}
```

Este paso ya construye el body JSON: **no agregues un XML to JSON Converter después**. Si las properties no se resuelven en tu configuración, separa la extracción XPath y la construcción del body en dos Content Modifiers consecutivos.

> La interpolación directa no escapa caracteres JSON. Una descripción con comillas, barras invertidas o saltos de línea puede producir JSON inválido. Esta plantilla sirve para datos controlados del laboratorio; para otros datos usa una transformación que serialice y escape los valores correctamente. El orden de las propiedades JSON tampoco debe ser una dependencia del consumidor.

Conecta al End Event, guarda y despliega. Espera el estado **Started** y copia el endpoint real desde Manage Integration Content.

## Probar desde Postman

Importa los dos archivos del [paquete descargable](/downloads/maintenance-order-simple-postman.zip). Selecciona el environment **Maintenance Order — Simple (template)** y configura:

| Variable | Qué colocar |
|---|---|
| `cpiBaseUrl` | Origen HTTPS del runtime CPI, sin `/http` ni barra final |
| `cpiClientId` | Client ID del servicio de runtime |
| `cpiClientSecret` | Client secret, solo en tu entorno local |
| `orderNumber` | Una orden existente; `1000` es el ejemplo |

Ejecuta **CPI directo — orden existente**:

```http
GET {{cpiBaseUrl}}/http/maint-simple/v1
orderNumber: {{orderNumber}}
```

La request utiliza Basic Auth con `cpiClientId` y `cpiClientSecret`. No tiene body. Para una orden existente, con datos compatibles con la plantilla, esperamos HTTP 200 y este contrato de ocho campos; los valores siguientes son ilustrativos:

```json
{
  "maintenanceOrder": "1000",
  "orderType": "PM01",
  "description": "Mantenimiento preventivo de equipo",
  "priority": "3",
  "plant": "1000",
  "basicStartDate": "2026-09-09",
  "equipment": "10000",
  "equipmentName": "Equipo de prueba"
}
```

La colección comprueba el estado HTTP, que el body sea JSON, los ocho nombres de campo y que la orden devuelta coincida con la solicitada. Ajusta `orderNumber` si tu backend exige un formato con ceros iniciales.

No hay un contrato 400/404 en esta versión. Las pruebas sin número o con una orden inexistente se incluyen como **diagnóstico**, sin afirmar un código que el iFlow todavía no implementa.

## Exponer con API Management

Continúa cuando la consulta directa a CPI funcione. La cadena pasa a ser:

```text
Postman -- apikey --> API Proxy -- Basic desde KVM --> CPI --> S/4HANA
```

### 1. API Provider y KVM

Crea el provider `APIP_CPI_Simple`, tipo Cloud Integration, con el **host de runtime CPI**, puerto 443 y SSL. Usa el host del endpoint que acabas de probar. Un 404 al consultar solo la raíz no demuestra que el endpoint del iFlow falle: prueba su ruta completa.

Crea el Key Value Map **cifrado** `KVM_CPI_Auth`, de scope Environment, con las entradas `username` y `password`. Guarda allí el client ID y client secret de CPI. El consumidor externo no necesita esas credenciales.

### 2. API Proxy

| Campo | Valor |
|---|---|
| Provider System | `APIP_CPI_Simple` |
| URL del target | `/http/maint-simple/v1` |
| Name | `api-maint-simple-v1` |
| API Base Path | `/acme/simple/v1` |
| Service Type | `REST` |

Mantén la Route Rule hacia el TargetEndpoint y comprueba que se reenvíe el header `orderNumber`.

### 3. Tres policies mínimas

En **ProxyEndpoint → PreFlow → Request**, agrega `PL_VerifyApiKey`:

```xml
<VerifyAPIKey xmlns="http://www.sap.com/apimgmt"
              async="false" continueOnError="false" enabled="true">
  <APIKey ref="request.header.apikey"/>
</VerifyAPIKey>
```

En **TargetEndpoint → PreFlow → Request**, agrega primero la lectura del KVM:

```xml
<KeyValueMapOperations xmlns="http://www.sap.com/apimgmt"
    mapIdentifier="KVM_CPI_Auth" async="false" continueOnError="false" enabled="true">
  <Get assignTo="private.cpiUser" index="1">
    <Key><Parameter>username</Parameter></Key>
  </Get>
  <Get assignTo="private.cpiPassword" index="1">
    <Key><Parameter>password</Parameter></Key>
  </Get>
  <Scope>environment</Scope>
</KeyValueMapOperations>
```

Después, agrega la policy de Basic Authentication:

```xml
<BasicAuthentication xmlns="http://www.sap.com/apimgmt"
    async="false" continueOnError="false" enabled="true">
  <Operation>Encode</Operation>
  <IgnoreUnresolvedVariables>false</IgnoreUnresolvedVariables>
  <User ref="private.cpiUser"/>
  <Password ref="private.cpiPassword"/>
  <AssignTo createNew="false">request.header.Authorization</AssignTo>
</BasicAuthentication>
```

Conserva el namespace SAP de estos ejemplos y haz coincidir exactamente el nombre del KVM y sus entradas. Guarda y despliega el proxy.

### 4. API Product y aplicación

Crea el producto `PRD_Acme_Simple`, asocia `api-maint-simple-v1` y publícalo. En Developer Hub crea la aplicación `APP_Demo_Simple`, suscríbela al producto y obtiene su Application Key.

En el laboratorio, el mensaje `Unable to publish Product` se resolvió activando Developer Hub. Si aparece en otro entorno, comprueba primero esa capability y los detalles del error; no es una causa universal.

### 5. Prueba final

Configura `apimBaseUrl` con el origen HTTPS de tu API proxy y `apiKey` con la Application Key local. Ejecuta **APIM — orden existente**:

```http
GET {{apimBaseUrl}}/acme/simple/v1
apikey: {{apiKey}}
orderNumber: {{orderNumber}}
```

Esta request usa **No Auth** en Postman. La autenticación hacia CPI la construye APIM. Debes recibir el mismo contrato de ocho campos que en la prueba directa.

Ejecuta también **APIM — sin API key**. Con la policy del ejemplo se espera 401; SAP documenta ese estado para la [clave que no puede resolverse en Verify API Key](https://help.sap.com/docs/integration-suite/sap-integration-suite/verify-api-key).

## Diagnosticar errores

| Síntoma | Qué revisar |
|---|---|
| 404 HTML al llamar a CPI | Estado Started y ruta `/http/maint-simple/v1` |
| 401 al llamar a CPI | Credencial del runtime y permiso `ESBMessaging.send` |
| Número vacío en el flujo | `orderNumber` en Allowed Headers y Source Type Header |
| La consulta devuelve varias órdenes | Valor enviado y Query Options completos; inspecciona la consulta real |
| Error de conexión al backend | Estado del Cloud Connector, mapping, Location ID y recurso permitido |
| JSON vacío o campos vacíos | Existencia de la orden y estructura XML que reciben los XPath |
| JSON inválido | Caracteres sin escapar en los valores interpolados |
| 401 por APIM con una key válida | KVM, orden de policies y credenciales hacia CPI; identifica qué capa rechaza la llamada |
| 500 con MPL ID | Busca ese identificador en Monitor Message Processing y revisa Error Details |

Si necesitas Trace, actívalo temporalmente para una prueba controlada y revisa properties y payload después de `RR_GetOrder`. Evita compartir capturas con Authorization, API keys o credenciales visibles.

## Límites y siguiente paso

El objetivo de la Variante A es comprobar conectividad y entender cada salto. No valida el número antes de interpolarlo en el filtro OData, no distingue una orden inexistente mediante un 404 propio y no normaliza errores del backend. La respuesta manual tiene la limitación de escape JSON descrita arriba.

Para evolucionar el caso, agrega validación y tratamiento seguro del número, detección de resultado vacío, serialización JSON, Exception Subprocess, parámetros externalizados y un contrato de errores. En APIM faltan límites de tráfico, eliminación del header `apikey` antes de enviarlo al target y Fault Rules.

Puedes continuar con el caso de [API gobernada con CPI y API Management](/blog/api-gobernada-cpi-api-management/) para estudiar esas policies, o revisar [más recursos descargables](/recursos/).

*Adaptado de la guía local «implementation-guide-variante-A-simple.md» del caso SIS-CASE-MIX-002. Esta publicación no incluye credenciales, hosts privados ni capturas del tenant. Las verificaciones sobre tu backend se realizan al ejecutar la colección en tu entorno.*

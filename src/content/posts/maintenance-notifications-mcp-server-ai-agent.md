---
title: Un agente IA que consulta y crea avisos de mantenimiento en SAP PM con MCP
description: Caso MIX-005: exponer una API de avisos S/4HANA como MCP Server en SAP Integration Suite. Dos tools, pruebas con Claude Desktop, capturas y manual descargable.
date: 2026-10-02
tags: sap-pm, api-management, cloud-integration, mcp, caso-practico
---

Un planificador de mantenimiento quiere consultar un aviso desde una conversación y registrar otro sin completar una petición HTTP a mano. **SIS-CASE-MIX-005** conecta ese agente con **SAP Plant Maintenance (PM)** mediante dos herramientas MCP: consultar un aviso por número y crear un aviso con datos explícitos.

El caso reutiliza la API de [MIX-003](/blog/maintenance-notification-create-query-postman/) y sus [validaciones de la parte 2](/blog/maintenance-notification-error-handling-part-2/). Añade un MCP Server en SAP Integration Suite, una Destination y la suscripción del agente. **No requiere un iFlow nuevo.**

**Alcance documentado al 2 de octubre de 2026:** lectura y creación verificadas en el laboratorio contra S/4HANA, con pruebas MCP, negativos principales, regresión de la API y un agente real en Claude Desktop. El aviso creado por el agente se comprobó en IW23. Quedan pendientes la evidencia de `429` por límites de tráfico, la rotación de credenciales y el cierre operativo. Publicar este caso no implica repetir esas operaciones en SAP ni certificar una solución productiva.

[Manual público en inglés — PDF de 23 páginas](/downloads/maintenance-notifications-mcp-guide-en.pdf) · [Postman, contratos y policies — ZIP](/downloads/maintenance-notifications-mcp-postman.zip) · [Todos los recursos](/recursos/)

## Arquitectura: de la conversación al aviso SAP

El agente descubre las tools y envía llamadas **JSON-RPC** al MCP Server. Una Destination dirige las llamadas a API Management; el proxy reutiliza Cloud Integration y el acceso a S/4HANA por Cloud Connector. El negocio sigue siendo el aviso de mantenimiento: MCP aporta el contrato de herramientas que entiende el agente.

![Arquitectura de MIX-005 desde el agente hasta S/4HANA mediante MCP, API Management y Cloud Integration](/images/posts/maintenance-notifications-mcp-server-ai-agent/fig-arch.png)
*Diagrama explicativo del manual público. Las capturas de las siguientes secciones aportan la evidencia del laboratorio.*

| Componente | Función en el caso |
|---|---|
| Claude Desktop | Conversación, elección de tool y confirmación del usuario |
| MCP Server en Integration Cell | Descubrimiento, contrato y ejecución de dos tools |
| Destination HTTP | Acceso al proxy e inyección de su API key |
| API Management | Validación de consumidor, adaptación de ruta y credenciales hacia CPI |
| iFlow existente | Crear y consultar avisos mediante `API_MAINTNOTIFICATION` |
| Cloud Connector y S/4HANA | Conectividad al backend y persistencia del aviso |

El runtime utilizado es **Integration Cell**. Para la ruta elegida, SAP documenta un endpoint HTTP, una especificación OpenAPI y la configuración de conectividad como base del servidor. La disponibilidad depende del entorno y del plan de servicio; se debe comprobar antes del build. [Referencia SAP: crear MCP Server desde un endpoint HTTP](https://help.sap.com/docs/integration-suite/isuite-integrations-and-apis/create-mcp-server-from-http-endpoint).

## Preparar la API existente

El OpenAPI expone `GET /v1/{notificationNumber}` y `POST /v1`, bajo la ruta relativa `/acme/notifications`. En el laboratorio, el iFlow esperaba el número en el header `notificationNumber`. Fue necesario adaptar el proxy para que la ruta pública y el contrato existente coincidieran.

1. Crear el flow condicional `GetByNumber` para `(proxy.pathsuffix MatchesPath "/*") and (request.verb = "GET")`.
2. Extraer `/{notificationNumber}` con `EV_NotifNumberFromPath` y asignar el header con `AM_NotifNumberToHeader` en el Request del flow.
3. En TargetEndpoint PreFlow, después de preparar la autenticación a CPI, aplicar `AM_NoPathSuffix`: `target.copy.pathsuffix=false`. Evita concatenar el número al endpoint fijo del iFlow y provocar un 404.
4. Activar **Edit** en el editor de policies y comprobar que los pasos quedaron realmente adjuntos. Ver una policy disponible no prueba que el flow la ejecute.

La regresión del caso registró `POST 201` y `GET 200` a través de APIM. Es una comprobación separada del ciclo MCP: primero debe funcionar la API que el servidor invocará.

## Separar las identidades en cada salto

El token del agente autentica la entrada al MCP Server. La Destination utiliza la API key del consumidor de APIM. El proxy prepara autenticación Basic hacia CPI desde un KVM cifrado, y el iFlow emplea su Security Material para S/4HANA. Estas credenciales tienen destinatarios distintos.

En la primera prueba, el Bearer del agente llegó a CPI y produjo `403`: ese token no tenía el permiso de mensajería requerido por el receptor. La corrección fue `AM_RemoveAgentAuth` en **ProxyEndpoint PreFlow**, después de Verify API Key y antes de que el TargetEndpoint construyera el Basic de CPI. Colocarlo después de ese Basic eliminaría también la credencial correcta.

![Policy AM_RemoveAgentAuth en el PreFlow del ProxyEndpoint](/images/posts/maintenance-notifications-mcp-server-ai-agent/fig-01-proxy-preflow-remove-auth.png)
*Captura del manual: retirar el Authorization del agente antes de preparar la identidad del siguiente salto.*

La Destination `DEST_ACME_NOTIF_APIM` utiliza HTTP, Internet y `NoAuthentication`, con `URL.headers.apikey` y `IntegrationCell.Include=true`. Aquí `NoAuthentication` describe la configuración de la Destination; el header añadido sigue identificando al consumidor ante APIM. No publica el backend sin controles.

![Comprobación de conexión de la Destination HTTP](/images/posts/maintenance-notifications-mcp-server-ai-agent/fig-02-destination-check.png)
*Check Connection correcto en el laboratorio. Es un prerrequisito de conectividad, no una prueba de todas las operaciones.*

## Crear y publicar las dos tools

En el asistente de MCP Server se eligió **HTTP Endpoint with OpenAPI Specification**, la Destination anterior y la especificación del contrato. El artefacto `MCP_AcmeMaintNotification` se desplegó en su versión `1.0.3`, con estado **Started** y path `/mcp/acme/maint-notif/v1`.

![Selección de endpoint HTTP con especificación OpenAPI en el asistente MCP](/images/posts/maintenance-notifications-mcp-server-ai-agent/fig-03-wizard-step2.png)
*Configuración del origen de las herramientas en SAP Integration Suite.*

El gateway generó los nombres `get_v1_notificationNumber` y `post_v1` en este build. Se renombraron y se añadieron descripciones orientadas al negocio:

| Tool | Entrada | Resultado esperado |
|---|---|---|
| `get_maintenance_notification` | `notificationNumber`: 1–12 dígitos | JSON plano con 16 campos, incluida la orden si está asociada |
| `create_maintenance_notification` | Objeto `requestBody` con los campos de creación | Número del nuevo aviso y datos devueltos por el backend |

**El catálogo tiene únicamente dos tools**, sin actualización ni borrado.

![Catálogo con las dos tools renombradas](/images/posts/maintenance-notifications-mcp-server-ai-agent/fig-03-tools-renamed.png)
*Nombres finales visibles al consumidor MCP. El comportamiento de generación descrito corresponde a este laboratorio.*

Se configuraron Authentication con OAuth y Client Certificate, Authorization con Developer Key, Quota de **50 llamadas por hora** y Surge de **4 llamadas cada 10 segundos**. La cuota Calendar identifica al cliente con `${context.authn.getClientID()}`. Los límites están configurados; la prueba que debe demostrar el rechazo `429` sigue pendiente.

![MCP Server desplegado con estado Started](/images/posts/maintenance-notifications-mcp-server-ai-agent/fig-03-deployed-started.png)
*Estado del artefacto en Integration Cell; las pruebas funcionales se documentan por separado.*

En Developer Hub se publicó el producto `ACME Maintenance Agent Tools`, desde **AI Artifacts**, y se creó una suscripción para el agente. Key, Secret y Token URL se conservaron en el gestor de credenciales y archivos locales excluidos de la publicación. Los descargables de esta página contienen placeholders.

## Ejecutar el ciclo MCP y consultar un aviso

La revisión de protocolo probada fue **2025-06-18**, sobre Streamable HTTP. El ciclo fue `initialize`, `notifications/initialized`, `tools/list` y `tools/call`. El cliente conserva el `Mcp-Session-Id` si el servidor lo devuelve y utiliza la versión negociada en `MCP-Protocol-Version`. [Referencia MCP: ciclo de vida](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle).

![Ciclo de inicialización, descubrimiento e invocación de tools](/images/posts/maintenance-notifications-mcp-server-ai-agent/fig-mcp-cycle.png)
*Diagrama explicativo: iniciar la sesión antes de listar e invocar herramientas.*

Las peticiones al endpoint MCP usan `POST`, aunque la operación de negocio termine siendo un `GET`. Los headers incluyen `Content-Type: application/json`, `Accept: application/json, text/event-stream` y la autorización Bearer del agente. Ejemplo de consulta después de inicializar la sesión:

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "get_maintenance_notification",
    "arguments": { "notificationNumber": "10000793" }
  }
}
```

![Consulta MCP del aviso 10000793 y respuesta con sus campos](/images/posts/maintenance-notifications-mcp-server-ai-agent/fig-05-t04-get.png)
*T04: lectura documentada del aviso 10000793, asociado a la orden 1000. Estos números son evidencia histórica, no datos garantizados para otro sistema.*

El resultado incluye `structuredContent` y una representación textual en `content`. Un cliente debe interpretar el resultado MCP, no asumir éxito de negocio por recibir HTTP 200. La especificación distingue errores de protocolo de fallos de ejecución señalados con `isError`. [Referencia MCP: tools y resultados](https://modelcontextprotocol.io/specification/2025-06-18/server/tools).

## Crear un aviso: el objeto requestBody es obligatorio

El error ER-12 mostró que la tool de `POST` espera los campos dentro de **`arguments.requestBody`**. Enviarlos directamente dentro de `arguments` no respeta el esquema publicado. Las restricciones incluyen descripción de 1–40 caracteres, prioridad `1`, `2`, `3` o `4`, equipo de 1–18 dígitos y `reportedBy` de 1–12 caracteres alfanuméricos o guion bajo.

![Esquema de entrada de la tool de creación](/images/posts/maintenance-notifications-mcp-server-ai-agent/fig-04-tool-create-schema.png)
*Esquema publicado en Developer Hub: los campos de negocio quedan dentro de requestBody.*

```json
{
  "jsonrpc": "2.0",
  "id": 11,
  "method": "tools/call",
  "params": {
    "name": "create_maintenance_notification",
    "arguments": {
      "requestBody": {
        "notificationType": "M2",
        "description": "MCP LAB TEST",
        "priority": "3",
        "equipment": "10000",
        "reportedBy": "MCP_LAB"
      }
    }
  }
}
```

**Esta llamada escribe en SAP.** Los valores son ilustrativos del laboratorio: elegir un equipo autorizado y confirmar todos los datos antes de ejecutar. Que el equipo cumpla un patrón numérico no implementa una allowlist ni prueba su existencia; S/4HANA valida los datos de negocio. `reportedBy` tampoco demuestra la identidad de la persona que autorizó la acción.

![Resultado T11 de creación de un aviso a través de MCP](/images/posts/maintenance-notifications-mcp-server-ai-agent/fig-05-t11-create.png)
*T11 creó el aviso 10000965 y T12 lo consultó. La comprobación SAP se registró en IW23.*

Cada creación exitosa puede generar un aviso nuevo. No se documenta una clave de idempotencia: ante un timeout ambiguo, revisar el procesamiento y SAP antes de repetir la escritura. La confirmación conversacional observada no sustituye una autorización técnica de escritura.

## Prueba con un agente real en Claude Desktop

Se utilizó un puente local de **stdio a Streamable HTTP** para conectar Claude Desktop con las credenciales OAuth de client credentials emitidas para este laboratorio. El puente obtiene y renueva el token y gestiona la sesión MCP. Es la ruta utilizada en esta prueba; una conexión remota directa requiere un flujo OAuth adecuado al cliente.

El agente consultó el aviso `10000965`, pidió los campos faltantes y solicitó confirmación antes de crear el aviso **10000967**, con descripción **CLAUDE CHAT**. La verificación en IW23 confirmó el nuevo documento. Crear un aviso no crea automáticamente una orden de mantenimiento.

![Claude Desktop solicita datos y confirmación para crear el aviso](/images/posts/maintenance-notifications-mcp-server-ai-agent/fig-06-claude-create.png)
*G1: evidencia de la conversación del agente y de la llamada de creación autorizada por el usuario del laboratorio.*

![Aviso 10000967 creado por Claude y comprobado en IW23](/images/posts/maintenance-notifications-mcp-server-ai-agent/fig-06-iw23-claude.png)
*Comprobación del documento persistido en SAP. Las imágenes públicas ocultan datos de conexión y credenciales.*

## Qué se verificó y qué falta

| Prueba | Resultado registrado |
|---|---|
| T00–T03: token, initialize, initialized y tools/list | 200, 200, 202 y descubrimiento de dos tools |
| T04: consulta existente | Aviso 10000793, orden 1000 |
| T05: aviso inexistente | HTTP 200 con `isError=true`, `NOTIFICATION_NOT_FOUND` y correlationId |
| T06: tool desconocida | Error JSON-RPC `-32602` |
| T07: sin Bearer | HTTP 401, `noCredentials` |
| T08: número ABC | Rechazo por patrón |
| T10: prioridad 9 | Rechazo por enum, sin creación |
| T11–T12: creación y lectura | Aviso 10000965, comprobado en SAP |
| Regresión directa de MIX-003 | POST 201 creó 10000966; GET 200 |
| G1: Claude Desktop | Lectura y creación de 10000967, comprobada en IW23 |
| T09: límites de tráfico | Configuración disponible; evidencia de 429 pendiente |

![Aviso inexistente devuelto como error de ejecución de la tool](/images/posts/maintenance-notifications-mcp-server-ai-agent/fig-05-t05-not-found.png)
*T05 ilustra por qué el consumidor debe comprobar isError y el contrato de error, además del estado HTTP.*

El siguiente cierre debe completar T09, rotar las credenciales del agente y la API key, revisar seguridad y consolidar el estado del caso. Para un uso productivo también se necesitan controles de escritura, alcance por equipo o planta, auditoría de identidad y tratamiento de duplicados definidos y probados. Los límites de tráfico no sustituyen esos controles.

## Descargas y continuidad

El [manual público en inglés](/downloads/maintenance-notifications-mcp-guide-en.pdf) contiene **23 páginas y 37 imágenes**, con el desarrollo, errores y pruebas. El [paquete técnico](/downloads/maintenance-notifications-mcp-postman.zip) incluye colección Postman T00–T12, environment con placeholders, OpenAPI y cuatro policies XML. Su README indica dónde va cada policy y qué llamadas crean documentos.

Importar los archivos no ejecuta pruebas ni configura un tenant. Completar endpoints y secretos solo en el entorno local; ejecutar T11 únicamente con permiso y datos revisados. El paquete no incluye credenciales, destinos privados ni el puente local del agente.

Este caso extiende el recorrido de [API de avisos](/blog/maintenance-notification-create-query-postman/), [validación y errores](/blog/maintenance-notification-error-handling-part-2/) y [alertas de integración hacia ServiceNow](/blog/servicenow-incident-open-connectors-cloud-connector/). Ahora un agente puede usar esa API a través de un contrato MCP acotado, con resultados de laboratorio comprobados y pendientes explícitos.

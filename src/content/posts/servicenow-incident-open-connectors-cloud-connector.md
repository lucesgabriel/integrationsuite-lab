---
title: Cuando Cloud Connector cae: de un error 502 a un incidente ServiceNow
description: Caso MIX-004 de SAP PM: arquitectura, iFlows, Open Connectors, deduplicación y pruebas documentadas para alertar fallas de Cloud Connector en ServiceNow. Incluye diagramas y capturas.
date: 2026-09-29
tags: sap-pm, cloud-integration, open-connectors, servicenow, caso-practico
---

Un contratista consulta un aviso de mantenimiento desde una aplicación externa. Cloud Connector está desconectado y la API responde `502 BACKEND_UNAVAILABLE`. El error llega al consumidor, pero el equipo de soporte no recibe ninguna alerta. **SIS-CASE-MIX-004** estudia cómo convertir esa falla técnica en un incidente de ServiceNow sin perder el contrato de error de la API.

Es una continuación del [caso MIX-003, parte 2](/blog/maintenance-notification-error-handling-part-2/): aquel iFlow crea y consulta avisos del módulo **SAP Plant Maintenance (PM)** en S/4HANA. Aquí el aviso sigue siendo el objeto de negocio; el incidente es un registro operativo sobre la integración. Son procesos relacionados, pero distintos.

**Alcance de esta publicación:** ServiceNow y Open Connectors tienen pruebas de prerrequisitos; existe un registro escrito de creación y actualización de incidentes en I-02/I-03. El README del laboratorio aún marca build, pruebas completas y cierre como pendientes. Faltan respuestas finales del consumidor y evidencia concluyente de I-01 e I-04 a I-08. Las figuras de configuración y los diagramas ayudan a entender la solución; **no sustituyen esas verificaciones**.

[Descargar la ficha pública del caso (PDF)](/downloads/mix-004-servicenow-open-connectors-guide-es.pdf) · [Ver todos los recursos](/recursos/)

## El problema y la arquitectura

El consumidor entra por **API Management**. El iFlow padre de MIX-003 procesa el `POST` o `GET` del aviso y llama a S/4HANA por Cloud Connector. Si ese acceso falla, su **Exception Subprocess** clasifica el error y llama por **ProcessDirect** a un iFlow hijo. El hijo usa el adaptador **Open Connectors** para buscar, crear o actualizar el incidente en ServiceNow. Ese canal de alertas sale por Internet y no depende del túnel que acaba de fallar.

![Arquitectura documental de MIX-004 con un canal de negocio hacia S/4HANA y otro de alertas hacia ServiceNow](/images/posts/servicenow-incident-open-connectors-cloud-connector/arquitectura.png)
*Arquitectura documental del caso. El diagrama representa el flujo previsto y sus límites; no es una prueba extremo a extremo.*

El objetivo de diseño es **una falla recurrente, un incidente abierto**: la primera petición abre un ticket y las siguientes agregan notas de trabajo. Una falla de conectividad (`BACKEND_UNAVAILABLE`, categoría `network`) y un rechazo de la credencial del backend (`BACKEND_AUTH_FAILED`, categoría `software`) deben seguir rutas separadas. Esa separación evita enviar al mismo equipo dos problemas con responsables diferentes.

## Qué se comprobó antes de integrar los iFlows

En la PDI de ServiceNow se probaron la Table API, la creación y actualización de incidentes, y la búsqueda por `correlation_id`. En la instancia del conector ServiceNow de Open Connectors se probaron `GET`, `POST` y `PATCH`. La respuesta de `GET /incidents` fue un **array JSON**; `POST` y `PATCH` devolvieron **objetos JSON**. En estas pruebas, `POST` de Open Connectors respondió `200`, aunque la Table API nativa había respondido `201`.

Un `401 User is not authenticated` en la Table API se resolvió en este laboratorio al asignar al usuario técnico el rol `snc_basic_auth_api_access`, además de los permisos de incidentes. La interfaz web accesible no demostraba que Basic Auth estuviera habilitado para la API. Las credenciales de Open Connectors pertenecen al **Security Material** de Cloud Integration; ningún valor de `Authorization`, User Secret, Organization Secret o Element Token debe copiarse al iFlow, a una captura o al repositorio.

| Nivel de evidencia | Resultado documentado |
|---|---|
| ServiceNow Table API | GET, POST, filtro de estados y PATCH probados |
| Open Connectors API Docs | GET, POST, búsqueda filtrada y PATCH probados |
| Pruebas I-02/I-03 | Registro escrito de creación de un INC y actualización del mismo con una work note |
| Respuesta final del consumidor y matriz I-01–I-08 | Verificación completa pendiente |

## El iFlow hijo: buscar, crear o actualizar

El diseño separa la lógica de alertas en `Raise_Incident_OpenConnectors_to_ServiceNow`. El padre le envía por ProcessDirect encabezados `inc_*` con código de error, método HTTP, número de aviso, texto de excepción e identificador de correlación. El hijo convierte ese contexto en propiedades y prepara una **clave funcional** para la búsqueda.

![Diagrama del iFlow hijo tomado de la guía HTML interactiva](/images/posts/servicenow-incident-open-connectors-cloud-connector/iflow-hijo-diagrama.png)
*Vista documental extraída del HTML interactivo: GET del incidente abierto, decisión create/update y ruta de error propia. [Abrir a tamaño completo](/images/posts/servicenow-incident-open-connectors-cloud-connector/iflow-hijo-diagrama.png).*

La secuencia es:

1. `OC_SNOW_Find` consulta `/incidents` con la clave y los estados abiertos.
2. `RT_IncidentExists` decide entre crear con `POST` o actualizar con `PATCH /incidents/{sys_id}`. El número visible `INC...` no reemplaza al identificador interno `sys_id` para PATCH.
3. Un Content Modifier prepara el cuerpo XML y el conversor XML-to-JSON produce el payload del conector. El mensaje de excepción requiere especial cuidado al insertarse en XML; además del diseño mostrado, debe verificarse el escape de caracteres y el cierre de CDATA con datos adversos.
4. `CM_IncidentResult` y `CM_IncidentReply` devuelven el número y el estado al padre. El Exception Subprocess del hijo intenta responder `FAILED` e `incident: null` si falla la alerta, para que el error original no se pierda.

![Captura del canvas del iFlow hijo en Cloud Integration](/images/posts/servicenow-incident-open-connectors-cloud-connector/canvas-hijo.png)
*Captura del canvas aportada en el manual. Muestra los pasos configurados, pero no acredita por sí sola que todos los escenarios de prueba hayan pasado.*

El punto delicado es la llamada **Request Reply**: el padre necesita conocer el número del incidente antes de construir su respuesta. Si el hijo no está iniciado, ProcessDirect puede fallar mientras el padre ya está dentro de su propio Exception Subprocess. Por eso el diseño del hijo incluye manejo local de errores, y la matriz pendiente debe probar de forma explícita el fallo del canal de alertas. No se puede prometer que cualquier excepción devolverá siempre 502 hasta completar esa prueba.

## El iFlow padre: conservar el error de negocio

El proceso principal de MIX-003 mantiene las ramas de creación y consulta de avisos. Los cambios propuestos se concentran en `ES_HandleErrors`: capturar la excepción, separar el rechazo de credenciales de la caída de conectividad, preparar los encabezados `inc_*`, llamar al hijo y añadir `incident` al JSON de error.

![Exception Subprocess del iFlow padre según el HTML interactivo](/images/posts/servicenow-incident-open-connectors-cloud-connector/iflow-padre-errores.png)
*Vista documental del manejo de errores: las rutas 400 y 500 siguen separadas de las dos rutas 502 que solicitan una alerta. [Abrir a tamaño completo](/images/posts/servicenow-incident-open-connectors-cloud-connector/iflow-padre-errores.png).*

![Comparación antes y después del manejo de errores del iFlow padre](/images/posts/servicenow-incident-open-connectors-cloud-connector/iflow-padre-cambios.png)
*Esquema del manual en inglés. Distingue `network` para la conectividad y `software` para la credencial técnica rechazada. [Abrir a tamaño completo](/images/posts/servicenow-incident-open-connectors-cloud-connector/iflow-padre-cambios.png).*

![Captura del canvas del iFlow padre con el Exception Subprocess](/images/posts/servicenow-incident-open-connectors-cloud-connector/canvas-padre.png)
*Captura de configuración del iFlow padre; la respuesta final del consumidor aún requiere evidencia de prueba.*

El contrato de respuesta previsto conserva `code`, `message` y `correlationId`, y agrega `incident`:

```json
{
  "code": "BACKEND_UNAVAILABLE",
  "message": "No fue posible llegar a S/4HANA",
  "correlationId": "MPL-ID",
  "incident": "INC..."
}
```

Este JSON es **ilustrativo**, no una respuesta capturada. Si ServiceNow también falla, el diseño busca mantener el `502` y devolver `"incident": null`. El `correlationId` identifica el mensaje de Cloud Integration y permite buscar su MPL; la clave de deduplicación en `correlation_id` de ServiceNow es otra cosa: representa el tipo de falla y permanece estable entre peticiones.

## Deduplicación: por clave y estado, no por `active`

El iFlow hijo busca la misma clave funcional solo entre incidentes `New`, `In Progress` u `On Hold` (`state IN (1,2,3)`). Si encuentra uno, añade una `work_notes`; si no, crea uno nuevo. En la PDI de la prueba, un incidente **Resolved** conservó `active=true`. Filtrar únicamente por `active` habría reutilizado un ticket que el equipo ya daba por resuelto.

![Estados de ServiceNow usados en la deduplicación del laboratorio](/images/posts/servicenow-incident-open-connectors-cloud-connector/deduplicacion.png)
*Regla observada en esta PDI. Una instancia con estados personalizados requiere revisar el filtro.*

La consulta del adaptador necesitó un ajuste adicional: un `where` escrito directamente en la configuración produjo un problema de endpoint; una versión ya codificada y combinada con `fields` y `pageSize` produjo un error de expresión. La guía documenta la opción que funcionó: generar el `where` **sin codificar** en una property, referenciar esa property en el receiver y configurar `Page Size = 1` en su campo propio.

![Configuración documental del receiver GET de Open Connectors](/images/posts/servicenow-incident-open-connectors-cloud-connector/oc-busqueda-config.png)
*Esquema del receiver basado en la guía HTML; no muestra secretos ni confirma el estado actual del tenant.*

![Tres intentos documentados de configuración de la consulta en Open Connectors](/images/posts/servicenow-incident-open-connectors-cloud-connector/oc-query-lecciones.png)
*Comparación del manual: el adaptador gestiona codificación y paginación; la property aporta solo la expresión `where`. [Abrir a tamaño completo](/images/posts/servicenow-incident-open-connectors-cloud-connector/oc-query-lecciones.png).*

Esta búsqueda seguida de `POST` **no es atómica**. Dos mensajes simultáneos podrían no encontrar incidente y crear dos. Tampoco conviene repetir un `POST` a ciegas después de un timeout: primero hay que consultar ServiceNow. Esas decisiones de concurrencia y reintento siguen abiertas para un uso operativo.

## Resultados registrados y pruebas que faltan

El registro escrito de I-02/I-03 describe un incidente creado durante una falla de Cloud Connector y una segunda petición que añadió una nota al mismo ticket. El manual en inglés muestra el recorrido y una captura del incidente, pero la revisión documental señala que **no se adjuntó la respuesta final del consumidor con el mismo INC y `correlationId`**. Por eso aquí se informa la creación/deduplicación registrada, sin presentar la matriz completa como superada.

| Prueba | Qué debe demostrar | Estado documental |
|---|---|---|
| I-01 | Cloud Connector conectado: consulta 200, sin incidente | Pendiente de evidencia concluyente |
| I-02 / I-03 | Conector caído: crear INC y reutilizarlo con una work note | Registro escrito; falta cerrar la evidencia del consumidor |
| I-04 | Resolver el INC y repetir: se crea uno distinto | Pendiente |
| I-05 | Falla de ServiceNow o del hijo: conservar 502 con `incident: null` | Pendiente |
| I-06 / I-07 | Errores 400/404 sin alerta y POST con conector caído | Pendiente |
| I-08 | Credencial SAP rechazada: `BACKEND_AUTH_FAILED` e incidente separado | Pendiente |

Para cerrar el caso hacen falta el despliegue verificado de ambos iFlows, las respuestas de Bruno o Postman, los MPL correlacionados, el historial de work notes en ServiceNow y la comprobación del comportamiento ante timeout, concurrencia y caracteres especiales. Mientras esa evidencia no esté completa, **MIX-004 sigue siendo una implementación documentada en progreso**.

La [ficha pública de dos páginas](/downloads/mix-004-servicenow-open-connectors-guide-es.pdf) resume la arquitectura y los límites sin exponer credenciales ni identificadores del tenant.

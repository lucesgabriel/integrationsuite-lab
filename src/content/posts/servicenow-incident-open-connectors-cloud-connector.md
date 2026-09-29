---
title: Cuando Cloud Connector cae: incidentes ServiceNow desde SAP Integration Suite
description: Caso MIX-004 de SAP PM: diseño de alertas para fallas de conectividad en avisos de mantenimiento, con Open Connectors, ServiceNow y deduplicación por estado. Incluye evidencia y pasos pendientes.
date: 2026-09-29
tags: sap-pm, cloud-integration, open-connectors, servicenow, caso-practico
---

Una API puede responder correctamente que S/4HANA no está disponible y, aun así, dejar al equipo de soporte sin aviso. En el [caso MIX-003, parte 2](/blog/maintenance-notification-error-handling-part-2/), una consulta de avisos de mantenimiento devuelve `502 BACKEND_UNAVAILABLE` cuando falla la conexión con SAP. **MIX-004** plantea el siguiente paso: abrir o actualizar un incidente en ServiceNow para que esa falla sea visible y trazable.

Este escenario relaciona **SAP Plant Maintenance (PM)** con operación de integraciones. El aviso de mantenimiento sigue siendo el dato de negocio en S/4HANA; el incidente de ServiceNow registra la falla técnica del canal que intenta consultarlo o crearlo. No son el mismo objeto.

[Descargar la ficha pública del caso (PDF)](/downloads/mix-004-servicenow-open-connectors-guide-es.pdf) · [Ver todos los recursos](/recursos/)

## Estado del laboratorio

**Al 29 de septiembre de 2026**, los registros del caso documentan pruebas de las API de ServiceNow y de la instancia de Open Connectors: consulta, creación, filtro de deduplicación y actualización. También existe un registro escrito de creación y actualización de incidentes durante pruebas I-02/I-03. La revisión del caso señala que **faltan respuestas finales del consumidor y evidencia concluyente para I-01 e I-04 a I-08**. El README mantiene el build, las pruebas completas y el cierre del caso como pendientes. Por ello, el flujo completo descrito aquí es un **diseño y una guía de implementación**, no una integración extremo a extremo certificada.

## Arquitectura propuesta

La llamada del consumidor entra por API Management y llega al iFlow de avisos de MIX-003. Si el acceso a S/4HANA por Cloud Connector falla, el manejo de errores invoca sincrónicamente, mediante **ProcessDirect**, un segundo iFlow dedicado a alertas. Este usa **Open Connectors** para consultar o escribir en ServiceNow. El canal de alertas sale por Internet y no depende del túnel que acaba de fallar.

![Arquitectura documental de MIX-004: canal de avisos hacia SAP y canal de alertas hacia ServiceNow](/images/posts/servicenow-incident-open-connectors-cloud-connector/arquitectura.png)
*Diagrama de diseño del laboratorio; por sí solo no acredita un despliegue completo.*

La respuesta prevista para el consumidor sigue siendo `502 BACKEND_UNAVAILABLE`. Si el registro en ServiceNow funciona, se añade el número `INC...`; si la alerta falla, `incident` queda en `null`. El caso también propone distinguir una falla de conectividad de un rechazo de credenciales del backend (`BACKEND_AUTH_FAILED`) para no mezclar ambos incidentes.

## Evitar incidentes duplicados

Antes de crear, el iFlow de alertas busca un incidente con la misma clave funcional en `correlation_id` y estado **New, In Progress u On Hold** (`1,2,3`). Si lo encuentra, agrega una nota de trabajo con `PATCH` usando su `sys_id`. Si no, crea uno nuevo con `POST`. Un incidente resuelto no debe reutilizarse.

![Estados usados en la consulta de deduplicación de ServiceNow](/images/posts/servicenow-incident-open-connectors-cloud-connector/deduplicacion.png)
*Regla observada en la PDI del laboratorio; hay que revisar los estados si otra instancia personaliza su ciclo de vida.*

La prueba de prerrequisitos mostró por qué **`active=true` no basta**: un incidente en estado Resolved seguía marcado como activo. También mostró que Open Connectors devuelve un **array** para GET y un **objeto** para POST/PATCH; sus respuestas pueden mostrar etiquetas como `New` aunque el filtro `state IN (1,2,3)` utilice los valores numéricos. Una búsqueda seguida de un POST no garantiza unicidad si dos mensajes llegan simultáneamente; esa condición exige una decisión adicional de concurrencia.

## Qué falta para cerrar el caso

El siguiente hito es configurar el material de seguridad, terminar y desplegar el iFlow de alertas, enlazarlo con el manejo de errores de MIX-003 y ejecutar toda la matriz I-01 a I-08. Esa matriz debe cubrir el camino normal con Cloud Connector conectado; creación y reutilización de incidente al desconectarlo; nuevo incidente tras resolver el anterior; fallos de ServiceNow; POST y GET de avisos; y una falla de autenticación del backend separada de la caída de red.

La [ficha descargable](/downloads/mix-004-servicenow-open-connectors-guide-es.pdf) resume el diseño, las comprobaciones documentadas y las pruebas que faltan. Usa nombres genéricos para el tenant y no contiene credenciales.

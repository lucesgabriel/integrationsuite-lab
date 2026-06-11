---
title: "Patrón Timer → OData → Data Store: automatizar snapshots diarios sin Excel"
description: Diseño completo de un proceso nocturno que extrae Sales Orders desde S/4HANA Cloud, las transforma a JSON y las persiste en un Data Store — con los 5 errores clásicos que este patrón debe evitar.
date: 2026-06-07
tags: casos-reales, cloud-integration, odata, buenas-practicas
---

Hay un clásico en todas las empresas: alguien de control de gestión que **cada noche exporta un Excel del ERP a mano**. Este caso de mi laboratorio automatiza exactamente eso: un snapshot diario de las Sales Orders abiertas, extraído de S/4HANA Cloud y persistido para que un dashboard lo consuma.

Es el patrón **Start Timer → OData → Message Mapping → Data Store**, uno de los más reutilizables de Cloud Integration (y un escenario seguro en el examen de certificación).

## El escenario

**Globex Industries** necesita que cada noche a las 23:30 se extraigan las órdenes de venta del día, se transformen a un JSON interno estándar y se guarden en un Data Store local. Para practicarlo sin un S/4 productivo, uso el sandbox público de SAP Business Accelerator Hub (`API_SALES_ORDER_SRV`).

## La arquitectura del iFlow

```
Timer_DailyAt2330
   → CM_BuildCorrelationAndTimestamp   (contexto: timestamp, correlationId, APIKey)
   → OData_Get_SalesOrders             (Request-Reply al sandbox)
   → MM_SalesOrder_to_SnapshotJson     (transformación a JSON interno)
   → DS_Write_SnapshotBatch            (persistencia, retención 30 días)

Exc_SnapshotErrorHandler               (Exception Subprocess → DS de errores, 90 días)
```

### 1. Timer con schedule externalizado

El cron no va fijo: `{{param_timer_cron}}` con valor `0 30 23 * * ?` en producción y "cada hora" en desarrollo. Cambiar la frecuencia es editar un parámetro en el deploy, no redesplegar el artefacto.

### 2. Contexto antes de llamar al backend

Un Content Modifier arma todo lo que el flujo necesita **como properties**, sin contaminar el payload:

- `snapshotTimestamp` = `${date:now:yyyy-MM-dd'T'HH:mm:ss'Z'}`
- `correlationId` = `${header.SAP_MessageProcessingLogID}` (único por ejecución)
- Header `APIKey` leído desde **Security Material** (alias `sandbox-saphub-apikey`) — la clave jamás se pega como texto

### 3. La llamada OData

Request-Reply hacia `{{param_target_baseUrl}}/A_SalesOrder` con `$top` y `$select` para traer solo los campos necesarios. Y un detalle que cuesta horas de debugging la primera vez:

> El header `APIKey` que inyectas en el Content Modifier **no llega al backend** si no lo agregas en **Allowed Headers** del receiver. El síntoma es un 401 inexplicable: el header está ahí, pero CPI lo filtra antes de enviar.

### 4. Mapping con contrato verificado

Antes de crear `MM_SalesOrder_to_SnapshotJson`, hago un GET manual al endpoint y reviso el `$metadata`. Mapear contra una estructura imaginada (en lugar de la respuesta real) es de los errores más comunes del patrón.

### 5. Entry ID a prueba de duplicados

```
Entry ID = ${property.snapshotTimestamp}_${property.correlationId}
```

La combinación garantiza unicidad incluso si dos ejecuciones coinciden: ni errores por entrada duplicada ni sobrescrituras silenciosas.

### 6. Errores a su propio Data Store

El Exception Subprocess construye un JSON con `code`, `${exception.message}`, `correlationId` y timestamp, y lo persiste en `DS_SalesOrderSnapshotErrors` con retención de 90 días — el triple que los datos, porque los errores se auditan con más calma.

## Los 5 errores clásicos de este patrón

De mi catálogo de errores del laboratorio, los que aplican aquí:

| Código | Error | Prevención |
|---|---|---|
| CPI-007 | Endpoints y schedule hardcodeados | Parámetros externalizados |
| BTP-001 | APIKey pegada como texto | Security Material con alias |
| CPI-008 | Header filtrado por CPI | Agregarlo a Allowed Headers |
| CPI-003 | Exception Subprocess sin conectar | Rama de error con su propio Data Store |
| CPI-006 | Mapping sin contrato verificado | GET manual + $metadata antes de mapear |

## Decisiones de diseño

- **¿Timer interno o scheduler externo?** Timer del iFlow: el schedule es responsabilidad del flujo de integración, no de infraestructura externa.
- **¿JMS como buffer?** No — un lote diario de decenas de órdenes no justifica la operación de colas y DLQ.
- **¿Data Store o SFTP?** Data Store: el requerimiento es que un dashboard consuma por API, no mover archivos.
- **¿Message Mapping o Groovy?** Mapping estándar. Groovy para transformar estructuras completas es un anti-patrón (CPI-004) que dispersa la lógica.

## Para llevarte

Este patrón aparece una y otra vez: reportes nocturnos, sincronizaciones de catálogos, snapshots de inventario. Dominarlo con sus 5 errores clásicos resueltos de antemano es de las mejores inversiones al preparar integraciones reales — y la certificación.

Cuando lo construya en el tenant publicaré la segunda parte con las evidencias, como hice con [el caso del wrapper](/blog/message-mapping-splitter-error-wrapper) y [la API gobernada](/blog/api-gobernada-cpi-api-management).

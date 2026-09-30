---
title: Timer → OData → Data Store: automate daily snapshots without Excel
description: A nightly process design that extracts Sales Orders from S/4HANA Cloud, transforms them to JSON and persists them in a Data Store — including five common mistakes to avoid.
date: 2026-06-07
tags: casos-reales, cloud-integration, odata, buenas-practicas
---

A familiar task in many companies: someone in management reporting **manually exports an ERP spreadsheet every night**. This laboratory case designs an automated daily snapshot of open Sales Orders from S/4HANA Cloud, persisted for a dashboard to consume.

The pattern is **Start Timer → OData → Message Mapping → Data Store**, a reusable Cloud Integration exercise for practical preparation.

## Scenario

**Globex Industries** needs to extract the day's sales orders every night at 23:30, transform them into a standard internal JSON format and store them locally. To practice without production S/4HANA, I use the public SAP Business Accelerator Hub sandbox (`API_SALES_ORDER_SRV`).

## iFlow architecture

```text
Timer_DailyAt2330
   → CM_BuildCorrelationAndTimestamp   (context: timestamp, correlationId, APIKey)
   → OData_Get_SalesOrders             (Request-Reply to the sandbox)
   → MM_SalesOrder_to_SnapshotJson     (internal JSON transformation)
   → DS_Write_SnapshotBatch            (persistence, 30-day retention)

Exc_SnapshotErrorHandler               (Exception Subprocess → error store, 90 days)
```

### 1. Timer with an externalized schedule

Externalize the cron expression as `{{param_timer_cron}}`: `0 30 23 * * ?` for the intended production schedule and hourly during development. Configure the frequency through the deployment parameter.

### 2. Context before the backend call

A Content Modifier prepares the internal context **as properties**, keeping it separate from the payload:

- `snapshotTimestamp` = `${date:now:yyyy-MM-dd'T'HH:mm:ss'Z'}`
- `correlationId` = `${header.SAP_MessageProcessingLogID}` (unique per execution)
- The `APIKey` header comes from **Security Material**, alias `sandbox-saphub-apikey`; the key is never pasted as literal text.

### 3. The OData call

Request-Reply calls `{{param_target_baseUrl}}/A_SalesOrder`, using `$top` and `$select` to request the necessary fields. One detail can cost hours of debugging:

> The `APIKey` header injected by the Content Modifier **does not reach the backend** unless it is included in the receiver's **Allowed Headers**. The symptom is a puzzling 401: the header exists inside the flow, but CPI filters it before sending.

### 4. Mapping against a verified contract

Before creating `MM_SalesOrder_to_SnapshotJson`, manually GET the endpoint and inspect `$metadata`. Mapping an imagined structure instead of the actual response is a common mistake.

### 5. A unique Entry ID

```text
Entry ID = ${property.snapshotTimestamp}_${property.correlationId}
```

The combination keeps entries unique even when executions coincide, preventing duplicate-entry errors or silent overwrites.

### 6. Errors in a separate Data Store

The Exception Subprocess builds JSON containing `code`, `${exception.message}`, `correlationId` and a timestamp. It persists the result in `DS_SalesOrderSnapshotErrors` with 90-day retention, allowing more time to investigate errors than regular data.

## Five common mistakes in this pattern

From my laboratory error catalogue:

| Code | Error | Prevention |
|---|---|---|
| CPI-007 | Hardcoded endpoints and schedule | Externalized parameters |
| BTP-001 | APIKey pasted as literal text | Security Material alias |
| CPI-008 | Header filtered by CPI | Add it to Allowed Headers |
| CPI-003 | Disconnected Exception Subprocess | Error branch with its own Data Store |
| CPI-006 | Mapping without a verified contract | Manual GET + $metadata before mapping |

## Design decisions

- **Internal Timer or external scheduler?** The iFlow Timer: scheduling belongs to this integration process.
- **JMS buffer?** A daily batch of a few dozen orders does not justify queue and DLQ operations for this exercise.
- **Data Store or SFTP?** Data Store: the dashboard needs API access to the data rather than file delivery.
- **Message Mapping or Groovy?** Standard mapping. Using Groovy unnecessarily for complete structural transformations can scatter the transformation logic (CPI-004).

## Takeaway

This pattern appears in nightly reports, catalogue synchronization and inventory snapshots. Learning it with these five common errors addressed is useful for real integrations and certification preparation.

**This article documents a design.** When I build it in the tenant, I will publish a second part with evidence, as I did for [the wrapper case](/blog/message-mapping-splitter-error-wrapper) and [the governed API](/blog/api-gobernada-cpi-api-management).

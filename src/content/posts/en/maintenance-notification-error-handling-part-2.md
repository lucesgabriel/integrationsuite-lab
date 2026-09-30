---
title: Maintenance notifications, part 2: validation and an error contract
description: SAP PM case MIX-003 evolves with input validation, flat JSON GET responses and 400, 404, 502 and 500 errors with correlationId, without Groovy. Includes the v2 PDF manual.
date: 2026-09-24
tags: sap-pm, cloud-integration, error-handling, api-management, caso-practico
---

Creating a maintenance notification is only part of the integration. The technician's application also needs to know whether equipment was empty, the requested notification does not exist or SAP is unavailable.

In [MIX-003 part 1](/blog/maintenance-notification-create-query-postman/), we connected an API to **SAP S/4HANA and Plant Maintenance (PM)** through API Management, Cloud Integration and Cloud Connector. Part 2 develops **Variant B, Block 1**: validate inputs, transform query output to JSON and return recognizable error responses using standard steps **without Groovy**.

**Status on September 24, 2026:** the updated laboratory README and evidence mark Block 1 closed. GET XPath expressions and equipment mapping were corrected. The re-test created notification `10000960` and retrieved it as flat JSON with 15 fields. Additional APIM governance and externalization blocks remain pending.

[Download the part 2 manual — English v2, 12-page PDF](/downloads/maintenance-notification-part-2-guide-en-v2.pdf)

The PDF includes design, configuration screenshots, Bruno tests and build errors. It is also available in [Resources](/recursos/).

## What changes from part 1

| Situation | Documented Block 1 result |
|---|---|
| Valid POST | 201 with notification number and equipment without leading zeros |
| GET for an existing notification | 200 with flat 15-field JSON |
| Out-of-range priority or empty equipment | 400 `INVALID_REQUEST`, before calling SAP |
| Valid number of a nonexistent notification | 404 `NOTIFICATION_NOT_FOUND` |
| Well-formed equipment rejected by SAP | 400 `BACKEND_REJECTED` |
| Cloud Connector disconnected during the test | 502 `BACKEND_UNAVAILABLE` |
| Malformed JSON | 500 `INTERNAL_ERROR`; changing this to 400 remains an improvement |

The common error contract has three fields: `code`, `message` and `correlationId`. This block uses the MPL identifier for correlation. Consumer-provided `X-Correlation-ID` belongs to a later stage.

## The iFlow and its new routes

The artifact remains `Manage_MaintNotification_Postman_to_S4HANA`. It retains create and query branches, adding validation, existence checks and a shared Exception Subprocess.

![Block 1 iFlow with validation, existence checks and an Exception Subprocess](/images/posts/maintenance-notification-error-handling-part-2/iflow-bloque-1.png)
*Highlighted steps represent the case evolution. Click the image to enlarge the diagram.*

### Validate POST before the receiver

After JSON to XML conversion and property extraction, `RT_ValidateCreateInput` evaluates a **Non-XML** condition. The exercise rules are:

| Field | Laboratory rule |
|---|---|
| Notification type | `M1`, `M2` or `M3` |
| Priority | A value from `1` to `4` |
| Equipment | 1–18 digits |
| Description | 1–40 characters |
| Reporter | Up to 12 alphanumeric or underscore characters; this block's expression allows empty input |

These rules reflect the exercise contract, not every possible SAP PM contract. S/4HANA still determines whether equipment exists: a numeric string can pass validation and be rejected by the backend.

Invalid input sends the flow through `CM_RaiseInvalidRequest`, which sets `errorStatus`, `errorCode` and `errorMessage`. An Error End Event then triggers the Exception Subprocess. The invalid-priority and empty-equipment tests show no receiver call.

Validation happens **after JSON to XML conversion**. Syntactically invalid JSON therefore fails before the Router and returns `500 INTERNAL_ERROR` in the tested version.

### Distinguish a nonexistent notification

The OData query uses `$filter`. Empty results can arrive with HTTP 200, so the receiver's status alone cannot establish that the document exists.

`RT_CheckNotificationFound` checks response records with an XML condition using `count()`. The default route uses `CM_RaiseNotFound`, sets `404` and `NOTIFICATION_NOT_FOUND`, then throws an Error End Event.

![Bruno test: nonexistent notification returns 404 and correlationId](/images/posts/maintenance-notification-error-handling-part-2/test-404.png)
*B-02: test number 99999999 does not exist in the laboratory. The error contract passes through APIM.*

A **malformed number** is a different scenario. During the build, a 14-digit number caused the backend to reject the filter with 400. That test does not demonstrate the 404 behavior.

## A common error contract

`ES_HandleErrors` catches Integration Process exceptions. `CM_CaptureException` copies `${exception.message}` to property `exMsg`, and `RT_ClassifyError` selects a response:

1. **Already defined business error:** retain the validation 400 or not-found 404 properties.
2. **Recognized connectivity failure:** return `502 BACKEND_UNAVAILABLE`.
3. **Recognized backend 400 rejection:** return `400 BACKEND_REJECTED`.
4. **Other exceptions:** return `500 INTERNAL_ERROR`.

This block's technical classification searches exception-message keywords. It is the implementation tested in this laboratory; it does not guarantee classification of every adapter error.

In `CM_BuildError`, set header `CamelHttpResponseCode` with **Type = Expression** and value `${property.errorStatus}`. Also set `Content-Type: application/json`. Contract example, retaining the tested message's original language:

```json
{
  "code": "NOTIFICATION_NOT_FOUND",
  "message": "El aviso solicitado no existe en S/4HANA.",
  "correlationId": "<MPL_ID>"
}
```

The message means that the requested notification does not exist in S/4HANA. Record the code in `SAP_MessageProcessingLogCustomStatus` to find messages by outcome. The subprocess ends with **Message End**, returning the constructed response to the consumer.

The backend-rejection test returned technical text `Bad Request : 400`. Extracting the OData error's business detail is an additional refinement; that text alone does not explain why SAP rejected the equipment.

## Flat JSON GET: the re-test that closed the block

The first `CM_BuildQueryResponse` attempt returned 200 but concatenated document values into `maintenanceNotification`. The XPath properties contained only field names: `MaintenanceNotification` matched the root, whose text value included its entire content.

The documented correction uses each property's complete path against the observed receiver XML:

```text
/MaintenanceNotification/MaintenanceNotificationType/MaintenanceNotification
/MaintenanceNotification/MaintenanceNotificationType/NotificationType
/MaintenanceNotification/MaintenanceNotificationType/NotificationText
```

On September 24, those paths and the create response's `TechnicalObjectLabel` adjustment were applied. POST returned `equipment = "10000"`; GET for the new notification returned the expected 15 fields.

![B-09 re-test: notification 10000960 returned as flat 15-field JSON](/images/posts/maintenance-notification-error-handling-part-2/test-200-json-plano.png)
*Updated evidence shows priority and its description, processing phase, equipment, functional location, plants and work center.*

`maintenanceOrder` is empty because no order is associated yet. This is a PM business distinction: **creating a notification does not automatically create a maintenance order**.

## Nine laboratory tests

Bruno tests ran through the API proxy with `apikey` on September 23 and 24. Block 1 does not yet include APIM Fault Rules; the tested CPI errors pass through with their status and body.

| Test | Documented result |
|---|---|
| B-01 · GET existing notification | 200 with flat JSON after XPath correction |
| B-02 · GET valid nonexistent number | 404 `NOTIFICATION_NOT_FOUND` |
| B-03 · POST priority 9 | 400 `INVALID_REQUEST`, no SAP call |
| B-04 · POST empty equipment | 400 `INVALID_REQUEST` |
| B-05 · POST equipment 99999999 | 400 `BACKEND_REJECTED` |
| B-06 · GET with Cloud Connector stopped | 502 `BACKEND_UNAVAILABLE`; connector restarted afterward |
| B-07 · POST malformed JSON | 500 `INTERNAL_ERROR`, accepted behavior for this block |
| B-08 · Valid POST | 201; re-test created notification 10000960 with equipment without leading zeros |
| B-09 · GET newly created notification | 200, same number and flat 15-field JSON |

Notification numbers are historical laboratory evidence. The downloadable **part 1** Postman collection checks the earlier contract, including GET XML. Adapt its assertions before using it to validate part 2.

## Build lessons and next steps

| Symptom | Applied correction |
|---|---|
| Router condition interpreted as XPath | Configure validation route as Non-XML |
| Error End Event becomes `INTERNAL_ERROR` | Set all three Exchange Properties first so classification recognizes the business error |
| Body reports an error but HTTP is 200 | Use Expression for `CamelHttpResponseCode` |
| GET concatenates fields into the notification number | Use complete XPath expressions for every response property |

**Block 1 is closed according to the updated README and its tests.** Block 2 plans Spike Arrest, per-application Quota, removal of `apikey` before the target and APIM Fault Rules. Block 3 plans externalized parameters and consumer-provided `X-Correlation-ID`.

The improvement is concrete: the application can distinguish invalid input, a missing notification and connectivity failure, while GET returns usable maintenance-process data.

[Read part 1](/blog/maintenance-notification-create-query-postman/) · [Download the English part 2 manual, v2](/downloads/maintenance-notification-part-2-guide-en-v2.pdf)

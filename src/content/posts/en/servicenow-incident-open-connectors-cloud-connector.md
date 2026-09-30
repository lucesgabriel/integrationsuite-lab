---
title: When Cloud Connector goes down: from a 502 error to a ServiceNow incident
description: SAP PM case MIX-004: architecture, iFlows, Open Connectors, deduplication and documented tests for alerting Cloud Connector failures in ServiceNow. Includes diagrams and screenshots.
date: 2026-09-29
tags: sap-pm, cloud-integration, open-connectors, servicenow, caso-practico
---

A contractor queries a maintenance notification from an external application. Cloud Connector is disconnected and the API returns `502 BACKEND_UNAVAILABLE`. The consumer sees the error, but support receives no alert. **SIS-CASE-MIX-004** explores how to turn that technical failure into a ServiceNow incident while preserving the API's error contract.

It follows [MIX-003 part 2](/blog/maintenance-notification-error-handling-part-2/), whose iFlow creates and queries **SAP Plant Maintenance (PM)** notifications in S/4HANA. The notification remains the business object; the incident is an operational record about the integration. These are related but separate processes.

**Publication scope:** ServiceNow and Open Connectors prerequisites have been tested, and a written I-02/I-03 log records incident creation and update. The laboratory README still marks build, complete testing and closure as pending. Final consumer responses and conclusive evidence for I-01 and I-04 through I-08 are missing. Configuration figures and diagrams explain the solution but **do not replace those checks**.

[Download the public case brief, Spanish PDF](/downloads/mix-004-servicenow-open-connectors-guide-es.pdf) · [Browse all resources](/recursos/)

## Problem and architecture

The consumer enters through **API Management**. The MIX-003 parent iFlow handles notification `POST` or `GET` and calls S/4HANA through Cloud Connector. If that access fails, its **Exception Subprocess** classifies the error and calls a child iFlow using **ProcessDirect**. The child uses the **Open Connectors** adapter to find, create or update a ServiceNow incident. This alert channel uses Internet access and does not depend on the failed tunnel.

![Documented MIX-004 architecture with a business channel to S/4HANA and an alert channel to ServiceNow](/images/posts/servicenow-incident-open-connectors-cloud-connector/arquitectura.png)
*Documentary architecture: the diagram represents the intended flow and its boundaries, not end-to-end test evidence.*

The design target is **one recurring failure, one open incident**: the first request opens a ticket and subsequent requests add work notes. Connectivity failures (`BACKEND_UNAVAILABLE`, category `network`) and rejected backend credentials (`BACKEND_AUTH_FAILED`, category `software`) require separate routes. This keeps problems with different owners from being sent to the same team.

## Checks completed before integrating the iFlows

The ServiceNow PDI was tested for Table API access, incident creation and update, and `correlation_id` searches. The ServiceNow Open Connectors instance was tested with `GET`, `POST` and `PATCH`. `GET /incidents` returned a **JSON array**; `POST` and `PATCH` returned **JSON objects**. In these tests, Open Connectors `POST` returned `200`, while the native Table API returned `201`.

A Table API `401 User is not authenticated` was resolved in this laboratory by assigning technical-user role `snc_basic_auth_api_access` alongside incident permissions. Web UI access did not prove API Basic Auth was enabled. Open Connectors credentials belong in Cloud Integration **Security Material**. Keep Authorization values, User Secret, Organization Secret and Element Token out of the iFlow, screenshots and repository.

| Evidence level | Documented result |
|---|---|
| ServiceNow Table API | GET, POST, state filtering and PATCH tested |
| Open Connectors API Docs | GET, POST, filtered search and PATCH tested |
| I-02/I-03 tests | Written record of INC creation and updating the same ticket with a work note |
| Final consumer response and I-01–I-08 matrix | Complete verification pending |

## Child iFlow: find, create or update

The design puts alert logic in `Raise_Incident_OpenConnectors_to_ServiceNow`. Through ProcessDirect, the parent sends `inc_*` headers with error code, HTTP method, notification number, exception text and correlation identifier. The child converts this context to properties and prepares a **functional key** for searching.

![Child iFlow diagram from the interactive HTML guide](/images/posts/servicenow-incident-open-connectors-cloud-connector/iflow-hijo-diagrama.png)
*Documentary view extracted from the interactive HTML: find an open incident, choose create/update and handle alert errors locally. [Open full size](/images/posts/servicenow-incident-open-connectors-cloud-connector/iflow-hijo-diagrama.png).*

The sequence is:

1. `OC_SNOW_Find` queries `/incidents` using the key and open states.
2. `RT_IncidentExists` chooses between creating with `POST` and updating with `PATCH /incidents/{sys_id}`. The visible `INC...` number does not replace internal `sys_id` for PATCH.
3. A Content Modifier prepares XML and XML-to-JSON conversion creates the connector payload. Exception text requires careful XML insertion: verify character escaping and CDATA termination with adverse inputs.
4. `CM_IncidentResult` and `CM_IncidentReply` return number and status to the parent. The child's Exception Subprocess attempts to return `FAILED` and `incident: null` if alerting fails, preserving the original error.

![Cloud Integration child iFlow canvas screenshot](/images/posts/servicenow-incident-open-connectors-cloud-connector/canvas-hijo.png)
*Canvas screenshot from the manual. It shows configured steps but does not prove that every test scenario passed.*

**Request Reply** is a delicate point: the parent needs the incident number before building its response. If the child is not started, ProcessDirect may fail while the parent is already inside its Exception Subprocess. The child therefore includes local error handling, and the pending matrix must explicitly test alert-channel failure. We cannot promise every exception will preserve 502 until that test is complete.

## Parent iFlow: preserve the original error

The MIX-003 main process retains notification creation and query branches. Proposed changes focus on `ES_HandleErrors`: capture the exception, distinguish credential rejection from connectivity failure, prepare `inc_*` headers, call the child and add `incident` to the error JSON.

![Parent Exception Subprocess from the interactive HTML guide](/images/posts/servicenow-incident-open-connectors-cloud-connector/iflow-padre-errores.png)
*Documentary error-handling view: 400 and 500 routes remain separate from the two 502 routes that request an alert. [Open full size](/images/posts/servicenow-incident-open-connectors-cloud-connector/iflow-padre-errores.png).*

![Before and after comparison of parent iFlow error handling](/images/posts/servicenow-incident-open-connectors-cloud-connector/iflow-padre-cambios.png)
*English manual diagram: `network` represents connectivity and `software` rejected technical credentials. [Open full size](/images/posts/servicenow-incident-open-connectors-cloud-connector/iflow-padre-cambios.png).*

![Parent iFlow canvas with Exception Subprocess](/images/posts/servicenow-incident-open-connectors-cloud-connector/canvas-padre.png)
*Parent configuration screenshot; the final consumer response still requires test evidence.*

The intended response preserves `code`, `message` and `correlationId`, adding `incident`. The original example message means S/4HANA could not be reached:

```json
{
  "code": "BACKEND_UNAVAILABLE",
  "message": "No fue posible llegar a S/4HANA",
  "correlationId": "MPL-ID",
  "incident": "INC..."
}
```

This JSON is **illustrative**, not a captured response. If ServiceNow also fails, the design aims to retain `502` with `"incident": null`. `correlationId` identifies the Cloud Integration message for MPL lookup. ServiceNow's `correlation_id` deduplication key is different: it represents the failure type and stays stable across requests.

## Deduplication: use key and state

The child searches for the same functional key only among `New`, `In Progress` or `On Hold` incidents (`state IN (1,2,3)`). A match receives `work_notes`; otherwise a new ticket is created. In the tested PDI, a **Resolved** incident still had `active=true`. Filtering only by `active` would have reused a ticket already considered resolved.

![ServiceNow states used for laboratory deduplication](/images/posts/servicenow-incident-open-connectors-cloud-connector/deduplicacion.png)
*Rule observed in this PDI. Review the filter for an instance with custom states.*

The adapter query needed another adjustment: a `where` expression typed directly into configuration caused an endpoint problem. A pre-encoded version combined with `fields` and `pageSize` caused an expression error. The guide documents the successful option: generate **unencoded `where`** in a property, reference that property in the receiver and set **Page Size = 1** in its dedicated field.

![Documented Open Connectors GET receiver configuration](/images/posts/servicenow-incident-open-connectors-cloud-connector/oc-busqueda-config.png)
*Receiver diagram based on the HTML guide. It contains no secrets and does not establish the tenant's current status.*

![Three documented Open Connectors query configuration attempts](/images/posts/servicenow-incident-open-connectors-cloud-connector/oc-query-lecciones.png)
*Manual comparison: the adapter handles encoding and pagination; the property supplies only the `where` expression. [Open full size](/images/posts/servicenow-incident-open-connectors-cloud-connector/oc-query-lecciones.png).*

Searching and then issuing `POST` **is not atomic**. Concurrent messages could both find no incident and create duplicates. Avoid blind POST retries after timeout: query ServiceNow first. Concurrency and retry decisions remain open for operational use.

## Recorded results and remaining tests

The written I-02/I-03 log describes an incident created during a Cloud Connector failure and a second request adding a note to that same ticket. The English manual shows the flow and an incident screenshot, but the documentary review notes that **the final consumer response containing the same INC and `correlationId` was not attached**. We therefore report the recorded creation/deduplication without claiming the complete matrix passed.

| Test | Required demonstration | Documentary status |
|---|---|---|
| I-01 | Connected Cloud Connector: query returns 200, no incident | Conclusive evidence pending |
| I-02 / I-03 | Disconnected connector: create INC, reuse it with a work note | Written record; consumer evidence still needs closure |
| I-04 | Resolve INC and repeat: create a different ticket | Pending |
| I-05 | ServiceNow or child failure: preserve 502 with `incident: null` | Pending |
| I-06 / I-07 | 400/404 without alerts, and POST with connector disconnected | Pending |
| I-08 | Rejected SAP credential: `BACKEND_AUTH_FAILED` and separate incident | Pending |

Closure requires verified deployment of both iFlows, Bruno or Postman responses, correlated MPLs, ServiceNow work-note history and checks for timeouts, concurrency and special characters. Until that evidence is complete, **MIX-004 remains a documented implementation in progress**.

The [public two-page brief, in Spanish](/downloads/mix-004-servicenow-open-connectors-guide-es.pdf) summarizes the architecture and limitations without exposing credentials or tenant identifiers.

---
title: Query a maintenance order from Postman: a simple CPI and S/4HANA version
description: SIS-CASE-MIX-002, Variant A. Query an order using a header and OData V2, return an eight-field JSON response and expose the flow through API Management.
date: 2026-09-09
tags: cloud-integration, odata, api-management, cloud-connector, caso-practico
---

An external application needs to query a S/4HANA maintenance order by number. Before adding more complex validation and transformations, verify the complete path using a known order.

This is **SIS-CASE-MIX-002, simple Variant A**: three iFlow steps, without Groovy, XSD or Message Mapping. First, test CPI directly from Postman; then add minimal API Management exposure.

**Estimated time:** 15 minutes for the iFlow and 15 for APIM if connectivity, credentials and the OData service are already prepared. Environment preparation is outside that estimate.

[Download the simple-version Postman collection and environment](/downloads/maintenance-order-simple-postman.zip)

## In this guide

- [Prepare the environment](#prepare-the-environment)
- [Build the iFlow](#build-the-iflow)
- [Test from Postman](#test-from-postman)
- [Expose through API Management](#expose-through-api-management)
- [Diagnose errors](#diagnose-errors)
- [Limitations and next steps](#limitations-and-next-steps)

## Prepare the environment

You need Cloud Integration enabled, access to a S/4HANA backend with `API_MAINTENANCEORDER`, and an order that exists in that system. Order `1000` is the laboratory example: replace it with a valid number in your environment.

Check these items before creating the flow:

1. Cloud Connector is connected to the correct BTP subaccount.
2. The virtual-host mapping points to the backend and resource `/sap/opu/odata/sap/API_MAINTENANCEORDER` allows subpaths.
3. The receiver's Location ID matches Cloud Connector if one is configured.
4. Security Material contains a backend Basic credential authorized to query the service. This article uses example alias `S4H_ODATA_BASIC`.
5. You have Process Integration Runtime credentials with `ESBMessaging.send` permission to invoke the iFlow. These differ from the S/4HANA credentials.

Hosts and credentials in this article are placeholders. Configure your own values locally in Postman and exclude them from shared exports.

## Build the iFlow

In package `ACME_MAINTENANCE_ORDER`, create `Query_MaintenanceOrder_Postman_to_S4HANA` as a separate artifact from the complete case.

```text
Postman → HTTPS Sender → CM_SetOrder → RR_GetOrder → CM_BuildResponse → End
                                         │
                                         └→ OData V2 → Cloud Connector → S/4HANA
```

### 1. HTTPS Sender and input header

Connect the Sender participant to the Start Event using HTTPS:

| Field | Value |
|---|---|
| Address | `/maint-simple/v1` |
| Authorization | `User Role` |
| User Role | `ESBMessaging.send` |
| CSRF Protected | Unchecked for this GET query |

Add `orderNumber` to the iFlow's **Runtime Configuration → Allowed Header(s)** so the header sent by Postman is available inside the flow.

### 2. Content Modifier CM_SetOrder

After Start, add `CM_SetOrder`. Configure this Exchange Property:

| Name | Source Type | Source Value | Data Type |
|---|---|---|---|
| `orderNumber` | `Header` | `orderNumber` | `java.lang.String` |

Keep the number as text to preserve any leading zeros. This variant assumes a valid, known value; it does not yet validate the input.

### 3. Request Reply and OData V2 receiver

Add `RR_GetOrder` and connect it to receiver `OD_S4H_Simple` using the OData V2 adapter.

| Connection | Configuration |
|---|---|
| Address | `http://<VIRTUAL_HOST>:<VIRTUAL_PORT>/sap/opu/odata/sap/API_MAINTENANCEORDER` |
| Proxy Type | `On-Premise` |
| Location ID | Your Cloud Connector value; empty if none is configured |
| Authentication | `Basic` |
| Credential Name | `S4H_ODATA_BASIC` |
| CSRF Protected | Unchecked for this GET query |

Under Processing, use **Query(GET)**, Resource Path `MaintenanceOrder`, Content Type `Atom`, and empty Custom Query Options. Do not activate Process in Pages for this test.

Set **Query Options** exactly to:

```text
$filter=MaintenanceOrder eq '${property.orderNumber}'
```

The filter selects the order by number. Check the property name and complete quotation marks. A Query response remains a collection even when only one order matches.

Omit `$select` for the first smoke test. Once the query works, limit requested fields to the eight used in the response. [SAP's OData V2 receiver documentation](https://help.sap.com/docs/CLOUD_INTEGRATION/sap-cloud-integration/configure-odata-v2-receiver-adapter?locale=en-US) describes the operation and Query Options.

### 4. Content Modifier CM_BuildResponse

After Request Reply, add `CM_BuildResponse`. In this laboratory, the adapter's output XML had root `MaintenanceOrder` and records `MaintenanceOrderType`. Verify your own message structure before reusing these XPath expressions.

All Exchange Property entries use Source Type `XPath` and Data Type `java.lang.String`:

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

In Message Header, set `Content-Type` using Constant and value `application/json`. In Message Body, select **Expression** and paste:

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

This step builds the JSON body: **do not add an XML to JSON Converter afterward**. If properties do not resolve in your configuration, separate XPath extraction and body construction into two consecutive Content Modifiers.

> Direct interpolation does not escape JSON characters. Quotes, backslashes or line breaks in a description can produce invalid JSON. This template is intended for controlled laboratory data; use proper serialization and escaping for arbitrary values. Consumers should not depend on JSON property order.

Connect to End, save and deploy. Wait for **Started**, then copy the actual endpoint from Manage Integration Content.

## Test from Postman

Import both files from the [downloadable package](/downloads/maintenance-order-simple-postman.zip). Select environment **Maintenance Order — Simple (template)** and configure:

| Variable | Value to provide |
|---|---|
| `cpiBaseUrl` | HTTPS CPI runtime origin, without `/http` or a trailing slash |
| `cpiClientId` | Runtime service client ID |
| `cpiClientSecret` | Client secret, kept locally |
| `orderNumber` | An existing order; `1000` is the example |

Run the existing-order request in the direct CPI folder:

```http
GET {{cpiBaseUrl}}/http/maint-simple/v1
orderNumber: {{orderNumber}}
```

The request uses Basic Auth with `cpiClientId` and `cpiClientSecret`, and no body. For an existing order with template-compatible data, expect HTTP 200 and this eight-field contract. The following values are illustrative laboratory data, retained in their original language:

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

The collection checks the HTTP status, JSON body, eight field names and whether the returned order matches the requested one. Adjust `orderNumber` if the backend requires leading zeros.

This version has no controlled 400/404 contract. Missing-number and nonexistent-order requests are included for **diagnosis**, without asserting a status the iFlow does not implement.

## Expose through API Management

Continue once the direct CPI query works:

```text
Postman -- apikey --> API Proxy -- Basic from KVM --> CPI --> S/4HANA
```

### 1. API Provider and KVM

Create provider `APIP_CPI_Simple`, type Cloud Integration, using the **CPI runtime host**, port 443 and SSL. Use the endpoint host you just tested. A 404 at the root alone does not establish that the iFlow endpoint fails: test its complete path.

Create **encrypted** Environment-scope Key Value Map `KVM_CPI_Auth` with entries `username` and `password`. Store CPI's client ID and client secret there. External consumers do not need those credentials.

### 2. API Proxy

| Field | Value |
|---|---|
| Provider System | `APIP_CPI_Simple` |
| Target URL | `/http/maint-simple/v1` |
| Name | `api-maint-simple-v1` |
| API Base Path | `/acme/simple/v1` |
| Service Type | `REST` |

Keep the Route Rule to the TargetEndpoint and verify that `orderNumber` is forwarded.

### 3. Three minimum policies

In **ProxyEndpoint → PreFlow → Request**, add `PL_VerifyApiKey`:

```xml
<VerifyAPIKey xmlns="http://www.sap.com/apimgmt"
              async="false" continueOnError="false" enabled="true">
  <APIKey ref="request.header.apikey"/>
</VerifyAPIKey>
```

In **TargetEndpoint → PreFlow → Request**, add the KVM read first:

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

Then add Basic Authentication:

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

Preserve the SAP namespace and match the KVM name and entry names exactly. Save and deploy the proxy.

### 4. API Product and application

Create `PRD_Acme_Simple`, associate `api-maint-simple-v1` and publish it. In Developer Hub, create `APP_Demo_Simple`, subscribe it to the product and get its Application Key.

In this laboratory, `Unable to publish Product` was resolved by activating Developer Hub. If it occurs elsewhere, check that capability and the error details first; it is not a universal cause.

### 5. Final test

Set `apimBaseUrl` to the API proxy's HTTPS origin and `apiKey` to your local Application Key. Run the existing-order request in the APIM folder:

```http
GET {{apimBaseUrl}}/acme/simple/v1
apikey: {{apiKey}}
orderNumber: {{orderNumber}}
```

This request uses Postman's **No Auth**. APIM builds the authentication to CPI. The response should use the same eight-field contract as the direct test.

Also run the APIM request without an API Key. The example policy should return 401; SAP documents this status for an [unresolved key in Verify API Key](https://help.sap.com/docs/integration-suite/sap-integration-suite/verify-api-key).

## Diagnose errors

| Symptom | What to check |
|---|---|
| CPI returns HTML 404 | Started status and `/http/maint-simple/v1` path |
| CPI returns 401 | Runtime credentials and `ESBMessaging.send` permission |
| Empty order number in the flow | `orderNumber` in Allowed Headers and Header source type |
| Query returns multiple orders | Sent value and complete Query Options; inspect the actual query |
| Backend connection error | Cloud Connector status, mapping, Location ID and allowed resource |
| Empty JSON or fields | Order existence and XML structure used by XPath |
| Invalid JSON | Unescaped characters in interpolated values |
| APIM returns 401 with a valid key | KVM, policy order and CPI credentials; identify which layer rejected the call |
| 500 with MPL ID | Find the identifier in Monitor Message Processing and inspect Error Details |

Enable Trace temporarily for a controlled test when needed, inspecting properties and payload after `RR_GetOrder`. Remove Authorization, API Keys and credentials from shared evidence.

## Limitations and next steps

Variant A verifies connectivity and illustrates every hop. It does not validate the number before interpolating it into the OData filter, distinguish a missing order with its own 404, or normalize backend errors. The manual response also has the JSON-escaping limitation described above.

Extend the case with safe number validation, empty-result detection, JSON serialization, an Exception Subprocess, externalized parameters and an error contract. APIM still needs traffic limits, removal of `apikey` before the target and Fault Rules.

Continue with [the governed CPI and API Management case](/blog/api-gobernada-cpi-api-management/) to study those policies, or browse [more downloadable resources](/recursos/).

*Adapted from the local SIS-CASE-MIX-002 guide implementation-guide-variante-A-simple.md. This article contains no credentials, private hosts or tenant screenshots. Verify your backend by executing the collection in your own environment.*

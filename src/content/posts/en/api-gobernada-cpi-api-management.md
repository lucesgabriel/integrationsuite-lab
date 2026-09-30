---
title: From zero to a governed API: Cloud Integration + API Management end to end
description: A solved case documented screen by screen — a catalogue API for 40 external distributors, with API Keys, spike arrest, quotas, encrypted KVM credentials, Developer Portal and a JSON error contract.
date: 2026-06-11
tags: casos-reales, api-management, cloud-integration, groovy
---

This is the most complete case in my laboratory: **Cloud Integration** and **API Management** in one solution, documented screen by screen in a SAP BTP trial tenant. **Globex Beverages** has 40 distributors calling the contact center daily to confirm product specifications before placing orders. The solution is a governed REST API.

```text
GET /globex/catalog/v1/products?sku=GBX-0042
```

Each distributor receives an API Key, with controlled traffic and stable JSON responses even when something goes wrong. The configured quota described below uses the API product as its counter identifier.

## End-to-end architecture

Consumers enter through **API Management**, which applies security and limits before delegating to the iFlow.

![End-to-end architecture](/images/posts/api-gobernada-cpi-api-management/01-arquitectura-e2e.png)
*Partner → API Management policies → Cloud Integration logic → JSON response.*

## Starting point: the BTP tenant

Everything runs in a trial subaccount subscribed to **Integration Suite**, with Cloud Integration and API Management activated. The BTP cockpit shows the subscription, process instances and Cloud Foundry environment:

![BTP subaccount](/images/posts/api-gobernada-cpi-api-management/01-btp-subaccount-instances.png)
*Integration Suite subscription and instances with service keys for connectivity.*

The process instance's **service key** provides the `clientid` and `clientsecret` used by APIM to authenticate to the CPI runtime:

![Tenant service key](/images/posts/api-gobernada-cpi-api-management/02-btp-service-key-redacted.png)
*Service key Credentials dialog, with values redacted. These credentials are later stored in the encrypted KVM.*

> Treat a service key as a production credential: never paste it into plain-text policies or leave it visible in screenshots. The screenshot above is redacted.

## Layer 1: the Cloud Integration iFlow

`IF_Globex_CatalogLookup` receives the GET, validates the SKU with a Router, looks it up in a simulated catalogue and builds the response:

![Detailed iFlow](/images/posts/api-gobernada-cpi-api-management/02-iflow-detalle.png)
*HTTPS Sender → read inputs with Groovy → validation Router → lookup → JSON response. Errors go to the Exception Subprocess.*

The deployed tenant configuration:

![Final deployed canvas](/images/posts/api-gobernada-cpi-api-management/04-iflow-final-canvas.png)
*Final canvas in the trial tenant.*

### HTTPS Sender

Address `/catalog/v1`, **User Role** authorization (`ESBMessaging.send`), and CSRF disabled for this idempotent GET:

![HTTPS Sender](/images/posts/api-gobernada-cpi-api-management/13-https-sender-address.png)
*The endpoint intended to be invoked through APIM.*

### Defensive input reading in Groovy

The SKU is supplied as a query parameter. The first script threw `NoSuchElementException` when the path was empty. The final version checks its inputs:

```groovy
def query    = (message.getHeader('CamelHttpQuery', String) ?: '').trim()
def path     = (message.getHeader('CamelHttpPath', String) ?: '').trim()
def querySku = (message.getHeader('sku', String) ?: '').trim()

// Safe fallback: query parameter first, then the last path segment
def sku = querySku ?: (path ? path.tokenize('/').last() : '')

def incoming = (message.getHeader('X-Correlation-Id', String) ?: '').trim()
message.setProperty('sku', sku)
message.setProperty('correlationId', incoming ?: UUID.randomUUID().toString())
```

![Groovy input-reading script](/images/posts/api-gobernada-cpi-api-management/10-groovy-read-inputs-script.png)
*Null-safe reads: never assume a header exists.*

If the consumer does not send `X-Correlation-Id`, the iFlow generates a UUID. **Every response, successful or failed, returns that correlationId**, supporting end-to-end tracing.

### Router with an externalized regex

`RT_ValidateSku` has a valid route with a condition and a default route that throws `INVALID_SKU_FORMAT`:

![Router routes](/images/posts/api-gobernada-cpi-api-management/09-iflow-router-routes.png)
*A valid SKU proceeds to lookup; other inputs enter the error route.*

The condition evaluates `${property.sku}` against `^GBX-\d{4}$`, held in the **externalized parameter** `param.skuPattern`. If Globex adds prefixes, the deployment configuration can change without editing the flow:

![Valid-route condition](/images/posts/api-gobernada-cpi-api-management/08-iflow-route-valid-condition.png)
*The regex is configurable.*

### Content Modifier properties

The matched product values are held in **Exchange Properties**. The final Content Modifier reads them to build the response JSON:

![Content Modifier properties](/images/posts/api-gobernada-cpi-api-management/12-content-modifier-properties.png)
*Internal properties hold the values; the body is built at the end.*

### Additional Groovy validation

The lookup script also validates the SKU and throws **named exceptions** that are mapped to HTTP status codes:

![Groovy SKU validation](/images/posts/api-gobernada-cpi-api-management/05-groovy-invalid-sku-script.png)
*INVALID_SKU_FORMAT and SKU_NOT_FOUND become 400 and 404 in the Exception Subprocess.*

### Exception Subprocess: controlled functional errors

My first attempt returned **HTTP 500 for every error**, including a missing SKU. The Exception Subprocess ended with **Error End**, causing CPI to rethrow the exception. For this request-response contract:

> End the Exception Subprocess with **Message End** and build the HTTP response within it.

```groovy
def raw = exception?.getMessage() ?: ''
def status = 500; def code = 'INTERNAL_ERROR'

if (raw.contains('INVALID_SKU_FORMAT')) { status = 400; code = 'INVALID_SKU_FORMAT' }
else if (raw.contains('SKU_NOT_FOUND')) { status = 404; code = 'SKU_NOT_FOUND' }

message.setHeader('CamelHttpResponseCode', status)
message.setHeader('Content-Type', 'application/json')
message.setBody(JsonOutput.toJson([code: code, message: text, correlationId: correlationId]))
```

![Exception Subprocess Groovy](/images/posts/api-gobernada-cpi-api-management/03-groovy-error-response-script.png)
*Exceptions become controlled HTTP responses with a consistent JSON contract.*

## Layer 2: API Management

### API Provider: connecting to CPI

Before creating the proxy, configure the backend connection. **API Provider** `APIP_CPI_Trial` points to the Cloud Integration runtime with Basic authentication. Credentials use a **Security Material alias**:

![API Provider](/images/posts/api-gobernada-cpi-api-management/11-api-provider-overview.png)
*The provider connects APIM to the tenant's CPI runtime.*

### Proxy policies: order matters

Proxy `Globex_Catalog_v1` applies four PreFlow policies in this order:

```text
1. SpikeArrest (5 req/s)    ← limit bursts before validation
2. VerifyApiKey            ← identify the consumer
3. Quota (100/hour)        ← apply the configured quota
4. RemoveApiKeyHeader      ← clean the request before the backend
```

SpikeArrest comes first to limit bursts before resources are spent validating API Keys.

![Spike Arrest policy](/images/posts/api-gobernada-cpi-api-management/13-policy-spike-arrest.png)
*Five requests per second as the first protection layer.*

![Verify API Key policy](/images/posts/api-gobernada-cpi-api-management/14-policy-verify-api-key.png)
*The policy reads `request.header.apikey`; change the variable supplied by the default template.*

The **Quota** limits calls to 100 per hour using `apiproduct.name` as its identifier. Each API product therefore has its own counter:

![Quota policy](/images/posts/api-gobernada-cpi-api-management/15-policy-quota.png)
*After the configured quota is exhausted, the consumer receives 429 QUOTA_EXCEEDED.*

Before the request reaches CPI, the consumer's API Key **is removed**:

![Remove API Key policy](/images/posts/api-gobernada-cpi-api-management/16-policy-remove-apikey-header.png)
*Consumer credentials stay at the gateway.*

### Backend credentials in an encrypted KVM

An instructive mistake: my first fix for a CPI 401 was to paste `Authorization: Basic base64(...)` into AssignMessage. It worked, but **exposed the credential in the proxy XML**.

The corrected solution stores the username and password in an **encrypted Key Value Map**:

![KVM entries](/images/posts/api-gobernada-cpi-api-management/24-kvm-cpi-backend-auth-entries.png)
*KVM_CPI_BACKEND_AUTH: encrypted cpi.username and cpi.password entries (*****).*

In the TargetEndpoint, `KeyValueMapOperations` reads the entries into private variables:

![KVM policy](/images/posts/api-gobernada-cpi-api-management/26-policy-read-cpi-credentials-kvm.png)
*KVM values are read into `private.*` variables.*

`BasicAuthentication` then generates the `Authorization` header at runtime:

![Basic Authentication policy](/images/posts/api-gobernada-cpi-api-management/27-policy-basic-auth-from-kvm.png)
*Base64 is generated at runtime. Rotate credentials by updating the KVM rather than embedding them in the proxy.*

The consumer knows its own API Key; APIM authenticates to CPI with the internal credentials.

### Product and application: the Developer Portal lifecycle

Package the proxy in **API Product** `PRD_Globex_Partner_Catalog`:

![API Product](/images/posts/api-gobernada-cpi-api-management/06-api-product-overview.png)
*The product groups the proxy and defines what is published in the Developer Hub.*

Each distributor creates an **Application** subscribed to that product, which generates the API Key:

![Developer Portal application](/images/posts/api-gobernada-cpi-api-management/01-devportal-demo-app-details.png)
*APP_Demo_Distributor_GBX: distributor key and secret are masked. The portal also shows analytics, including 36 calls that month.*

The complete lifecycle is **API Provider → API Proxy → policies → API Product → Application → API Key**.

## Five HTTP test scenarios

Responses follow the JSON contract (`code`, `message`, `correlationId`). Postman evidence:

**200 — Happy path**, valid API Key and existing SKU:

![Postman 200](/images/posts/api-gobernada-cpi-api-management/01-postman-apim-200.png)
*GBX-0042: Globex Lemonade 1L, with correlationId for tracing.*

**400 — Invalid SKU format**, caught by the CPI Router:

![Postman 400](/images/posts/api-gobernada-cpi-api-management/02-postman-apim-400-invalid-sku.png)
*INVALID_SKU_FORMAT: the input does not match GBX-\d{4}.*

**404 — Well-formed but missing SKU**, detected by the lookup:

![Postman 404](/images/posts/api-gobernada-cpi-api-management/03-postman-apim-404-sku-not-found.png)
*SKU_NOT_FOUND: a functional error with the appropriate HTTP status.*

**401 — Missing API Key**, rejected by APIM before CPI:

![Postman 401 without a key](/images/posts/api-gobernada-cpi-api-management/04-postman-apim-401-missing-apikey.png)
*The missing apikey header is rejected at the gateway.*

**401 — Invalid API Key**:

![Postman 401 with an invalid key](/images/posts/api-gobernada-cpi-api-management/05-postman-apim-401-invalid-apikey.png)
*An incorrect key receives the same response without revealing extra details.*

## Seven lessons

1. **Put APIM in front of CPI for external consumers** to handle governance, identity and traffic limits.
2. **Policy order matters:** SpikeArrest → VerifyApiKey → Quota → header cleanup.
3. **Keep secrets out of XML and screenshots:** use an encrypted KVM and BasicAuthentication. A pasted Base64 value still exposes a credential.
4. **Use Message End for this controlled error response** so functional errors keep their intended HTTP status.
5. **Maintain a consistent JSON response contract**, including correlationId.
6. **Practice Provider → Proxy → Product → App:** this turns an endpoint into a governed API and is useful certification preparation.
7. **Copy the trial proxy URL from the UI:** the actual URL includes an account prefix that should not be guessed.

Eight errors from this case were recorded in the error log and promoted to my knowledge base. Solving complete cases creates knowledge that can be reused in the next integration.

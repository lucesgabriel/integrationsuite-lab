---
title: Message Mapping + General Splitter: the unexpected wrapper error
description: A solved real case — splitting a batch of sales opportunities, transforming each item and persisting it in a Data Store. Includes the runtime Cannot produce target element error and its Trace diagnosis.
date: 2026-06-10
tags: casos-reales, cloud-integration, message-mapping
---

This is the first complete laboratory case I am sharing, with real tenant screenshots. **Logali Consulting** receives batches of won opportunities from a sales system, simulated with Postman, and must convert each one into a product draft. The drafts are persisted in a Data Store for auditing before synchronization with S/4HANA.

It looks simple — until you inspect what the General Splitter actually produces.

## Architecture

The iFlow `IF_Logali_Product_Inbound_Batch`, in package `Pkg_Logali_LeadToOrder`, has five steps:

1. **HTTPS Sender** — receives the XML batch at `/logali/products`.
2. **General Splitter** — splits it into one branch per opportunity.
3. **Content Modifier** — captures `ProductId` using XPath.
4. **Message Mapping** — transforms `Opportunity` → `ProductDraft`.
5. **Write Data Store** — persists each draft using its ID as Entry ID.

## Step by step with evidence

### 1. HTTPS Sender

Address `/logali/products`, **User Role** authorization with `ESBMessaging.send`, and CSRF disabled for this exercise:

![HTTPS Sender configuration](/images/posts/message-mapping-splitter-error-wrapper/01-https-sender-logali-products.png)
*Inbound HTTPS channel with role-based authorization.*

### 2. General Splitter

XPath `/Opportunities/Opportunity`, Grouping `1`, and **Stop on Exception disabled** so the remaining opportunities continue if one fails:

![General Splitter configuration](/images/posts/message-mapping-splitter-error-wrapper/02-general-splitter-opportunities-opportunity.png)
*The Splitter creates one branch for each `<Opportunity>` in the batch.*

### 3. Content Modifier BEFORE mapping

The first lesson: capture the `ProductId` property using XPath **before** transforming the message. After mapping, the body is a `ProductDraft` and the original opportunity path no longer exists:

![Content Modifier with XPath](/images/posts/message-mapping-splitter-error-wrapper/03-content-modifier-productid-xpath.png)
*Extract the Data Store key while the XML still contains an Opportunity.*

### 4. Message Mapping

Here is **the error in this case**. My first attempt used `Opportunity.xsd` as the source for `MM_SalesforceOpp_to_ProductDraft`. Deployment succeeded, but runtime failed:

```text
Cannot produce target element /ProductDraft
```

![Runtime error Trace](/images/posts/message-mapping-splitter-error-wrapper/07-runtime-error-wrapper-trace.png)
*The monitor showed the mapping failing on each split segment.*

Inspecting **Message before Step → Payload** in the first segment's Trace revealed that the General Splitter **preserves the `<Opportunities>` wrapper**. The actual payload was not:

```xml
<Opportunity>...</Opportunity>
```

It was:

```xml
<Opportunities>
  <Opportunity>...</Opportunity>
</Opportunities>
```

The mapping expected root `Opportunity` but received `Opportunities`. I considered normalizing the XML in an extra step, then rejected that unnecessary addition. The final correction was:

- Mapping source: `OpportunitiesSplit.xsd`, including the wrapper.
- Root mapping: `Opportunities → ProductDraft`.
- All fields start at `Opportunities/Opportunity/...`.
- Content Modifier XPath: `/Opportunities/Opportunity/Id`.

![Mapping schemas](/images/posts/message-mapping-splitter-error-wrapper/01-mapping-local-schemas-opportunitiessplit-productdraft.png)
*Corrected source: OpportunitiesSplit with its wrapper → ProductDraft.*

Seven fields are mapped, plus constant `USD` for the currency code:

![Mapping field links](/images/posts/message-mapping-splitter-error-wrapper/02-mapping-field-links-final.png)
*Id→ProductId, Name→Name and Description, Amount→Price, Account/Id→SupplierId, Account/Name→SupplierName.*

### 5. Write Data Store with externalized parameters

Use Entry ID `${property.ProductId}` and **Overwrite = Yes** for idempotency: reprocessing the same batch does not create duplicates.

![Write Data Store](/images/posts/message-mapping-splitter-error-wrapper/05-datastore-write-productdrafts.png)
*Each ProductDraft is persisted using its ProductId as the key.*

Externalize the Data Store name as `{{dataStoreName}}` and configure `DS_Logali_ProductDrafts` at deployment, so moving between environments does not require editing the iFlow:

![Externalized Data Store parameter](/images/posts/message-mapping-splitter-error-wrapper/06-externalized-datastore-name.png)
*Externalize values that change between environments.*

## Final test

A batch of three opportunities sent from Postman returned HTTP 200, with all three Data Store entries using their correct IDs (`OPP-2026-00042/43/44`):

![Postman 200 OK](/images/posts/message-mapping-splitter-error-wrapper/08-postman-200-ok-response.png)
*Happy path validated after the fix.*

## Lessons

1. **The General Splitter preserves the wrapper in this configuration.** Before choosing the source XSD for post-split mapping, inspect `Message before Step → Payload` in the first segment's Trace. The actual payload determines the contract.
2. **Capture keys before transforming.** Placing the Content Modifier after mapping can leave a property empty without throwing an error.
3. **Externalize environment-specific values.** A hardcoded Data Store name may work in DEV but cause transport problems.
4. **Never export real credentials.** Postman collections use `{{cpi_user}}` / `{{cpi_password}}` secret variables, and screenshots are sanitized before sharing.

This case is documented as CPI-014 in my knowledge base. The next post presents the preventive version of the same pattern.

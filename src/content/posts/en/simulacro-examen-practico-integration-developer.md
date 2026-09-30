---
title: SAP Integration Developer practical mock exam: solution and scoring rubric
description: A complete practice assessment with a fictional scenario — an API Management task via Cloud Connector and an autonomous Cloud Integration task with context changes and a Data Store. Includes timing, steps and a 100-point rubric.
date: 2026-07-27
tags: certificacion, simulacro, api-management, cloud-integration
---

After [passing the System-based Assessment](/blog/aprobe-certificacion-sap-integration-developer), I created this **practice assessment** with two independent tasks, mandatory artifact names and checklist validation. The scenario is **fictional**, preserving the confidentiality of the real exam. Solving it under time pressure is a useful preparation exercise.

> **How to use it:** reserve **90 uninterrupted minutes**, open your Integration Suite trial tenant and avoid reading the solution until you finish or decide to stop. Score your work with the rubric at the end.

---

## Scenario

**Aurora Foods** is a food distributor with an on-premise ERP. It needs two deliverables from you as an Integration Developer:

- **Task A:** expose the ERP's material catalogue OData service to business partners through **API Management**, using an already configured Cloud Connector connection.
- **Task B:** build an internal **Cloud Integration** process that flattens a warehouse hierarchy into a simple SKU list and saves it in internal storage.

**Required names are exact and case-sensitive:** `AUR_Proxy` ≠ `aur_proxy`. Write them down before starting.

---

## Task A — Expose the on-premise catalogue with API Management

### Requirement

Publish the ERP's `ZMAT_CATALOG_SRV` OData service in the Developer Hub so partners can subscribe using an API Key.

### Technical details

| Item | Value |
|---|---|
| ERP host | `erp.aurora-foods.internal` |
| Port | `44300` (HTTPS) |
| Path prefix | `/sap/opu/odata` |
| Service catalogue | `/IWFND/CATALOGSERVICE;v=2/ServiceCollection` |
| Cloud Connector Location ID | `plant001` |
| Backend authentication | Basic, with a trial technical user or placeholder |

### Required artifacts: exact names

| Artifact | Name |
|---|---|
| API Provider | `AUR_Provider` |
| API Proxy | `AUR_Proxy` |
| Product | `AUR_Product` |

### What is assessed

Understand **the chain and its order**: the Provider defines the technical connection, using *On Premise* and Location ID to route through Cloud Connector. The Proxy exposes the service discovered from the Provider's catalogue. The Product packages the Proxy and is **published** to the Developer Hub. Creation alone is insufficient: the Proxy must be **Deployed** and the Product **Published**.

---

## Task B — Internal flattening pipeline with Cloud Integration

### Requirement

Build an **autonomous** iFlow that runs when deployed, **without a sender or external call**. It takes hierarchical inventory — warehouse → aisle → SKU — transforms it into a **flat SKU list**, ignores intermediate levels and persists the result in a Data Store **before ending**.

### Input payload: place it at the start of the flow

```xml
<?xml version="1.0" encoding="UTF-8"?>
<inv:WarehouseInventory xmlns:inv="http://aurora-foods.example/inventory">
  <Warehouse Name="Central">
    <Aisle Number="A1">
      <SKU>ARZ-1001</SKU>
      <SKU>ARZ-1002</SKU>
    </Aisle>
    <Aisle Number="A2">
      <SKU>ACE-2001</SKU>
      <SKU>ACE-2002</SKU>
      <SKU>ACE-2003</SKU>
    </Aisle>
  </Warehouse>
  <Warehouse Name="Norte">
    <Aisle Number="N1">
      <SKU>HAR-3001</SKU>
      <SKU>HAR-3002</SKU>
    </Aisle>
    <Aisle Number="N2">
      <SKU>AZU-4001</SKU>
    </Aisle>
  </Warehouse>
</inv:WarehouseInventory>
```

### Expected Data Store result

A single-level list containing **eight SKUs**:

```xml
<inv:SKUList xmlns:inv="http://aurora-foods.example/inventory">
  <SKU>ARZ-1001</SKU>
  <SKU>ARZ-1002</SKU>
  <SKU>ACE-2001</SKU>
  <SKU>ACE-2002</SKU>
  <SKU>ACE-2003</SKU>
  <SKU>HAR-3001</SKU>
  <SKU>HAR-3002</SKU>
  <SKU>AZU-4001</SKU>
</inv:SKUList>
```

### Required artifacts: exact names

| Artifact | Name |
|---|---|
| Package | `AUR_Package` |
| Integration Flow | `AUR_Flow` |
| Message Mapping | `SKUFlattener` |
| Data Store | `AUR_Store` |

*Create the mapping XSD/WSDL from the structures above, or simulate using editor types. The assessed concept is context handling rather than schema typing.*

⏱️ **Stop reading and solve the tasks.** The solution follows below.

---

## Task A solution

1. **Configure → APIs → API Providers → Create:** name `AUR_Provider`. Under **Connection**, choose **On Premise**, host `erp.aurora-foods.internal`, port `44300`, and **Location ID `plant001`**. This value routes through the corresponding Cloud Connector. Under **Catalog Service Settings**, configure the path prefix, catalogue URL and Basic authentication from the table.
2. **Create API → API Provider source** → `AUR_Provider` → **Discover** → select `ZMAT_CATALOG_SRV` → name `AUR_Proxy` → **Deploy**. Creating a proxy from a pasted direct URL does not establish the Provider→Proxy relationship required by this exercise.
3. **Engage → Products → Create:** `AUR_Product` → APIs tab → **Add** → `AUR_Proxy` → **Publish**. Without publication, partners cannot find and subscribe to the product in the Developer Hub.

*In a trial without a real ERP, Test Connection will fail. You can still practice the configuration sequence. For a working end-to-end lifecycle using a simulated CPI backend, follow [the governed API case](/blog/api-gobernada-cpi-api-management).*

## Task B solution

1. **Design → Create package** `AUR_Package` → Add → Integration Flow `AUR_Flow` → Edit.
2. **Autonomous means Timer:** remove the Sender participant, Start Message and channel. Add a **Timer** start event with **Run Once** scheduling so it runs upon deployment.
3. Add a **Content Modifier** after the Timer. Under **Message Body**, select Constant and paste the complete XML payload. Copying it avoids namespace typing mistakes.
4. Add **Message Mapping**, creating the artifact as `SKUFlattener`. Keep the exact required name. Source structure: `WarehouseInventory`; target: `SKUList`.
5. **The key step — change the context:** map `Warehouse/Aisle/SKU` → `SKUList/SKU`. An initial simulation may group SKUs by aisle or show a context error. Select source node `SKU` in the expression editor and change its **context** to root `WarehouseInventory`, or use node function `removeContexts`. This removes intermediate Warehouse/Aisle contexts so all SKUs enter one list. **Simulate** and verify eight flat SKUs.
6. Add **Data Store Operations → Write** after mapping: Data Store Name `AUR_Store`, empty Entry ID for automatic generation, Integration Flow visibility. Connect it to **End**, ensuring the write happens before completion.
7. **Save → Deploy**. Verify a **Completed** message in **Monitor → Message Processing**, then one entry in **Manage Stores → Data Stores → `AUR_Store`** containing the flat list.

---

## Self-assessment rubric: 100 points

| # | Criterion | Points |
|---|---|---|
| 1 | `AUR_Provider` is On Premise with Location ID `plant001` and configured catalogue | 15 |
| 2 | `AUR_Proxy` created **from the Provider** through Discover, and Deployed | 15 |
| 3 | `AUR_Product` includes the proxy and is **Published** | 10 |
| 4 | Exact case-sensitive Task A names | 5 |
| 5 | `AUR_Flow` has no Sender and starts with Timer Run Once | 15 |
| 6 | Content Modifier contains the payload in Message Body | 5 |
| 7 | `SKUFlattener` mapping changes **context** and produces eight flat SKUs in simulation | 20 |
| 8 | Data Store Write to `AUR_Store` precedes End; entry visible in Manage Stores | 10 |
| 9 | Successful deployment with Completed MPL | 5 |

**80+ points:** strong performance on this practice rubric. **60–79:** review failed criteria and repeat in three days. **Below 60:** revisit the fundamentals using [the laboratory cases](/blog). This rubric is a practice aid, not an official exam score or guarantee.

## Frequent mistakes and how to avoid them

1. **Using your own artifact names** instead of the required names: validation is literal.
2. **Leaving the Proxy undeployed or Product unpublished:** creation alone does not finish the task.
3. **Leaving a Sender in the iFlow:** this autonomous exercise requires a Timer.
4. **Mapping without changing context:** grouped output can look correct at first glance. Simulate and count elements.
5. **Skipping final verification in Data Store and Monitor:** finish by checking the actual result.

Share your score [on LinkedIn](https://www.linkedin.com/in/lucesgabriel) or [contact me](/contacto). If you are preparing for certification, read [my exam experience](/blog/aprobe-certificacion-sap-integration-developer) and explore the free [resources](/recursos). 🎯

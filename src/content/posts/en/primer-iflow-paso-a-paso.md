---
title: Your first iFlow in Cloud Integration, step by step
description: Build a complete integration flow — from the HTTPS sender to error handling — with an explanation of each design decision.
date: 2026-06-11
tags: cloud-integration, tutorial
---

Let's build a simple but realistic iFlow: it receives an order over **HTTPS**, validates and transforms it, then stores it in a **Data Store**. It is a useful hands-on exercise for Integration Developer preparation.

## Scenario

An external system sends orders in JSON. Our iFlow must:

1. Receive the message over HTTPS.
2. Convert JSON to XML so we can use Message Mapping.
3. Route orders: those over USD 1,000 require an additional record.
4. Persist the result in a Data Store.

## Step 1 — HTTPS sender

Create `IF_Orders_Inbound` in your package. Connect the **Sender** participant to the Start Message through an **HTTPS** channel:

- **Address:** `/orders/inbound`
- **Authorization:** User Role (`ESBMessaging.send`)
- **CSRF Protected:** disabled for Postman testing

## Step 2 — JSON to XML

Add a **JSON to XML Converter** after the Start. Converters need a *root element*; use `Order` and an empty namespace to keep this exercise simple.

## Step 3 — Conditional Router

Add a **Router** with two routes:

- **HighValue route:** XPath condition `//Order/total > 1000`
- **Default route:** mark it as *Default Route*

On the HighValue route, add a **Content Modifier** that creates the `orderPriority` property with value `HIGH`. **Properties** exist throughout message processing; **headers** can propagate to the receiver. Understand this distinction when preparing for the exam.

## Step 4 — Data Store

End both routes in **Data Store Operations (Write)**:

- **Data Store Name:** `OrdersInbound`
- **Entry ID:** `${property.orderId}` (extracted earlier with a Content Modifier)
- **Retention:** 30 days

## Step 5 — Error handling

Add an **Exception Subprocess** with a Content Modifier that captures `${exception.message}` and ends with an **Error End Event**. This gives you an explicit error-handling path to investigate in the monitor.

## Test

Deploy and get the endpoint URL from **Monitor → Manage Integration Content**. Test it with Postman:

```json
{
  "orderId": "PO-1001",
  "customer": "ACME",
  "total": 1500
}
```

Check the result in **Monitor → Manage Stores → Data Stores**.

## Key lessons

- Convert JSON to XML early if you plan to map it or use XPath.
- Use properties for internal logic and headers for external communication.
- Include an Exception Subprocess in production iFlows.

In the next article, we will add security with API Management in front of this endpoint.

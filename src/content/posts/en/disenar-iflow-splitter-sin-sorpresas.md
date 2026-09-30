---
title: Designing a Splitter iFlow without surprises: 7 decisions before you build
description: The preventive version of the wrapper case — documenting design decisions for a Splitter + Message Mapping + Data Store pattern before the error occurs.
date: 2026-06-09
tags: casos-reales, cloud-integration, message-mapping, buenas-practicas
---

In [the wrapper error post](/blog/message-mapping-splitter-error-wrapper), I explained how Message Mapping failed at runtime because the General Splitter preserves the parent element in each segment. This article takes the same pattern and **designs it from scratch with those lessons already incorporated**, as a training case in my laboratory.

The difference is between debugging at runtime and making the decision during design.

## The pattern

XML batch → split by item → capture key → transform → persist:

![iFlow architecture](/images/posts/disenar-iflow-splitter-sin-sorpresas/architecture.png)
*HTTPS Sender → General Splitter → Content Modifier → Message Mapping → Write Data Store, with an Exception Subprocess.*

## The 7 design decisions and their rationale

Each laboratory case includes a **decision log**: what was decided, which alternatives were considered and why. These are the decisions for the Splitter pattern:

### DC-01 — Cloud Integration as the main capability

This case requires orchestration and transformation. If external consumers required API Keys and quotas, API Management would be part of the design, as in [the Globex case](/blog/api-gobernada-cpi-api-management).

### DC-02 — Declarative Message Mapping

For structure-to-structure transformations with available XSDs, standard Message Mapping is visual, maintainable and avoids unnecessary code. Reserve Groovy for requirements that mapping cannot handle.

### DC-03 — Capture the key BEFORE mapping

Extract the `ProductId` property with XPath immediately after the Splitter, while the body still contains an `Opportunity`. After mapping, that field no longer exists and the property would be empty — **without throwing an error**, which makes the mistake difficult to spot.

### DC-04 — Externalize the Data Store name

Use `{{dataStoreName}}` as an externalized parameter instead of hardcoding `DS_Logali_ProductDrafts`. Values that vary, or could vary, between environments should be configurable.

### DC-05 — Exception Subprocess from day one

It is part of the initial design: otherwise errors lack a controlled handling path and can be difficult to interpret in the monitor.

### DC-06 — Disable Stop on Exception in the Splitter

This is a resilience decision: if opportunity 2 of 3 fails, the other two should still be processed. Diagnose the failed record separately.

### DC-07 — The mapping source is the REAL post-split payload

The most important decision comes directly from error CPI-014:

> At runtime, `Message before Step` shows `<Opportunities><Opportunity>...</Opportunity></Opportunities>` for each segment. The mapping must represent the observed payload.

The source is therefore `OpportunitiesSplit.xsd`, including the wrapper, and all paths start at `Opportunities/Opportunity/...`. Document this **before building** to prevent the same mismatch.

## Pre-deployment checklist

My validation rubric before deploying an iFlow with this pattern:

- [ ] Splitter XPath tested against the actual input payload
- [ ] Trace enabled and post-split payload inspected: is the wrapper preserved?
- [ ] Mapping source XSD matches the post-split payload
- [ ] Key properties captured before transformation
- [ ] Externalized parameters for values that vary by environment
- [ ] Exception Subprocess connected with a controlled ending
- [ ] Postman collection uses variables and contains no literal credentials

## The lesson

Solving a case creates knowledge; **documenting decisions makes that knowledge reusable**. The wrapper error cost me an afternoon of debugging the first time. The next time, it was decision DC-07, written before opening the iFlow editor.

That is how my laboratory knowledge base works: each error is catalogued (CPI-NNN), each decision is recorded (DC-NN), and the next case starts by reviewing both.

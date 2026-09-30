---
title: My preparation roadmap for SAP Integration Developer certification
description: My certification study plan — exam topics, resources, time allocation and mistakes to avoid.
date: 2026-06-08
tags: certificacion, c-cpi-15
---

I am in the final stretch of preparing for **SAP Certified Associate — Integration Developer**, and I want to document my plan. If you are following the same path, this may save you time.

## Exam topics

The exam covers these areas; their approximate weighting varies by version:

| Area | What to study |
| --- | --- |
| Cloud Integration | iFlows, processing steps, adapters, monitoring |
| API Management | Proxies, policies, products, Developer Hub |
| Security | OAuth 2.0, API Key, CSRF, certificates, Keystore |
| Connectivity | Cloud Connector, Location ID, BTP destinations |
| Integration Advisor / B2B | MIG, MAG and TPM concepts |
| BTP fundamentals | Subaccounts, entitlements, ISA-M |

## My study plan

### Phase 1 — Fundamentals (2 weeks)

- SAP Learning Hub / learning.sap.com: the official Integration Suite learning journey.
- A BTP trial account with Integration Suite activated from day one.

### Phase 2 — Intensive practice (4 weeks)

This is where preparation succeeds or fails. Practice every concept instead of memorizing it:

- Build an iFlow every day, even a small one.
- Recreate common patterns: Content-Based Router, Splitter + Gather, Request-Reply with OData to S/4HANA.
- Build API Proxies with API Key, OAuth and rate-limiting policies.
- Practice an on-premise scenario with Cloud Connector and Location ID.

### Phase 3 — Simulation (1–2 weeks)

- Official SAP sample questions.
- Timed exam-style exercises.
- Review the weak areas you identify.

## Mistakes to avoid

1. **Studying theory alone.** Scenario questions are harder to distinguish if you have never configured the relevant adapter, such as SFTP.
2. **Ignoring API Management.** Developers coming from CPI/PO may underestimate this area. Practice Verify API Key, Quota and Spike Arrest.
3. **Confusing headers and properties.** A property is internal to the iFlow; a header travels with the message, subject to adapter configuration.
4. **Skipping the official Exam Guide.** It defines the scope of the current exam version.

## Resources I am using

- The official learning journey on learning.sap.com (free).
- An Integration Suite trial tenant for daily practice.
- SAP Community for specific questions.
- AI-generated practical exercises with strict assessment rubrics.

**Update (July 2026):** passed! ✅ I shared my experience of the practical exam in [this post](/blog/aprobe-certificacion-sap-integration-developer).

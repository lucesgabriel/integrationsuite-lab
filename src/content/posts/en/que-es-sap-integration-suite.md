---
title: What is SAP Integration Suite? Getting started in 2026
description: An introduction to the main SAP Integration Suite capabilities on BTP — Cloud Integration, API Management, Event Mesh and more — and SAP's strategic integration platform.
date: 2026-06-10
tags: fundamentos, btp
---

SAP Integration Suite is SAP's **integration platform as a service (iPaaS)**, running on SAP Business Technology Platform (BTP). It is SAP's strategic platform for connecting SAP and non-SAP applications, in the cloud and on premises.

## Main capabilities

### Cloud Integration (CPI)

The heart of the suite. Here you design **iFlows** (integration flows): graphical processes that receive a message, transform it and deliver it to one or more destinations. Common building blocks include:

- **Content Modifier** — modifies message headers, properties and body.
- **Router** — routes messages according to conditions (XPath or expressions).
- **Message Mapping** — transforms structures, for example from IDoc to JSON.
- **Splitter / Aggregator** — splits and reassembles messages.
- **Exception Subprocess** — centralizes error handling.

### API Management

Publish and govern APIs: create an **API Proxy** over a backend service and apply **policies** such as API Key, OAuth 2.0, rate limiting, spike arrest and CORS. Proxies are grouped into **API Products** and published in the Developer Hub.

### Event Mesh

**Asynchronous, event-driven communication** between applications, using queues and topics. It supports event-driven architectures with S/4HANA.

### Other capabilities

- **Edge Integration Cell** — runs integrations inside your own network through hybrid deployment.
- **Integration Advisor** — accelerates B2B scenarios with intelligent mapping content.
- **Trading Partner Management** — manages trading partners for EDI.
- **Open Connectors** — provides connectors to third-party applications.

## Why learn it now?

1. **Migration from PO/PI:** companies moving from SAP Process Orchestration to Integration Suite need integration specialists. Maintenance timelines depend on the applicable SAP product and support terms.
2. **Clean Core:** SAP's strategy moves extensions and integrations outside the ERP and onto BTP.
3. **Integration Developer certification:** validates your integration knowledge. Check the current official certification guide when planning your preparation.

## How to get started

> My recommendation: create a SAP BTP trial account, activate Integration Suite and build your first iFlow that same day. Integration theory needs hands-on practice.

In the next articles, we will build an iFlow step by step and review common mistakes when preparing for certification.

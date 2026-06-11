---
title: Tu primer iFlow paso a paso en Cloud Integration
description: Construimos un integration flow completo — desde el sender HTTPS hasta el manejo de errores — explicando cada decisión de diseño en el camino.
date: 2026-06-11
tags: cloud-integration, tutorial
---

Vamos a construir un iFlow sencillo pero realista: recibe un pedido por **HTTPS**, lo valida, lo transforma y lo guarda en un **Data Store**. Es el tipo de ejercicio que aparece (con variaciones) en la certificación C_CPI_15.

## Escenario

Un sistema externo envía pedidos en JSON. Nuestro iFlow debe:

1. Recibir el mensaje vía HTTPS.
2. Convertir JSON a XML para poder usar Message Mapping.
3. Enrutar: pedidos sobre 1000 USD requieren registro adicional.
4. Persistir el resultado en un Data Store.

## Paso 1 — Sender HTTPS

Crea el iFlow `IF_Orders_Inbound` en tu paquete. Conecta el participante **Sender** al Start Message con un canal **HTTPS**:

- **Address**: `/orders/inbound`
- **Authorization**: User Role (`ESBMessaging.send`)
- **CSRF Protected**: desactivado para pruebas con Postman

## Paso 2 — JSON a XML

Agrega un **JSON to XML Converter** después del Start. Los converters necesitan un *root element*; usa `Order` y namespace vacío para simplificar.

## Paso 3 — Router con condición

Agrega un **Router** con dos rutas:

- **Ruta HighValue**: condición XPath `//Order/total > 1000`
- **Ruta Default**: marca como *Default Route*

En la ruta HighValue agrega un **Content Modifier** que cree la property `orderPriority` con valor `HIGH`. Las **properties** viven durante todo el procesamiento del mensaje; los **headers** se propagan hacia el receiver — esta diferencia es pregunta segura de examen.

## Paso 4 — Data Store

Cierra ambas rutas en un **Data Store Operations (Write)**:

- **Data Store Name**: `OrdersInbound`
- **Entry ID**: `${property.orderId}` (extraído antes con Content Modifier)
- **Retention**: 30 días

## Paso 5 — Manejo de errores

Agrega un **Exception Subprocess** con un Content Modifier que capture `${exception.message}` y termine en un **Error End Event**. Sin esto, los errores quedan crípticos en el monitor.

## Prueba

Despliega y obtén la URL del endpoint en **Monitor → Manage Integration Content**. Prueba con Postman:

```json
{
  "orderId": "PO-1001",
  "customer": "ACME",
  "total": 1500
}
```

Verifica el resultado en **Monitor → Manage Stores → Data Stores**.

## Lecciones clave

- Convierte JSON a XML temprano si vas a mapear o usar XPath.
- Properties para lógica interna, headers para comunicación externa.
- Todo iFlow productivo necesita Exception Subprocess. Sin excepciones.

En el próximo artículo agregaremos seguridad con API Management delante de este endpoint.

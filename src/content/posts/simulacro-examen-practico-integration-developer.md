---
title: "Simulacro del examen práctico SAP Integration Developer (con solución y rúbrica)"
description: Un assessment de práctica completo con escenario ficticio — Task de API Management (servicio on-premise vía Cloud Connector) y Task de Cloud Integration (iFlow autónomo con cambio de contexto y Data Store). Cronómetro, paso a paso y rúbrica de 100 puntos.
date: 2026-07-27
tags: certificacion, simulacro, api-management, cloud-integration
---

Después de [aprobar el System-based Assessment](/blog/aprobe-certificacion-sap-integration-developer), armé este **simulacro de práctica** con el mismo formato y nivel de exigencia: dos tareas independientes, nombres de artefactos obligatorios y validación por checklist. El escenario es **inventado** (así no toco el contenido real del examen, que es confidencial) — pero si puedes resolver esto contra reloj, estás en forma.

> **Cómo usarlo**: reserva **90 minutos** sin interrupciones, abre tu tenant trial de Integration Suite, y no mires la solución hasta terminar (o rendirte 😄). Al final, califícate con la rúbrica.

---

## El escenario

**Aurora Foods** es un distribuidor de alimentos con un ERP on-premise. Necesitan dos cosas de ti como Integration Developer:

- **Task A**: exponer su catálogo de materiales (servicio OData del ERP) a los socios comerciales a través de **API Management**, usando la conexión Cloud Connector ya configurada.
- **Task B**: un proceso interno de **Cloud Integration** que aplane la jerarquía de bodegas a una lista simple de SKUs y la deje en un almacenamiento interno.

**Regla de oro (igual que en el examen real): los nombres son exactos y case-sensitive.** `AUR_Proxy` ≠ `aur_proxy`. Anota los nombres antes de empezar.

---

## Task A — Exponer el catálogo on-premise (API Management)

### Requerimiento

Publica el servicio OData `ZMAT_CATALOG_SRV` del ERP on-premise en el Developer Hub, para que los socios se suscriban con API Key.

### Datos técnicos

| Elemento | Valor |
|---|---|
| Host del ERP | `erp.aurora-foods.internal` |
| Puerto | `44300` (HTTPS) |
| Path prefix | `/sap/opu/odata` |
| Catálogo de servicios | `/IWFND/CATALOGSERVICE;v=2/ServiceCollection` |
| Location ID del Cloud Connector | `plant001` |
| Autenticación al backend | Basic (usuario técnico de tu trial o placeholder) |

### Artefactos obligatorios (nombres exactos)

| Artefacto | Nombre |
|---|---|
| API Provider | `AUR_Provider` |
| API Proxy | `AUR_Proxy` |
| Product | `AUR_Product` |

### Lo que se evalúa

Que entiendas **la cadena y su orden**: el Provider define la conexión técnica (tipo *On Premise* + Location ID → enruta por Cloud Connector), el Proxy expone el servicio descubierto desde el catálogo del Provider, y el Product empaqueta el Proxy y se **publica** al Developer Hub. Crear los tres no basta: el Proxy debe quedar **Deployed** y el Product **Published**.

---

## Task B — Pipeline interno de aplanado (Cloud Integration)

### Requerimiento

Un iFlow **autónomo** — debe ejecutarse solo al desplegarse, **sin sender ni llamada externa** — que tome el inventario jerárquico (bodega → pasillo → SKU), lo transforme en una **lista plana de SKUs** ignorando los niveles intermedios, y la persista en un Data Store **antes de terminar**.

### Payload de entrada (colócalo al inicio del flujo)

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

### Resultado esperado en el Data Store

Una lista plana con los **8 SKUs** en un solo nivel:

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

### Artefactos obligatorios (nombres exactos)

| Artefacto | Nombre |
|---|---|
| Package | `AUR_Package` |
| Integration Flow | `AUR_Flow` |
| Message Mapping | `SKUFlattener` |
| Data Store | `AUR_Store` |

*(Para el mapping: crea los XSD/WSDL tú mismo a partir de las estructuras de arriba, o simula con los tipos del editor — el punto evaluado es el manejo de contextos, no el tipeo de esquemas.)*

⏱️ **Detén la lectura aquí y resuelve.** La solución viene abajo.

---

## Solución Task A

1. **Configure → APIs → API Providers → Create**: nombre `AUR_Provider`. En **Connection**: Type **On Premise**, host `erp.aurora-foods.internal`, puerto `44300`, **Location ID `plant001`** — este campo es el que enruta por tu Cloud Connector; si tu escenario real no lo usa, quedará "sin destino" y el catálogo no responderá. En **Catalog Service Settings**: path prefix y URL del catálogo de la tabla, autenticación Basic.
2. **Create API → fuente API Provider** → `AUR_Provider` → **Discover** → selecciona `ZMAT_CATALOG_SRV` → nombre `AUR_Proxy` → **Deploy**. La trampa clásica: crear el proxy pegando la URL directa en lugar de descubrirlo desde el Provider — funciona en apariencia, pero rompe la relación Provider→Proxy que el escenario exige.
3. **Engage → Products → Create**: `AUR_Product` → pestaña APIs → **Add** → `AUR_Proxy` → **Publish**. Sin publicar, el Developer Hub no lo muestra y los socios no pueden suscribirse.

*(En un trial sin ERP real, el Test Connection fallará — no importa: lo que practicas es la secuencia y la configuración. Si quieres el ciclo completo funcionando con un backend real, sigue [el caso de la API gobernada](/blog/api-gobernada-cpi-api-management), que usa un backend simulado en CPI.)*

## Solución Task B

1. **Design → Create package** `AUR_Package` → Add → Integration Flow `AUR_Flow` → Edit.
2. **Autónomo = Timer**: borra el participante Sender y el Start Message con su canal. De la paleta Events, agrega **Timer** como inicio, scheduler en **Run Once** — así el flujo se dispara solo con cada deploy.
3. **Content Modifier** después del Timer: pestaña **Message Body**, type Constant, pega el payload XML completo. (Copia/pega — escribirlo a mano invita a errores de namespace.)
4. **Message Mapping**: agrega el paso, **Create** como artefacto con el nombre `SKUFlattener` (no dejes el `MM_...` por defecto — nombre exigido es nombre evaluado). Source: estructura `WarehouseInventory`; target: `SKUList`.
5. **El punto clave — cambio de contexto**: mapea `Warehouse/Aisle/SKU` → `SKUList/SKU`. Si simulas ahora, verás los SKUs agrupados por pasillo o un error de contexto. Selecciona el nodo source `SKU` en el editor de expresión y cambia su **contexto** al nodo raíz `WarehouseInventory` (o intercala la función de nodo `removeContexts`). Efecto: los niveles `Warehouse` y `Aisle` se ignoran y todos los SKUs caen en una única lista. **Simula** y verifica los 8 SKUs planos.
6. **Data Store Operations → Write** después del mapping: Data Store Name `AUR_Store`, Entry ID vacío (auto), visibilidad Integration Flow. Conecta al **End** — la escritura debe ocurrir *antes* de que el flujo concluya, no en una rama muerta.
7. **Save → Deploy**. Verifica: **Monitor → Message Processing** con el mensaje `Completed`, y **Manage Stores → Data Stores → `AUR_Store`** con 1 entrada cuyo body sea la lista plana.

---

## Rúbrica de autoevaluación (100 puntos)

| # | Criterio | Puntos |
|---|---|---|
| 1 | `AUR_Provider` tipo On Premise con Location ID `plant001` y catálogo configurado | 15 |
| 2 | `AUR_Proxy` creado **desde el Provider** (Discover) y en estado Deployed | 15 |
| 3 | `AUR_Product` con el proxy asignado y **Published** | 10 |
| 4 | Nombres de Task A exactos (case-sensitive) | 5 |
| 5 | `AUR_Flow` sin Sender, iniciando con Timer Run Once | 15 |
| 6 | Content Modifier con el payload en Message Body | 5 |
| 7 | Mapping `SKUFlattener` con **cambio de contexto** → 8 SKUs planos en la simulación | 20 |
| 8 | Data Store Write a `AUR_Store` antes del End; entrada visible en Manage Stores | 10 |
| 9 | Deploy exitoso con MPL Completed | 5 |

**80+ puntos**: listo para agendar el examen. **60–79**: repasa los criterios fallados y repite en 3 días. **<60**: vuelve a los fundamentos con calma — [los casos del laboratorio](/blog) son el camino.

## Los errores que más se repiten (y cómo evitarlos)

1. **Nombres inventados propios** en lugar de los exigidos — la validación de un assessment es literal.
2. **Proxy sin Deploy / Product sin Publish** — "creado" no es "terminado".
3. **Dejar el Sender en el iFlow** — si el enunciado dice autónomo, el grader espera Timer.
4. **Mapear sin tocar el contexto** — el resultado agrupado *parece* correcto a simple vista; simula siempre y cuenta los elementos.
5. **No verificar el resultado final** (Data Store/Monitor) — la tarea termina cuando compruebas el efecto, no cuando haces clic en Deploy.

¿Lo resolviste? Cuéntame tu puntaje [por LinkedIn](https://www.linkedin.com/in/lucesgabriel) o [escríbeme](/contacto). Y si vas camino al examen: [así fue mi experiencia real](/blog/aprobe-certificacion-sap-integration-developer) y [estos recursos](/recursos) son gratis. 🎯

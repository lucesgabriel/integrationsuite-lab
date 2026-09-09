# Plan de mejora — SAPIntegrationLab

Fecha: 9 de septiembre de 2026.

## Alcance y prioridades

Conservar React, Vite, el diseño azul, los temas claro/oscuro, la interfaz ES/EN y la publicación existente en GitHub Pages con el dominio sapintegrationlab.com.

| Prioridad | Hallazgo en el proyecto | Mejora ejecutada | Criterio de aceptación |
|---|---|---|---|
| P1 | El caso MIX-002 simple aún no está publicado | Artículo propio con guía CPI, APIM, diagnóstico y límites | URL del artículo, listado y recurso descargable coherentes |
| P1 | El HTML generado contiene metadatos pero un root vacío | Contenido estático por ruta; artículos completos y enlaces desde inicio/blog | El HTML de producción contiene el texto sin ejecutar JavaScript |
| P1 | Artículos filtrables solo por etiqueta | Búsqueda por título, descripción y etiquetas; filtros en URL, contador y reinicio | Consultas sin distinción de tildes o mayúsculas y enlaces de filtros reutilizables |
| P2 | Tablas técnicas pueden ensanchar la página | Contenedor con desplazamiento horizontal y foco por teclado | Las tablas quedan contenidas en el ancho del artículo |
| P2 | Metadatos pequeños y enlace de lectura dependiente de hover | Mayor tamaño de etiquetas, contraste secundario y acción Leer siempre visible | Lectura accesible también en pantallas táctiles |
| P2 | Navegación sin enlace de salto ni estado accesible de menú | Saltar al contenido, foco visible, menú con estado y movimiento reducido | Recorrido por teclado y preferencia de movimiento respetados |
| P2 | Guías extensas sin indicación de tiempo ni anclas | Tiempo estimado de lectura y anclas estables; índice en el nuevo caso | El índice abre las secciones correspondientes |

## Adaptación del caso simple

Fuente: `implementation-guide-variante-A-simple.md`, caso SIS-CASE-MIX-002 del laboratorio local indicado por el propietario.

- Mantener tres pasos funcionales: CM_SetOrder, RR_GetOrder y CM_BuildResponse.
- Mantener entrada por header orderNumber y las rutas propias de la variante simple.
- Documentar las tres policies de APIM y separar credenciales del consumidor, CPI y backend.
- Corregir notas heredadas sobre JSON anidado: CM_BuildResponse construye ocho campos planos.
- Explicar la limitación de escape JSON y la ausencia de validaciones y contratos 400/404.
- Crear una colección Postman específica, con hosts example.com y secretos vacíos; no distribuir archivos privados ni capturas del tenant.

## Verificación y entrega

Compilación TypeScript y Vite, comprobación del HTML y enlaces internos del contenido, anclas y ZIP descargable. Las pruebas del iFlow se entregan en Postman para el entorno SAP del lector; no se afirma una nueva ejecución sobre el backend desde esta tarea.

Publicar mediante el flujo existente de GitHub Pages y comprobar su resultado. No trasladar el dominio a otro proveedor.

## Futuras iteraciones fuera de esta entrega

Medir rendimiento real y accesibilidad visual en dispositivos antes de proponer un rediseño. Revisar métricas de búsqueda e indexación cuando se disponga de Search Console. La traducción de artículos y activación de servicios de contacto/newsletter requieren contenido o configuración adicionales.

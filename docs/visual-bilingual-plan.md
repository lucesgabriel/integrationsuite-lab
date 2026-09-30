# Mejora visual y experiencia bilingüe

## Objetivo

Facilitar que un visitante encuentre un caso, entienda su arquitectura y descargue su material. La web y los 13 artículos tendrán versiones completas en español e inglés; los PDF conservarán su idioma original, indicado en cada recurso.

## Cambios previstos

1. **Portada:** mapa de integración en Three.js con tres recorridos del laboratorio: API gobernada, consulta de órdenes SAP PM y alertas ServiceNow. Controles HTML accesibles, descripción del recorrido y enlace al caso. Carga diferida, pausa fuera de pantalla, movimiento reducido y alternativa SVG cuando WebGL no esté disponible.
2. **Jerarquía visual:** más espacio entre secciones, tarjetas de artículos con imagen o portada tipográfica, un tratamiento consistente de títulos y etiquetas y colores basados en el tema actual. Mantener contraste y lectura en claro/oscuro.
3. **Recursos:** búsqueda, filtro por categoría, conteos, idioma del archivo visible y vínculo al artículo del idioma seleccionado. La descarga queda junto al formato y tamaño.
4. **Idiomas:** conservar las URL españolas existentes y añadir `/en/`, `/en/blog/`, `/en/resources/`, `/en/about/` y `/en/contact/`. El selector abre la misma página en el otro idioma. Traducir títulos, resúmenes, cuerpos, tablas, alt y pies de imágenes de los 13 artículos; conservar código, contratos y evidencia técnica.
5. **Lectura de imágenes:** visor con controles para ampliar y enlace al archivo original. Etiquetas y controles traducidos.
6. **SEO:** HTML estático por idioma, canonical, hreflang, Open Graph e idioma de datos estructurados; sitemap con las dos versiones.

## Verificación y publicación

- Compilación y comprobación de que cada artículo español tiene su traducción y sus enlaces/recursos.
- Revisar portada, recursos, blog y artículos en 320/390/768/1440 px, ambos temas e idiomas.
- Comprobar cambio de idioma conservando artículo y filtros, búsqueda inglesa, imágenes, visor, WebGL deshabilitado y movimiento reducido.
- Publicar por el flujo de GitHub Pages; comprobar resultado del despliegue, nuevas rutas inglesas y archivos desde el dominio público.

## Límite del trabajo

No se traducen los PDF ni se cambia el estado de validación de los casos SAP. Las capturas del laboratorio conservan el texto original; sus descripciones, pies y explicación sí se traducen.

## Implementación y QA local — 29 de septiembre de 2026

- Completados los seis puntos: portada Three.js, tarjetas con portada, catálogo filtrable, traducciones completas, visor con zoom y SEO bilingüe.
- 13 pares de artículos ES/EN; 102 referencias de imágenes comprobadas; 36 rutas estáticas con canonical, hreflang, sitemap, datos estructurados y anclas válidas.
- 96 vistas comprobadas: seis páginas principales en 320/390/768/1440 px, español/inglés y claro/oscuro, sin desbordamiento horizontal ni errores del navegador.
- Verificados filtros y búsquedas, conservación de URL y filtros al cambiar idioma, carga de imágenes de los 13 artículos ingleses, apertura/cierre y retorno del foco del visor, escena 3D y alternativa con WebGL deshabilitado.
- Movimiento reducido evita cargar Three.js. Recursos tampoco solicita el módulo 3D. El resaltado de código del lector se carga al abrir un artículo; el paquete inicial comprimido queda en aproximadamente 166 KB y la escena 3D en 138 KB adicionales cuando se utiliza.
- GitHub Actions ejecuta la validación del contenido generado antes de publicar. El resultado público del despliegue se comprobará después del push.

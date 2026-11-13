# SPEC-003: Catálogo, filtros y búsqueda

- **Estado:** borrador (prototipo de referencia en `sections/main-collection.liquid` y `snippets/tarjeta-producto.liquid`)
- **Etapa:** 2
- **Requerimientos:** RF-01, RF-02, RF-03
- **Responsable:** dev-tema-liquid
- **Revisores:** disenador-ui, qa-calidad

## Objetivo

Que el cliente encuentre su modelo y su talla en pocos toques, y que cada producto muestre de un vistazo si es nuevo, si está en combo o si quedan pocas unidades.

## Alcance

- Página de colección con cuadrícula de 2 columnas en celular y 4 en escritorio, 24 productos por página.
- Filtros nativos de Shopify (app Search & Discovery): talla, color, línea (tipo de producto o metacampo), precio y disponibilidad.
- Orden: destacados, novedad, precio menor a mayor y mayor a menor.
- Tarjeta de producto con foto, segunda foto al pasar el mouse (solo escritorio), nombre, precio, precio anterior tachado si aplica y sellos.
- Búsqueda predictiva en el encabezado (API `search/suggest` de Shopify) con productos y colecciones.

## Fuera de alcance

- Filtros por combo (se resuelve con una colección automática "En combo", SPEC-005).

## Comportamiento

- Los filtros funcionan con un formulario `GET` (sin JS se recarga la página; con JS se actualiza sin recargar).
- En celular los filtros se abren en un panel desde abajo con botón "Ver N productos".
- Sellos (máximo dos por tarjeta, en este orden de prioridad): **Agotado**, **Últimas unidades** (inventario total ≤ `umbral_ultimas_unidades`), **Combo** (etiqueta `combo`), **Nuevo** (etiqueta `nuevo`).
- Estado vacío: "No encontramos productos con esos filtros" y botón "Quitar filtros".

## Datos y configuración

- Etiquetas de producto: `nuevo`, `combo`, y las de grupo de combo `grupo-tenis`, `grupo-gorras` (SPEC-005).
- Filtros configurados en la app Search & Discovery (runbook en `docs/operaciones/`).

## Criterios de aceptación

- [ ] Dado un catálogo con tallas 38–44, cuando filtro por talla 42, entonces solo veo productos con la talla 42 disponible.
- [ ] Dado un producto con 2 unidades y umbral 3, entonces muestra "Últimas unidades".
- [ ] Dado un producto agotado, entonces muestra "Agotado" y no "Últimas unidades".
- [ ] Al escribir 3 letras en la búsqueda aparecen sugerencias en menos de 300 ms con red 4G.
- [ ] La cuadrícula no tiene saltos de diseño al cargar (CLS < 0,1).

## Plan

- [x] Prototipo de tarjeta y cuadrícula con filtros por formulario GET.
- [ ] Panel de filtros móvil.
- [ ] Actualización sin recarga con `fetch` + Section Rendering API.
- [ ] Búsqueda predictiva.

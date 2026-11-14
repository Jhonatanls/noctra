# Specs (ASDD)

Cada funcionalidad tiene una spec. La spec es el contrato entre el equipo y los agentes: dice qué se construye, cómo se sabe que está bien y quién lo hace.

## Estados

| Estado | Quién lo cambia | Significa |
| --- | --- | --- |
| `borrador` | arquitecto-specs | En redacción; no se implementa |
| `aprobada` | Equipo | Lista para planear e implementar |
| `en-progreso` | Agente responsable | Hay una rama abierta |
| `en-revision` | Agente responsable | Implementada; esperando QA, cumplimiento y prueba del equipo |
| `hecha` | Equipo | Aprobada y publicada |

Una spec en `borrador` puede tener un **prototipo de referencia** (código hecho para explorar), marcado así en su encabezado. El prototipo no cuenta como implementación aprobada.

## Índice

| Spec | Título | Etapa | RF / RNF | Responsable | Estado |
| --- | --- | --- | --- | --- | --- |
| [SPEC-001](SPEC-001-sistema-de-diseno.md) | Sistema de diseño de Noctra y modos | 1 | RF-34, RNF-03, RNF-04, RNF-05 | disenador-ui | en-revision |
| [SPEC-002](SPEC-002-esqueleto-y-navegacion.md) | Esqueleto, encabezado, pie e inicio | 1 | RF-21, RF-32, RNF-01, RNF-02 | dev-tema-liquid | en-revision |
| [SPEC-003](SPEC-003-catalogo.md) | Catálogo, filtros y búsqueda | 2 | RF-01, RF-02, RF-03; RNF-01, RNF-02, RNF-03, RNF-05, RNF-13, RNF-17 (parciales) | dev-tema-liquid | en-progreso |
| [SPEC-004](SPEC-004-ficha-y-tallas.md) | Ficha de producto y guía de tallas | 2 | RF-04 a RF-07, RF-18, RF-21 (parcial); RNF-01 a RNF-03, RNF-05, RNF-09, RNF-10, RNF-13, RNF-14, RNF-17 (parciales) | dev-tema-liquid | aprobada |
| [SPEC-005](SPEC-005-motor-de-combos.md) | Motor de combos | 3 | RF-08 a RF-11, RF-13 | dev-funciones | borrador (lógica implementada) |
| [SPEC-006](SPEC-006-carrito-y-whatsapp.md) | Carrito y compra por WhatsApp | 3 | RF-10, RF-14, RF-16 | dev-tema-liquid | borrador (prototipo) |
| [SPEC-007](SPEC-007-pagos-envios-checkout.md) | Pagos, envíos y checkout | 4 | RF-15, RF-17 a RF-20 | operaciones-shopify | borrador |
| [SPEC-008](SPEC-008-inventario-y-pedidos.md) | Inventario y pedidos | 4 | RF-24, RF-25, RF-27, RF-28 | operaciones-shopify | borrador |
| [SPEC-009](SPEC-009-canales-y-analitica.md) | Canales, notificaciones y analítica | 5 | RF-22, RF-23, RF-35, RF-36, RNF-18 | operaciones-shopify | borrador |
| [SPEC-010](SPEC-010-contenido-y-legal.md) | Contenido y páginas legales | 6 | RF-29, RF-33, RNF-09 a RNF-13 | contenido-copy | borrador |
| [SPEC-011](SPEC-011-calidad-y-lanzamiento.md) | Rendimiento, SEO y lanzamiento | 6 | RNF-01, RNF-02, RNF-14, RNF-16 | qa-calidad | borrador |

Copia `SPEC-000-plantilla.md` para escribir una nueva.

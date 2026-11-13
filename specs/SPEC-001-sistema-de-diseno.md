# SPEC-001: Sistema de diseño de Noctra y modos oscuro y claro

- **Estado:** en-revision
- **Etapa:** 1
- **Requerimientos:** RF-34, RNF-03, RNF-04, RNF-05
- **Responsable:** disenador-ui
- **Revisores:** qa-calidad

## Objetivo

Que toda la tienda transmita la identidad de Noctra (nocturna, gótica, afilada, de lujo urbano) con el producto como protagonista, que se lea bien en modo oscuro y claro, y que ajustar la identidad tome minutos y no días.

## Alcance

- Archivo único de tokens: `theme/assets/tokens.css`.
- Estilos globales: `theme/assets/base.css` (tipografía, botones, enlaces, foco, logo, contenedor, utilidades).
- Logo: snippet `logo` con las piezas vectoriales de `theme/assets/noctra-*.svg`.
- Fuentes autoalojadas: `snippets/fuentes.liquid` con Pirata One y Jost (licencia SIL OFL).
- Modo oscuro como base y modo claro con el interruptor.

## Fuera de alcance

- Redibujo profesional del logo (pendiente del equipo, ver `docs/marca/README.md`).
- Diseño del checkout (se ajusta en el admin de Shopify, SPEC-007).

## Dirección visual

**Concepto: vitrina de noche.** Fondo casi negro, el blanco del logotipo y del botón principal como luz, y la plata del isotipo como único acento. Lo memorable es una sola cosa por pantalla: en el inicio, el logotipo gótico grande; en la ficha, el producto.

- **Color:** paleta Noir y plata derivada del logo, con **oro como acabado**. La plata (`--color-acento`) es del isotipo. El oro (`--color-oro`) va en filos de 1 px de botones, tarjetas y diálogos, en el ornamento de línea con rombo, en las esquinas de marco, en precios, en el sello de combo y en el anillo de foco. `--color-oro-suave` (35 %) para filos que no deben competir: encabezado, bordes de tarjeta, divisores.
- **Acabados premium:** doble filo dorado (borde + contorno interior a 8 px) en combos y diálogos; esquinas de marco doradas en la foto principal de la ficha y al pasar el mouse por las tarjetas; línea con rombo bajo cada título de sección; isotipo entre dos líneas doradas al inicio del pie.
- **Tipografía:** Pirata One (gótica, afín al logotipo) solo para títulos de sección, nombre del producto en la ficha y eslogan, siempre en tamaños grandes; nunca en párrafos, botones, precios ni tarjetas de la cuadrícula. Jost para todo lo demás.
- **Forma:** aristas afiladas como las puntas del isotipo: radio 0 en botones, campos y sellos; 2 px en tarjetas y diálogos. Sin sombras ni degradados; la profundidad se da con `--color-superficie` y `--color-borde`.
- **Movimiento:** solo como respuesta a una acción, 160–240 ms, desactivado con `prefers-reduced-motion`.
- **Ritmo:** espaciado en múltiplos de 4 px.
- **Alineación:** títulos de sección a la izquierda con el contenido; solo la portada centra el logo.

## Logo

| Pieza | Archivo | Dónde se usa | Color |
| --- | --- | --- | --- |
| Logotipo (NOCTRA) | `noctra-wordmark.svg` | Encabezado, portada | `--color-texto` (máscara) |
| Isotipo (N) | `noctra-isotipo.svg` | Portada, pie, ícono del navegador, perfil de redes | `--color-acento` (máscara) |
| Completo superpuesto | `noctra-completo.svg` | Empaques, etiquetas, piezas sobre fondo oscuro | Dos tonos fijos, solo fondo oscuro |

El logotipo y el isotipo se pintan con `mask` CSS y `background: currentColor`, de modo que cambian solos con el modo. Altura mínima: logotipo 20 px, isotipo 32 px.

## Tokens

Colores en `CLAUDE.md` sección 6 y en `tokens.css`. Tipografía (escala ~1,25 sobre 16 px):

| Token | Valor | Uso |
| --- | --- | --- |
| `--texto-xs` | 0,8125 rem | Notas legales, ayudas |
| `--texto-s` | 0,9375 rem | Texto secundario, etiquetas |
| `--texto-m` | 1,0625 rem | Texto base |
| `--texto-l` | 1,375 rem | Precio en ficha, eslogan |
| `--texto-xl` | 1,875 rem | Títulos de sección (Pirata One) |
| `--texto-2xl` | 2,625 rem | Nombre de producto (Pirata One) |
| `--texto-hero` | clamp(3 rem, 9vw, 6 rem) | Titular de portada si no se usa el logo |

## Comportamiento del modo

1. La tienda **siempre inicia en oscuro** (`settings.modo_predeterminado = oscuro`). La opción "seguir el modo del celular" existe en el editor pero no se usa por decisión de marca.
2. El interruptor del encabezado alterna entre oscuro y claro y lo guarda en `localStorage` (`tema`).
3. Un script en el `<head>` aplica la preferencia antes de pintar, para que no parpadee.
4. Si `localStorage` no está disponible, el interruptor funciona solo durante la visita.

**Cambio respecto a RF-34 (aprobado por el equipo el 13 nov 2026):** la tienda inicia en oscuro en vez de seguir el modo del celular, por coherencia con la marca. El modo claro sigue disponible con el interruptor.

## Criterios de aceptación

- [x] Ningún componente define colores, fuentes o tamaños fuera de `tokens.css` (la única excepción es `meta theme-color`).
- [x] Cambiar `--color-acento` en `tokens.css` cambia el color del isotipo en toda la tienda; cambiar `--color-oro` cambia todos los acabados.
- [ ] El oro sobre marfil en modo claro (#8C6E3A sobre #F3F3F1) cumple 4,5:1 en precios (verificar).
- [x] El logotipo y el isotipo se ven correctamente en modo oscuro y claro sin archivos distintos.
- [x] Sin preferencia guardada, la tienda carga en oscuro sin parpadeo.
- [x] El interruptor cambia el modo y al recargar se mantiene.
- [x] Fuentes autoalojadas: Theme Check sin avisos de recursos remotos.
- [ ] Todos los pares texto/fondo cumplen 4,5:1 en ambos modos (medir con herramienta; `--color-texto-2` sobre `--color-superficie` es el más ajustado).
- [x] Foco visible con teclado (anillo de 2 px en `--color-acento`).
- [x] Con "reducir movimiento" no hay transiciones.
- [ ] Revisión visual del equipo a 360 px y 1280 px en ambos modos, en la tienda de desarrollo.

## Plan

- [x] Tokens Noir y plata, forma afilada, tipografía gótica para títulos.
- [x] Snippet `logo` con máscara CSS; favicon e ícono de Apple desde el isotipo.
- [x] Autoalojar Pirata One y Jost.
- [ ] Reemplazar los SVG vectorizados por los archivos vectoriales originales del diseñador.
- [ ] Medir contrastes y documentarlos aquí.

## Notas y decisiones

- 13 nov 2026: se agrega el oro como color de acabados y la portada animada, a pedido del equipo.
- 13 nov 2026: se adopta el nombre Noctra y su logo; la paleta pasa de Noir y oro a Noir y plata y la tipografía de Cinzel a Pirata One (ADR-002).

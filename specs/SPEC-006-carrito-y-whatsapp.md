# SPEC-006: Carrito y compra por WhatsApp

- **Estado:** Aprobada (estado puesto por el equipo; prototipo de página de carrito en `sections/main-cart.liquid`. El 16 nov 2026 se agregaron los mensajes por combo, el selector "Elige tu gorra de regalo" y el combo en el mensaje de WhatsApp; conviene que el equipo relea esos cambios)
- **Etapa:** 3
- **Requerimientos:** RF-08 (mensaje de combo en la ficha, parcial: no sugiere productos uno por uno), RF-10 (mensajes), RF-14, RF-16
- **Responsable:** dev-tema-liquid
- **Revisores:** disenador-ui, qa-calidad, contenido-copy (textos), cumplimiento (promesas de "gratis" y términos)

## Objetivo

Que el carrito venda: muestre el combo que Shopify aplicó y lo que ahorra, empuje a completar el siguiente combo y al envío gratis, ayude a elegir la gorra de regalo de Eclipse y permita cerrar por WhatsApp a quien prefiere hablar con alguien.

## Trazabilidad

| Requerimiento | Qué cubre | Dónde |
| --- | --- | --- |
| RF-08 (parcial) | Bloque "Arma tu combo" de la ficha (espacio reservado en SPEC-004): qué combos aplican al producto y qué activa en el carrito actual, con enlace a las colecciones del combo. No sugiere productos uno por uno | Tema |
| RF-10 | Mensajes "te falta…" y del combo aplicado. La aplicación automática es de Shopify (SPEC-005) | Tema + `assets/combos.js` |
| RF-14 | Carrito lateral con combo aplicado, ahorro total y barra de envío gratis | Tema |
| RF-16 | "Comprar por WhatsApp" con productos, tallas, combo y total | Tema |

## Alcance

- Carrito lateral (se abre al agregar un producto) y página `/cart` como respaldo sin JS.
- Líneas con foto, nombre, talla, color, cantidad editable y eliminar. Una línea con descuento de combo muestra el precio de lista tachado y el precio final.
- Bloque de combos: combo aplicado con su ahorro y mensaje "te falta…".
- Bloque "Elige tu gorra de regalo" para Eclipse.
- Bloque "Arma tu combo" en la ficha (RF-08).
- Barra de progreso al envío gratis según `envio_gratis_desde`.
- Total con ahorro destacado en plata (`--color-acento`).
- Botones "Finalizar compra" (checkout de Shopify) y "Comprar por WhatsApp".

## Fuera de alcance

- Configurar los descuentos y la lógica `compraXllevaY` (SPEC-005).
- Shopify Functions: no se usan. Todo lo de esta spec es tema + Cart API + descuentos nativos.
- Cuotas en el carrito (SPEC-007, solo si las apps entregan un bloque).
- Pedidos borrador para ventas por WhatsApp (SPEC-008).

## Qué se programa y qué se configura

| Pieza | Tipo | Quién |
| --- | --- | --- |
| Precio final, combo aplicado y ahorro | Shopify (descuentos automáticos, SPEC-005); el tema los lee de `cart` | Plataforma |
| Mensajes, selector de regalo, bloque de la ficha | Tema (Liquid + Web Components + `assets/combos.js`) | dev-tema-liquid |
| Agregar la gorra de regalo | Cart API (`/cart/add.js`) y Section Rendering API; sin JS, formulario `POST /cart/add` | dev-tema-liquid |
| Textos de los mensajes | Locales del tema (`locales/es.json`) con valores por combo del metaobjeto `combo` | contenido-copy |
| Máximo de gorras en el selector | Ajuste de la sección del carrito (por defecto 8) | Equipo, en el editor |
| Shopify Function | **No aplica** | — |

## Regla de oro: qué calcula el tema y qué calcula Shopify

- **Shopify pone el precio.** Total, combo aplicado y ahorro salen de `cart.total_price`, `cart.discount_applications` y los descuentos por línea (en JS, de la respuesta de `/cart.js` o de la sección re-renderizada). El tema nunca resta un descuento por su cuenta.
- **El tema predice solo para mensajes.** `assets/combos.js` (SPEC-005) dice qué falta, si conviene mostrar el selector de regalo y qué activaría un producto desde la ficha.
- **Si hay diferencia, manda Shopify.** Si la predicción dice un combo y Shopify aplicó otro (o ninguno), el carrito muestra lo de Shopify y no muestra el mensaje que lo contradiga. Así nunca se promete un precio que el checkout no cobra.
- El combo aplicado se reconoce comparando el título del descuento con `tituloDescuento` del metaobjeto `combo`.

## Mensajes por combo en el carrito

Precios de lista: tenis en combo (T) $175.000, gorra en combo (G) $60.000. Textos propuestos; la redacción final es de contenido-copy, con revisión de cumplimiento. El único texto literal del equipo es el de la fila 3.

| # | Carrito | Combo aplicado (Shopify) | Total | Mensaje |
| --- | --- | --- | --- | --- |
| 1 | 1T | Ninguno | $175.000 | "Agrega 1 gorra del combo y activa Luna Nueva: ahorras $45.000." con enlace a "Gorras en combo" |
| 2 | 1G | Ninguno | $60.000 | "Agrega 1 par de tenis del combo y activa Luna Nueva: ahorras $45.000." con enlace a "Tenis en combo" |
| 3 | 1T + 1G | Luna Nueva | $190.000 | "Combo Luna Nueva aplicado: ahorras $45.000." y "**Agrega 1 par y activa Eclipse: la gorra va por nosotros**" |
| 4 | 2T | Ninguno | $350.000 | Bloque "Elige tu gorra de regalo" y, debajo, "O agrega 1 par más y activa Luna Llena: ahorras $125.000." |
| 5 | 2T + 1G | Eclipse | $350.000 | "Combo Eclipse aplicado: la gorra va por nosotros." Sin sugerencia (pregunta 10 de SPEC-005) |
| 6 | 2T + 2G | Eclipse | $410.000 | "Combo Eclipse aplicado a 1 gorra. Se aplica un combo por pedido." |
| 7 | 3T | Luna Llena | $400.000 | "Combo Luna Llena aplicado: ahorras $125.000." |
| 8 | 3T + 1G | Luna Llena | $460.000 | "Combo Luna Llena aplicado: ahorras $125.000. Se aplica el combo que más te ahorra, uno por pedido." |
| 9 | 4T | Luna Llena | $575.000 | "Combo Luna Llena aplicado: ahorras $125.000. Se aplica un combo por pedido." |

- Sin productos de las colecciones del combo (por ejemplo, solo un premium): no hay bloque de combos.
- Los montos de los mensajes salen del metaobjeto y de los precios del carrito; nunca se escriben en el código.
- "Se aplica un combo por pedido" aparece cuando el carrito tiene unidades de combo que quedaron a precio de lista (filas 6, 8 y 9). Es la limitación honesta de SPEC-005.

## Bloque "Elige tu gorra de regalo"

**Cuándo aparece:** Eclipse está vigente en el metaobjeto, el carrito tiene al menos 2 tenis de "Tenis en combo", no tiene gorras de "Gorras en combo" y, al simular 1 gorra más con `assets/combos.js`, el combo ganador sería Eclipse. Con 2T aparece. Con 3T **no** aparece, porque con una gorra ganaría Luna Llena y la gorra se cobraría.

**Qué muestra:**

1. Título "Elige tu gorra de regalo" y una línea: "Con 2 pares, la gorra va por nosotros (combo Eclipse)."
2. Las gorras de `collections['gorras-en-combo']` con al menos una variante disponible, hasta el máximo del ajuste (8 por defecto), en un carrusel horizontal en celular. Si hay más, enlace "Ver todas las gorras del combo".
3. En cada gorra: foto, nombre, selector de color (solo variantes disponibles), precio de lista tachado y "Gratis con Eclipse", y el botón **"Agregar gorra de regalo"**.

**Al tocar el botón (con JS):**

1. `POST /cart/add.js` con la variante elegida y cantidad 1. El botón queda deshabilitado y con texto "Agregando…" mientras responde.
2. Se vuelve a pintar el carrito con la Section Rendering API.
3. Shopify aplica Eclipse. El carrito muestra la gorra en $0, "Combo Eclipse aplicado: la gorra va por nosotros." y el total de $350.000. El bloque de regalo desaparece.
4. Un aviso en `aria-live` anuncia: "Agregaste la gorra. Combo Eclipse aplicado." El foco pasa al mensaje del combo.

**Sin JS:** cada gorra es un formulario `POST /cart/add` con `return_to=/cart` y un selector de color nativo. El resultado es el mismo en la página `/cart`.

**Casos borde:**

- Ninguna gorra disponible: el bloque no aparece y tampoco la promesa de regalo.
- Error de la Cart API (por ejemplo, la variante se agotó): mensaje "No pudimos agregar esa gorra. Elige otro color u otra gorra." en `aria-live`, sin cambiar el carrito.
- Shopify no aplica Eclipse tras agregar la gorra (descuento pausado en el admin aunque el metaobjeto siga activo): el carrito muestra el total que da Shopify y el mensaje del combo que Shopify sí aplicó, sin la palabra "gratis".
- El cliente quita un tenis después de agregar la gorra: queda 1T + 1G, Shopify aplica Luna Nueva, el total pasa a $190.000 y el mensaje cambia al de la fila 3.

## Bloque "Arma tu combo" en la ficha (RF-08)

Usa el bloque reservado de SPEC-004. No se pinta en productos Noctra Premium ni en productos que no estén en las colecciones del combo.

- **Tenis de "Tenis en combo", sin JS o con carrito vacío:** lista de los combos vigentes del metaobjeto con su precio: "Luna Nueva: 1 par + 1 gorra por $190.000", "Eclipse: 2 pares + gorra de regalo por $350.000", "Luna Llena: 3 pares por $400.000", y enlaces "Ver gorras del combo" y "Ver tenis del combo". Los precios se calculan con la lógica y los precios de lista de las colecciones. Si una colección tiene precios distintos, se muestra el combo sin precio.
- **Gorra de "Gorras en combo":** "Llévala con 1 par por $190.000 (Luna Nueva) o de regalo con 2 pares (Eclipse)."
- **Con JS y carrito con productos:** se agrega una línea según lo que activaría este producto, calculada con `assets/combos.js`. Ejemplos: con 1T + 1G en el carrito, en un tenis: "Con este par activas Eclipse: la gorra va por nosotros." Con 2T en el carrito, en una gorra: "Esta gorra va de regalo con tu combo Eclipse."

## Mensaje de WhatsApp (RF-16)

Ejemplo con el carrito 5 de la tabla (2T + 1G). Los nombres de modelo son de ejemplo.

```text
Hola, quiero hacer este pedido:
• Tenis Modelo X, talla 42, Negro × 2 — $350.000
• Gorra Modelo Y, Negro × 1 — $0 (regalo del combo)
Combo aplicado: Eclipse (ahorras $60.000)
Total estimado: $350.000
¿Me confirman disponibilidad y envío a mi ciudad?
```

- Cada línea lleva su precio final según Shopify. Una línea con descuento parcial lleva el precio final (por ejemplo, la gorra de Luna Nueva: "$15.000").
- La línea "Combo aplicado" sale del descuento que aplicó Shopify, con el nombre del metaobjeto y el ahorro de `cart.discount_applications`. Sin combo, la línea no aparece.
- El total por WhatsApp se marca como "estimado" porque el envío y la confirmación final los da el equipo.

## Envío gratis

La barra usa el total del carrito con los combos ya descontados (`cart.total_price`). La tarifa nativa de envío gratis debe usar la misma base; se confirma en SPEC-007 (tarea 1). Mientras `envio_gratis_desde` sea 0, la barra no aparece.

## Criterios de aceptación

Se verifican en la tienda de desarrollo con los combos de SPEC-005 configurados, a 360 px y 1280 px, en modo oscuro y claro.

| # | Criterio |
| --- | --- |
| C1 | [ ] Al agregar un producto, el carrito lateral se abre con el foco en su título y se cierra con Escape. |
| C2 | [ ] Dado 2T + 1G, cuando abro el carrito, entonces dice "Combo Eclipse aplicado", la gorra aparece de $60.000 tachado a $0, el total es $350.000 y es el mismo subtotal que muestra luego el checkout. |
| C3 | [ ] Dado 1T, entonces el carrito dice que agregando 1 gorra del combo se activa Luna Nueva con un ahorro de $45.000 y enlaza a "Gorras en combo". |
| C4 | [ ] Dado 1T + 1G, entonces el carrito muestra "Combo Luna Nueva aplicado", total $190.000, y el mensaje "Agrega 1 par y activa Eclipse: la gorra va por nosotros" (o el texto aprobado por contenido-copy con el mismo sentido). |
| C5 | [ ] Dado 2T y al menos una gorra disponible en "Gorras en combo", entonces aparece "Elige tu gorra de regalo" solo con gorras y colores disponibles; cuando toco "Agregar gorra de regalo" en una, entonces la gorra entra al carrito con cantidad 1, Shopify aplica Eclipse, el total queda en $350.000, el bloque desaparece y el lector de pantalla anuncia el cambio. |
| C6 | [ ] Dado 2T y JavaScript desactivado, cuando envío el formulario de una gorra, entonces vuelvo a `/cart` con la gorra agregada y el total en $350.000. |
| C7 | [ ] Dado 3T, entonces no aparece "Elige tu gorra de regalo", el carrito dice "Combo Luna Llena aplicado" y el total es $400.000. |
| C8 | [ ] Dado 2T + 1G, entonces no aparece ninguna sugerencia de agregar otro par (salvo que el equipo responda lo contrario en la pregunta 10 de SPEC-005). |
| C9 | [ ] Dados 2T + 2G y 4T, entonces el carrito dice "Se aplica un combo por pedido" y los totales son $410.000 y $575.000. |
| C10 | [ ] Dado "Combo Eclipse" desactivado en el admin y el metaobjeto todavía activo, cuando agrego una gorra a 2T, entonces el carrito muestra el total que da Shopify ($365.000, con Luna Nueva), dice "Combo Luna Nueva aplicado" y no usa la palabra "gratis". |
| C11 | [ ] Dado 2T + 1G con Eclipse, cuando toco "Comprar por WhatsApp", entonces el mensaje tiene cada línea con modelo, talla, color, cantidad y precio final, la línea "Combo aplicado: Eclipse (ahorras $60.000)" y "Total estimado: $350.000", igual al total del carrito. |
| C12 | [ ] Dado un carrito sin combo (solo 1T), entonces el mensaje de WhatsApp no tiene línea "Combo aplicado" y el total es $175.000. |
| C13 | [ ] Dado un tenis de "Tenis en combo" y el carrito vacío, cuando abro su ficha, entonces "Arma tu combo" lista Luna Nueva por $190.000, Eclipse por $350.000 y Luna Llena por $400.000, con enlaces a las dos colecciones; en un tenis Noctra Premium el bloque no aparece. |
| C14 | [ ] Dado 1T + 1G en el carrito, cuando abro la ficha de otro tenis de "Tenis en combo", entonces el bloque dice "Con este par activas Eclipse: la gorra va por nosotros." |
| C15 | [ ] La barra de envío gratis muestra cuánto falta según el total con descuentos y desaparece al superarlo; con `envio_gratis_desde` en 0 no aparece. |
| C16 | [x] Sin JavaScript, `/cart` permite cambiar cantidades y pagar. |
| C17 | [ ] Botones y selectores del carrito y del bloque de regalo miden al menos 44 px, tienen foco visible y contraste AA en los dos modos; con "reducir movimiento" el carrusel no se anima. |
| C18 | [ ] Ningún archivo del tema tiene escritos montos de combos, nombres de combos ni precios: salen del metaobjeto, de `cart` y de los locales. |

## Plan

Cada tarea cabe en menos de un día. Depende de las tareas 2 a 5 y 9 de SPEC-005 (lógica y puente de datos).

1. [x] Página de carrito con barra de envío gratis y botón de WhatsApp.
2. [ ] **Carrito lateral** (dev-tema-liquid): Web Component con Cart API (`/cart/add.js`, `/cart/change.js`) y Section Rendering API; foco y Escape (C1).
3. [ ] **Líneas con descuento** (dev-tema-liquid): precio tachado y final desde los descuentos por línea de Shopify (C2).
4. [ ] **Bloque de combos** (dev-tema-liquid): combo aplicado desde `cart.discount_applications`, mensajes de la tabla con `assets/combos.js` y la regla "manda Shopify" (C3, C4, C7 a C10).
5. [ ] **Selector "Elige tu gorra de regalo"** (dev-tema-liquid): condición con simulación, lista de gorras disponibles, formulario sin JS y agregado con Cart API (C5, C6).
6. [ ] **Estilos del carrito y del selector** (disenador-ui): carrusel a 360 px, sello de regalo con el oro permitido, ambos modos (C17).
7. [ ] **Bloque "Arma tu combo" en la ficha** (dev-tema-liquid): lista estática y línea contextual con JS (C13, C14).
8. [ ] **Mensaje de WhatsApp con combo** (dev-tema-liquid): línea "Combo aplicado" y precios finales (C11, C12).
9. [ ] **Textos** (contenido-copy): mensajes de la tabla, selector, ficha y WhatsApp en `locales/es.json`; revisión de cumplimiento de "gratis" y "va por nosotros" (C18).
10. [ ] **Barra de envío gratis con total descontado** (dev-tema-liquid) (C15).
11. [ ] **Verificación** (qa-calidad): los 9 carritos de la tabla en carrito lateral, `/cart` y checkout; capturas a 360 px y 1280 px en los dos modos; Theme Check sin errores.

## Notas y decisiones

- **16 nov 2026:** los combos pasan a descuentos automáticos nativos (SPEC-005). El carrito ya no calcula el descuento: lo lee de Shopify. Se agregan los mensajes por combo, el selector de gorra de regalo (porque Shopify no agrega sola la gorra de Eclipse) y el combo en el mensaje de WhatsApp. Reemplaza el plan anterior "Integrar `combos.js` y las definiciones de combos del metaobjeto", que se repartió en las tareas 3 a 5.
- El mensaje de WhatsApp anterior usaba el combo "Look completo" (2 tenis + 1 gorra con ahorro de $80.000). Se cambió por Eclipse.

### Preguntas abiertas para el equipo

1. **Texto del regalo:** "la gorra va por nosotros" y "Gratis con Eclipse": ¿los aprueban? Cumplimiento revisa que los términos del combo estén a un toque (vigencia, 1 por pedido).
2. **Pedidos por WhatsApp:** cuando el equipo crea el pedido a mano (SPEC-008), ¿el combo se aplica solo o lo ponen a mano? Se confirma en SPEC-008.
3. **Máximo de gorras en el selector:** 8 por defecto; ¿otro número?

# SPEC-005: Motor de combos

- **Estado:** Aprobada (estado puesto por el equipo; el contenido se reescribió el 16 nov 2026 con la decisión de combos nativos y conviene que el equipo lo relea)
- **Etapa:** 3
- **Requerimientos:** RF-09, RF-10 (aplicación automática; los mensajes los muestra SPEC-006), RF-11 (parcial, ver "Trazabilidad"), RF-13; RNF-17. RF-08 se cubre en SPEC-006
- **Responsable:** dev-funciones (lógica pura) · operaciones-shopify (runbook de descuentos) · el equipo ejecuta en el admin
- **Revisores:** qa-calidad, cumplimiento (términos de cada combo), contenido-copy (nombres y textos)

## Objetivo

Que los tres combos de Noctra se apliquen solos en el carrito y en el checkout con los **descuentos automáticos nativos** de Shopify, en plan Basic y sin Functions propias, y que el tema sepa calcular qué combo aplica y qué le falta al cliente para mostrárselo (SPEC-006), sin cobrar nada por su cuenta.

## Decisión del equipo (16 nov 2026)

Reemplaza las decisiones anteriores de esta spec (ver "Historial"). Texto del equipo, resumido sin cambiar su contenido:

- Tienda en **Shopify Basic**, sin Plus y sin Functions propias. **No se crea `apps/combos/`.**
- Precios: todos los tenis de la colección **"Tenis en combo"** a **$175.000**; las gorras de **"Gorras en combo"** a **$60.000**. Los modelos premium no entran a esas colecciones.
- Tres descuentos automáticos nativos **"Compra X lleva Y"**, ~~1 uso por pedido~~ **hasta 3 usos por pedido** (ver el cambio de abajo), **sin combinarse entre sí**: cuando varios califican, Shopify aplica el que más ahorra.

### Cambio: tope de 3 usos por pedido (decisión del equipo, 16 nov 2026, en conversación)

El equipo evaluó dejar los combos sin límite y eligió **un máximo de 3 usos por pedido** en cada descuento: un mismo combo se puede repetir hasta 3 veces en un pedido (por ejemplo, 6 pares = Luna Llena ×2 = $800.000), pero los combos siguen sin combinarse entre sí. Motivos: no castigar las compras de grupo o familia, limitar la reventa a unos 9 pares por pedido y acotar el monto de los pedidos contraentrega.

- En el admin: "Máximo de usos por pedido" = 3 en los tres descuentos.
- En el tema: Ajustes del tema > Combos > "Máximo de usos por pedido" = 3 (debe coincidir).
- Efecto que el equipo debe conocer: con tantas gorras como pares, Luna Nueva repetida puede ganarle a Eclipse (2T + 2G = Luna Nueva ×2, $380.000, en vez de Eclipse + 1 gorra, $410.000).
- La lógica compara el ahorro **total** de cada combo contando sus usos, y el carrito sugiere repetir el combo ("Agrega 3 pares y Luna Llena se aplica 2 veces").
- QA en vivo del 16 nov 2026 (antes de este cambio en el admin): Shopify ya aplicaba Luna Nueva ×2 en 2T + 2G, lo que confirma que el límite cuenta por grupo "compra + lleva".

## Trazabilidad

| Requerimiento | Qué cubre esta spec | Dónde se cumple |
| --- | --- | --- |
| RF-09 | Combos configurables desde el admin sin tocar código. Con descuentos nativos el "precio fijo" sale de dos cosas: precio uniforme por colección y descuento fijo por combo. Los ejemplos de RF-09 ($350.000 y $420.000) cambian: hoy son $190.000, $350.000 y $400.000 | Admin → Descuentos y colecciones; metaobjeto `combo` para el tema |
| RF-10 | Aplicación automática en carrito y checkout (nativa). El mensaje "te falta…" lo calcula `packages/combos` y lo muestra SPEC-006 | Shopify + `packages/combos` + SPEC-006 |
| RF-11 (parcial) | Vigencia: fechas del descuento. Productos elegibles: colecciones. Acumulable: no (Combinaciones desmarcadas). **Límite por cliente: los descuentos automáticos no lo traen** (por confirmar en la tarea 1); solo hay límite de usos por pedido | Admin → Descuentos |
| RF-13 | Códigos de campaña e influenciadores con descuentos de código nativos y su reporte nativo. Si un código se combina o no con los combos es pregunta abierta (pregunta 4) | Admin → Descuentos |
| RNF-17 | El equipo crea, pausa o cambia combos desde el admin, con el runbook | `docs/operaciones/combos-nativos.md` |

Sin spec: ninguno. RF-08 ("Arma tu combo" en la ficha) y los mensajes de RF-10 están en SPEC-006. RF-36 (ventas por combo) se mide con el nombre del descuento en los reportes (SPEC-009). RF-12 (Precio Club) es fase 2.

## Alcance

- Colecciones automáticas "Tenis en combo" (`tenis-en-combo`) y "Gorras en combo" (`gorras-en-combo`).
- Tres descuentos automáticos "Compra X lleva Y" configurados en el admin.
- Modelo de datos `compraXllevaY` y su lógica en `packages/combos` (fuente única), copiada a `theme/assets/combos.js` con `npm run sync:combos`.
- Definición de combos que lee el tema (metaobjeto `combo`, ver "Datos y configuración") y puente de datos del carrito a la lógica.
- Pruebas de la lógica con los 7 carritos de esta spec y prueba manual de los mismos carritos en carrito y checkout.

## Fuera de alcance

- Shopify Function propia, app privada o custom app (`apps/combos/`): descartadas por esta decisión.
- Interfaz del carrito, ficha, selector "Elige tu gorra de regalo" y mensaje de WhatsApp (SPEC-006).
- Bloque "Combos destacados" del inicio y barra de anuncios (SPEC-002); solo se pide alinear sus textos (tarea 12).
- Precio Club (fase 2). Combos en la tienda física (POS, fase 2).

## Qué se programa y qué se configura

| Pieza | Tipo | Quién |
| --- | --- | --- |
| Precio de cada producto en combo ($175.000 / $60.000) | Admin → Productos | Equipo |
| Colecciones automáticas `tenis-en-combo` y `gorras-en-combo` (etiqueta `combo` + tipo de producto) | Admin → Colecciones | Equipo, con `docs/operaciones/combos-nativos.md` |
| Descuentos Luna Nueva, Eclipse y Luna Llena | Admin → Descuentos (nativo "Compra X lleva Y") | Equipo, con el runbook |
| Aplicar el descuento y calcular el precio real | Shopify (carrito y checkout) | Plataforma |
| Definición de combos para el tema (metaobjeto `combo`) | Admin → Contenido → Metaobjetos | Equipo; definición del metaobjeto por operaciones-shopify |
| Lógica `compraXllevaY` (qué combo gana, qué falta) | Código en `packages/combos` | dev-funciones |
| Puente de datos: grupo de cada línea y combos del metaobjeto hacia el JS | Tema (Liquid + JS) | dev-tema-liquid |
| Shopify Function | **No aplica** | — |

## Los tres combos

Precios de lista: tenis en combo (T) $175.000, gorra en combo (G) $60.000.

| Combo | Compra | Lleva | Beneficio | Precio del combo | Ahorro |
| --- | --- | --- | --- | --- | --- |
| **Luna Nueva** | 1 de "Tenis en combo" | 1 de "Gorras en combo" | $45.000 de descuento en la gorra | **$190.000** (175.000 + 15.000) | $45.000 |
| **Eclipse** | 2 de "Tenis en combo" | 1 de "Gorras en combo" | Gorra gratis | **$350.000** (2 × 175.000 + 0) | $60.000 |
| **Luna Llena** | 2 de "Tenis en combo" | 1 más de "Tenis en combo" | $125.000 de descuento en el tenis de menor precio | **$400.000** (3 × 175.000 − 125.000) | $125.000 |

Reglas comunes: descuento automático (sin código), máximo **3 usos por pedido**, Combinaciones **todas desmarcadas**, vigencia por fechas (pregunta 1).

## Comportamiento esperado

### Cómo resuelve Shopify

1. Shopify revisa los tres descuentos. Califica uno cuando el carrito tiene las unidades de "compra" **y** las de "lleva".
2. Como no se combinan, aplica **solo uno**: el de mayor ahorro para el cliente.
3. El combo ganador se repite mientras el carrito alcance, hasta 3 veces por pedido. Se elige por el ahorro total con sus repeticiones. Las unidades sobrantes pagan precio de lista.
4. En la parte "lleva", el descuento cae en la unidad de **menor precio** entre las elegibles.
5. El cliente tiene que agregar la unidad "lleva" al carrito. Shopify no la agrega sola (por eso existe el selector "Elige tu gorra de regalo" de SPEC-006).

### Los 7 carritos de referencia

Totales de productos, sin envío. Son los mismos de la tabla de pruebas de `docs/operaciones/combos-nativos.md`.

| # | Carrito | Califican (ahorro) | Gana | Cálculo | Total esperado |
| --- | --- | --- | --- | --- | --- |
| 1 | 1T + 1G | Luna Nueva ($45.000) | Luna Nueva | 175.000 + (60.000 − 45.000) | **$190.000** |
| 2 | 2T + 1G | Luna Nueva ($45.000), Eclipse ($60.000) | Eclipse | 350.000 + 0 | **$350.000** |
| 3 | 2T + 2G | Luna Nueva ×2 ($90.000), Eclipse ($60.000) | Luna Nueva dos veces (tope de 3 usos) | 350.000 + 2 × 15.000 | **$380.000** |
| 4 | 3T | Luna Llena ($125.000) | Luna Llena | 525.000 − 125.000 | **$400.000** |
| 5 | 3T + 1G | Luna Nueva ($45.000), Eclipse ($60.000), Luna Llena ($125.000) | Luna Llena; la gorra a precio de lista | 400.000 + 60.000 | **$460.000** |
| 6 | 4T | Luna Llena ($125.000) | Luna Llena una vez (4 pares solo alcanzan para un uso) | 700.000 − 125.000 | **$575.000** |
| 6b | 6T | Luna Llena ×2 ($250.000) | Luna Llena dos veces | 1.050.000 − 250.000 | **$800.000** |
| 6c | 12T | Luna Llena ×3 ($375.000) | Luna Llena tres veces; el tope deja 3 pares a precio de lista | 2.100.000 − 375.000 | **$1.725.000** |
| 7 | 1T + 1 tenis premium de precio P + 1G | Luna Nueva ($45.000) | Luna Nueva; el premium no cuenta | 175.000 + 15.000 + P | **$190.000 + P** |

### Caso: un tenis de otro precio

- **Fuera de la colección** (carrito 7): un modelo premium no está en "Tenis en combo", así que no cuenta ni como "compra" ni como "lleva". Paga su precio de lista P y el resto del carrito se evalúa como si no estuviera. Con 2T + 1 premium + 1G gana Eclipse y el total es $350.000 + P. P lo define el equipo (pregunta 3); la spec no lo inventa.
- **Dentro de la colección con otro precio** (error de carga, no es un caso permitido): el precio fijo deja de cuadrar. Ejemplo con un valor de prueba hipotético de $185.000: con 2T de $175.000 + 1 de $185.000, Luna Llena descuenta $125.000 al de menor precio ($175.000) y el total queda en $410.000, no en $400.000. En Luna Nueva y Eclipse el total sube en la diferencia del tenis. Con una gorra de otro precio, Eclipse la regala completa y Luna Nueva le quita $45.000, así que el total también cambia. Por eso la regla de negocio es **un solo precio por colección**, y qa-calidad revisa los precios de las dos colecciones antes de cada publicación (criterio C10).

### Limitaciones honestas de los descuentos nativos

1. **Un combo por pedido.** Los combos no se acumulan: con 4 tenis + 2 gorras no se aplican dos combos, gana uno solo. Las unidades sobrantes pagan precio de lista. El carrito lo dice (SPEC-006).
2. **La gorra de regalo de Eclipse no se agrega sola.** El cliente debe elegirla y agregarla, con talla única pero color a elección. SPEC-006 lo resuelve con el bloque "Elige tu gorra de regalo".
3. **Precio fijo solo con precios uniformes.** Ver el caso anterior.
4. **La protección de los premium es la colección.** El descuento nativo no lee el metacampo `custom.gama`: si un premium entra por error a "Tenis en combo" (por ejemplo, con la etiqueta `combo`), Shopify **sí** le aplica el combo. La lógica del tema refleja lo que hace Shopify y tampoco lo excluye por gama, para no mostrar algo distinto al checkout. Esto reemplaza la decisión del 13 nov 2026 de excluir a los premium en la lógica (ver "Historial").
5. **El tema no puede leer los descuentos automáticos que todavía no aplican.** Liquid solo ve los descuentos ya aplicados al carrito. Para decir "te falta…", el tema necesita su propia copia de las reglas (metaobjeto `combo`), que el equipo mantiene igual a los descuentos del admin.
6. **Empates.** Si dos combos dan el mismo ahorro, Shopify puede elegir cualquiera. Con los montos actuales no hay empates en ningún carrito; si el equipo cambia montos, el runbook pide evitarlos.

## Modelo de datos (`packages/combos`)

Tipo único `compraXllevaY`. Montos en **centavos** de COP, igual que Shopify ($45.000 = 4.500.000).

```json
{
  "id": "eclipse",
  "nombre": "Eclipse",
  "tituloDescuento": "Combo Eclipse",
  "tipo": "compraXllevaY",
  "compra": { "grupo": "tenis-en-combo", "cantidad": 2 },
  "lleva": { "grupo": "gorras-en-combo", "cantidad": 1, "valor": { "tipo": "gratis" } },
  "limitePorPedido": 1,
  "desde": "AAAA-MM-DD",
  "hasta": "AAAA-MM-DD",
  "activo": true
}
```

- `grupo`: handle de la colección. El tema deduce el grupo de cada línea con las colecciones del producto (`tenis-en-combo` o `gorras-en-combo`). Un producto en ninguna de las dos no tiene grupo y no cuenta. Las etiquetas `grupo-tenis` y `grupo-gorras` dejan de usarse para combos.
- `lleva.valor`: `{ "tipo": "gratis" }`, `{ "tipo": "porcentaje", "valor": 1 a 100 }` o `{ "tipo": "monto", "valor": centavos por unidad }`. El monto nunca deja una unidad por debajo de $0.
- `limitePorPedido`: 1 por defecto (regla del equipo).
- `tituloDescuento`: el título exacto del descuento en el admin. Sirve para reconocer en el carrito qué combo aplicó Shopify (`cart.discount_applications`).
- `desde` y `hasta` opcionales, fecha de Colombia. Deben coincidir con las fechas del descuento.

### Reglas de la lógica

1. Expandir el carrito en unidades (cantidad 2 = 2 unidades), cada una con su precio de lista (`original_price`) y su grupo.
2. Para cada combo vigente: tomar las unidades de "compra" (las más caras del grupo) y, entre las elegibles que quedan, las de "lleva" de **menor precio**. Si compra y lleva son el mismo grupo, salen del mismo conjunto.
3. Ahorro = suma del beneficio sobre las unidades "lleva". Un combo sin ahorro positivo no aplica.
4. **Sin combinarse:** se aplica solo el combo de mayor ahorro. Ante empate, el primero de la lista (regla determinista para las pruebas; Shopify no garantiza el mismo desempate).
5. Se aplica hasta `limitePorPedido` veces (1).
6. Además del resultado, la lógica devuelve el estado de cada combo (califica, aplicado, unidades que faltan en "compra" y en "lleva") y si falta solo la parte "lleva" gratuita (para el selector de gorra de regalo).

**El tema solo calcula para mostrar mensajes. El precio real lo pone Shopify con los descuentos nativos.** El total, el ahorro y el combo aplicado que ve el cliente en el carrito salen del objeto `cart` de Shopify (`cart.total_price`, `cart.discount_applications`, descuentos por línea), no de la lógica. La lógica se usa para "te falta…", para el selector de regalo y para predecir el efecto de agregar un producto desde la ficha. Si la predicción no coincide con lo que Shopify aplicó, el carrito muestra lo de Shopify y oculta el mensaje que contradiga (SPEC-006).

### Mensaje "te falta…" (RF-10)

Con el carrito actual, entre los combos que no aplican, se sugiere el que necesita menos unidades y, en empate, el de mayor ahorro, con dos condiciones:

1. Su ahorro es mayor que el del combo aplicado.
2. Mantiene con descuento las unidades que hoy lo tienen. De Luna Nueva a Eclipse la gorra sigue con descuento (pasa a gratis), así que se sugiere. De Eclipse a Luna Llena la gorra perdería el regalo y pasaría a $60.000, así que no se sugiere (pregunta 10).

Los textos y los casos están en SPEC-006.

## Datos y configuración

| Dato | Dónde vive | Valor |
| --- | --- | --- |
| Precio de tenis en combo | Admin → Productos | $175.000 (decisión del equipo) |
| Precio de gorras en combo | Admin → Productos | $60.000 (decisión del equipo) |
| Colecciones | Automáticas: etiqueta `combo` + tipo `Tenis` / `Gorras`; handles `tenis-en-combo`, `gorras-en-combo` | Runbook `combos-nativos.md` (pregunta 6) |
| Descuentos | Admin → Descuentos, títulos propuestos "Combo Luna Nueva", "Combo Eclipse", "Combo Luna Llena" | Pregunta 2 |
| Fechas de vigencia | Descuento y metaobjeto | Pregunta 1 |
| Metaobjeto `combo` | Admin → Contenido → Metaobjetos; un registro por combo con los campos del modelo | Pregunta 5 |

## Criterios de aceptación

Precios de prueba: T = $175.000, G = $60.000, P = precio de un premium que defina el equipo. Se verifican en la tienda de desarrollo.

| # | Criterio |
| --- | --- |
| C1 | [ ] Dado el carrito 1 (1T + 1G), cuando abro el carrito y luego el checkout, entonces los dos muestran "Luna Nueva" y un total de productos de $190.000. |
| C2 | [ ] Dado el carrito 2 (2T + 1G), entonces carrito y checkout aplican "Eclipse" (no Luna Nueva) y el total es $350.000. |
| C3 | [ ] Dado el carrito 3 (2T + 2G), entonces aplica Luna Nueva dos veces y el total es $380.000. |
| C4 | [ ] Dado el carrito 4 (3T), entonces aplica Luna Llena y el total es $400.000. |
| C5 | [ ] Dado el carrito 5 (3T + 1G), entonces aplica Luna Llena (ahorro $125.000, mayor que los $60.000 de Eclipse), la gorra queda en $60.000 y el total es $460.000. |
| C6 | [ ] Dado el carrito 6 (4T), entonces Luna Llena se aplica una vez y el total es $575.000; con 6T se aplica dos veces ($800.000) y con 12T tres veces ($1.725.000; si da $1.600.000, el tope de 3 usos no quedó configurado). |
| C7 | [ ] Dado el carrito 7 (1T + 1 premium de P + 1G), entonces aplica Luna Nueva, el premium no tiene descuento y el total es $190.000 + P. |
| C8 | [ ] **En los 7 carritos, el total de productos del carrito del tema y el subtotal del checkout son iguales** entre sí y al total esperado de la tabla (capturas de los dos). |
| C9 | [ ] `npm test` cubre los 7 carritos con la lógica `compraXllevaY` y da el mismo combo ganador y el mismo total de la tabla; también cubre: combo inactivo o vencido no aplica, combo sin ahorro no aplica, monto mayor que el precio deja la unidad en $0, porcentaje, y línea sin grupo no cuenta. |
| C10 | [ ] Dadas las colecciones publicadas, cuando qa-calidad las revisa antes de unir a `prod`, entonces todos los productos de "Tenis en combo" cuestan $175.000, todos los de "Gorras en combo" $60.000 y ningún producto con `custom.gama` = "Noctra Premium" está en ellas. |
| C11 | [ ] Dado que el equipo desactiva "Eclipse" en el admin, cuando abro el carrito 2 en una ventana de incógnito, entonces aplica Luna Nueva y el total es $175.000 + $175.000 + $15.000 = $365.000; sin desplegar código. Al reactivarlo vuelve a $350.000. |
| C12 | [ ] Dados los tres combos de Ajustes del tema > Combos, cuando qa-calidad compara cada campo con su descuento en el admin (título, colecciones, cantidades, valor, máximo de usos por pedido, fechas), entonces coinciden todos. |
| C13 | [ ] Ningún archivo del repositorio contiene `apps/combos/`, una extensión de Function ni un token de Admin API para combos. |

## Plan

Cada tarea cabe en menos de un día. La tarea 1 va primero porque confirma supuestos de la plataforma.

1. [ ] **Verificar plataforma** (operaciones-shopify, con el MCP `shopify-dev` y la ayuda de Shopify): que los descuentos automáticos "Compra X lleva Y" se reflejan en el carrito de la tienda online antes del checkout (`cart.discount_applications`, `/cart.js`); que la unidad "lleva" de menor precio aplica también con colecciones distintas; cómo cuenta el límite de 1 uso con 4T; si existe límite por cliente en descuentos automáticos (RF-11); qué pasa cuando el cliente pone un código que no combina con un combo automático. Anotar en "Notas y decisiones".
2. [ ] **Lógica `compraXllevaY`** (dev-funciones): `packages/combos/src/combos.js` con el modelo de esta spec; se retira el tipo de precio fijo anterior (queda en el historial de Git). Ya hay trabajo en curso en la rama; se ajusta a esta spec.
3. [ ] **Pruebas** (dev-funciones): los 7 carritos, el caso del tenis de otro precio dentro de la colección y los casos de C9 (`npm test` en verde).
4. [ ] **Estado y "te falta…"** (dev-funciones): pruebas de la función de estado para 1T, 1G, 1T + 1G, 2T, 2T + 1G, 3T y 4T, con los mensajes que espera SPEC-006.
5. [ ] **Sincronizar** (dev-funciones): `npm run sync:combos` y comprobar que `theme/assets/combos.js` es copia exacta.
6. [ ] **Runbook de descuentos** (operaciones-shopify): ajustar `docs/operaciones/combos-nativos.md` con lo que confirme la tarea 1, la regla de títulos (`tituloDescuento`) y la revisión de precios de C10.
7. [ ] **Definición del metaobjeto `combo`** (operaciones-shopify): campos, tipos y pasos para crear los tres registros (C12). Depende de la pregunta 5.
8. [ ] **Actualizar runbooks de carga** (operaciones-shopify): `docs/operaciones/cargar-productos.md`, `configuracion-inicial.md` y `plantilla-productos.csv` (las etiquetas `grupo-*` ya no deciden el combo; precios de ejemplo de la plantilla distintos de $175.000 y $60.000).
9. [ ] **Puente de datos en el tema** (dev-tema-liquid): leer el metaobjeto `combo` en Liquid y entregarlo como JSON al JS; calcular el grupo de cada línea con las colecciones del producto; leer el combo aplicado desde `cart.discount_applications`. Sin interfaz (la interfaz es SPEC-006).
10. [ ] **Textos de los combos** (contenido-copy): nombre visible, descripción de una línea y términos de cada combo (vigencia, 1 por pedido, no acumulable, la gorra se agrega al carrito). Revisión de cumplimiento.
11. [ ] **Configuración en desarrollo** (equipo, con el runbook): precios, colecciones, tres descuentos y metaobjeto.
12. [ ] **Alinear textos existentes** (contenido-copy, el equipo los cambia en el editor): "Combos destacados" del inicio y la barra de anuncios ("Combos desde $350.000" ya no es el combo más barato). Traer antes la versión de `prod` de los JSON.
13. [ ] **Prueba de los 7 carritos** (qa-calidad): carrito y checkout en la tienda de desarrollo, capturas, C1 a C8, C10 a C13.

## Notas y decisiones

- **16 nov 2026, decisión del equipo:** combos con descuentos automáticos nativos en plan Basic. Reemplaza la decisión de subir a Plus y la app privada con Function. El riesgo bloqueante de plan queda **resuelto** (ver "Historial").
- **16 nov 2026:** la exclusión de los premium deja de estar en la lógica: la da la colección (limitación 4). Reemplaza la decisión del 13 nov 2026.
- Lo que la spec da como comportamiento de Shopify (descuentos visibles en el carrito, menor precio en "lleva", límite de uso, desempate) sale de la ayuda de Shopify citada en el runbook y se confirma en la tarea 1 y en la tarea 13.

### Preguntas abiertas para el equipo

1. **Vigencia:** ¿fecha de inicio y de fin de cada combo, o sin fin?
2. **Nombres visibles:** ¿el título del descuento es "Combo Luna Nueva", "Combo Eclipse" y "Combo Luna Llena" (propuesta del runbook) o solo el nombre? Lo ve el cliente en carrito y checkout.
3. **Precio P de los premium** para la prueba 7 (no se inventa).
4. **Códigos de campaña (RF-13):** ¿un código de influenciador se puede sumar a un combo o no? Si no, Shopify aplica uno u otro.
5. **Dónde viven las reglas para el tema:** se recomienda el metaobjeto `combo` (formulario en el admin). La otra opción son bloques en la configuración del tema. En los dos casos el equipo cambia dos lugares al editar un combo (descuento y regla); ¿lo aceptan?
6. **Colecciones:** ¿automáticas por etiqueta `combo` + tipo (recomendado en el runbook) o manuales?
7. **Límite por cliente (RF-11):** si la tarea 1 confirma que los descuentos automáticos no lo traen, ¿aceptan dejarlo fuera?
8. **Nombre "Eclipse":** la plantilla de productos tiene un tenis premium "Eclipse 02" que no entra a combos. ¿Se cambia el nombre del combo o del modelo para evitar confusiones en redes y WhatsApp?
9. **Inventario de gorras para regalo:** ¿hay un tope de gorras de regalo por campaña? El descuento nativo no lo controla; solo el inventario.
10. **Sugerir de Eclipse a Luna Llena:** con 2T + 1G, agregar 1 par activa Luna Llena (ahorro $125.000) pero la gorra deja de ser regalo y el total pasa de $350.000 a $460.000. La spec propone no sugerirlo. ¿Lo quieren sugerir con el total a la vista?

## Historial

### Decisión anterior (16 nov 2026, reemplazada el mismo día)

La tienda real iba a pasar a **Shopify Plus** antes del lanzamiento para mantener una app privada (`apps/combos/`, creada con `shopify app init`) con una Shopify Function de descuento que aplicaba el algoritmo de precio fijo. **Ya no aplica.**

### Riesgo: plan de Shopify (bloqueante) — RESUELTO

**Resuelto el 16 nov 2026** por la decisión del equipo de usar descuentos automáticos nativos en plan Basic.

Restricción verificada en shopify.dev (16 nov 2026): "Stores on any plan can use public apps that are distributed through the Shopify App Store and contain functions. Only stores on a Shopify Plus plan can use custom apps that contain Shopify Function APIs." Por eso la app privada no habría corrido en una tienda Basic.

Alternativas que se evaluaron:

| Alternativa | Por qué no se eligió |
| --- | --- |
| 1. Subir a Shopify Plus | Costo mensual mucho mayor; sobredimensionado para el lanzamiento |
| 2. Publicar la app propia en la App Store | Revisión de Shopify de semanas, con riesgo de rechazo, y mantenimiento como producto público |
| 3. App pública de combos | Costo mensual, tercero con acceso a pedidos y reglas que podían no coincidir con el carrito |
| 4. Descuentos nativos con precios distintos | El precio fijo no cuadra con precios distintos |
| **4b. Descuentos nativos + precios uniformes** | **Elegida** (con la forma "Compra X lleva Y" de esta spec) |

### Diseño anterior (precio fijo con Function)

- Modelo `{ id, nombre, precio, requisitos: { tenis: 2, gorras: 1 }, desde, hasta, activo, limitePorPedido }`, con grupos por etiqueta `grupo-*`.
- Algoritmo: unidades más caras por grupo, aplicar repetidamente el combo de mayor ahorro, reparto del descuento proporcional al precio.
- Combos de ejemplo: 2 tenis + 1 gorra = $350.000 y 3 tenis = $420.000.
- Opciones de edición: A. metaobjeto + sincronización a un metacampo de la Function; B. metacampo JSON; C. extensión de admin.
- Criterios retirados: "La Function devuelve el mismo descuento que `packages/combos`" y "El equipo crea un combo nuevo desde el admin y se aplica sin desplegar código" (este último lo cubre ahora C11 con los descuentos nativos).
- Decisión del 13 nov 2026: excluir a los Noctra Premium en la lógica y en la Function. Reemplazada por la limitación 4.

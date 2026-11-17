# Contenido de combos (borrador de copy)

Estado: borrador para aprobación del equipo. Basado en la decisión del 16 nov 2026.
Los textos legales de la sección 5 son "Borrador para revisión legal".

Datos base: par de la colección "Tenis en combo" $175.000; gorra de "Gorras en combo" $60.000. Los modelos premium no entran.

Cálculos de referencia (para verificar contra Shopify):

| Combo | Precio normal | Precio combo | Ahorro |
| --- | --- | --- | --- |
| Luna Nueva (1 par + 1 gorra) | $235.000 | $190.000 | $45.000 |
| Eclipse (2 pares + 1 gorra) | $410.000 | $350.000 | $60.000 |
| Luna Llena (3 pares) | $525.000 | $400.000 | $125.000 |

## 1. Combos

### Luna Nueva
- Sello / tarjeta: **1 par + 1 gorra · $190.000**
- Descripción: Tu primer par y la gorra que lo cierra. La gorra te queda $45.000 más baja.

### Eclipse
- Sello / tarjeta: **2 pares + 1 gorra gratis · $350.000**
- Descripción: Dos pares al precio de siempre y la gorra la ponemos nosotros. Tú la eliges.

### Luna Llena
- Sello / tarjeta: **3 pares · $400.000**
- Descripción: Tres pares para toda la semana. El de menor precio baja $125.000.

Cierre sugerido de la sección "Combos destacados": **Viste la noche.**

## 2. Mensajes dinámicos (carrito y ficha)

Variables: `{pares}` pares en el carrito (solo "Tenis en combo"), `{gorras}` gorras en el carrito (solo "Gorras en combo"), `{faltan}` unidades que faltan, `{ahorro}` ahorro en pesos con formato `$60.000`, `{combo}` nombre del combo, `{combo_mejor}` nombre del combo superior, `{ahorro_mejor}` ahorro de ese combo, `{precio_combo}` precio fijo.

Plurales: `{faltan_pares}` = "1 par" / "2 pares"; `{faltan_gorras}` = "1 gorra" / "2 gorras". Nunca escribir "1 pares".

### 2.1 Cuánto falta (sin combo activo)

| Estado | Mensaje |
| --- | --- |
| 0 pares, 0 gorras (ficha de tenis) | Arma tu combo desde 1 par + 1 gorra por $190.000. |
| 1 par, 0 gorras | Agrega 1 gorra y activa Luna Nueva: pagas $190.000 por los dos. |
| 0 pares, 1 gorra | Agrega 1 par y activa Luna Nueva: pagas $190.000 por los dos. |
| 2 pares, 0 gorras | Agrega 1 gorra y activa Eclipse: la gorra va por nosotros. |
| 1 par, 0 gorras (alternativa a Luna Llena) | Agrega 2 pares y activa Luna Llena: 3 pares por $400.000. |
| 2 pares, 0 gorras (alternativa) | Agrega 1 par y activa Luna Llena: 3 pares por $400.000. |

Plantilla general: "Agrega {faltan_pares} y activa {combo}: {beneficio}."
Beneficio por combo: Luna Nueva = "pagas $190.000 por los dos"; Eclipse = "la gorra va por nosotros"; Luna Llena = "3 pares por $400.000".

Si faltan varias cosas, muestra solo el combo más cercano de activar; en empate, el que más ahorra.

### 2.2 Combo activo

- Luna Nueva activo: ahorras $45.000
- Eclipse activo: ahorras $60.000
- Luna Llena activo: ahorras $125.000

Plantilla: "{combo} activo: ahorras {ahorro}."
Línea de apoyo en el resumen: "Precio combo aplicado automáticamente."

### 2.3 Ya tienes un combo y te falta poco para uno mejor

Plantilla: "{combo} activo: ahorras {ahorro}. Agrega {faltan_pares} y pasas a {combo_mejor}: ahorras {ahorro_mejor}."

Ejemplos:
- 1 par + 1 gorra: "Luna Nueva activo: ahorras $45.000. Agrega 1 par y pasas a Eclipse: ahorras $60.000."
- 2 pares + 1 gorra: "Eclipse activo: ahorras $60.000. Agrega 1 par y pasas a Luna Llena: ahorras $125.000."

Mostrar solo si el combo superior ahorra más que el actual. Solo se aplica uno por pedido.

### 2.4 Califica para Eclipse pero no hay gorra

- Título: **Elige tu gorra de regalo**
- Ayuda: Con 2 pares, Eclipse incluye una gorra gratis. Elígela y agrégala: se descuenta sola en el carrito.
- Botón: **Agregar gorra de regalo**
- Mensaje posterior (misma palabra): "Gorra de regalo agregada. Eclipse activo: ahorras $60.000."
- Error si no hay gorras disponibles: "Hoy no hay gorras de combo disponibles. Escríbenos por WhatsApp y te ayudamos a elegir otra opción."

### 2.5 Hay 2 o más gorras y solo una va gratis

- Mensaje: "Eclipse incluye 1 gorra gratis. Las demás gorras van a $60.000 cada una."
- Si el carrito tiene 2 gorras: "Tu segunda gorra va a $60.000."
- Alternativa corta en línea de producto: "Gorra extra: $60.000."

### 2.6 Los combos no se acumulan

- Aviso en carrito: "Los combos no se acumulan. Si calificas para varios, aplicamos el que más ahorra."
- Cuando aplica uno y calificaba para otros: "Aplicamos {combo}, el que más te ahorra: {ahorro}."
- Aviso de un solo uso: "Cada combo se aplica una vez por pedido."

## 3. Línea del combo para el mensaje de WhatsApp

Va en la lista de productos del mensaje de "Pedir por WhatsApp".

- Plantilla: `Combo: {combo} ({detalle}) - {precio_combo} - ahorro {ahorro}`
- Luna Nueva: `Combo: Luna Nueva (1 par + 1 gorra) - $190.000 - ahorro $45.000`
- Eclipse: `Combo: Eclipse (2 pares + 1 gorra de regalo) - $350.000 - ahorro $60.000`
- Luna Llena: `Combo: Luna Llena (3 pares) - $400.000 - ahorro $125.000`
- Sin combo: omitir la línea.

Tallas en el mensaje con el formato "talla 42 (EUR)".

## 4. Textos de apoyo en la ficha

- Etiqueta en ficha de tenis o gorra elegible: "Entra en combo".
- Ficha de modelo premium (no elegible): "Este modelo no participa en combos."

## 5. Términos y condiciones de los combos

**Borrador para revisión legal.**

1. **Vigencia.** Los combos aplican desde [desde] hasta [hasta], o hasta agotar existencias. [PENDIENTE: dato del equipo]
2. **Productos elegibles.** Solo los productos de las colecciones "Tenis en combo" (tenis a $175.000 el par) y "Gorras en combo" (gorras a $60.000). Los modelos premium no participan.
3. **Combos disponibles.**
   - Luna Nueva: 1 par + 1 gorra por $190.000.
   - Eclipse: 2 pares + 1 gorra por $350.000; la gorra va sin costo.
   - Luna Llena: 3 pares por $400.000; el descuento de $125.000 se aplica sobre el par de menor precio.
4. **Aplicación automática.** El descuento se aplica solo en el carrito cuando se cumplen las condiciones. En Eclipse, el cliente elige la gorra y la agrega al carrito.
5. **Un uso por pedido.** Cada combo se aplica una sola vez por pedido.
6. **No acumulables.** Los combos no se acumulan entre sí: si el carrito califica para varios, se aplica el que más ahorra. Tampoco se acumulan con otros descuentos o códigos. [confirmar con el equipo]
7. **Precio de referencia.** Los ahorros se calculan frente al precio de lista vigente: $175.000 el par y $60.000 la gorra. [confirmar con cumplimiento que el precio de referencia sea el precio habitual real]
8. **Cambios y devoluciones.** [confirmar con cumplimiento] Texto base: si cambias o devuelves un producto que llegó en combo, el combo se recalcula. El valor reembolsado corresponde a lo que pagaste por ese producto dentro del combo, no al precio de lista. [PENDIENTE: política de cambios y devoluciones del equipo, plazos y condiciones]
9. **Stock limitado.** Los combos dependen de la disponibilidad de tallas y modelos. Si un producto se agota, el combo deja de aplicar a ese producto.
10. **Cambios en la promoción.** [PENDIENTE: dato del equipo sobre si Noctra se reserva el derecho de modificar o terminar los combos y cómo lo comunica.]

## 6. Dudas para el equipo

1. Vigencia de los combos ([desde] / [hasta]).
2. Con 3 pares + 1 gorra aplica Luna Llena ($125.000 de ahorro) y la gorra paga completa. ¿Está bien, o prefieren sugerir Eclipse?
3. Con 2 gorras en Eclipse, ¿cuál va gratis? Se asume una sola y la otra a $60.000.
4. ¿Los combos se acumulan con códigos de descuento o envío gratis? Se asumió que no.
5. Política de cambios y devoluciones sobre productos de combo.
6. ¿La gorra de regalo cuenta para el umbral de envío gratis? Hoy el umbral de ejemplo es $150.000.
7. ¿El aviso "Aplicamos {combo}, el que más te ahorra" se muestra siempre o solo cuando calificaba para varios?

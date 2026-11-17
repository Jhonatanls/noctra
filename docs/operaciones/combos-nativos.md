# Combos con descuentos automáticos nativos

Estado: borrador para aprobación del equipo. Última revisión de fuentes: 16 nov 2026.

## Preguntas para el equipo (decidir antes de empezar)

1. **Fechas de vigencia.** El equipo no las definió. Cada descuento lleva fecha de inicio y, opcionalmente, de fin. Marcador: `[FECHA_INICIO]` y `[FECHA_FIN o sin fin]`. Hora según la zona horaria de la tienda.
2. **Precio base.** Esta guía asume que el precio publicado de cada tenis en combo es $175.000 y de cada gorra en combo es $60.000 (sin precio "antes"). Si los productos tienen otro precio, los totales de la tabla de pruebas cambian.
3. **Precio de un tenis premium** para la prueba 7 (valor `P`). Es un modelo que NO está en "Tenis en combo".
4. **Nombres visibles** de los combos en el checkout: deben ser iguales a los de Ajustes del tema > Combos (hoy `Luna Nueva`, `Eclipse`, `Luna Llena`).

## Objetivo

Que los tres combos se apliquen solos en el carrito y en el checkout, sin código ni apps, en el plan Basic.

| Combo | Compra | Lleva | Resultado |
| --- | --- | --- | --- |
| Luna Nueva | 1 de Tenis en combo | 1 de Gorras en combo con $45.000 de descuento por artículo | $175.000 + $15.000 = $190.000 |
| Eclipse | 2 de Tenis en combo | 1 de Gorras en combo gratis | $350.000 |
| Luna Llena | 2 de Tenis en combo | 1 más de Tenis en combo con $125.000 de descuento | $350.000 + $50.000 = $400.000 |

Regla de negocio: 1 uso por pedido en cada combo y ninguno se combina con otro.

## Requisitos previos

- Acceso al admin de la tienda con permiso de **Descuentos** y **Productos** (cuenta del dueño o personal con esos permisos).
- Los tenis y gorras del combo ya cargados con su precio (ver `docs/operaciones/cargar-productos.md`).
- Los modelos premium NO deben llevar la etiqueta `combo`.
- No hace falta ninguna app ni documento de la empresa para esto.

## Qué dice la documentación oficial (verificado el 16 nov 2026)

Fuente principal: [Descuento Buy X get Y (ayuda de Shopify)](https://help.shopify.com/en/manual/discounts/discount-types/buy-x-get-y). La versión en español ([enlace](https://help.shopify.com/es/manual/discounts/discount-types/buy-x-get-y)) conserva los nombres de las opciones en inglés en su texto, así que **el nombre exacto en español del admin: verificar en pantalla**. Lo esperable es "Compra X y obtén Y".

- Admite método **Descuento automático** (Automatic discount), con **Título** en lugar de código.
- En "Customer gets" (El cliente obtiene) se elige el valor: **Percentage** (porcentaje), **Amount off each** (monto de descuento por artículo) o **Free** (gratis). Por eso el monto fijo por artículo ($45.000 y $125.000) sí está soportado.
- Existe la casilla **Set the maximum number of uses per order** (máximo de usos por pedido) dentro de "Customer gets". En la app móvil se llama "Uses per order".
- **Misma colección en "compra" y "lleva"** (aplica a descuentos automáticos): el descuento se aplica al artículo de menor precio que el cliente elige. Con todos los tenis a $175.000 no hay diferencia, pero si un tenis en combo tuviera otro precio, el descuento caería sobre el más barato.
- El cliente debe agregar todos los artículos al carrito; el artículo "de regalo" o con descuento no se agrega solo.
- Los descuentos de este tipo no se aplican en páginas de oferta posterior a la compra.
- Fechas de inicio y fin siguen la zona horaria de la tienda.
- **Descuentos que no se combinan:** [Combinación de descuentos](https://help.shopify.com/en/manual/discounts/discount-combinations) indica que cuando varios descuentos automáticos no combinables califican, se aplica siempre "the best discount for the customer's cart" (el mejor para el cliente, es decir, el de mayor ahorro). Shopify no define "mejor" con más detalle y, si dos dan el mismo valor, puede elegir uno por rendimiento del checkout.
- Límite: hasta 25 descuentos automáticos activos (incluidos los de apps). Con 3 estamos lejos.
- Los descuentos automáticos con Buy X get Y se aplican en el checkout de la tienda online. Los descuentos automáticos en tienda física solo aplican con POS Pro (fase 2).

**No confirmado en fuentes oficiales:** si el límite "máximo de usos por pedido" cuenta como un solo grupo "compra 2, lleva 1" o por artículo en casos como Luna Llena con 4 tenis. La tabla de pruebas (carrito 6) lo comprueba en la práctica; ver "Si el checkout da otro total".

## Parte A. Crear las colecciones

### Recomendación: colección automática por etiqueta

Usa colecciones **automáticas** con la etiqueta `combo` más el tipo de producto. Razón: al cargar un tenis nuevo basta con etiquetarlo `combo` y entra solo (a la colección y a los descuentos); no hay que acordarse de agregarlo a mano. Las colecciones manuales sirven si el equipo prefiere control total producto por producto, pero se olvidan con facilidad. Los modelos premium quedan fuera simplemente por no llevar la etiqueta.

Handles obligatorios (el tema los usa): `tenis-en-combo` y `gorras-en-combo`.

Fuente: [Crear una colección automática](https://help.shopify.com/en/manual/products/collections/automated-collections) y [Crear una colección manual](https://help.shopify.com/en/manual/products/collections/manual-collections). Los nombres de los campos de condición en español: verificar en pantalla.

### Pasos

1. En el admin, entra a **Productos > Colecciones** y pulsa **Crear colección**.
2. Título: `Tenis en combo`.
3. En **Tipo de colección**, elige **Automatizada**.
4. Condiciones: marca "los productos deben cumplir **todas** las condiciones" y agrega:
   - **Etiqueta de producto** es igual a `combo`.
   - **Tipo de producto** es igual a `Tenis` (usa el mismo texto que tienen los productos cargados; verifica en pantalla cómo está escrito en tu catálogo). Si el catálogo no usa tipo de producto, usa en su lugar dos etiquetas distintas: `combo-tenis` y `combo-gorras`.
5. Guarda.
6. Baja a **Publicación de motores de búsqueda** y pulsa **Editar**. En **URL y controlador** (handle) escribe `tenis-en-combo`. Guarda.
7. Repite con título `Gorras en combo`, condiciones etiqueta `combo` + tipo de producto `Gorras`, y handle `gorras-en-combo`.
8. Etiqueta los productos: abre cada tenis y cada gorra que entre al combo y agrega la etiqueta `combo`. Los premium no se etiquetan.

### Cómo probar que quedó bien

- Abre cada colección: deben aparecer solo los productos esperados y todos al precio correcto ($175.000 los tenis, $60.000 las gorras).
- Entra a `https://TU-DOMINIO/collections/tenis-en-combo` y `/collections/gorras-en-combo`: deben cargar (no "404").
- Ningún modelo premium aparece en ellas.

### Si falla

- Un producto no aparece: revisa que esté **Activo**, que la etiqueta esté escrita idéntica y que el tipo coincida.
- El handle salió con sufijo (`tenis-en-combo-1`): ya existía una colección con ese nombre; elimínala o renombra su handle y corrige el de la nueva.

## Parte B. Crear los tres descuentos automáticos

Se repite el mismo flujo tres veces. Fuente: [Buy X get Y](https://help.shopify.com/en/manual/discounts/discount-types/buy-x-get-y).

### Pasos comunes

1. Admin > **Descuentos** > **Crear descuento**.
2. En el tipo de descuento elige **Compra X y obtén Y** (en inglés "Buy X get Y"; nombre exacto en español: verificar en pantalla).
3. En **Método**, elige **Descuento automático** (no código).
4. **Título**: es el nombre que ve el cliente en el carrito y el checkout. Debe ser **idéntico** al nombre del combo en Ajustes del tema > Combos (`Luna Nueva`, `Eclipse`, `Luna Llena`): el tema lo usa para reconocer qué combo aplicó Shopify. Si cambias uno, cambia el otro. No uses nombres de marcas de terceros.
5. **El cliente compra** (Customer buys): elige **Cantidad mínima de artículos**, escribe el número, y en "Cualquier artículo de" elige **Colecciones específicas** y agrega la colección.
6. **El cliente obtiene** (Customer gets): escribe la cantidad, elige colección, y en **Con un valor de descuento** elige según el combo.
7. Marca **Establecer el número máximo de usos por pedido** y escribe `1`.
8. **Combinaciones**: deja **todas las casillas desmarcadas** (productos, pedido, envío).
9. **Fechas activas**: inicio `[FECHA_INICIO]`; fin `[FECHA_FIN o sin fin]`. Si aún no hay fechas, guarda el descuento sin activar probando primero en la tienda de desarrollo o deja la fecha de inicio en el futuro.
10. Revisa el **Resumen** a la derecha y pulsa **Guardar**.

### Valores de cada combo

| Campo | Luna Nueva | Eclipse | Luna Llena |
| --- | --- | --- | --- |
| Título | Luna Nueva | Eclipse | Luna Llena |
| Compra: cantidad mínima | 1 | 2 | 2 |
| Compra: colección | Tenis en combo | Tenis en combo | Tenis en combo |
| Lleva: cantidad | 1 | 1 | 1 |
| Lleva: colección | Gorras en combo | Gorras en combo | Tenis en combo |
| Valor de descuento | Monto de descuento por artículo: `45000` | Gratis | Monto de descuento por artículo: `125000` |
| Máximo de usos por pedido | 1 | 1 | 1 |
| Combinaciones | Ninguna | Ninguna | Ninguna |

Notas:
- Escribe los montos sin punto ni símbolo (`45000`). La moneda de la tienda debe ser COP (peso colombiano); verifica en Configuración > General.
- En Luna Llena la colección de compra y de entrega es la misma. Shopify descuenta el tenis de menor precio entre los elegidos; con precios iguales da lo mismo.

### Cómo se resuelve entre combos

Como ninguno se combina con otro, cuando un carrito califica para varios Shopify aplica el de mayor ahorro para el cliente. Ejemplo: con 2 tenis + 1 gorra califican Luna Nueva (ahorro $45.000) y Eclipse (ahorro $60.000); gana Eclipse. Esto es lo que produce los totales de la tabla.

### Cómo probar que quedó bien

Usa la tabla de carritos y la tienda de desarrollo o la tienda real sin completar el pago (el checkout muestra el descuento antes de pagar).

## Tabla de 7 carritos de prueba

Supuestos: tenis en combo (T) $175.000, gorra en combo (G) $60.000. `P` = precio de un tenis premium que no está en la colección.

| # | Carrito | Combo que gana | Cálculo | Total esperado (productos, sin envío) |
| --- | --- | --- | --- | --- |
| 1 | 1T + 1G | Luna Nueva | 175.000 + (60.000 - 45.000) | $190.000 |
| 2 | 2T + 1G | Eclipse (ahorro $60.000 contra $45.000 de Luna Nueva) | 350.000 + 0 | $350.000 |
| 3 | 2T + 2G | Eclipse (1 gorra gratis, 1 al precio normal) | 350.000 + 60.000 | $410.000 |
| 4 | 3T | Luna Llena | 525.000 - 125.000 | $400.000 |
| 5 | 3T + 1G | Luna Llena (Eclipse ahorraría solo $60.000 contra $125.000) | 400.000 + 60.000 | $460.000 |
| 6 | 4T | Luna Llena una sola vez | 700.000 - 125.000 | $575.000 |
| 7 | 1T + 1 tenis premium + 1G | Luna Nueva (el premium no cuenta para ninguna compra) | 175.000 + P + 15.000 | $190.000 + P |

Qué comprueba cada una: 1 el combo base; 2 y 5 la elección de mayor ahorro; 3 el límite de 1 gorra gratis; 4 la misma colección en compra y entrega; 6 el límite de 1 uso por pedido (si diera $450.000 no se aplicó el límite); 7 que los premium quedan fuera.

Para cada carrito: agrega los productos, entra al checkout con una dirección de prueba, confirma que el nombre del combo aparece en el resumen y que el subtotal coincide. No es necesario pagar.

## Pausar o terminar un combo

Fuente: [Administrar descuentos](https://help.shopify.com/en/manual/discounts/managing-discount-codes) (nombres de botones: verificar en pantalla).

- **Terminar en una fecha:** abre el descuento > **Fechas activas** > agrega fecha y hora de fin > Guardar.
- **Pausar ya:** abre el descuento > **Desactivar** (o "Terminar descuento" según la pantalla). Se puede reactivar luego.
- **Eliminar:** solo si no se volverá a usar; pierdes el historial de uso. Prefiere desactivar.
- Tras pausar, abre el carrito en una ventana de incógnito y confirma que el combo ya no se aplica.
- Avisa al equipo de WhatsApp y de redes para que no se anuncie un combo pausado.

## Si el checkout da otro total

1. **Revisa que el descuento esté activo** (no en "Programado" ni "Vencido") y que la fecha de inicio ya haya pasado.
2. **Revisa la etiqueta y la colección** del producto en el carrito. Un tenis sin etiqueta `combo` no cuenta.
3. **Revisa el precio** del producto: si no es $175.000 o $60.000, el total cambia.
4. **Revisa Combinaciones:** debe estar todo desmarcado en los tres descuentos. Si alguno tiene casillas marcadas, podrían sumarse dos combos.
5. **Revisa "máximo de usos por pedido":** debe ser 1. Si en 4 tenis el total es $450.000, quedó sin límite.
6. **Revisa duplicados:** descuentos viejos activos de pruebas anteriores, o un código de descuento puesto por el cliente.
7. **Revisa descuentos de precio "antes/ahora"** del producto: pueden interferir con el monto mínimo.
8. **Revisa el mercado y la moneda** (COP) y si hay descuentos limitados a ciertos clientes.
9. Si Shopify elige otro combo al empatar ahorros, es comportamiento documentado; ajusta los montos para evitar empates.
10. Si nada cuadra, compara contra la tabla, anota carrito, total esperado y total real, y consulta al soporte de Shopify o a la comunidad.

## Pendiente de verificar en pantalla

- Nombre exacto en español de "Buy X get Y", de "Amount off each" y de "Set the maximum number of uses per order".
- Si el campo "Tipo de producto" existe como condición de colección en tu admin.
- Comportamiento real del límite de 1 uso con 4 tenis (carrito 6).

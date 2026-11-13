# SPEC-006: Carrito y compra por WhatsApp

- **Estado:** borrador (prototipo de página de carrito en `sections/main-cart.liquid`)
- **Etapa:** 3
- **Requerimientos:** RF-10, RF-14, RF-16
- **Responsable:** dev-tema-liquid
- **Revisores:** disenador-ui, qa-calidad

## Objetivo

Que el carrito venda: muestre el ahorro de los combos, empuje a completar el siguiente combo y al envío gratis, y permita cerrar por WhatsApp a quien prefiere hablar con alguien.

## Alcance

- Carrito lateral (se abre al agregar un producto) y página `/cart` como respaldo sin JS.
- Líneas con foto, nombre, talla, color, cantidad editable y eliminar.
- Bloque de combos: combos aplicados con su ahorro y mensaje "te falta…" (usa `assets/combos.js`).
- Barra de progreso al envío gratis según `envio_gratis_desde`.
- Total con ahorro destacado en plata (`--color-acento`).
- Botones "Finalizar compra" (checkout de Shopify) y "Comprar por WhatsApp".

## Mensaje de WhatsApp (RF-16)

```
Hola, quiero hacer este pedido:
• Tenis Modelo X, talla 42, negro × 1 — $190.000
• Gorra Modelo Y × 1 — $60.000
Combo aplicado: Look completo (ahorras $80.000)
Total estimado: $350.000
¿Me confirman disponibilidad y envío a mi ciudad?
```

El total por WhatsApp se marca como "estimado" porque el envío y la confirmación final los da el equipo.

## Criterios de aceptación

- [ ] Al agregar un producto, el carrito lateral se abre con el foco en su título y se cierra con Escape.
- [ ] Con 2 tenis y 1 gorra elegibles, el carrito muestra el combo y el ahorro igual al que luego aplica el checkout.
- [ ] Con 1 tenis, el carrito dice qué falta para el combo más cercano.
- [ ] La barra de envío gratis muestra cuánto falta y desaparece al superarlo.
- [ ] El mensaje de WhatsApp contiene todas las líneas, tallas, combo y total.
- [x] Sin JavaScript, `/cart` permite cambiar cantidades y pagar.

## Plan

- [x] Página de carrito con barra de envío gratis y botón de WhatsApp.
- [ ] Carrito lateral con Cart API (`/cart/add.js`, `/cart/change.js`) y Section Rendering API.
- [ ] Integrar `combos.js` y las definiciones de combos del metaobjeto.

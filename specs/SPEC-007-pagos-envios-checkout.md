# SPEC-007: Pagos, envíos y checkout

- **Estado:** borrador
- **Etapa:** 4
- **Requerimientos:** RF-15, RF-17, RF-18, RF-19, RF-20, RNF-06, RNF-12
- **Responsable:** operaciones-shopify (runbook) · el equipo ejecuta
- **Revisores:** cumplimiento, qa-calidad

## Objetivo

Que el cliente pague como prefiera y que cada pedido llegue al equipo con el estado correcto, sin que el tema toque datos de pago.

## Alcance (se configura en el admin, no en código)

| Medio | Cómo se activa | Requisito previo |
| --- | --- | --- |
| Addi | App oficial de Addi en Shopify | Persona jurídica y aprobación de Addi |
| Sistecrédito | App oficial de Sistecrédito en Shopify | Aprobación de Sistecrédito |
| Mercado Pago | Proveedor de pagos externo | Cuenta empresarial verificada |
| Wompi (tarjeta, PSE, Nequi, Daviplata) | App de Wompi | Cuenta Wompi empresarial |
| Transferencia | Método de pago manual con instrucciones | Cuenta bancaria empresarial |
| Contraentrega | Método de pago manual "Pago contra entrega" | Transportadora con recaudo |

- Envíos: zonas por departamento/ciudad con tarifas de la transportadora (app cotizadora) y envío gratis desde el umbral definido.
- Contraentrega (RF-19): monto máximo y ciudades habilitadas. Si Shopify no permite restringir el método por ciudad o monto de forma nativa, se evalúa una Function de personalización de pagos (verificar con `shopify-dev`).
- Transferencia (RF-20): instrucciones con datos bancarios; el cliente envía el comprobante por WhatsApp o correo (nunca se publica en una URL); el pedido queda "pendiente de pago" hasta que el equipo lo marca como pagado.
- Checkout: logo, colores y tipografía de marca en la configuración del checkout del admin.

## Criterios de aceptación

- [ ] Un pedido de prueba se completa con cada medio de pago y queda en el estado correcto.
- [ ] Un pedido con contraentrega fuera de las ciudades habilitadas no puede elegir ese método.
- [ ] El checkout muestra la marca en ambos modos de forma legible.
- [ ] Ningún archivo del tema maneja datos de tarjeta (revisión de cumplimiento).

## Plan

- [ ] Runbook `docs/operaciones/pagos-y-envios.md` paso a paso.
- [ ] Prueba de pedidos con cada medio (modo de prueba de cada pasarela).

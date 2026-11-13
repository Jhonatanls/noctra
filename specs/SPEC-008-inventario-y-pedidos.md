# SPEC-008: Inventario y pedidos

- **Estado:** borrador
- **Etapa:** 4
- **Requerimientos:** RF-24, RF-25, RF-27, RF-28
- **Responsable:** operaciones-shopify
- **Revisores:** qa-calidad

## Objetivo

Un solo inventario confiable para web, redes y WhatsApp, y pedidos con estados claros de punta a punta.

## Alcance

- Estructura de producto: un producto por modelo y color; variantes por talla (o modelo × talla × color si el equipo prefiere un producto por modelo). Decisión del equipo antes de cargar el catálogo.
- Plantilla CSV de carga masiva con columnas acordadas (`docs/operaciones/plantilla-productos.csv`).
- Alerta de stock bajo (app o Flow) al llegar a `umbral_ultimas_unidades`.
- Ventas por WhatsApp: se registran como pedido borrador en el admin y se envía el enlace de pago, o se marcan como pagadas con transferencia/contraentrega. Así descuentan inventario.
- Estados: usar los estados nativos de pago y preparación de Shopify y etiquetas para "en preparación".
- Cambio de talla: formulario en la cuenta del cliente o por WhatsApp con política publicada (SPEC-010).

## Criterios de aceptación

- [ ] Una venta por WhatsApp registrada como pedido borrador descuenta inventario.
- [ ] Una carga CSV de 20 productos con tallas crea variantes correctas.
- [ ] Al quedar 3 unidades de una variante, el equipo recibe la alerta.

## Plan

- [ ] Definir estructura de producto con el equipo.
- [ ] Runbook de pedidos por WhatsApp.
- [ ] Plantilla CSV.

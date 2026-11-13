# ADR-001: Shopify con tema propio en Liquid

- Estado: aceptada
- Fecha: 2026-11-09

## Contexto

Necesitamos una tienda muy vistosa, con inventario, combos de precio fijo y pagos colombianos (Addi, Sistecrédito, Mercado Pago, Wompi, transferencia, contraentrega), operable por un equipo pequeño y que crezca a tienda física.

## Decisión

Shopify como plataforma de comercio y un tema propio Online Store 2.0 escrito desde cero en Liquid, versionado en Git y desarrollado con agentes. Los combos se implementan como Shopify Function de descuento alimentada por una lógica pura compartida (`packages/combos`).

## Alternativas descartadas

- **WooCommerce**: sin comisión por venta, pero con hosting, seguridad y mantenimiento propios.
- **Tiendanube**: más barata y con Addi integrado, pero con menos libertad de diseño.
- **Headless (Next.js + Medusa o Hydrogen)**: control total, pero meses extra e integración manual de cada pasarela. Se reevalúa en una fase 3.
- **Tema comercial (Dawn u otro)**: rápido, pero la identidad visual es la prioridad número uno y heredaríamos mucho código que no usamos.

## Consecuencias

- Comisión adicional de Shopify por pasarela externa (2 % en Basic, 1 % en Grow).
- El checkout es el de Shopify; su diseño se ajusta con la configuración de marca del admin.
- Todo lo que se configura en el admin (pagos, envíos, apps) queda documentado en `docs/operaciones/` en vez de en código.

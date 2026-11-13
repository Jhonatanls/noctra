# SPEC-009: Canales, notificaciones y analítica

- **Estado:** borrador
- **Etapa:** 5
- **Requerimientos:** RF-22, RF-23, RF-35, RF-36, RNF-18
- **Responsable:** operaciones-shopify · dev-tema-liquid (banner de cookies)
- **Revisores:** cumplimiento

## Objetivo

Vender desde Instagram, TikTok y WhatsApp con el mismo catálogo y saber qué canal y qué combo venden.

## Alcance

- Canal de Facebook e Instagram (Meta) en Shopify: catálogo sincronizado, etiquetado en publicaciones, catálogo en WhatsApp Business.
- App de TikTok: catálogo y píxel para anuncios (verificar disponibilidad de TikTok Shop en Colombia antes de prometerla).
- Píxeles por la integración oficial de cada canal (eventos estándar) y Google Analytics 4 con la app de Google.
- Banner de consentimiento de cookies nativo de Shopify (Customer Privacy) antes de activar píxeles de publicidad.
- Notificaciones: correos de Shopify en español con la marca; WhatsApp de confirmación y despacho con una app de mensajería que use la API oficial de WhatsApp Business.
- Atribución: parámetros UTM en todos los enlaces de redes; los pedidos por WhatsApp llevan la etiqueta `canal-whatsapp`; los combos aparecen como nombre del descuento en los reportes.

## Criterios de aceptación

- [ ] Un producto nuevo aparece en el catálogo de Instagram y WhatsApp en menos de 24 h.
- [ ] Sin aceptar cookies, no se dispara ningún píxel de publicidad.
- [ ] El reporte de ventas se puede filtrar por canal y por combo.

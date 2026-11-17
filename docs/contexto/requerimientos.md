# Tienda online: paleta, stack y requerimientos

Fuente: documento del equipo "Tienda online: paleta, stack y requerimientos" (9 nov 2026). Este archivo es la copia de trabajo para los agentes; si cambia el documento, actualízalo aquí.

## Contexto y supuestos

La fase 1 es una tienda de tenis y gorras con venta por web, Instagram, TikTok y WhatsApp, pensada para crecer luego a ropa premium, lociones, accesorios y tienda física. La marca es **Noctra** (decidido el 13 nov 2026), con identidad gótica nocturna en negro, blanco y plata. Todo el diseño usa tokens para que la identidad se pueda ajustar sin rehacer el tema.

| Tema | Fase 1 (lanzamiento) | Fase 2 en adelante |
| --- | --- | --- |
| Catálogo | Tenis y gorras | Ropa premium, lociones, accesorios |
| Canales | Web, Instagram, TikTok, WhatsApp Business | Tienda física con punto de venta |
| Gancho comercial | Combos y "Precio Club" | Lanzamientos exclusivos, clientes VIP |
| Pagos | Addi, Sistecrédito, Mercado Pago, transferencia, efectivo contraentrega | Datáfono en tienda |

Supuesto clave: el catálogo es de marca propia o de productos originales. Addi, Sistecrédito, Mercado Pago y las redes sociales exigen vender productos legítimos y bloquean cuentas que vendan falsificaciones.

## Paleta y tipografía

Noir y plata, derivada del logo de Noctra (reemplaza la paleta Noir y oro del documento original). Ver `CLAUDE.md` sección 6, `specs/SPEC-001-sistema-de-diseno.md` y `docs/marca/README.md`.

## Stack

Shopify con tema propio Online Store 2.0 (Liquid) en Git. Promociones con descuentos automáticos nativos "Compra X lleva Y" en plan Basic, sin Functions propias (decisión del equipo 16 nov 2026, ver SPEC-005). Contraentrega por municipio con una app pública de la App Store (SPEC-007). Cuotas con las apps oficiales de Addi y Sistecrédito. Pagos con Mercado Pago y Wompi. Transferencia y contraentrega como métodos manuales. WhatsApp Business con catálogo sincronizado vía Meta. Apps de Facebook/Instagram y TikTok. Transportadora vía app cotizadora. Factura electrónica con Alegra o Siigo. Shopify POS en fase 2.

Costo a considerar: Shopify Payments no está disponible en Colombia, así que Shopify cobra una comisión adicional por venta con pasarela externa (2 % en Basic, 1 % en Grow), además de la comisión de cada pasarela.

## Requerimientos funcionales

| ID | Módulo | Requerimiento | Fase |
| --- | --- | --- | --- |
| RF-01 | Catálogo | Listado por categoría (tenis, gorras) con filtros por talla disponible, color, línea y precio; orden por precio y novedad | 1 |
| RF-02 | Catálogo | Búsqueda con sugerencias mientras se escribe | 1 |
| RF-03 | Catálogo | Etiquetas visibles en cada producto: Nuevo, Últimas unidades, Combo, Agotado | 1 |
| RF-04 | Producto | Galería de mínimo 5 fotos y un video corto, con zoom | 1 |
| RF-05 | Tallas | Selector de talla en EUR por defecto, con equivalencia en centímetros de pie y talla US | 1 |
| RF-06 | Tallas | Guía de tallas: tabla EUR ↔ cm de pie, cómo medir el pie en casa y aclaración de que la talla se toma del número EUR de la etiqueta de un tenis de referencia | 1 |
| RF-07 | Tallas | Talla agotada visible pero deshabilitada, con botón "Avísame" que notifica por WhatsApp o correo | 1 |
| RF-08 | Producto | Bloque "Arma tu combo" en la ficha, que sugiere los productos que completan la promoción | 1 |
| RF-09 | Promociones | Combos de precio fijo configurables desde el admin sin tocar código (ej. 2 tenis + 1 gorra = $350.000; 3 tenis = $420.000) | 1 |
| RF-10 | Promociones | Aplicación automática del combo en el carrito, con mensaje de lo que falta ("Agrega 1 gorra y ahorra $X") | 1 |
| RF-11 | Promociones | Reglas por combo: vigencia, productos elegibles, límite por cliente y si es acumulable | 1 |
| RF-12 | Promociones | "Precio Club": precio especial visible solo para clientes registrados | 2 |
| RF-13 | Promociones | Códigos de descuento para campañas e influenciadores, con reporte de uso | 1 |
| RF-14 | Carrito | Carrito lateral con combos aplicados, ahorro total y barra de progreso al envío gratis | 1 |
| RF-15 | Checkout | Dirección con departamento y ciudad de Colombia y costo de envío calculado por ciudad | 1 |
| RF-16 | Checkout | Botón "Comprar por WhatsApp" que arma el mensaje con productos, tallas, combo y total | 1 |
| RF-17 | Pagos | Addi, Sistecrédito, Mercado Pago (tarjeta, PSE y los demás medios que el equipo active en su cuenta), transferencia y contraentrega. Cambio por decisión del equipo 16 nov 2026: Wompi sale del alcance (ver SPEC-007) | 1 |
| RF-18 | Pagos | Mensaje de cuotas en la ficha del producto ("desde $X al mes con Addi") | 1 |
| RF-19 | Pagos | Contraentrega con monto máximo, ciudades habilitadas y confirmación por WhatsApp antes de despachar | 1 |
| RF-20 | Pagos | Transferencia con datos bancarios y carga de comprobante; el pedido queda pendiente hasta validarlo | 1 |
| RF-21 | WhatsApp | Botón flotante de WhatsApp con mensaje prellenado según la página o producto | 1 |
| RF-22 | Redes | Catálogo sincronizado con Instagram, Facebook y WhatsApp; productos etiquetables en publicaciones | 1 |
| RF-23 | Notificaciones | Confirmación de pedido, despacho y número de guía por WhatsApp y correo | 1 |
| RF-24 | Inventario | Inventario por variante (modelo × talla × color) con alerta de stock bajo | 1 |
| RF-25 | Inventario | Carga masiva por CSV; las ventas cerradas por WhatsApp se registran como pedido y descuentan inventario | 1 |
| RF-26 | Inventario | Varias ubicaciones (bodega y tienda física) con un solo inventario | 2 |
| RF-27 | Pedidos | Estados: pendiente de pago, pagado, en preparación, despachado, entregado, devuelto | 1 |
| RF-28 | Pedidos | Generación de guía, rastreo y solicitud de cambio de talla desde la cuenta del cliente | 1 |
| RF-29 | Clientes | Registro con celular o correo, que convierte al cliente en miembro del Club | 1 |
| RF-30 | Clientes | Historial de pedidos y lista de deseos | 2 |
| RF-31 | Clientes | Reseñas con foto en cada producto | 2 |
| RF-32 | Contenido | Inicio editable: video principal, colecciones, combos destacados y fotos de clientes o de Instagram | 1 |
| RF-33 | Contenido | Páginas de guía de tallas, envíos, cambios, garantía, preguntas frecuentes y sobre la marca | 1 |
| RF-34 | Contenido | La tienda inicia en modo oscuro; interruptor a modo claro que recuerda la preferencia (actualizado el 13 nov 2026) | 1 |
| RF-35 | Analítica | Píxel de Meta con API de conversiones, píxel de TikTok y Google Analytics 4 | 1 |
| RF-36 | Analítica | Reporte de ventas por canal (web, WhatsApp, Instagram, TikTok) y por combo | 1 |

## Requerimientos no funcionales

| ID | Categoría | Requerimiento | Meta medible |
| --- | --- | --- | --- |
| RNF-01 | Rendimiento | Carga rápida en celular con 4G | LCP < 2,5 s, CLS < 0,1, INP < 200 ms; Lighthouse móvil ≥ 85 |
| RNF-02 | Rendimiento | Imágenes y video optimizados | Fotos WebP/AVIF con carga diferida; video del inicio < 3 MB con imagen previa |
| RNF-03 | Diseño | Pensado primero para celular | Diseño base a 360 px de ancho; nada se desborda de lado |
| RNF-04 | Diseño | Identidad consistente | Todos los colores y tipos salen de un solo archivo de tokens; cambiar la marca toma minutos |
| RNF-05 | Accesibilidad | Legible y usable para todos | Contraste WCAG AA (4,5:1); botones de mínimo 44 px; respeta "reducir movimiento" |
| RNF-06 | Seguridad | Pagos sin datos sensibles en la tienda | Ningún dato de tarjeta pasa por el tema; todo lo procesan las pasarelas certificadas PCI |
| RNF-07 | Seguridad | Acceso controlado al admin | Verificación en dos pasos obligatoria; un usuario por persona con permisos por rol |
| RNF-08 | Seguridad | Comprobantes de transferencia privados | Solo visibles para el equipo, nunca en URL pública |
| RNF-09 | Legal | Protección de datos (Ley 1581 de 2012) | Política de tratamiento publicada y autorización expresa en registro y checkout |
| RNF-10 | Legal | Estatuto del Consumidor (Ley 1480 de 2011) | Derecho de retracto de 5 días hábiles y reversión del pago explicados en la tienda; términos de cada promoción publicados |
| RNF-11 | Legal | Facturación electrónica | Cada pedido pagado genera factura electrónica DIAN automáticamente |
| RNF-12 | Legal | Empresa formalizada | Persona jurídica registrada en Colombia, requisito para activar Addi y la mayoría de pasarelas |
| RNF-13 | Legal | Catálogo legítimo | Solo marca propia u originales, condición de Addi, Sistecrédito, Mercado Pago, Meta y TikTok |
| RNF-14 | SEO | Encontrable en Google | URLs limpias, metadatos por producto, datos estructurados de producto y mapa del sitio |
| RNF-15 | Disponibilidad | Tienda siempre en línea | Hosting gestionado por Shopify; picos de campaña sin intervención |
| RNF-16 | Mantenibilidad | Código ordenado y reversible | Tema en Git, tienda de desarrollo separada de producción, cada cambio revisado antes de publicar |
| RNF-17 | Mantenibilidad | Operable sin programador | Combos, banners, productos y textos se cambian desde el admin |
| RNF-18 | Privacidad | Consentimiento de cookies | Banner de cookies antes de activar píxeles de publicidad |

# SPEC-004: Ficha de producto y guía de tallas

- **Estado:** borrador (prototipo de referencia en `sections/main-product.liquid`, `snippets/guia-tallas.liquid` y `assets/theme.js`)
- **Etapa:** 2
- **Requerimientos:** RF-04, RF-05, RF-06, RF-07, RF-18, RF-21
- **Responsable:** dev-tema-liquid
- **Revisores:** disenador-ui, contenido-copy, qa-calidad

## Objetivo

Que el cliente elija su talla con seguridad (la causa número uno de cambios y devoluciones) y compre o pregunte por WhatsApp sin salir de la ficha.

## Alcance

- Galería: mínimo 5 fotos y un video, deslizable en celular, con miniaturas en escritorio y zoom al tocar.
- Nombre en Pirata One, precio en plata (`--color-acento`), precio anterior tachado si aplica.
- Espacio para el mensaje de cuotas de Addi y Sistecrédito como **bloques de app** (las apps los proveen; el tema no calcula cuotas).
- Selector de talla con botones: muestra el número EUR y debajo los centímetros de pie de la guía.
- Tallas agotadas visibles y tachadas, y anunciadas como "agotada" a lectores de pantalla. Se pueden tocar para pedir aviso: el botón "Agregar al carrito" se desactiva y el de WhatsApp cambia a "Avísame por WhatsApp".
- Enlace "¿Cuál es mi talla?" que abre la guía en un diálogo.
- Botones "Agregar al carrito" y "Pedir por WhatsApp" (mensaje con producto, talla, color y enlace).
- Bloques editables: descripción, texto, desplegable (envíos, cambios, cuidado), bloque de app.

## Guía de tallas (RF-06)

- Tabla EUR ↔ centímetros de pie ↔ US.
- Pasos para medir el pie en casa: hoja contra la pared, talón contra la pared, marcar la punta del dedo más largo, medir en centímetros; si queda entre dos tallas, elegir la mayor.
- Aclaración destacada: **la forma más segura es mirar la talla EUR en la etiqueta de un tenis que te quede bien y pedir ese mismo número.**
- Los datos salen del metaobjeto `guia_tallas` (campos `eur`, `cm`, `us`). Si no existe, se usa una tabla de referencia general marcada como provisional.

## Comportamiento

- La URL se actualiza con `?variant=` al cambiar de opción (se puede compartir por WhatsApp).
- Sin JavaScript, el formulario sigue funcionando con un `<select>` de variantes.
- En celular, al pasar del botón de compra aparece una barra fija abajo con precio y "Agregar al carrito".

## Datos y configuración

- Metaobjeto `guia_tallas` (lo crea el equipo con el runbook): una entrada por talla. **Las medidas reales por horma las entrega el equipo**; los agentes no inventan medidas.
- Opción de variante llamada "Talla" (detecta también "Size"). Opción "Color".

## Criterios de aceptación

- [ ] Dado un tenis con talla 42 agotada, cuando abro la ficha, entonces veo la 42 tachada; si la toco, no puedo agregarla al carrito y el botón de WhatsApp dice "Avísame por WhatsApp".
- [ ] Cuando elijo la talla 41, entonces veo "41" y debajo su medida en cm según la guía.
- [ ] Cuando toco "¿Cuál es mi talla?", se abre la guía, el foco entra al diálogo y Escape lo cierra.
- [ ] Cuando toco "Pedir por WhatsApp" con talla 41 elegida, el mensaje incluye nombre, talla 41 y enlace con `?variant=`.
- [ ] Con las apps de Addi y Sistecrédito instaladas, su mensaje de cuotas aparece bajo el precio al agregar el bloque de app en el editor.
- [ ] La foto principal es el LCP y carga en menos de 2,5 s en 4G.

## Plan

- [x] Prototipo de sección con galería simple, selector de opciones, guía y WhatsApp.
- [ ] Zoom y video en galería.
- [ ] Barra fija de compra en celular.
- [ ] Bloque "Arma tu combo" (depende de SPEC-005).
- [ ] Botón "Avísame" por correo (app de alertas de stock) además de WhatsApp.

## Notas y decisiones

- La tabla de referencia usa la equivalencia general EUR = 1,5 × (largo del pie en cm + 1,5). Varía por horma: es provisional y así lo dice la tienda hasta que el equipo cargue medidas reales.

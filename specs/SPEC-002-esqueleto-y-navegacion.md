# SPEC-002: Esqueleto del tema, encabezado, pie e inicio

- **Estado:** en-revision
- **Etapa:** 1
- **Requerimientos:** RF-21, RF-32, RNF-01, RNF-02, RNF-17
- **Responsable:** dev-tema-liquid
- **Revisores:** disenador-ui, qa-calidad

## Objetivo

Tener un tema que levante en la tienda de desarrollo con encabezado, pie, botón flotante de WhatsApp e inicio editable, sobre el cual se construye todo lo demás.

## Alcance

- `layout/theme.liquid`, grupos de secciones de encabezado y pie.
- Encabezado: logotipo de Noctra (SVG que cambia de color con el modo), menú principal, búsqueda, cuenta, carrito con contador, interruptor de modo. En celular, menú desplegable sin JavaScript (`<details>`).
- Pie: menús, redes, medios de pago habilitados, eslogan, aviso legal.
- Inicio: sección de portada (video o imagen, isotipo, logotipo grande como titular, eslogan, botón) y colecciones destacadas.
- Botón flotante de WhatsApp con mensaje según la página (RF-21).
- Plantillas mínimas para que el tema sea válido: inicio, producto, colección, lista de colecciones, carrito, página, búsqueda, 404.
- Ajustes del tema: nombre de marca, logo, eslogan, WhatsApp, redes, umbral de envío gratis, umbral de "Últimas unidades".

## Portada animada

Al entrar se ve el isotipo pequeño arriba y el logotipo NOCTRA debajo. Al hacer scroll, la portada queda fija y:

1. El isotipo crece desde el 30 % hasta su tamaño final y baja al centro.
2. El logotipo sube hasta quedar superpuesto en el centro del isotipo, con un halo del color del fondo y un filo dorado que lo "tallan" sobre las líneas del isotipo, como en el logo completo.
3. La animación termina al 80 % del recorrido (220 svh) y el logo completo queda quieto un momento antes de seguir a los combos.
4. El ornamento dorado, el eslogan y el botón están siempre visibles abajo; la indicación "Desliza" desaparece al empezar.

Proporciones tomadas del logo completo: el logotipo mide 0,735 veces el alto final del isotipo y su centro queda al 51,6 % de ese alto. Solo se animan `transform` (sin recalcular diseño), y el scroll se escucha solo mientras la portada está en pantalla.

Sin JavaScript, con "reducir movimiento" o con la casilla de animación apagada, se muestra el logo completo sin recorrido extra.

## Barra de anuncios y combos destacados

- **Barra de anuncios** (grupo del encabezado): hasta 4 mensajes separados por rombos dorados; en celular solo el primero. Por defecto: "Envíos a toda Colombia", "Paga a cuotas con Addi o Sistecrédito", "Combos desde $350.000".
- **Combos destacados** (inicio, después de la portada): tarjetas con doble filo dorado, nombre en letra gótica, qué incluye, precio en oro y botón "Armar mi combo". Los precios son texto editable y **deben coincidir con los combos del motor de descuentos** (SPEC-005); cuando exista el metaobjeto de combos, la sección los leerá de ahí.

## Fuera de alcance

- Carrito lateral (SPEC-006). Por ahora el ícono lleva a `/cart`.
- Búsqueda predictiva (SPEC-003).

## Comportamiento

- En celular, el encabezado mide 64 px, es fijo arriba y no tapa contenido al hacer scroll hacia el ancla.
- El botón de WhatsApp aparece abajo a la derecha, 56 px, sin tapar el botón de compra en la ficha (se sube cuando la barra de compra fija está visible).
- Si no hay número de WhatsApp configurado, el botón no se muestra.
- La portada usa video si existe (silenciado, en bucle, `playsinline`, con imagen previa); si no, imagen. Respeta "reducir movimiento" pausando el video.

## Datos y configuración

| Ajuste | Tipo | Por defecto |
| --- | --- | --- |
| `nombre_marca` | texto | Noctra |
| `logo` | imagen | vacío (usa `noctra-wordmark.svg`) |
| `modo_predeterminado` | selector | oscuro (decisión de marca) |
| `eslogan` | texto | Viste la noche |
| `whatsapp_numero` | texto (con indicativo, solo dígitos) | vacío |
| `whatsapp_mensaje` | texto | Hola, quiero información sobre sus productos |
| `envio_gratis_desde` | número (pesos) | 150000 |
| `umbral_ultimas_unidades` | número | 3 |
| `instagram_url`, `tiktok_url` | url | vacío |

## Criterios de aceptación

- [x] `shopify theme check` sin errores sobre el tema.
- [ ] `shopify theme dev` levanta el tema y navega inicio, colección, producto, carrito, página, búsqueda y 404.
- [x] El nombre de la marca no aparece escrito en duro en ningún archivo de código; el logo sale siempre del snippet `logo`.
- [x] Sin número de WhatsApp configurado, no aparece el botón flotante.
- [x] El menú de celular abre y cierra sin JavaScript.
- [ ] Lighthouse móvil ≥ 85 en el inicio con una imagen de portada real.
- [ ] La portada con video pesa menos de 3 MB y muestra imagen previa.
- [x] Al hacer scroll, el isotipo crece y el logotipo se superpone hasta formar el logo completo (verificado en vista previa a 390 y 1280 px).
- [x] Con "reducir movimiento" o sin JavaScript se ve el logo completo sin animación.
- [ ] La animación se mantiene fluida (sin saltos) en un celular Android de gama media.
- [x] La barra de anuncios muestra un solo mensaje en celular y todos en escritorio.

## Plan

- [x] Layout, grupos de encabezado y pie, ajustes del tema.
- [x] Secciones: encabezado, pie, portada, colección destacada.
- [x] Plantillas mínimas y sus secciones principales.
- [x] Snippet de WhatsApp flotante.
- [ ] Conectar a la tienda de desarrollo y probar con productos de ejemplo del equipo.

## Notas y decisiones

- Se usa `<details>` para el menú móvil: funciona sin JS y es accesible por teclado.

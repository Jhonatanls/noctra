# SPEC-004: Ficha de producto y guía de tallas

- **Estado:** en-progreso (aprobada por el equipo; implementación en la rama `spec/SPEC-004-ficha`; prototipo de referencia en `sections/main-product.liquid`, `snippets/guia-tallas.liquid`, `sections/pagina-guia-tallas.liquid`, `assets/componente-ficha.css` y `assets/theme.js`)
- **Etapa:** 2
- **Requerimientos:** RF-04, RF-05, RF-06, RF-07, RF-18, RF-21 (parcial: WhatsApp en la ficha); RNF-01, RNF-02, RNF-03, RNF-05, RNF-09, RNF-10, RNF-13, RNF-14, RNF-17 (parciales, en lo que toca a la ficha)
- **Responsable:** dev-tema-liquid
- **Revisores:** disenador-ui, contenido-copy, cumplimiento, qa-calidad

## Objetivo

Que el cliente elija su talla con seguridad (la causa número uno de cambios y devoluciones) y compre o pregunte por WhatsApp sin salir de la ficha.

## Trazabilidad

| Requerimiento | Qué cubre esta spec | Dónde se cumple |
| --- | --- | --- |
| RF-04 | Galería con todas las fotos y el video del producto, deslizable en celular, con zoom | Tema; la carga de mínimo 5 fotos y un video es del equipo (`docs/operaciones/cargar-productos.md`) |
| RF-05 | Selector de talla en EUR, con centímetros de pie y talla US de la talla elegida (solo tenis; las gorras son de talla única) | Tema + metaobjeto `guia_tallas` (admin) |
| RF-06 | Guía de tallas: una sola tabla EUR ↔ cm ↔ US para todos los tenis, cómo medir el pie, aclaración de la etiqueta EUR | Snippet `guia-tallas` en diálogo y página `page.guia-tallas` (tema); datos en metaobjeto (admin) |
| RF-07 | Talla agotada visible pero no comprable, con aviso **solo por WhatsApp** ("Preguntar disponibilidad por WhatsApp"). El aviso por correo que RF-07 permite como alternativa no se usa al lanzar (decisión del equipo, 13 nov 2026) | Tema |
| RF-18 | Mensaje de cuotas bajo el precio, con "sujeto a aprobación", visible solo cuando el equipo activa el ajuste del tema tras confirmar que la pasarela está activa | Bloques de app de Addi y Sistecrédito (las apps calculan) + ajuste del tema `mostrar_cuotas` (tema / editor) |
| RF-21 | Botón "Pedir por WhatsApp" con producto, talla, color y enlace; el flotante de SPEC-002 no tapa la compra | Tema |
| RNF-01, RNF-02 | La primera foto es el LCP (carga prioritaria), resto diferido; video con imagen previa y `preload="none"` | Tema |
| RNF-03, RNF-05 | Sin desborde a 360 px; tallas de 44 px; diálogo accesible; agotadas anunciadas | Tema |
| RNF-09 | Aviso de tratamiento de datos junto al botón de WhatsApp (decisión del 13 nov 2026) | Snippet `aviso-datos-whatsapp` (tema); política en el admin |
| RNF-10 | Precio final claro: la empresa es responsable de IVA y carga los precios con IVA incluido, así que la ficha muestra "IVA incluido."; condiciones de envío, cambios y retracto enlazadas a las políticas del admin, sin escribirlas en el código | Tema + configuración de impuestos y políticas del admin |
| RNF-13 | Sin marcas de terceros en `alt`, textos de ejemplo, plantillas ni datos de prueba | Tema + contenido |
| RNF-14 | Datos estructurados de producto (`structured_data`) | Tema; SEO general en SPEC-011 |
| RNF-17 | Bloques de la ficha, desplegables, guía de tallas y mensaje de cuotas editables o activables desde el editor y los metaobjetos | Editor / admin |

No cubre: el bloque "Arma tu combo" (RF-08), que depende del motor de combos (SPEC-005) y hoy **no tiene criterios de aceptación en ninguna spec**; se recomienda especificarlo en SPEC-005 o SPEC-006. La ficha deja reservado su lugar con un bloque del editor.

## Alcance

- Galería: todas las fotos y videos del producto. En celular, carrusel deslizable a todo el ancho con indicador "1 de 6"; en escritorio, fotos apiladas en una columna junto a la información fija (sticky). Zoom al tocar o hacer clic.
- Nombre en Pirata One con el ornamento debajo; precio en oro (`--color-oro`, clase `.precio`), precio anterior tachado si aplica, y "IVA incluido." debajo cuando `cart.taxes_included` es verdadero (el admin debe tenerlo activado; ver "Qué se programa y qué se configura").
- Mensaje de cuotas de Addi y Sistecrédito como **bloques de app** (`@app`) bajo el precio, más la nota "Sujeto a aprobación." del tema. Todo el conjunto se muestra solo si el ajuste del tema "Mostrar mensaje de cuotas" está activo (por defecto apagado). El tema no calcula cuotas.
- Selector de opciones con botones. Para la opción de talla de los tenis: número EUR y, debajo, los centímetros de pie de la guía; bajo el grupo, una línea con la equivalencia completa de la talla elegida ("Talla 42 EUR · 26,5 cm de pie · US 8,5", con los datos que cargue el equipo).
- Tallas agotadas visibles y tachadas, anunciadas como agotadas a lectores de pantalla y seleccionables para pedir información: "Agregar al carrito" se desactiva y dice "Agotado", y el botón de WhatsApp cambia a **"Preguntar disponibilidad por WhatsApp"**.
- Enlace "¿Cuál es mi talla?" que abre la guía en un diálogo (con JS) o lleva a la página de guía de tallas (sin JS). Solo en tenis.
- Ficha de gorra (plantilla `product.gorra`): sin selector de talla, sin guía y sin "(EUR)"; conserva el selector de color si la gorra tiene variantes de color.
- Botones "Agregar al carrito" y "Pedir por WhatsApp", con el aviso de tratamiento de datos debajo.
- Desplegable "Envíos y cambios" que enlaza a las políticas publicadas en el admin, sin copiar sus condiciones en el código.
- Barra fija de compra en celular.
- Bloques editables: nombre, precio, opciones y tallas, botones, descripción, texto, desplegable, bloque de app y espacio para "Arma tu combo".

## Fuera de alcance

- Lógica y contenido del bloque "Arma tu combo" (SPEC-005 / SPEC-006).
- Cálculo de cuotas e instalación de las apps de Addi y Sistecrédito (SPEC-007).
- Aviso de reposición por correo con una app (decisión del equipo: solo WhatsApp al lanzar). Si se retoma, se agrega con una nota en esta spec y un runbook.
- Tablas de tallas por horma o por modelo: hay una sola tabla para todos los tenis.
- Guía de tallas de gorras (son de talla única o ajustable).
- Redacción de las políticas de envío, cambios, retracto y garantía (SPEC-010, con contenido-copy y cumplimiento).
- Carga de las medidas reales de la guía: requisito de lanzamiento (SPEC-011), no de esta spec.
- Carrito lateral al agregar (SPEC-006). Mientras tanto, "Agregar al carrito" envía el formulario y lleva a `/cart`.
- Reseñas con foto (RF-31) y lista de deseos (RF-30), fase 2.
- Cambiar el sistema de tallas a US o UK con un interruptor: la talla se elige siempre en EUR y las demás medidas se muestran como equivalencia.

## Qué se programa y qué se configura

| Pieza | Tipo | Quién |
| --- | --- | --- |
| Fotos (mínimo 5), video, `alt` en español sin marcas de terceros, precios con IVA incluido, precio anterior, variantes Talla y Color (tenis) o solo Color (gorras), inventario | Admin (producto o CSV) | Equipo, con `docs/operaciones/cargar-productos.md` |
| Metaobjeto `guia_tallas` (campos `eur`, `cm`, `us`): **una sola tabla** para todos los tenis. Al principio, sin entradas o con la tabla provisional; las medidas reales de los proveedores se cargan antes del lanzamiento | Admin → Contenido → Metaobjetos | Equipo, con `docs/operaciones/configuracion-inicial.md` |
| Plantilla alternativa de producto para gorras (sin selector de talla ni guía) | Editor del tema + asignación en cada gorra | Equipo; el tema entrega la plantilla `product.gorra.json` |
| Página "Guía de tallas" con la plantilla `page.guia-tallas` | Admin → Tienda online → Páginas | Equipo |
| Políticas de envío, cambios (reembolso), privacidad y términos, con sus textos | Admin → Configuración → Políticas | Equipo (textos con contenido-copy y cumplimiento, SPEC-010) |
| "Todos los precios incluyen impuestos" activado | Admin → Configuración → Impuestos y aranceles | Equipo (la empresa es responsable de IVA) |
| Apps de cuotas y su bloque en la ficha | Apps oficiales de Addi y Sistecrédito, agregadas como bloque en el editor | Equipo (SPEC-007) |
| Ajuste "Mostrar mensaje de cuotas" (por defecto apagado) | Editor del tema → Configuración del tema | Equipo, cuando la pasarela esté activa |
| Galería, zoom, selector, equivalencias, barra fija, mensaje de WhatsApp, diálogo de guía, nota "Sujeto a aprobación." | Tema (Liquid, CSS, Web Components) | dev-tema-liquid, disenador-ui |
| Shopify Function | No aplica | — |

## Guía de tallas (RF-06)

- Aclaración destacada al inicio: **la forma más segura es mirar la talla EUR en la etiqueta de un tenis que te quede bien y pedir ese mismo número.**
- Tabla EUR ↔ centímetros de pie ↔ US.
- Pasos para medir el pie en casa: hoja en el piso contra la pared, talón contra la pared, marcar la punta del dedo más largo, medir en centímetros, buscar en la tabla; si queda entre dos tallas, elegir la mayor.
- **Una sola tabla** para todos los tenis, leída del metaobjeto `guia_tallas` (nivel tienda, no por producto) y ordenada por EUR. Si no hay entradas, se usa la tabla de referencia general y se muestra la nota "Tabla de referencia general. Puede variar según el modelo; si tienes dudas, escríbenos por WhatsApp."
- La misma guía aparece en el diálogo de la ficha y en la página "Guía de tallas" (RF-33, SPEC-010).
- **Las medidas reales las entregan los proveedores a través del equipo**; los agentes no inventan medidas. Cargarlas es requisito de lanzamiento (SPEC-011). Esta spec se puede cerrar con la tabla provisional.

## Comportamiento

### Elegir talla y comprar (celular, 360 px)

1. El cliente abre la ficha de un tenis. Ve la primera foto a todo el ancho, el indicador "1 de 6", el nombre, el precio en oro, "IVA incluido." y, si el ajuste está activo, el mensaje de cuotas con "Sujeto a aprobación.".
2. Ve los grupos "Color" y "Talla (EUR)". Cada talla es un botón de al menos 44 × 44 px con el número y, debajo, los centímetros ("41" / "25,8 cm"). La talla preseleccionada es la de `?variant=` o la primera disponible.
3. Al tocar una talla: el botón queda marcado con el filo de oro, la leyenda dice "Talla (EUR): 41", la línea de equivalencia muestra cm y US, el precio se actualiza si cambia y la URL pasa a `?variant=<id>` con `replaceState` (se puede compartir).
4. Toca "Agregar al carrito" y el producto se agrega.
5. Al bajar y dejar de ver el botón de compra aparece una barra fija abajo con nombre corto, talla elegida, precio y "Agregar al carrito". Si no hay talla disponible elegida, el botón de la barra dice "Elegir talla" y lleva al selector. El botón flotante de WhatsApp de SPEC-002 sube para no taparla. La barra respeta "reducir movimiento" (aparece sin deslizarse).

### Ficha de gorra

- Las gorras usan la plantilla `product.gorra` y se cargan sin opción "Talla".
- No hay selector de talla, ni "¿Cuál es mi talla?", ni "(EUR)", ni línea de equivalencia.
- Si la gorra tiene variantes de color, se muestra el grupo "Color" y el mensaje de WhatsApp incluye el color (`Hola, quiero pedir {producto} ({color}): {enlace con ?variant=}`). Si tiene una sola variante, no hay selector y el mensaje no lleva paréntesis.
- La barra fija en celular muestra el color en lugar de la talla, o nada si no hay variantes.
- Respaldo: si una gorra llega con una opción de talla de un solo valor (por ejemplo, "Única"), el tema no pinta ese grupo, en cualquier plantilla. En general, una opción con un solo valor no se pinta como selector.

### Talla agotada (RF-07)

- La talla agotada se ve tachada en color de texto secundario y su etiqueta accesible incluye "agotada".
- Se puede tocar. Al elegirla: "Agregar al carrito" queda deshabilitado con el texto "Agotado"; el botón de WhatsApp dice "Preguntar disponibilidad por WhatsApp" y su mensaje es `Hola, avísenme cuando llegue {producto} ({talla} / {color}): {enlace con ?variant=}`.
- No hay aviso por correo ni bloque de app de reposición.
- Si no hay número de WhatsApp configurado, la talla agotada solo muestra "Agotado" deshabilitado (no hay otro canal de aviso).
- Si la combinación de color y talla no existe, el botón dice "Combinación no disponible" y el de WhatsApp pregunta por el producto sin variante.

### WhatsApp en la ficha (RF-21)

- Botón secundario "Pedir por WhatsApp" con el mensaje `Hola, quiero pedir {producto} ({talla} / {color}): {enlace con ?variant=}`.
- Debajo, siempre, el aviso: "Al escribirnos por WhatsApp aceptas el tratamiento de tus datos según nuestra política de datos.", con enlace a la política de privacidad del admin si existe.
- Si no hay número configurado, no aparecen el botón ni el aviso.

### Precio, IVA y cuotas (RF-18, RNF-10)

- Bajo el precio: "IVA incluido." cuando `cart.taxes_included` es verdadero. Con la configuración decidida por el equipo siempre aparece; la condición queda como protección si el admin se configura distinto.
- Ajuste del tema **"Mostrar mensaje de cuotas"** (`mostrar_cuotas`, casilla, por defecto apagada, con la ayuda "Actívalo solo cuando Addi o Sistecrédito estén activos en tu tienda").
  - Apagado: los bloques de app de cuotas no se pintan aunque estén agregados en el editor, y no aparece "Sujeto a aprobación.".
  - Encendido: se pintan los bloques de app que el equipo haya agregado y, debajo, la nota del tema "Sujeto a aprobación." en texto secundario.
  - Encendido sin ningún bloque de app agregado: no aparece nada (ni la nota sola).
- Si las apps de cuotas resultan ser incrustaciones de app (app embeds) y no bloques, el tema no puede apagarlas: se anota en la tarea 1 y el equipo controla su visibilidad desde la app.

### Envíos y cambios

- El desplegable por defecto "Envíos y cambios" tiene un texto neutro ("Consulta nuestras condiciones de envío y de cambios.") y enlaces a las políticas de envío y de cambios publicadas en el admin (`shop.shipping_policy`, `shop.refund_policy`). Si una política no está publicada, su enlace no aparece; si no hay ninguna, el desplegable no aparece.
- El tema **no escribe** plazos, cobertura, quién paga el envío ni estados del producto. Esas condiciones viven en las políticas del admin (ver "Notas y decisiones").

### Galería y zoom (RF-04)

- Celular: deslizar con el dedo (scroll-snap), indicador "N de total" actualizado y anunciado de forma discreta. Escritorio: fotos apiladas; la columna de información queda fija al hacer scroll.
- Zoom: tocar o hacer clic en una foto abre un diálogo a pantalla completa con la foto en alta resolución (2048 px). En celular se puede pellizcar para ampliar (zoom nativo del navegador); en escritorio, un clic alterna entre ajuste a la pantalla y tamaño 2×. Se cierra con "Cerrar", Escape o el gesto de volver, y el foco vuelve a la foto.
- Video: se muestra en su posición de la galería con controles, silenciado, `playsinline`, `preload="none"` e imagen previa; nunca se reproduce solo con "reducir movimiento" activado.
- Sin JS: las fotos se ven en lista deslizable y el zoom no está disponible (cada foto sigue visible).

### Guía de tallas

- Con JS, "¿Cuál es mi talla?" abre un `<dialog>` modal: el foco entra al diálogo, Escape o "Cerrar" lo cierran y el foco vuelve al enlace. Sin JS, es un enlace a la página de guía de tallas.
- Solo aparece en productos con opción de talla en EUR (tenis). En gorras no aparece.

### Sin JavaScript

- El formulario sigue funcionando con un `<select>` de variantes, con las agotadas deshabilitadas y marcadas "(agotado)". El botón de WhatsApp lleva el mensaje de la variante inicial.

### Casos borde

- Producto con una sola variante: no hay selector; los botones funcionan igual.
- Producto totalmente agotado: "Agotado" deshabilitado y "Preguntar disponibilidad por WhatsApp".
- Producto sin fotos: marcador de posición 4:5.
- Talla sin entrada en la guía: el botón muestra solo el número EUR y la línea de equivalencia dice "Consulta la guía de tallas".
- Guía sin entradas en el metaobjeto (situación esperada hasta que lleguen las medidas reales): se usa la tabla provisional con su nota.
- Precio con descuento: precio en oro y anterior tachado con "Antes" para lectores de pantalla.
- Gorra asignada por error a la plantilla de tenis: como no tiene opción "Talla", tampoco muestra selector de talla, guía ni "(EUR)".

## Datos y configuración

- Metaobjeto `guia_tallas` (lo crea el equipo con el runbook): una entrada por talla con `eur` (texto), `cm` (decimal) y `us` (texto). Una sola tabla para toda la tienda.
- Opción de variante llamada "Talla" en tenis (el tema detecta también "Size" y "Tallas") y opción "Color". Las gorras no llevan opción "Talla".
- Ajuste del bloque "Opciones y tallas": "Mostrar guía de tallas" (por defecto sí) y "Página de guía de tallas" (selector de página, para el enlace sin JS).
- Ajuste de la sección: "Mostrar barra fija de compra en celular" (por defecto sí).
- Ajuste global del tema: `mostrar_cuotas` (casilla, por defecto apagada).
- Plantilla `product.json` (tenis, con guía) y `product.gorra.json` (sin selector de talla ni guía).
- Bloque "Desplegable" con título y contenido editables. Por defecto, "Envíos y cambios" con enlaces a las políticas de envío y de cambios del admin, **sin prometer condiciones** en el código.
- Ajustes globales usados: `whatsapp_numero` (SPEC-002).
- Admin: "Todos los precios incluyen impuestos" activado; políticas de envío, cambios y privacidad publicadas (SPEC-010).

## Criterios de aceptación

Salvo que se indique otra cosa, cada criterio se verifica con Playwright en cuatro combinaciones: **360 px oscuro, 360 px claro, 1280 px oscuro y 1280 px claro**, en la tienda de desarrollo con un tenis de prueba con tallas 38 a 44, colores Negro y Blanco, 6 fotos y 1 video, y una gorra de prueba sin opción "Talla" con colores Negro y Blanco. Los datos de tallas de los criterios son de prueba, no medidas reales. La columna "Prototipo" dice qué ya cumple el código de referencia (no cuenta como implementación aprobada).

| # | Criterio | Prototipo |
| --- | --- | --- |
| C1 | [x] Dado el tenis de prueba con 6 fotos y 1 video, cuando abro la ficha, entonces a 360 px puedo deslizar entre los 7 medios y veo el indicador "1 de 7"; a 1280 px veo los 7 apilados y la información fija al hacer scroll. | Parcial: deslizable y apilado sí; falta el indicador |
| C2 | [x] Cuando toco la segunda foto, se abre el zoom a pantalla completa; a 360 px puedo ampliarla con dos dedos; Escape o "Cerrar" lo cierran y el foco vuelve a la foto. | Falta |
| C3 | [x] Con "reducir movimiento" activado, el video no se reproduce solo y la barra fija aparece sin animación. | Parcial: el video no se reproduce solo; falta la barra |
| C4 | [x] El nombre se ve en Pirata One y el precio "$189.900" en oro; con precio anterior de $229.900, se ve tachado. | Cumple |
| C5 | [x] Dado el admin con "Todos los precios incluyen impuestos" activado, entonces bajo el precio de $189.900 dice "IVA incluido."; dado el admin sin esa opción, no aparece. | Cumple |
| C6 | [x] Dada la guía con la talla 41 = 25,8 cm y US 8, cuando elijo la 41, entonces el botón muestra "41" y debajo "25,8 cm", la leyenda dice "Talla (EUR): 41" y la línea de equivalencia muestra "25,8 cm de pie · US 8". | Parcial: número y cm sí; falta la línea con US |
| C7 | [x] Cuando elijo la 41, la URL cambia a `?variant=<id de la 41>` y, al abrir esa URL en otra pestaña, la 41 está preseleccionada. | Cumple |
| C8 | [x] Dado el tenis con la talla 42 agotada en Negro, cuando abro la ficha en Negro, entonces la 42 se ve tachada y un lector de pantalla la anuncia como agotada. | Cumple |
| C9 | [x] Cuando toco la 42 agotada, entonces "Agregar al carrito" queda deshabilitado con el texto "Agotado" y el botón de WhatsApp dice "Preguntar disponibilidad por WhatsApp", con un mensaje que incluye el nombre, "42", "Negro" y el enlace con `?variant=`; no aparece ningún formulario de aviso por correo. | Cumple |
| C10 | [x] Cuando toco "Pedir por WhatsApp" con la talla 41 en Negro, se abre `wa.me/<número>` con un mensaje que incluye el nombre del producto, "41", "Negro" y el enlace con `?variant=`. | Cumple |
| C11 | [ ] Con número de WhatsApp configurado, bajo el botón de WhatsApp aparece el aviso de tratamiento de datos con enlace a la política de privacidad; sin número, no aparecen ni el botón ni el aviso. | Cumple |
| C12 | [x] Cuando toco "¿Cuál es mi talla?", se abre la guía, el foco entra al diálogo, Escape lo cierra y el foco vuelve al enlace. | Parcial: abre y cierra; falta verificar el regreso del foco |
| C13 | [ ] Sin JavaScript, "¿Cuál es mi talla?" lleva a la página de guía de tallas y el `<select>` permite agregar una talla disponible al carrito. | Parcial: el `<select>` sí; el enlace no funciona sin JS |
| C14 | [ ] La guía muestra primero la aclaración de la etiqueta EUR, luego la tabla y los 5 pasos para medir; sin entradas en el metaobjeto, muestra la tabla provisional con la nota de tabla de referencia general; con 7 entradas cargadas (38 a 44), muestra esas 7 ordenadas por EUR y sin la nota. | Parcial: cumple el caso sin entradas; falta verificar con entradas |
| C15 | [x] Dada la gorra de prueba sin opción "Talla", con la plantilla `product.gorra`, entonces no aparece selector de talla, ni "¿Cuál es mi talla?", ni "(EUR)"; sí aparece el grupo "Color" con Negro y Blanco, y "Pedir por WhatsApp" con Negro elegido envía un mensaje con el nombre, "Negro" y el enlace con `?variant=`. | Falta (hoy una gorra con opción "Talla: Única" muestra "(EUR)" y la guía de tenis) |
| C16 | [ ] Dada una gorra con la opción "Talla: Única" (un solo valor), entonces no se pinta ningún selector de talla ni la guía, con cualquiera de las dos plantillas. | Falta |
| C17 | [x] A 360 px, al bajar más allá del botón "Agregar al carrito", aparece la barra fija con talla elegida, precio y botón; el botón flotante de WhatsApp queda por encima de la barra sin taparla; la barra no aparece a 1280 px. | Falta |
| C18 | [ ] Con "Mostrar mensaje de cuotas" apagado y el bloque de app de cuotas agregado en el editor, entonces bajo el precio no aparece ningún mensaje de cuotas ni "Sujeto a aprobación.". | Falta |
| C19 | [ ] Con "Mostrar mensaje de cuotas" encendido, las apps de Addi y Sistecrédito instaladas y su bloque agregado, entonces el mensaje de cuotas aparece bajo el precio seguido de "Sujeto a aprobación.", en ambos modos y con contraste AA. | Parcial: existe el bloque `@app`; falta el ajuste, la nota y probar con las apps |
| C20 | [x] Todas las tallas, colores y botones miden al menos 44 × 44 px, tienen foco visible con el anillo de foco y se pueden elegir con teclado (flechas dentro del grupo). | Parcial: 44 px de alto sí; verificar ancho y foco en ambos modos |
| C21 | [x] La ficha no tiene desborde horizontal a 360 px con 11 tallas, con el diálogo de guía abierto ni con la barra fija visible. | Sin verificar |
| C22 | [ ] Lighthouse móvil en la ficha del tenis de prueba: la primera foto es el LCP, LCP < 2,5 s, CLS < 0,1 y puntaje ≥ 85. | Sin verificar |
| C23 | [ ] El HTML de la ficha incluye datos estructurados de producto válidos en la prueba de resultados enriquecidos de Google. | Parcial: usa `structured_data`; falta validar |
| C24 | [ ] Dadas las políticas de envío y de cambios publicadas en el admin, el desplegable "Envíos y cambios" muestra un enlace a cada una; sin políticas publicadas, el desplegable no aparece. En ningún caso el código del tema contiene plazos en días, cobertura geográfica ni quién paga el envío (revisión de cumplimiento sobre `templates/product*.json` y la sección). | Falta (hoy dice "Si la talla no te queda, te la cambiamos" y "Enviamos a toda Colombia") |
| C25 | [x] Ningún valor de color, tamaño, espaciado o radio de los componentes nuevos está fuera de `tokens.css`, y ningún `alt`, texto de ejemplo o dato de prueba contiene marcas de terceros (revisión de qa-calidad y cumplimiento). | Cumple en lo existente |

## Plan

Cada tarea cabe en menos de un día. Las tareas 1 a 3 desbloquean el resto.

1. [x] **Verificar plataforma** (dev-tema-liquid, con el MCP `shopify-dev`): `image_tag` con `fetchpriority`; regreso del foco al cerrar `<dialog>`; si las apps de Addi y Sistecrédito entregan bloque de app o incrustación (define si `mostrar_cuotas` puede apagarlas); si `variant` en JSON trae inventario sin exponer datos de más; nombres actuales de `shop.shipping_policy` y `shop.refund_policy`. Anotar en "Notas y decisiones".
2. [x] **Corregir textos que prometen políticas** (contenido-copy + cumplimiento): el desplegable por defecto de `templates/product.json` pasa al texto neutro con enlaces a las políticas del admin y se oculta si no hay políticas (C24). Traer antes la versión de `prod` de los JSON del editor.
3. [x] **Plantilla de gorras** (dev-tema-liquid): `templates/product.gorra.json` sin selector de talla ni guía; la etiqueta "(EUR)" y la guía solo aparecen cuando hay opción de talla con valores EUR; una opción de un solo valor no se pinta como selector (C15, C16).
4. [x] **Runbook de gorras y datos de prueba** (operaciones-shopify): cargar gorras sin opción "Talla", asignar la plantilla `product.gorra` y quitar "Talla: Única" de `docs/operaciones/plantilla-productos.csv` (coordinado con la tarea 3 de SPEC-003).
5. [x] **Datos de la guía independientes del diálogo** (dev-tema-liquid): los centímetros y la equivalencia salen de un JSON de la guía aunque "Mostrar guía de tallas" esté apagado; una sola tabla ordenada por EUR (C14).
6. [x] **Línea de equivalencia** EUR · cm · US de la talla elegida y caso "Consulta la guía de tallas" (dev-tema-liquid + contenido-copy) (C6).
7. [x] **Enlace sin JS a la página de guía** con ajuste de página en el bloque, y regreso del foco al cerrar el diálogo (dev-tema-liquid) (C12, C13).
8. [x] **Mensaje de cuotas detrás de un ajuste** (dev-tema-liquid + contenido-copy): casilla `mostrar_cuotas` en `settings_schema.json` (apagada por defecto, con texto de ayuda), pintar los bloques `@app` de cuotas solo si está activa y la nota "Sujeto a aprobación." solo si hay al menos un bloque (C18, C19).
9. [x] **Indicador de galería** "N de total" en celular con `IntersectionObserver` (dev-tema-liquid + disenador-ui) (C1).
10. [x] **Zoom** en diálogo a pantalla completa, pellizco nativo en celular y 2× en escritorio (dev-tema-liquid + disenador-ui) (C2).
11. [x] **LCP**: primera foto con prioridad alta y tamaños correctos; video con imagen previa (dev-tema-liquid) (C22).
12. [x] **Barra fija de compra** en celular con ajuste de sección, coordinada con el flotante de WhatsApp de SPEC-002 y "reducir movimiento"; en gorras muestra el color (dev-tema-liquid + disenador-ui) (C3, C17).
13. [x] **Accesibilidad del selector** (dev-tema-liquid): 44 × 44 px, flechas dentro del grupo, texto "agotada"/"agotado" según la opción, y WhatsApp coherente cuando la combinación no existe (C8, C20).
14. [x] **Espacio del bloque "Arma tu combo"** (dev-tema-liquid): solo el bloque vacío en el esquema, sin lógica, a la espera de SPEC-005.
15. [ ] **Runbook de impuestos y activación de cuotas** (operaciones-shopify): activar "Todos los precios incluyen impuestos" y, cuando SPEC-007 confirme la pasarela activa, encender `mostrar_cuotas` y agregar los bloques de app (C5, C19).
16. [ ] **Prueba con apps de cuotas** (qa-calidad, cuando SPEC-007 las active) (C19).
17. [ ] **QA** (qa-calidad): Theme Check, Playwright en las cuatro combinaciones, Lighthouse móvil, teclado, lector de pantalla y prueba de resultados enriquecidos (C15, C16, C18, C20 a C25).

## Notas y decisiones

- La tabla de referencia usa la equivalencia general EUR = 1,5 × (largo del pie en cm + 1,5). Varía por horma: es provisional y así lo dice la tienda hasta que el equipo cargue las medidas reales que entreguen los proveedores. Cargarlas es un punto del checklist de lanzamiento (SPEC-011); hoy SPEC-011 no lo lista y hay que agregarlo allá.
- **13 nov 2026, incorporado desde SPEC-002 (correcciones de cumplimiento):** aviso de tratamiento de datos junto al botón de WhatsApp (`snippets/aviso-datos-whatsapp.liquid`); "IVA incluido." condicionado a `cart.taxes_included`; para variantes agotadas el botón dice "Preguntar disponibilidad por WhatsApp" (reemplaza "Avísame por WhatsApp" de la versión anterior de esta spec). El prototipo ya tiene los tres cambios.
- **13 nov 2026, revisión del prototipo:** el precio va en oro (`--color-oro`), no en plata como decía la versión anterior; así lo define CLAUDE.md y así está el prototipo. En escritorio, la galería queda apilada en una columna (como el prototipo) en lugar de miniaturas: deja ver cada foto grande, que es la prioridad visual de la ficha. disenador-ui puede proponer otra cosa en su revisión.
- **13 nov 2026, decisiones del equipo incorporadas** (ver "Respuestas del equipo"):
  - Una sola tabla de tallas en el metaobjeto `guia_tallas`; no se cambia el modelo de datos a tablas por producto.
  - Gorras de talla única o ajustable: sin selector de talla ni guía. La plantilla de prueba que les pone "Talla: Única" se corrige (tarea 4).
  - Reposición solo por WhatsApp. RF-07 permite "WhatsApp o correo", así que se cumple con WhatsApp; el texto del botón es "Preguntar disponibilidad por WhatsApp" en lugar del "Avísame" literal de RF-07.
  - IVA: la empresa es responsable de IVA y carga los precios con IVA incluido; la ficha y el carrito muestran "IVA incluido.".
  - Cuotas (RF-18) dentro del alcance, detrás de `mostrar_cuotas`, que el equipo enciende solo con la pasarela activa (hallazgo I2 de cumplimiento), con la nota "Sujeto a aprobación.".
- **Política de cambio por talla decidida por el equipo** (para el texto de la política del admin, no para el código): 7 días desde que el cliente recibe el pedido para solicitar el cambio y enviar el producto; tenis sin uso y sin defectos; el cliente paga el envío del cambio. La redacta contenido-copy en SPEC-010 y la revisa cumplimiento antes de publicarla: es una política de cambio por talla y no reemplaza el derecho de retracto (Ley 1480, art. 47) ni la garantía legal por defectos, en la que el envío no lo paga el cliente.
- **Cobertura de envío:** el objetivo es toda Colombia; la cobertura de la contraentrega está en averiguación (SPEC-007). La ficha no lo dice en el código; aparece solo en la política de envío del admin cuando esté confirmada.
- El botón flotante de WhatsApp (SPEC-002) y el botón de la ficha conviven: el flotante usa el mensaje general del producto y el de la ficha incluye la variante.

- **14 nov 2026, implementación y tarea 1 (verificación de plataforma):**
  - `image_tag` acepta atributos HTML arbitrarios, así que `fetchpriority: 'high'` va en la primera foto (con `loading: 'eager'`); el resto sigue con `loading: 'lazy'`. Verificado en el HTML de la tienda de desarrollo.
  - Al cerrar un `<dialog>` modal el navegador devuelve el foco al elemento que lo abrió; el tema además lo asegura con un respaldo en `theme.js`. Verificado con Escape y con "Cerrar" (guía y zoom).
  - `shop.shipping_policy` y `shop.refund_policy` existen como objetos `policy` (con `.url`); si la política no está publicada son vacíos. También `shop.privacy_policy`.
  - `product.variants | json` no trae cantidades de inventario (solo `available`, `inventory_management`, SKU, código de barras y reglas de cantidad). No expone existencias.
  - Addi y Sistecrédito: no se pudo comprobar en la documentación si entregan **bloque de app** o **incrustación de app** (cada app lo decide). El tema se preparó para bloques: la casilla `mostrar_cuotas` solo controla los bloques de app que el equipo ponga justo debajo del bloque "Mensaje de cuotas" (los bloques de app que van antes o después, como reseñas, no se afectan). Si resultan ser incrustaciones, el tema no puede apagarlas y su visibilidad se controla desde la app (Configuración del tema → Incrustaciones de app). Queda para SPEC-007.
  - No existe la rama `origin/prod` en el repositorio todavía, así que no hubo versión del editor con la cual comparar `templates/product.json`. Cuando exista, hay que traer el JSON de `prod` antes de unir esta rama.
- **14 nov 2026, decisiones de implementación:**
  - Nuevo bloque "Envíos y cambios" (`politicas`): texto neutro editable más enlaces automáticos a `shop.shipping_policy` y `shop.refund_policy`; si no hay ninguna política publicada, el bloque no se pinta. El bloque "Desplegable" genérico se conserva (ahora con el título por defecto "Más información" y sin enlaces).
  - Nuevo bloque "Mensaje de cuotas" (`cuotas`): marcador a partir del cual los bloques de app consecutivos se consideran de cuotas. Sin este marcador no hay forma de saber cuál bloque de app es de cuotas.
  - Nuevo bloque "Arma tu combo (reservado)" (`combo`): solo un contenedor vacío, sin lógica; no se pinta en productos de gama alta. En el editor no se ve nada hasta que SPEC-005 lo llene.
  - Sello en la ficha: "Noctra Premium" (ajuste `gama_premium_valor` y metacampo `custom.gama`) o "Combo" (etiqueta `combo` en minúsculas), nunca los dos, igual que la tarjeta.
  - La guía de tallas se pinta como JSON aparte (`snippets/guia-tallas-json.liquid`) aunque "Mostrar guía de tallas" esté apagado. Orden por EUR con clave numérica en Liquid.
  - Una opción de un solo valor queda oculta (`hidden`) pero marcada, para que la variante siga resolviéndose. "(EUR)", la línea de equivalencia y "¿Cuál es mi talla?" solo salen si la opción es de talla, tiene más de un valor y algún valor es numérico.
  - Plantilla `product.gorra.json`: sin guía, con el texto "Ajustable" en un bloque "Texto" (editable en el editor).
  - La barra fija de compra reacciona al scroll (no a `IntersectionObserver`): un salto largo se saltaba el botón sin avisar. En productos cortos (sin descripción) puede que nunca aparezca, porque el botón no llega a salir de la pantalla.
  - Mensaje de WhatsApp: talla primero y luego las demás opciones con más de un valor; sin paréntesis si el producto tiene una sola variante; combinación inexistente: "Preguntar por WhatsApp" sobre el producto sin variante.
- **14 nov 2026, estado de la verificación** (tienda de desarrollo; productos de prueba A, B y C y una gorra de prueba; 360 y 1280 px en oscuro y claro):
  - Verificado en navegador: C1 (indicador, con 3 medios; falta probar con 6 fotos y 1 video), C2 (zoom, Escape, Cerrar, gesto de volver y regreso del foco; el pellizco es nativo del navegador y no se probó en un teléfono real), C3 (transición de la barra en 0 s con "reducir movimiento"), C4, C5 (caso con "IVA incluido."; falta el caso sin la opción en el admin), C6, C7, C8, C9 y C10 (con el número de WhatsApp inyectado solo en la página de prueba, no hay número configurado), C12, C15, C17 (barra con el flotante por encima; no aparece a 1280 px), C20 (flechas dentro del grupo, 44 px de alto, foco visible), C21, C25, C26 y C27.
  - Pendiente: **C11** (aviso de datos con número real; el aviso va dentro del mismo bloque condicionado al número); **C13** (hace falta crear en el admin la página "Guía de tallas" con dirección `guia-de-tallas`; sin ella el enlace queda oculto sin JavaScript); **C14** (con 7 entradas del metaobjeto: el orden se probó solo con la tabla provisional); **C16** (verificado por lectura del código; no hay en la tienda una gorra con "Talla: Única"); **C18** y **C19** (necesitan el bloque de app de cuotas: SPEC-007); **C22** (Lighthouse no se corrió); **C23** (validación de resultados enriquecidos de Google); **C24** (caso sin políticas verificado: el bloque no aparece; falta probar con las políticas publicadas, hoy la tienda de desarrollo no las tiene).
  - Plan: las tareas 15 y 16 quedan para SPEC-007; la 17 (QA) la hace `qa-calidad`.

## Preguntas para el equipo

Siguen abiertas (ninguna bloquea la aprobación de esta spec):

1. **Fecha de las medidas reales:** ¿cuándo estiman tener las medidas de los proveedores? Se necesita para programar la tarea del checklist de lanzamiento (SPEC-011).
2. **Colores de gorras:** ¿cada gorra tendrá variantes de color dentro del mismo producto, o cada color será un producto aparte? Cambia si la ficha de gorra muestra selector de color.
3. **Texto de talla en gorras:** ¿quieren que la ficha de la gorra diga "Talla única" o "Ajustable"? Si es así, ¿lo escriben en la descripción de cada gorra o prefieren un dato fijo por producto (por ejemplo, un metacampo)? Hoy la spec no muestra ninguno de los dos.
4. **Texto de la nota de cuotas:** ¿les sirve "Sujeto a aprobación." o las pasarelas exigen otro texto en sus condiciones de uso? Se confirma con cumplimiento al activar SPEC-007.

### Respuestas del equipo (13 nov 2026)

Registro de las respuestas a la versión anterior de las preguntas. Ya están integradas en el cuerpo de la spec.

1. **Guía de tallas:** **una sola tabla** para todos los tenis, en el metaobjeto `guia_tallas`. Las medidas reales las entregan los proveedores más adelante. Mientras tanto, la guía usa la tabla de referencia marcada como provisional. Cargar las medidas reales es requisito para el lanzamiento (SPEC-011), no para cerrar esta spec.
2. **Gorras:** **talla única o ajustable**. La plantilla de gorra no muestra selector de talla ni guía.
3. **Reposición (RF-07):** **solo WhatsApp** ("Preguntar disponibilidad por WhatsApp"). No se instala app de aviso por correo al lanzar.
4. **Política de cambios y cobertura de envío:**
   - **Cambio de talla:** el cliente tiene **7 días** desde que recibe el pedido para solicitarlo y enviarlo. Los tenis deben estar **sin uso y sin defectos**. El **cliente paga el envío** del cambio.
   - **Cobertura:** el objetivo es enviar a **toda Colombia**. La cobertura de la contraentrega está en averiguación (SPEC-007).
   - Revisión de `cumplimiento` antes de publicar: esta política es de cambio por talla. No reemplaza el derecho de retracto (Ley 1480, art. 47) ni la garantía legal por defectos, en la que el envío no lo paga el cliente.
5. **IVA:** la empresa es **responsable de IVA** y los precios se cargan **con IVA incluido**. La ficha y el carrito muestran "IVA incluido." (el admin debe tener activado "Todos los precios incluyen impuestos").
6. **Cuotas:** el objetivo es lanzar con **Addi y Sistecrédito activos**. El mensaje de cuotas (RF-18) entra en esta spec, pero se muestra solo cuando el equipo lo active en la configuración del tema, después de confirmar que la pasarela está activa (hallazgo I2 de cumplimiento).

### Respuestas del equipo, segunda ronda (13 nov 2026)

1. **Colores de gorras:** cada color es una **variante del mismo producto**. La ficha de gorra muestra el selector de Color (C16).
2. **Talla de gorras:** la ficha de la gorra dice **"Ajustable"**. Como todas las gorras son ajustables, es un texto del bloque de la plantilla de gorra, editable en el editor, con "Ajustable" por defecto. No hace falta un metacampo por producto.
   - Criterio nuevo **C26:** [x] Dada una gorra con dos colores, cuando abro su ficha a 360 px, entonces veo el selector de Color, el texto "Ajustable" y ningún selector de talla ni enlace a la guía.
3. **Noctra Premium:** los tenis de gama alta muestran el sello **"Noctra Premium"** en la ficha y **no muestran** el bloque "Arma tu combo" (RF-08) ni el sello de combo (ver SPEC-003 y SPEC-005).
   - Criterio nuevo **C27:** [x] Dado un tenis con `custom.gama` = "Noctra Premium", cuando abro su ficha, entonces veo el sello "Noctra Premium" y no veo el sello de combo ni el bloque de combo.

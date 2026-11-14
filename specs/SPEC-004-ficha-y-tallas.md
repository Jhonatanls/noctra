# SPEC-004: Ficha de producto y guía de tallas

- **Estado:** borrador (prototipo de referencia en `sections/main-product.liquid`, `snippets/guia-tallas.liquid`, `sections/pagina-guia-tallas.liquid`, `assets/componente-ficha.css` y `assets/theme.js`)
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
| RF-05 | Selector de talla en EUR, con centímetros de pie y talla US de la talla elegida | Tema + metaobjeto `guia_tallas` (admin) |
| RF-06 | Guía de tallas: tabla EUR ↔ cm ↔ US, cómo medir el pie, aclaración de la etiqueta EUR | Snippet `guia-tallas` en diálogo y página `page.guia-tallas` (tema); datos en metaobjeto (admin) |
| RF-07 | Talla agotada visible pero no comprable, con aviso por WhatsApp y, si el equipo lo decide, por correo | Tema (WhatsApp); app de avisos de reposición (admin) para correo |
| RF-18 | Mensaje de cuotas bajo el precio | Bloques de app de Addi y Sistecrédito (las apps calculan; el tema solo deja el espacio) |
| RF-21 | Botón "Pedir por WhatsApp" con producto, talla, color y enlace; el flotante de SPEC-002 no tapa la compra | Tema |
| RNF-01, RNF-02 | La primera foto es el LCP (carga prioritaria), resto diferido; video con imagen previa y `preload="none"` | Tema |
| RNF-03, RNF-05 | Sin desborde a 360 px; tallas de 44 px; diálogo accesible; agotadas anunciadas | Tema |
| RNF-09 | Aviso de tratamiento de datos junto al botón de WhatsApp (decisión del 13 nov 2026) | Snippet `aviso-datos-whatsapp` (tema); política en el admin |
| RNF-10 | Precio final claro: "IVA incluido" solo si el admin tiene impuestos incluidos (decisión del 13 nov 2026); condiciones de envío y cambios enlazadas a las políticas reales | Tema + políticas del admin |
| RNF-13 | Sin marcas de terceros en `alt`, textos de ejemplo, plantillas ni datos de prueba | Tema + contenido |
| RNF-14 | Datos estructurados de producto (`structured_data`) | Tema; SEO general en SPEC-011 |
| RNF-17 | Bloques de la ficha, desplegables y guía de tallas editables desde el editor y los metaobjetos | Editor / admin |

No cubre: el bloque "Arma tu combo" (RF-08), que depende del motor de combos (SPEC-005) y hoy **no tiene criterios de aceptación en ninguna spec**; se recomienda especificarlo en SPEC-005 o SPEC-006. La ficha deja reservado su lugar con un bloque del editor.

## Alcance

- Galería: todas las fotos y videos del producto. En celular, carrusel deslizable a todo el ancho con indicador "1 de 6"; en escritorio, fotos apiladas en una columna junto a la información fija (sticky). Zoom al tocar o hacer clic.
- Nombre en Pirata One con el ornamento debajo; precio en oro (`--color-oro`, clase `.precio`), precio anterior tachado si aplica, y "IVA incluido." debajo solo cuando `cart.taxes_included` es verdadero.
- Espacio para el mensaje de cuotas de Addi y Sistecrédito como **bloques de app** (`@app`). El tema no calcula cuotas.
- Selector de opciones con botones. Para la opción de talla: número EUR y, debajo, los centímetros de pie de la guía; bajo el grupo, una línea con la equivalencia completa de la talla elegida ("Talla 42 EUR · 26,5 cm de pie · US 8,5", con los datos que cargue el equipo).
- Tallas agotadas visibles y tachadas, anunciadas como agotadas a lectores de pantalla y seleccionables para pedir información: "Agregar al carrito" se desactiva y dice "Agotado", y el botón de WhatsApp cambia a **"Preguntar disponibilidad por WhatsApp"**.
- Enlace "¿Cuál es mi talla?" que abre la guía en un diálogo (con JS) o lleva a la página de guía de tallas (sin JS).
- Botones "Agregar al carrito" y "Pedir por WhatsApp", con el aviso de tratamiento de datos debajo.
- Barra fija de compra en celular.
- Bloques editables: nombre, precio, opciones y tallas, botones, descripción, texto, desplegable, bloque de app y espacio para "Arma tu combo".

## Fuera de alcance

- Lógica y contenido del bloque "Arma tu combo" (SPEC-005 / SPEC-006).
- Cálculo de cuotas (lo hacen las apps de Addi y Sistecrédito, SPEC-007).
- Carrito lateral al agregar (SPEC-006). Mientras tanto, "Agregar al carrito" envía el formulario y lleva a `/cart`.
- Reseñas con foto (RF-31) y lista de deseos (RF-30), fase 2.
- Cambiar el sistema de tallas a US o UK con un interruptor: la talla se elige siempre en EUR y las demás medidas se muestran como equivalencia.

## Qué se programa y qué se configura

| Pieza | Tipo | Quién |
| --- | --- | --- |
| Fotos (mínimo 5), video, `alt` en español sin marcas de terceros, precios, precio anterior, variantes Talla y Color, inventario | Admin (producto o CSV) | Equipo, con `docs/operaciones/cargar-productos.md` |
| Metaobjeto `guia_tallas` (campos `eur`, `cm`, `us`) con medidas reales | Admin → Contenido → Metaobjetos | Equipo, con `docs/operaciones/configuracion-inicial.md` |
| Plantilla alternativa de producto para gorras (sin guía de tallas de tenis) | Editor del tema + asignación en cada producto | Equipo; el tema entrega la plantilla `product.gorra.json` |
| Página "Guía de tallas" con la plantilla `page.guia-tallas` | Admin → Tienda online → Páginas | Equipo |
| Políticas de envío, cambios y privacidad | Admin → Configuración → Políticas | Equipo (textos con contenido-copy y cumplimiento) |
| Impuestos incluidos en el precio | Admin → Configuración → Impuestos | Equipo, según su régimen |
| Mensaje de cuotas | Apps oficiales de Addi y Sistecrédito, agregadas como bloque en el editor | Equipo (SPEC-007) |
| Avisos de reposición por correo (si se decide) | App de la Shopify App Store | Equipo, con runbook de operaciones-shopify |
| Galería, zoom, selector, equivalencias, barra fija, mensaje de WhatsApp, diálogo de guía | Tema (Liquid, CSS, Web Components) | dev-tema-liquid, disenador-ui |
| Shopify Function | No aplica | — |

## Guía de tallas (RF-06)

- Aclaración destacada al inicio: **la forma más segura es mirar la talla EUR en la etiqueta de un tenis que te quede bien y pedir ese mismo número.**
- Tabla EUR ↔ centímetros de pie ↔ US.
- Pasos para medir el pie en casa: hoja en el piso contra la pared, talón contra la pared, marcar la punta del dedo más largo, medir en centímetros, buscar en la tabla; si queda entre dos tallas, elegir la mayor.
- Los datos salen del metaobjeto `guia_tallas`, ordenados por EUR. Si no hay entradas, se usa la tabla de referencia general y se muestra la nota "Tabla de referencia general. Puede variar según el modelo; si tienes dudas, escríbenos por WhatsApp."
- La misma guía aparece en el diálogo de la ficha y en la página "Guía de tallas" (RF-33, SPEC-010).
- **Las medidas reales por horma las entrega el equipo**; los agentes no inventan medidas.

## Comportamiento

### Elegir talla y comprar (celular, 360 px)

1. El cliente abre la ficha de un tenis. Ve la primera foto a todo el ancho, el indicador "1 de 6", el nombre, el precio en oro, "IVA incluido." si aplica y, si las apps están activas, el mensaje de cuotas.
2. Ve los grupos "Color" y "Talla (EUR)". Cada talla es un botón de al menos 44 × 44 px con el número y, debajo, los centímetros ("41" / "25,8 cm"). La talla preseleccionada es la de `?variant=` o la primera disponible.
3. Al tocar una talla: el botón queda marcado con el filo de oro, la leyenda dice "Talla (EUR): 41", la línea de equivalencia muestra cm y US, el precio se actualiza si cambia y la URL pasa a `?variant=<id>` con `replaceState` (se puede compartir).
4. Toca "Agregar al carrito" y el producto se agrega.
5. Al bajar y dejar de ver el botón de compra aparece una barra fija abajo con nombre corto, talla elegida, precio y "Agregar al carrito". Si no hay talla disponible elegida, el botón de la barra dice "Elegir talla" y lleva al selector. El botón flotante de WhatsApp de SPEC-002 sube para no taparla. La barra respeta "reducir movimiento" (aparece sin deslizarse).

### Talla agotada (RF-07)

- La talla agotada se ve tachada en color de texto secundario y su etiqueta accesible incluye "agotada".
- Se puede tocar. Al elegirla: "Agregar al carrito" queda deshabilitado con el texto "Agotado"; el botón de WhatsApp dice "Preguntar disponibilidad por WhatsApp" y su mensaje es `Hola, avísenme cuando llegue {producto} ({talla} / {color}): {enlace con ?variant=}`.
- Si el equipo activa la app de avisos por correo, su bloque aparece bajo los botones solo para variantes agotadas (el comportamiento lo da la app).
- Si la combinación de color y talla no existe, el botón dice "Combinación no disponible" y el de WhatsApp pregunta por el producto sin variante.

### WhatsApp en la ficha (RF-21)

- Botón secundario "Pedir por WhatsApp" con el mensaje `Hola, quiero pedir {producto} ({talla} / {color}): {enlace con ?variant=}`.
- Debajo, siempre, el aviso: "Al escribirnos por WhatsApp aceptas el tratamiento de tus datos según nuestra política de datos.", con enlace a la política de privacidad del admin si existe.
- Si no hay número configurado, no aparecen el botón ni el aviso.

### Galería y zoom (RF-04)

- Celular: deslizar con el dedo (scroll-snap), indicador "N de total" actualizado y anunciado de forma discreta. Escritorio: fotos apiladas; la columna de información queda fija al hacer scroll.
- Zoom: tocar o hacer clic en una foto abre un diálogo a pantalla completa con la foto en alta resolución (2048 px). En celular se puede pellizcar para ampliar (zoom nativo del navegador); en escritorio, un clic alterna entre ajuste a la pantalla y tamaño 2×. Se cierra con "Cerrar", Escape o el gesto de volver, y el foco vuelve a la foto.
- Video: se muestra en su posición de la galería con controles, silenciado, `playsinline`, `preload="none"` e imagen previa; nunca se reproduce solo con "reducir movimiento" activado.
- Sin JS: las fotos se ven en lista deslizable y el zoom no está disponible (cada foto sigue visible).

### Guía de tallas

- Con JS, "¿Cuál es mi talla?" abre un `<dialog>` modal: el foco entra al diálogo, Escape o "Cerrar" lo cierran y el foco vuelve al enlace. Sin JS, es un enlace a la página de guía de tallas.
- En productos sin opción de talla en EUR (por ejemplo, gorras con la plantilla alternativa) no aparece la guía de tenis ni la etiqueta "(EUR)".

### Sin JavaScript

- El formulario sigue funcionando con un `<select>` de variantes, con las agotadas deshabilitadas y marcadas "(agotado)". El botón de WhatsApp lleva el mensaje de la variante inicial.

### Casos borde

- Producto con una sola variante: no hay selector; los botones funcionan igual.
- Producto totalmente agotado: "Agotado" deshabilitado y "Preguntar disponibilidad por WhatsApp".
- Producto sin fotos: marcador de posición 4:5.
- Talla sin entrada en la guía: el botón muestra solo el número EUR y la línea de equivalencia dice "Consulta la guía de tallas".
- Precio con descuento: precio en oro y anterior tachado con "Antes" para lectores de pantalla.

## Datos y configuración

- Metaobjeto `guia_tallas` (lo crea el equipo con el runbook): una entrada por talla con `eur` (texto), `cm` (decimal) y `us` (texto).
- Opción de variante llamada "Talla" (el tema detecta también "Size" y "Tallas") y opción "Color".
- Ajuste del bloque "Opciones y tallas": "Mostrar guía de tallas" (por defecto sí) y "Página de guía de tallas" (selector de página, para el enlace sin JS).
- Ajuste de la sección: "Mostrar barra fija de compra en celular" (por defecto sí).
- Plantilla `product.json` (tenis, con guía) y `product.gorra.json` (sin guía de tenis).
- Bloque "Desplegable" con título y contenido editables. Por defecto, "Envíos y cambios" con enlaces a las políticas de envío y de cambios del admin, **sin prometer condiciones** que el equipo no haya publicado.
- Ajustes globales usados: `whatsapp_numero` (SPEC-002).

## Criterios de aceptación

Salvo que se indique otra cosa, cada criterio se verifica con Playwright en cuatro combinaciones: **360 px oscuro, 360 px claro, 1280 px oscuro y 1280 px claro**, en la tienda de desarrollo con un tenis de prueba con tallas 38 a 44, colores Negro y Blanco, 6 fotos y 1 video, y una gorra de prueba. La columna "Prototipo" dice qué ya cumple el código de referencia (no cuenta como implementación aprobada).

| # | Criterio | Prototipo |
| --- | --- | --- |
| C1 | [ ] Dado el tenis de prueba con 6 fotos y 1 video, cuando abro la ficha, entonces a 360 px puedo deslizar entre los 7 medios y veo el indicador "1 de 7"; a 1280 px veo los 7 apilados y la información fija al hacer scroll. | Parcial: deslizable y apilado sí; falta el indicador |
| C2 | [ ] Cuando toco la segunda foto, se abre el zoom a pantalla completa; a 360 px puedo ampliarla con dos dedos; Escape o "Cerrar" lo cierran y el foco vuelve a la foto. | Falta |
| C3 | [ ] Con "reducir movimiento" activado, el video no se reproduce solo y la barra fija aparece sin animación. | Parcial: el video no se reproduce solo; falta la barra |
| C4 | [ ] El nombre se ve en Pirata One y el precio "$189.900" en oro; con precio anterior de $229.900, se ve tachado. | Cumple |
| C5 | [ ] Dado el admin con impuestos incluidos en el precio, entonces bajo el precio dice "IVA incluido."; dado el admin sin impuestos incluidos, no aparece. | Cumple |
| C6 | [ ] Dada la guía con la talla 41 = 25,8 cm y US 8, cuando elijo la 41, entonces el botón muestra "41" y debajo "25,8 cm", la leyenda dice "Talla (EUR): 41" y la línea de equivalencia muestra "25,8 cm de pie · US 8". (Datos de prueba, no medidas reales.) | Parcial: número y cm sí; falta la línea con US |
| C7 | [ ] Cuando elijo la 41, la URL cambia a `?variant=<id de la 41>` y, al abrir esa URL en otra pestaña, la 41 está preseleccionada. | Cumple |
| C8 | [ ] Dado el tenis con la talla 42 agotada en Negro, cuando abro la ficha en Negro, entonces la 42 se ve tachada y un lector de pantalla la anuncia como agotada. | Cumple |
| C9 | [ ] Cuando toco la 42 agotada, entonces "Agregar al carrito" queda deshabilitado con el texto "Agotado" y el botón de WhatsApp dice "Preguntar disponibilidad por WhatsApp", con un mensaje que incluye el nombre, "42", "Negro" y el enlace con `?variant=`. | Cumple |
| C10 | [ ] Cuando toco "Pedir por WhatsApp" con la talla 41 en Negro, se abre `wa.me/<número>` con un mensaje que incluye el nombre del producto, "41", "Negro" y el enlace con `?variant=`. | Cumple |
| C11 | [ ] Con número de WhatsApp configurado, bajo el botón de WhatsApp aparece el aviso de tratamiento de datos con enlace a la política de privacidad; sin número, no aparecen ni el botón ni el aviso. | Cumple |
| C12 | [ ] Cuando toco "¿Cuál es mi talla?", se abre la guía, el foco entra al diálogo, Escape lo cierra y el foco vuelve al enlace. | Parcial: abre y cierra; falta verificar el regreso del foco |
| C13 | [ ] Sin JavaScript, "¿Cuál es mi talla?" lleva a la página de guía de tallas y el `<select>` permite agregar una talla disponible al carrito. | Parcial: el `<select>` sí; el enlace no funciona sin JS |
| C14 | [ ] La guía muestra primero la aclaración de la etiqueta EUR, luego la tabla y los 5 pasos para medir; sin entradas en el metaobjeto, muestra la nota de tabla de referencia general. | Cumple |
| C15 | [ ] Dada la gorra de prueba con la plantilla `product.gorra`, entonces no aparece "¿Cuál es mi talla?" ni "(EUR)". | Falta (hoy una gorra con opción "Talla: Única" muestra "(EUR)" y la guía de tenis) |
| C16 | [ ] A 360 px, al bajar más allá del botón "Agregar al carrito", aparece la barra fija con talla elegida, precio y botón; el botón flotante de WhatsApp queda por encima de la barra sin taparla; la barra no aparece a 1280 px. | Falta |
| C17 | [ ] Con las apps de Addi y Sistecrédito instaladas y su bloque agregado en el editor, el mensaje de cuotas aparece bajo el precio en ambos modos y es legible (contraste AA). | Parcial: existe el bloque `@app`; falta probar con las apps |
| C18 | [ ] Todas las tallas, colores y botones miden al menos 44 × 44 px, tienen foco visible con el anillo de foco y se pueden elegir con teclado (flechas dentro del grupo). | Parcial: 44 px de alto sí; verificar ancho y foco en ambos modos |
| C19 | [ ] La ficha no tiene desborde horizontal a 360 px con 11 tallas, con el diálogo de guía abierto ni con la barra fija visible. | Sin verificar |
| C20 | [ ] Lighthouse móvil en la ficha del tenis de prueba: la primera foto es el LCP, LCP < 2,5 s, CLS < 0,1 y puntaje ≥ 85. | Sin verificar |
| C21 | [ ] El HTML de la ficha incluye datos estructurados de producto válidos en la prueba de resultados enriquecidos de Google. | Parcial: usa `structured_data`; falta validar |
| C22 | [ ] El desplegable de envíos y cambios por defecto no promete condiciones: enlaza a las políticas publicadas en el admin. | Falta (hoy dice "Si la talla no te queda, te la cambiamos" y "Enviamos a toda Colombia") |
| C23 | [ ] Ningún valor de color, tamaño, espaciado o radio de los componentes nuevos está fuera de `tokens.css`, y ningún `alt`, texto de ejemplo o dato de prueba contiene marcas de terceros (revisión de qa-calidad y cumplimiento). | Cumple en lo existente |

## Plan

Cada tarea cabe en menos de un día. Las tareas 1 a 3 desbloquean el resto.

1. [ ] **Verificar plataforma** (dev-tema-liquid, con el MCP `shopify-dev`): `image_tag` con `fetchpriority`, regreso del foco al cerrar `<dialog>`, forma de los bloques de app de Addi y Sistecrédito (bloque o incrustación), y si `variant` en JSON trae inventario sin exponer datos de más. Anotar en "Notas y decisiones".
2. [ ] **Corregir textos que prometen políticas** (contenido-copy + cumplimiento): el desplegable por defecto de `templates/product.json` enlaza a las políticas del admin en vez de prometer cambios o cobertura (C22). Traer antes la versión de `prod` de los JSON del editor.
3. [ ] **Plantilla de gorras** (dev-tema-liquid): `templates/product.gorra.json` sin guía de tenis, y que la etiqueta "(EUR)" y la guía solo aparezcan cuando la opción de talla tenga valores numéricos EUR (C15). Runbook corto para asignar la plantilla (operaciones-shopify).
4. [ ] **Datos de la guía independientes del diálogo** (dev-tema-liquid): los centímetros y la equivalencia salen de un JSON de la guía aunque "Mostrar guía de tallas" esté apagado; orden por EUR.
5. [ ] **Línea de equivalencia** EUR · cm · US de la talla elegida y caso "Consulta la guía de tallas" (dev-tema-liquid + contenido-copy) (C6).
6. [ ] **Enlace sin JS a la página de guía** con ajuste de página en el bloque, y regreso del foco al cerrar el diálogo (dev-tema-liquid) (C12, C13).
7. [ ] **Indicador de galería** "N de total" en celular con `IntersectionObserver` (dev-tema-liquid + disenador-ui) (C1).
8. [ ] **Zoom** en diálogo a pantalla completa, pellizco nativo en celular y 2× en escritorio (dev-tema-liquid + disenador-ui) (C2).
9. [ ] **LCP**: primera foto con prioridad alta y tamaños correctos; video con imagen previa (dev-tema-liquid) (C20).
10. [ ] **Barra fija de compra** en celular con ajuste de sección, coordinada con el flotante de WhatsApp de SPEC-002 y "reducir movimiento" (dev-tema-liquid + disenador-ui) (C3, C16).
11. [ ] **Accesibilidad del selector** (dev-tema-liquid): 44 × 44 px, flechas dentro del grupo, texto "agotada"/"agotado" según la opción, y WhatsApp coherente cuando la combinación no existe (C8, C18).
12. [ ] **Espacio del bloque "Arma tu combo"** (dev-tema-liquid): solo el bloque vacío en el esquema, sin lógica, a la espera de SPEC-005.
13. [ ] **Runbook de avisos por correo** (operaciones-shopify), solo si el equipo lo decide (pregunta 3).
14. [ ] **Prueba con apps de cuotas** (qa-calidad, cuando SPEC-007 las active) (C17).
15. [ ] **QA** (qa-calidad): Theme Check, Playwright en las cuatro combinaciones, Lighthouse móvil, teclado, lector de pantalla y prueba de resultados enriquecidos (C18 a C21, C23).

## Notas y decisiones

- La tabla de referencia usa la equivalencia general EUR = 1,5 × (largo del pie en cm + 1,5). Varía por horma: es provisional y así lo dice la tienda hasta que el equipo cargue medidas reales.
- **13 nov 2026, incorporado desde SPEC-002 (correcciones de cumplimiento):** aviso de tratamiento de datos junto al botón de WhatsApp (`snippets/aviso-datos-whatsapp.liquid`); "IVA incluido." condicionado a `cart.taxes_included`; para variantes agotadas el botón dice "Preguntar disponibilidad por WhatsApp" (reemplaza "Avísame por WhatsApp" de la versión anterior de esta spec). El prototipo ya tiene los tres cambios.
- **13 nov 2026, revisión del prototipo:** el precio va en oro (`--color-oro`), no en plata como decía la versión anterior; así lo define CLAUDE.md y así está el prototipo. En escritorio, la galería queda apilada en una columna (como el prototipo) en lugar de miniaturas: deja ver cada foto grande, que es la prioridad visual de la ficha. disenador-ui puede proponer otra cosa en su revisión.
- La plantilla de prueba de productos (`docs/operaciones/plantilla-productos.csv`) pone a la gorra la opción "Talla: Única"; con el prototipo actual eso muestra "(EUR)" y la guía de tenis en la gorra (tarea 3).
- El botón flotante de WhatsApp (SPEC-002) y el botón de la ficha conviven: el flotante usa el mensaje general del producto y el de la ficha incluye la variante.

## Preguntas para el equipo

Decisiones necesarias para aprobar esta spec:

1. **Medidas de la guía:** ¿tendrán una sola tabla para todos los tenis o tablas distintas por horma o modelo? Si son distintas, la guía debe leerse por producto y cambia el modelo de datos. ¿Cuándo pueden entregar las medidas reales?
2. **Tallas de gorras:** ¿las gorras son talla única o ajustable, o tienen tallas por medida de cabeza? Si tienen tallas, ¿necesitan su propia guía?
3. **Aviso de reposición por correo (RF-07):** ¿lanzan solo con "Preguntar disponibilidad por WhatsApp" o también quieren aviso por correo con una app de la tienda de apps de Shopify (puede tener costo mensual)?
4. **Política de cambios por talla y cobertura de envío:** ¿cuáles son las condiciones reales (plazo, estado del producto, quién paga el envío del cambio) y a qué ciudades envían? Hasta tenerlas, la ficha solo enlaza a las políticas publicadas.
5. **Régimen de IVA:** ¿la empresa es responsable de IVA y los precios se cargan con IVA incluido? Define si aparece "IVA incluido." en la ficha.
6. **Mensaje de cuotas:** ¿Addi y Sistecrédito estarán activos al lanzar? Si no, la ficha sale sin mensaje de cuotas y RF-18 queda pendiente para cuando SPEC-007 los active.

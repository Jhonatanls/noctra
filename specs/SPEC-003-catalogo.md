# SPEC-003: Catálogo, filtros y búsqueda

- **Estado:** en-progreso (prototipo de referencia en `sections/main-collection.liquid`, `snippets/tarjeta-producto.liquid`, `sections/main-search.liquid` y `assets/componente-coleccion.css`)
- **Etapa:** 2
- **Requerimientos:** RF-01, RF-02, RF-03; RNF-01, RNF-02, RNF-03, RNF-05, RNF-13, RNF-17 (parciales, en lo que toca a colección y búsqueda)
- **Responsable:** dev-tema-liquid
- **Revisores:** disenador-ui, qa-calidad, cumplimiento (textos de sellos, nombres de filtros y estados vacíos), operaciones-shopify (runbook de filtros y metacampos)

## Objetivo

Que el cliente encuentre su modelo y su talla en pocos toques desde el celular, y que cada producto muestre de un vistazo si es nuevo, si está en combo, si quedan pocas unidades o si está agotado.

## Trazabilidad

| Requerimiento | Qué cubre esta spec | Dónde se cumple |
| --- | --- | --- |
| RF-01 | Listado por categoría (Tenis, Gorras) con filtros por talla disponible, color, género, gama y precio; orden por precio y novedad. La "línea" de RF-01 se concreta en dos filtros: **Género** y **Gama** (decisión del equipo, 13 nov 2026) | Colecciones automáticas (admin), metacampos `custom.genero` y `custom.gama` (admin), filtros de Search & Discovery (admin), sección `main-collection` (tema) |
| RF-02 | Búsqueda con sugerencias mientras se escribe | Componente de búsqueda predictiva en el encabezado (tema) sobre la API `search/suggest` de Shopify |
| RF-03 | Sellos Nuevo (automático, 7 días desde la publicación), Últimas unidades (3 o menos en total), Combo, Agotado | Snippet `tarjeta-producto` (tema) + etiqueta `combo` y ajustes `umbral_ultimas_unidades` y `dias_sello_nuevo` (admin / editor) |
| RNF-01 | CLS < 0,1 y LCP < 2,5 s en la colección; sugerencias sin bloquear la escritura (INP < 200 ms) | Tema |
| RNF-02 | Fotos WebP/AVIF con `image_url` y carga diferida salvo las 2 primeras | Tema |
| RNF-03 | Cuadrícula y panel de filtros sin desborde a 360 px | Tema |
| RNF-05 | Filtros, orden, paginación y sugerencias usables con teclado y lector de pantalla; objetivos de 44 px; contraste AA de los sellos | Tema |
| RNF-13 | Sin marcas de terceros en datos de prueba, `alt`, textos de ejemplo, valores de filtros ni sugerencias de búsqueda. El filtro por marca queda bloqueado (ver Fuera de alcance) | Tema + contenido + admin |
| RNF-17 | Filtros, metacampos, colecciones, umbral y días del sello "Nuevo" se cambian desde el admin o el editor sin programador | Admin / editor |

No cubre: filtro por combo (se resuelve con la colección automática "En combo", SPEC-005), ni el sello en la ficha de producto (SPEC-004). RNF-14 (URLs limpias y mapa del sitio) lo verifica SPEC-011.

## Alcance

- Página de colección con cuadrícula de 2 columnas en celular y 4 desde 990 px, 24 productos por página.
- Filtros nativos de Shopify (app Search & Discovery): **Talla, Color, Género, Gama, Precio y Disponibilidad**. Género y Gama salen de metacampos de producto.
- La colección "Gorras" no muestra filtro de talla: las gorras son de talla única o ajustable y se cargan sin opción "Talla".
- Productos agotados **al final** de la cuadrícula, con el sello "Agotado" (ver "Agotados al final": depende de lo que permita la plataforma).
- Orden: destacados, novedad (más nuevo primero), precio menor a mayor y precio mayor a menor.
- Tarjeta de producto: foto, segunda foto al pasar el mouse (solo dispositivos con puntero), nombre, precio ("Desde" si varía entre variantes), precio anterior tachado si aplica y hasta dos sellos.
- Sello "Nuevo" automático por días desde la publicación; ya no depende de la etiqueta `nuevo`.
- Búsqueda predictiva en el encabezado (productos y colecciones) y página de resultados `/search`.

## Fuera de alcance

- **Filtro por marca: bloqueado.** Mostrar nombres de marcas de terceros en la tienda choca con la regla 1 del CLAUDE.md y RNF-13. No se configura ni se programa hasta que el equipo tome una decisión explícita y `cumplimiento` la revise. Si el filtro fuera solo para marcas propias del negocio, se especifica en una nota de esta spec después de esa revisión.
- Filtro por combo: colección automática "En combo" (SPEC-005 y runbook de configuración inicial).
- Sellos y disponibilidad en la ficha (SPEC-004).
- Reseñas y lista de deseos en la tarjeta (fase 2, RF-30 y RF-31).
- Búsqueda por voz o por foto.
- Programar un reordenamiento propio de toda la colección en el tema (ver "Agotados al final").

## Qué se programa y qué se configura

| Pieza | Tipo | Quién |
| --- | --- | --- |
| Colecciones "Tenis", "Gorras" (automáticas por tipo de producto) y "En combo" (por etiqueta `combo`) | Admin | Equipo, con `docs/operaciones/configuracion-inicial.md` |
| Metacampo de producto **`custom.genero`**: nombre visible "Género", tipo lista de texto de una línea (`list.single_line_text_field`) con valores permitidos "Hombre" y "Mujer" | Admin → Configuración → Datos personalizados → Productos | Equipo, con runbook de `operaciones-shopify` |
| Metacampo de producto **`custom.gama`**: nombre visible "Gama", tipo texto de una línea (`single_line_text_field`) con un solo valor permitido, "Noctra Premium"; los demás productos lo dejan vacío | Admin → Configuración → Datos personalizados → Productos | Equipo, con runbook de `operaciones-shopify` |
| Valor de Género y Gama en cada producto (formulario del producto o CSV/importación masiva) | Admin | Equipo |
| Filtros (Talla, Color, Género, Gama, Precio, Disponibilidad), sus nombres en español y su orden | Admin, app Search & Discovery (oficial de Shopify) | Equipo, con runbook de `operaciones-shopify` |
| Agotados al final de la colección | Ajuste nativo si existe (a verificar, tarea 1); si no, la alternativa que apruebe el equipo | Equipo (admin) o dev-tema-liquid, según la verificación |
| Gorras sin opción "Talla" (una variante o solo opción "Color") | Admin (producto o CSV) | Equipo; `operaciones-shopify` corrige la plantilla CSV |
| Opciones de orden | Nativas de Shopify (`collection.sort_options`); el tema solo muestra las cuatro del alcance | Tema |
| Etiquetas `combo`, `grupo-*` | Admin (producto o CSV) | Equipo |
| Umbral de "Últimas unidades" | Editor del tema (`settings.umbral_ultimas_unidades`, por defecto 3) | Equipo |
| Días del sello "Nuevo" | Editor del tema (`settings.dias_sello_nuevo`, por defecto 7; 0 apaga el sello) | Equipo |
| Sinónimos de búsqueda (si se necesitan) | Admin, Search & Discovery | Equipo |
| Cuadrícula, tarjeta, sellos, panel de filtros, actualización sin recarga, búsqueda predictiva | Tema (Liquid, CSS, Web Components) | dev-tema-liquid, disenador-ui |
| Shopify Function | No aplica | — |

## Comportamiento

### Colección

1. El cliente llega a `/collections/tenis` desde un menú, una historia de Instagram o un enlace de WhatsApp. Ve el título, el número de productos y la cuadrícula.
2. **Celular (360 px):** encima de la cuadrícula hay una fila con dos botones de 44 px de alto: "Filtrar" (con el número de filtros activos, por ejemplo "Filtrar (2)") y el selector "Ordenar". "Filtrar" abre un panel desde abajo que ocupa hasta el 90 % del alto, con un grupo plegable por filtro, el botón principal "Ver N productos" y el enlace "Quitar filtros". El panel atrapa el foco, se cierra con Escape, con el botón "Cerrar" o tocando el fondo, y devuelve el foco a "Filtrar".
3. **Escritorio (1280 px):** los filtros se muestran como una fila de desplegables encima de la cuadrícula (como en el prototipo), con el orden a la derecha.
4. Los filtros activos aparecen como fichas removibles ("Talla: 42 ×", "Género: Mujer ×", "Gama: Alta ×") encima de la cuadrícula, en celular y en escritorio.
5. **Sin JavaScript:** los filtros son un formulario `GET` real con botón "Aplicar"; la página se recarga con los parámetros en la URL. **Con JavaScript:** cada cambio actualiza la cuadrícula, el conteo y las fichas sin recargar (Section Rendering API), actualiza la URL con `history.replaceState` para que el enlace se pueda compartir, y el botón "Aplicar" se oculta. El conteo "Ver N productos" del panel se actualiza con cada cambio.
6. Mientras carga la actualización, la cuadrícula conserva su altura (sin saltos) y se anuncia el nuevo conteo a lectores de pantalla con una región `aria-live="polite"`.
7. Los valores de filtro con 0 productos se ven deshabilitados, salvo que estén activos.
8. **Precio:** dos campos numéricos en pesos ("Desde", "Hasta") con teclado numérico en celular.
9. El tema pinta los filtros que entrega `collection.filters`, en el orden configurado en Search & Discovery. No se escribe en el código ninguna lista de valores de filtro.

### Talla disponible

El filtro de talla debe devolver solo productos que tengan **esa talla con existencias**. Si Search & Discovery no lo logra con el filtro de talla solo, la combinación "Talla + Disponibilidad: en existencia" debe hacerlo y el tema activa "en existencia" por defecto al elegir una talla. Esto se verifica en la tienda de desarrollo antes de implementar (Plan, tarea 1).

### Gorras sin filtro de talla

- Las gorras son de talla única o ajustable y se cargan **sin opción "Talla"** (una sola variante, o solo la opción "Color"). Así el filtro de talla no tiene valores en la colección "Gorras" y no aparece.
- Como respaldo, el tema no pinta un grupo de filtro que no tenga ningún valor con productos en la colección actual. Esto cubre también una gorra cargada por error con "Talla: Única": el valor "Única" no debe aparecer como filtro en "Gorras". dev-tema-liquid confirma en la tarea 1 cómo lo entrega `collection.filters` y si basta con ocultar grupos de un solo valor.

### Género y Gama

- **Género** (`custom.genero`): valores "Hombre" y "Mujer". Es una lista para que un modelo pueda llevar los dos valores si el equipo decide que hay modelos unisex (pregunta abierta 1); así ese modelo aparece al filtrar por cualquiera de los dos, sin crear un tercer valor.
- **Gama** (`custom.gama`): un solo valor, "Noctra Premium". Los productos que no son Premium lo dejan vacío y no llevan sello de gama. El filtro muestra una sola casilla, "Noctra Premium".
- Un producto sin valor en el metacampo no aparece al filtrar por ese metacampo, pero sí en la colección sin filtros. El runbook pide llenar ambos campos en todos los productos.
- Que Search & Discovery acepte estos tipos de metacampo como filtro se confirma en la tarea 1 (a verificar con `shopify-dev`). Si no acepta la lista, se usa texto de una línea y se resuelve lo unisex según la respuesta del equipo.

### Agotados al final

Decisión del equipo: los agotados se muestran al final de la cuadrícula con el sello "Agotado". Límite técnico honesto:

- El orden de los productos lo decide el servidor de Shopify antes de paginar. Dentro de Liquid solo se puede reordenar **la página actual** (24 productos), no la colección completa, así que un agotado de la página 1 nunca pasaría a la página 2 con un reordenamiento en el tema.
- **Opción A, preferida: ajuste nativo.** Search & Discovery tiene ajustes sobre productos agotados en búsqueda y colecciones (mostrar, ocultar o enviar al final). **A verificar con `shopify-dev`** y en la tienda de desarrollo: si existe la opción de "enviar al final", para qué tipo de orden aplica (destacados, precio, novedad) y si aplica a colecciones además de búsqueda. Si existe, se configura en el admin y no se programa nada.
- **Opción B: orden manual de la colección** con los agotados abajo. Solo afecta el orden "Destacados" y exige que alguien lo mantenga cuando cambie el inventario (a mano o con una app de la App Store que lo haga sola, con posible costo mensual). No se programa.
- **Opción C: reordenar en Liquid dentro de la página** (primero disponibles, luego agotados). Solo es correcto cuando la colección filtrada cabe en una página. Se descarta como solución general por lo dicho arriba; solo se usaría con aprobación del equipo y documentando el límite.
- **Si ninguna opción sirve**, los agotados quedan en su posición normal con el sello "Agotado" y se vuelve a preguntar al equipo (pregunta abierta 4). Mientras no esté verificado, el criterio C26 no se puede marcar.

### Sellos (RF-03)

Máximo dos por tarjeta, en este orden de prioridad:

1. **Agotado**: ninguna variante disponible.
2. **Últimas unidades**: el producto rastrea inventario y la suma de unidades disponibles de **todas sus variantes** (todas las tallas y colores) es mayor que 0 y menor o igual a `umbral_ultimas_unidades` (por defecto 3). Nunca aparece junto con "Agotado". Con umbral 0 no aparece nunca.
3. **Combo**: etiqueta `combo`.
4. **Nuevo**: automático. Aparece cuando el producto se publicó en la tienda online hace **menos de `dias_sello_nuevo` días** (por defecto 7, es decir, menos de 168 horas), contando desde `product.published_at`. Con 0 días no aparece nunca. La etiqueta `nuevo` ya no se usa: si un producto la conserva, no cambia nada.

Los sellos son texto (no imagen), legibles en ambos modos con contraste AA, y el sello de combo usa el relleno de oro permitido por SPEC-001.

### Búsqueda

1. El ícono de búsqueda del encabezado abre un campo de búsqueda (en celular, a todo el ancho bajo el encabezado). Sin JS, el ícono sigue siendo un enlace a `/search`.
2. Desde 2 caracteres, tras 200 ms sin escribir, se piden sugerencias a `/search/suggest` (secciones con Section Rendering API): hasta 4 productos (foto, nombre, precio) y hasta 3 colecciones, más el enlace "Ver todos los resultados de «texto»".
3. Las sugerencias se navegan con flechas, Enter abre la elegida y Escape cierra la lista (patrón combobox de ARIA). El número de resultados se anuncia con `aria-live`.
4. Sin resultados: "No encontramos nada con «texto». Prueba con otra palabra o escríbenos por WhatsApp." (el enlace de WhatsApp solo si hay número configurado).
5. La página `/search` usa la misma tarjeta y la misma cuadrícula de la colección, con los agotados al final si la opción elegida en "Agotados al final" también aplica a la búsqueda.

### Estados vacíos y casos borde

- Filtros sin resultados: "No encontramos productos con esos filtros." y botón "Quitar filtros".
- Colección sin productos y sin filtros activos: "Pronto tendremos productos aquí." y botón "Ver todo el catálogo" (a `/collections/all`). No se muestra "Quitar filtros".
- Producto sin foto: marcador de posición con la misma proporción 4:5 (sin salto de diseño).
- Producto sin segunda foto: no hay efecto al pasar el mouse.
- Nombre largo: se corta en 2 líneas con puntos suspensivos y el nombre completo sigue en el enlace accesible.
- Error de red en la actualización sin recarga: se navega a la URL del filtro (recarga normal).
- Producto sin valor en Género o Gama: visible sin filtros, no aparece al filtrar por ese campo.
- Producto despublicado y vuelto a publicar: Shopify puede cambiar `published_at`, así que el sello "Nuevo" vuelve a contar 7 días (a verificar en la tarea 1). Se documenta en el runbook para que el equipo lo sepa.
- Caché de páginas: Shopify puede servir una página en caché, así que el sello "Nuevo" puede seguir visible unas horas después de cumplir los 7 días. Se acepta; el sello nunca aparece en un producto con más de 8 días publicado.
- Producto con "seguir vendiendo sin existencias" e inventario 0 o negativo: no muestra "Últimas unidades" (la suma debe ser mayor que 0).

## Datos y configuración

- Etiquetas de producto: `combo`, `grupo-tenis`, `grupo-gorras` (SPEC-005, `docs/operaciones/cargar-productos.md`). La etiqueta `nuevo` deja de usarse.
- Metacampos de producto: `custom.genero` (lista de texto, valores "Hombre", "Mujer") y `custom.gama` (texto, un solo valor "Noctra Premium"; vacío en los demás). Los nombres de espacio y clave son una sugerencia: si el runbook usa otros, el tema no los lee directamente (los filtros llegan por `collection.filters`) y basta con anotarlo aquí.
- Opción de variante "Talla" con valores EUR solo en tenis. Las gorras no llevan opción "Talla".
- Filtros en Search & Discovery, en este orden: Talla (opción de variante), Color (opción de variante), Género (metacampo), Gama (metacampo), Precio, Disponibilidad.
- Ajuste del tema `umbral_ultimas_unidades` (número, por defecto 3; 0 apaga el sello).
- Ajuste del tema `dias_sello_nuevo` (número, por defecto 7; 0 apaga el sello).
- Ajustes de la sección Colección en el editor: productos por página (12 a 48, por defecto 24) y "Mostrar segunda foto al pasar el mouse" (por defecto sí).

## Criterios de aceptación

Salvo que se indique otra cosa, cada criterio se verifica con Playwright en cuatro combinaciones: **360 px oscuro, 360 px claro, 1280 px oscuro y 1280 px claro**, contra la tienda de desarrollo con los productos de prueba del runbook. La columna "Prototipo" dice qué ya cumple el código de referencia (no cuenta como implementación aprobada).

| # | Criterio | Prototipo |
| --- | --- | --- |
| C1 | [ ] Dada la colección "Tenis" con 30 productos, cuando la abro, entonces veo 2 columnas a 360 px y 4 columnas a 1280 px, 24 productos en la primera página y paginación "Anterior / Siguiente" con objetivos de 44 px. | Parcial: cuadrícula y paginación sí; falta verificar 44 px en la paginación |
| C2 | [ ] Dado un catálogo con tenis en tallas 38 a 44 donde el modelo A tiene la 42 con 2 unidades y el modelo B tiene la 42 con 0 unidades, cuando filtro por talla 42, entonces veo el modelo A y no el modelo B. | Sin verificar (depende de Search & Discovery) |
| C3 | [ ] Dado el filtro de color "Negro" y precio "Hasta 200000", cuando lo aplico sin JavaScript, entonces la página se recarga con los parámetros en la URL y solo muestra productos negros de $200.000 o menos. | Cumple (formulario `GET` con "Aplicar") |
| C4 | [ ] Dado JavaScript activo, cuando marco talla 42, entonces la cuadrícula y el conteo se actualizan sin recargar, la URL incluye el filtro y, al copiarla en otra pestaña, veo el mismo resultado. | Falta |
| C5 | [ ] A 360 px, cuando toco "Filtrar", entonces se abre el panel desde abajo, el foco entra al panel, "Ver N productos" muestra el conteo real, Escape lo cierra y el foco vuelve a "Filtrar". | Falta |
| C6 | [ ] Dados dos filtros activos (talla 42 y color Negro), entonces veo dos fichas removibles y el botón dice "Filtrar (2)"; al quitar la ficha "Talla: 42" queda solo el filtro de color. | Falta (solo hay "Quitar filtros") |
| C7 | [ ] Cuando abro "Ordenar", entonces veo exactamente cuatro opciones en español: destacados, más nuevos, precio de menor a mayor y precio de mayor a menor, y el orden elegido se conserva al filtrar. | Parcial: muestra todas las opciones de Shopify |
| C8 | [ ] Dado un tenis con inventario rastreado, 2 unidades en total sumando todas sus tallas y umbral 3, entonces su tarjeta muestra "Últimas unidades". | Cumple |
| C9 | [ ] Dado un tenis con 4 unidades en total (por ejemplo, 1 en cada una de 4 tallas) y umbral 3, entonces no muestra "Últimas unidades", aunque cada talla tenga solo 1 unidad. | Cumple |
| C10 | [ ] Dado un producto agotado con etiqueta `combo` y publicado hace 2 días, entonces muestra "Agotado" y "Combo", y no muestra "Últimas unidades" ni "Nuevo". | Parcial: cumple con la etiqueta `nuevo`; falta el sello automático |
| C11 | [ ] Dado un producto sin inventario rastreado, entonces nunca muestra "Últimas unidades". | Cumple |
| C12 | [ ] Dado el umbral en 0, entonces ningún producto muestra "Últimas unidades", ni siquiera uno disponible con 0 unidades por "seguir vendiendo sin existencias". | Parcial: el prototipo no exige inventario mayor que 0 |
| C13 | [ ] Los cuatro sellos tienen contraste de al menos 4,5:1 sobre su fondo en modo oscuro y en modo claro (medido con la herramienta de contraste de qa-calidad). | Sin verificar |
| C14 | [ ] Dado un producto de $189.900 con precio anterior de $229.900, entonces la tarjeta muestra "$189.900" en oro y "$229.900" tachado, con "Antes" para lectores de pantalla. | Cumple |
| C15 | [ ] Dado un producto con variantes de $179.900 y $189.900, entonces la tarjeta muestra "Desde $179.900". | Cumple |
| C16 | [ ] A 1280 px con mouse, al pasar sobre una tarjeta con dos fotos se ve la segunda; a 360 px (táctil) no se descarga la segunda foto antes de que la tarjeta entre en pantalla. | Parcial: el efecto existe; la segunda foto se pide también en celular |
| C17 | [ ] Cuando escribo "umb" en el buscador del encabezado, entonces aparecen sugerencias de productos y colecciones en menos de 300 ms después de la pausa de escritura, con red 4G simulada en Lighthouse/Playwright. | Falta |
| C18 | [ ] Con el teclado, en las sugerencias: flecha abajo resalta la primera, Enter abre su ficha y Escape cierra la lista y deja el foco en el campo. | Falta |
| C19 | [ ] Cuando busco una palabra sin resultados, entonces veo el mensaje de "No encontramos nada…" y, si hay número de WhatsApp configurado, el enlace para escribir. | Parcial: la página `/search` tiene mensaje; falta el enlace y la búsqueda predictiva |
| C20 | [ ] Dados filtros sin resultados, entonces veo "No encontramos productos con esos filtros." y "Quitar filtros" me devuelve a la colección completa. | Cumple |
| C21 | [ ] Dada una colección vacía sin filtros, entonces no aparece "Quitar filtros" sino "Ver todo el catálogo". | Falta |
| C22 | [ ] La colección no tiene desborde horizontal a 360 px, ni con el panel de filtros abierto ni con el buscador abierto. | Parcial: sin panel ni buscador aún |
| C23 | [ ] Lighthouse móvil en la colección "Tenis" con 24 productos de prueba: CLS < 0,1, LCP < 2,5 s y puntaje ≥ 85. | Sin verificar |
| C24 | [ ] Ningún color, tamaño, espaciado o radio de los componentes nuevos está fuera de `tokens.css` (revisión de qa-calidad). | Cumple en lo existente |
| C25 | [ ] En datos de prueba, textos de ejemplo, `alt`, placeholders y valores de filtros no aparece ninguna marca de terceros ni palabras prohibidas por RNF-13, y no existe ningún filtro por marca (revisión de cumplimiento). | Cumple en lo existente |
| C26 | [ ] Dada la colección "Tenis" con 30 productos, de los cuales 3 están agotados, cuando la abro en orden "Destacados", entonces los 27 disponibles aparecen primero y los 3 agotados son los últimos de la página 2, cada uno con el sello "Agotado". El comportamiento con los otros tres órdenes queda anotado según la verificación de la tarea 1. | Falta (depende de la opción elegida en "Agotados al final") |
| C27 | [ ] Dados tres tenis con `custom.genero` = "Hombre", dos con "Mujer" y uno con ambos valores, cuando filtro por Género "Mujer", entonces veo 3 productos y la ficha "Género: Mujer ×". | Falta |
| C28 | [ ] Dados cuatro tenis con `custom.gama` = "Noctra Premium" y dos sin Gama, cuando filtro por Gama "Noctra Premium" y talla 42 (con existencias en dos de los Noctra Premium), entonces veo 2 productos y el botón dice "Filtrar (2)". | Falta |
| C29 | [ ] Dada la colección "Gorras" con 5 gorras sin opción "Talla", entonces no aparece el filtro de talla ni a 360 px ni a 1280 px, y sí aparecen Color, Precio y Disponibilidad. | Sin verificar |
| C30 | [ ] Dado `dias_sello_nuevo` en 7, entonces un tenis publicado hace 3 días muestra "Nuevo", uno publicado hace 8 días no lo muestra y uno publicado hace 30 días con la etiqueta `nuevo` tampoco lo muestra. Con el ajuste en 0, ninguno lo muestra. | Falta (hoy depende de la etiqueta `nuevo`) |

## Plan

Cada tarea cabe en menos de un día. El orden importa: las tareas 1 y 2 desbloquean el resto.

1. [x] **Verificar plataforma** (dev-tema-liquid, con el MCP `shopify-dev` y la tienda de desarrollo): (a) filtro de opción de variante con disponibilidad (C2); (b) formato de `price_range` en COP (centavos y parámetros `filter.v.price`); (c) valores de `collection.sort_options`; (d) respuesta de `search/suggest` con `section_id`; (e) si Search & Discovery acepta como filtro metacampos de tipo lista de texto y texto de una línea con valores permitidos; (f) si existe un ajuste nativo para enviar los agotados al final, para qué órdenes y si aplica a colecciones y búsqueda; (g) cómo entrega `collection.filters` un grupo sin valores o con un solo valor (gorras); (h) si `product.published_at` cambia al despublicar y volver a publicar. Anotar todo en "Notas y decisiones". **Hecha parcialmente (14 nov): verificado en documentación oficial lo que se pudo; lo demás queda "a verificar en la tienda" (ver Notas).**
2. [ ] **Runbook de filtros y metacampos** (operaciones-shopify): pasos en `docs/operaciones/` para crear las definiciones de metacampo `custom.genero` y `custom.gama` con sus valores permitidos, llenarlas en cada producto (formulario y CSV), activar y nombrar en español los filtros de Search & Discovery (Talla, Color, Género, Gama, Precio, Disponibilidad) en ese orden, configurar los agotados al final según el resultado de la tarea 1 y crear las colecciones automáticas. Incluye la advertencia de no crear un filtro por marca.
3. [ ] **Plantilla CSV de prueba** (operaciones-shopify): quitar la opción "Talla: Única" de las gorras en `docs/operaciones/plantilla-productos.csv`, agregar las columnas de Género y Gama con datos de prueba y quitar la etiqueta `nuevo` de los ejemplos.
4. [ ] **Decisión sobre agotados al final** (arquitecto-specs con el equipo): con el resultado de la tarea 1, anotar la opción elegida (A, B o C) y ajustar C26. Si es la opción C o no hay opción, el equipo decide antes de seguir.
5. [x] **Sello "Nuevo" automático** (dev-tema-liquid): ajuste `dias_sello_nuevo` en `settings_schema.json` y cálculo con `published_at` en `tarjeta-producto`, sin leer la etiqueta `nuevo` (C10, C30).
6. [x] **Sello "Últimas unidades"** (dev-tema-liquid): exigir suma total mayor que 0 y umbral mayor que 0 (C8, C9, C11, C12).
7. [x] **Orden limitado** (dev-tema-liquid): mostrar solo destacados, más nuevos, precio ascendente y descendente; conservar el orden al filtrar (C7).
8. [x] **Fichas de filtros activos** y contador "Filtrar (N)" (dev-tema-liquid), incluidos los filtros de metacampo (C6, C27, C28).
9. [x] **Grupos de filtro vacíos** (dev-tema-liquid): no pintar un grupo sin valores con productos; verificar con la colección "Gorras" (C29).
10. [x] **Panel de filtros en celular** (dev-tema-liquid + disenador-ui): `<dialog>` desde abajo con foco atrapado, cierre por Escape y fondo, botón "Ver N productos" (C5, C22).
11. [x] **Actualización sin recarga** (dev-tema-liquid): Web Component `filtros-coleccion` con `fetch` + Section Rendering API, `replaceState`, región `aria-live`, altura reservada y caída a recarga si falla la red (C4).
12. [x] **Estados vacíos** (dev-tema-liquid + contenido-copy): distinguir colección vacía y filtros sin resultados (C20, C21).
13. [x] **Tarjeta** (dev-tema-liquid + disenador-ui): segunda foto solo con puntero (no descargarla en táctil), nombre a 2 líneas, revisar contraste de sellos en ambos modos y jerarquía de títulos (C13, C16).
14. [x] **Ajustes de la sección Colección** (dev-tema-liquid): productos por página y segunda foto (RNF-17).
15. [ ] **Agotados al final, implementación** (equipo en el admin, o dev-tema-liquid solo si la tarea 4 eligió la opción C) (C26).
16. [x] **Búsqueda predictiva, marcado y estilos** (dev-tema-liquid + disenador-ui): campo en el encabezado, lista de sugerencias con patrón combobox, sin JS enlaza a `/search` (C18).
17. [x] **Búsqueda predictiva, datos** (dev-tema-liquid): `fetch` a `/search/suggest` con espera de 200 ms, cancelación de peticiones viejas y mensaje sin resultados con WhatsApp (C17, C19).
18. [ ] **Revisión de textos** (contenido-copy, cumplimiento): sellos, estados vacíos, placeholders, nombres y valores de filtros, ausencia de filtro por marca (C25).
19. [ ] **QA** (qa-calidad): Theme Check, Playwright en las cuatro combinaciones, Lighthouse móvil de la colección, teclado y lector de pantalla (C1, C13, C22 a C30).

## Notas y decisiones

- Prototipo revisado el 13 nov 2026 contra esta spec: ya cumple cuadrícula 2/4, formulario `GET` con "Aplicar", tarjeta con sellos en el orden correcto (máximo dos, "Agotado" excluye "Últimas unidades"), precio "Desde", precio anterior tachado y estado vacío de filtros. Falta: panel móvil, actualización sin recarga, fichas de filtros activos, orden limitado, búsqueda predictiva, estado de colección vacía, sello "Nuevo" automático, filtros de Género y Gama, agotados al final y ocultar grupos de filtro vacíos.
- **13 nov 2026, decisiones del equipo incorporadas** (ver "Respuestas del equipo"): el filtro "Línea" de RF-01 se reemplaza por Género y Gama sobre metacampos; los agotados van al final; el sello "Nuevo" es automático por 7 días; "Últimas unidades" se cuenta sobre el total con umbral 3; las gorras no tienen filtro de talla. El filtro por marca queda fuera de alcance y bloqueado.
- "Últimas unidades" usa el inventario **total** del producto (suma de todas sus tallas), no el de la talla elegida. La escasez por talla se ve en la ficha (SPEC-004). El sello debe reflejar el inventario real: no se fuerza a mano para no incurrir en publicidad engañosa (Ley 1480).
- El sello "Nuevo" se calcula en el servidor con `published_at` y el momento de render; por la caché de Shopify puede durar unas horas de más. Se descartó calcularlo en el navegador con JS para no mover el diseño al cargar (CLS) y para que funcione sin JS.
- Los días del sello "Nuevo" y el umbral de "Últimas unidades" son ajustes del tema para que el equipo los cambie sin programador (RNF-17); los valores por defecto (7 y 3) son los que decidió el equipo.
- Agotados al final: la plataforma decide el orden antes de paginar, así que no se promete un reordenamiento de la colección completa desde Liquid. La existencia del ajuste nativo en Search & Discovery está **a verificar con `shopify-dev`** (tarea 1).
- El prototipo usa `<h3>` en la tarjeta dentro de una página con `<h1>`; revisar la jerarquía de títulos en la tarea 13.

- **Implementación de dev-tema-liquid (tareas 1, 5 a 14, 16 y 17; sello C31).** Hecho en código; **ningún criterio se marca todavía** porque exigen Playwright contra la tienda de desarrollo (qa-calidad, tarea 19). Theme Check: sin ofensas (41 archivos). `npm test`: 13 en verde. Qué cambió: `snippets/tarjeta-producto.liquid` (sello Nuevo por `published_at` y `dias_sello_nuevo`; Últimas unidades exige total > 0 y umbral > 0; sello de gama alta; combo omitido en gama alta; segunda foto solo con puntero; título con nivel configurable y 2 líneas), `sections/main-collection.liquid` (orden limitado a 4, fichas, "Filtrar (N)", grupos vacíos ocultos, panel `<dialog>`, estados vacíos, ajustes de sección), `assets/componente-coleccion.css/.js` (Web Component `filtros-coleccion`), `sections/encabezado.liquid`, `sections/busqueda-predictiva.liquid`, `snippets/sin-resultados.liquid`, `assets/componente-busqueda.css/.js` (Web Component `busqueda-predictiva`), `sections/main-search.liquid`, `config/settings_schema.json` (`dias_sello_nuevo`, `gama_premium_valor`), `assets/tokens.css` (4 tokens de medida nuevos) y `assets/base.css` (`.sello--premium`).
- **Sello de gama alta (C31):** el valor de Gama que activa el sello es el ajuste `gama_premium_valor` (por defecto "Noctra Premium"); el texto del sello es el valor del metacampo `custom.gama`. Se lee `product.metafields.custom.gama.value`: si el runbook usa otro espacio o clave, hay que cambiarlo en `tarjeta-producto`. Orden de sellos: Agotado, Últimas unidades, Noctra Premium, Combo, Nuevo (máximo dos). Estilo: texto principal con filo y rombo de oro. La exclusión del producto de la colección "En combo" es de SPEC-005 y del admin; el tema solo oculta el sello.
- **Tarea 1, verificación de plataforma (14 nov 2026, con WebFetch porque el MCP `shopify-dev` no conectó).**
  - (b) Precio: `filter_value` no documenta unidades (https://shopify.dev/docs/api/liquid/objects/filter_value); los parámetros son `filter.v.price.gte` y `filter.v.price.lte`. El código asume el convenio de los temas de Shopify: valores en centavos en Liquid (`| money` y `| divided_by: 100`) y pesos enteros en la URL. **A verificar en la tienda.**
  - (c) `collection.sort_options` entrega, entre otros, `manual`, `price-ascending`, `price-descending` y `created-descending` (https://shopify.dev/docs/api/liquid/objects/collection). El tema muestra solo esos cuatro. Si la colección tiene otro orden por defecto (por ejemplo `best-selling`), el selector no marca ninguna opción: configurar las colecciones con orden manual o "más nuevos".
  - (d) `/search/suggest` con `section_id` devuelve el HTML de la sección y el objeto `predictive_search` (https://shopify.dev/docs/api/ajax/reference/predictive-search); admite `resources[type]`, `resources[limit]` (1 a 10) y `resources[limit_scope]`. Implementado con la sección `busqueda-predictiva`. La existencia de `routes.predictive_search_url` la valida Theme Check; probar en la tienda.
  - (e) Search & Discovery acepta metacampos de producto de tipo texto de una línea y lista de texto de una línea como filtro (https://help.shopify.com/en/manual/online-store/search-and-discovery/filters). Para la lista, `filter.operator` admite `AND` (https://shopify.dev/docs/api/liquid/objects/filter). No se verificó el comportamiento con valores permitidos (validaciones); **a verificar en la tienda**.
  - (f) **Agotados al final: no hay ajuste nativo para colecciones.** El ajuste "Productos agotados" de Search & Discovery (mostrar, ocultar o enviar al final) aplica solo a **búsqueda y búsqueda predictiva**, y por defecto ya los deja al final (https://help.shopify.com/en/manual/online-store/search-and-discovery/search-settings). La ayuda de diseño de colecciones no menciona ninguno para colecciones (https://help.shopify.com/en/manual/products/collections/collection-layout). Lo que existe es mover a mano al final con orden manual (solo orden manual) o `collectionReorderProducts` por API (exige orden manual; no sirve para colecciones automáticas), o una app, y una discusión de la comunidad confirma que no hay solución solo con Liquid con paginación (https://community.shopify.dev/t/how-can-i-push-sold-out-products-to-the-end-of-a-collection-using-shopify-liquid-or-js-with-pagination/19288). Consecuencia: **C26 no se puede cumplir con un ajuste nativo en las colecciones "Tenis" y "Gorras" (son automáticas)**. Búsqueda sí queda con agotados al final. La tarea 4 (decisión de opción A, B o C) queda **pendiente del equipo**; la tarea 15 no se hizo. Mientras tanto los agotados quedan en su posición con el sello "Agotado".
  - (g) Un grupo sin valores: la documentación de `filter` no describe el caso. Para no depender de ello, el tema oculta un grupo de lista cuando ningún valor tiene productos y no está activo, y el de precio cuando `range_max` es 0. Un grupo con un solo valor (por ejemplo "Talla: Única") **no** se oculta, porque ocultarlo es una regla de negocio; el runbook ya indica cargar las gorras sin opción Talla. **A verificar en la tienda con la colección "Gorras" (C29).**
  - (h) `product.published_at`: la documentación no dice si cambia al despublicar y volver a publicar (https://shopify.dev/docs/api/liquid/objects/product). **A verificar en la tienda.**
  - (a) Talla disponible (C2): la documentación de Search & Discovery no explica cómo interactúa el filtro de opción con la disponibilidad. **A verificar en la tienda.** El tema no activa "en existencia" automáticamente al elegir talla; si la prueba falla, se agrega.
- Decisiones de implementación: sin JavaScript el panel de filtros es un `<dialog open>` en línea con botón "Aplicar"; con JavaScript en celular se cierra y se abre como hoja modal; en escritorio queda en línea con desplegables. Las fichas de filtros activos son enlaces (`url_to_remove`) y recargan la página; el cambio de casillas, precio y orden sí actualiza sin recargar. Los textos del orden ("Destacados", "Más nuevos", "Precio: de menor a mayor", "Precio: de mayor a menor") están en la sección.
- **Pendiente para revisión de diseño/QA (C13):** en modo claro, el texto de `--color-boton-texto` sobre `--color-oro` (sello Combo) mide cerca de 4,3:1 (calculado a mano), por debajo de 4,5:1. Es un valor de tokens (disenador-ui); no se cambió aquí.
- Gama: solo existe "Noctra Premium"; los demás productos van sin gama (decisión del 13 nov 2026, tercera ronda).

## Preguntas para el equipo

Siguen abiertas (ninguna bloquea la aprobación, salvo que la 4 se vuelva necesaria tras la tarea 1):

1. **Modelos unisex:** ¿hay modelos que se vendan para hombre y mujer? Si los hay, ¿prefieren que lleven los dos valores de Género (aparecen en ambos filtros, como propone esta spec) o un tercer valor visible "Unisex"?
2. **Filtro por marca:** ¿la idea era filtrar por marcas propias del negocio? Si es así, ¿cuáles y con qué nombres? Se incluye solo después de su decisión explícita y de la revisión de `cumplimiento`. Si eran marcas de terceros, no se puede incluir (regla 1 del CLAUDE.md, RNF-13).
3. **Nombres visibles de Gama:** ¿el cliente ve "Gama: Alta / Media" tal cual, o prefieren otros textos para el filtro? (Los valores del metacampo son los que se muestran.)
4. **Agotados al final si no hay ajuste nativo:** si la tarea 1 confirma que Shopify no lo permite, ¿aceptan el orden manual de "Destacados" (mantenido a mano o con una app de pago), o prefieren dejar los agotados en su posición normal con el sello?

### Respuestas del equipo (13 nov 2026)

Registro de las respuestas a la versión anterior de las preguntas. Ya están integradas en el cuerpo de la spec.

1. **Filtro "Línea":** se reemplaza por dos filtros, alimentados por metacampos de producto en Search & Discovery:
   - **Género:** Hombre / Mujer. Queda por confirmar si hay modelos unisex.
   - **Gama:** Alta / Media.
   - **Filtro por marca:** **bloqueado** por la regla 1 del CLAUDE.md (catálogo legítimo, RNF-13). Mostrar nombres de marcas de terceros en la tienda necesita una decisión explícita del equipo y una revisión de `cumplimiento`. Si es solo para marcas propias, se puede incluir.
2. **Agotados:** se muestran **al final** de la cuadrícula con el sello "Agotado".
3. **Sello "Nuevo":** **automático durante 7 días** desde la publicación del producto. La etiqueta `nuevo` deja de ser necesaria.
4. **"Últimas unidades":** se cuenta sobre el **total del producto** (todas las tallas) y arranca con **3** o menos.
5. **Gorras:** **talla única o ajustable**. La colección "Gorras" no muestra filtro de talla.

### Respuestas del equipo, segunda ronda (13 nov 2026)

1. **Unisex:** los modelos unisex llevan **los dos valores** de Género (Hombre y Mujer) y aparecen en ambos filtros. No hay valor "Unisex". Esto confirma el criterio C27.
2. **Gama alta = "Noctra Premium":** la gama alta se muestra al cliente como **Noctra Premium**.
   - Valores de `custom.gama`: "Noctra Premium" y "Media". El nombre visible de la gama media queda pendiente; mientras tanto se usa "Media".
   - La tarjeta de producto muestra el sello **"Noctra Premium"** en los productos de esa gama. Usa el estilo de sello existente (oro como acabado) y no se suma a "Nuevo" si ya hay dos sellos.
   - **Los productos Noctra Premium no participan en combos** (ver SPEC-005). Aunque lleven la etiqueta `combo`, no deben aparecer en la colección "En combo" ni llevar el sello de combo.
   - Criterio nuevo **C31:** [ ] Dado un tenis con `custom.gama` = "Noctra Premium" y la etiqueta `combo`, cuando abro la colección "Tenis", entonces su tarjeta muestra el sello "Noctra Premium" y no muestra el sello de combo.
- **13 nov 2026, contraste del sello de combo (C13).** En modo claro, `--color-boton-texto` (#F3F3F1) sobre `--color-oro` (#8C6E3A) medía 4,29:1, por debajo de AA. El oro claro pasa a **#856837**: 4,69:1 sobre el fondo y 5,21:1 sobre la superficie. Se actualizaron `tokens.css`, CLAUDE.md y SPEC-001.
- **13 nov 2026, colección "En combo".** La ayuda de Shopify no permite excluir productos por metacampo en colecciones automáticas. La condición queda como "etiqueta `combo` Y Gama = Media" (ver `docs/operaciones/filtros-y-metacampos.md`). Pendiente que el equipo la confirme.

### Respuestas del equipo, tercera ronda (13 nov 2026)

1. **Gama:** solo existe el valor **"Noctra Premium"**. Los demás tenis dejan la Gama **vacía**: no llevan sello ni nombre de gama. El filtro "Gama" muestra una sola casilla. No hace falta nombre para la gama media.
2. **Colección "En combo":** queda automática **solo por la etiqueta `combo`**. Ya no se puede usar "Gama = Media" porque esa gama no tiene valor. Protecciones: la regla de carga (los Premium nunca llevan `combo`) y la exclusión en el motor de combos de SPEC-005. El riesgo que queda: un Premium mal etiquetado se vería en esa colección, pero sin descuento.
3. **Agotados (tarea 4): decidido el 14 nov 2026.** Las colecciones se ordenan **de forma manual** ("Destacados"), y el equipo mueve los productos según vaya cambiando el inventario. Los agotados muestran el sello "Agotado" en la posición donde estén. C26 queda así: "Dada una colección en orden manual con un producto agotado, el producto aparece en la posición que le dio el equipo, con el sello Agotado". La tarea 15 no aplica.

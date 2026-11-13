# SPEC-003: Catálogo, filtros y búsqueda

- **Estado:** borrador (prototipo de referencia en `sections/main-collection.liquid`, `snippets/tarjeta-producto.liquid`, `sections/main-search.liquid` y `assets/componente-coleccion.css`)
- **Etapa:** 2
- **Requerimientos:** RF-01, RF-02, RF-03; RNF-01, RNF-02, RNF-03, RNF-05, RNF-13, RNF-17 (parciales, en lo que toca a colección y búsqueda)
- **Responsable:** dev-tema-liquid
- **Revisores:** disenador-ui, qa-calidad, cumplimiento (textos de sellos y estados vacíos)

## Objetivo

Que el cliente encuentre su modelo y su talla en pocos toques desde el celular, y que cada producto muestre de un vistazo si es nuevo, si está en combo, si quedan pocas unidades o si está agotado.

## Trazabilidad

| Requerimiento | Qué cubre esta spec | Dónde se cumple |
| --- | --- | --- |
| RF-01 | Listado por categoría (Tenis, Gorras) con filtros por talla disponible, color, línea y precio; orden por precio y novedad | Colecciones automáticas (admin), filtros de Search & Discovery (admin), sección `main-collection` (tema) |
| RF-02 | Búsqueda con sugerencias mientras se escribe | Componente de búsqueda predictiva en el encabezado (tema) sobre la API `search/suggest` de Shopify |
| RF-03 | Sellos Nuevo, Últimas unidades, Combo, Agotado | Snippet `tarjeta-producto` (tema) + etiquetas y ajuste `umbral_ultimas_unidades` (admin / editor) |
| RNF-01 | CLS < 0,1 y LCP < 2,5 s en la colección; sugerencias sin bloquear la escritura (INP < 200 ms) | Tema |
| RNF-02 | Fotos WebP/AVIF con `image_url` y carga diferida salvo las 2 primeras | Tema |
| RNF-03 | Cuadrícula y panel de filtros sin desborde a 360 px | Tema |
| RNF-05 | Filtros, orden, paginación y sugerencias usables con teclado y lector de pantalla; objetivos de 44 px; contraste AA de los sellos | Tema |
| RNF-13 | Sin marcas de terceros en datos de prueba, `alt`, textos de ejemplo ni sugerencias de búsqueda | Tema + contenido |
| RNF-17 | Filtros, etiquetas, colecciones y umbral se cambian desde el admin sin programador | Admin / editor |

No cubre: filtro por combo (se resuelve con la colección automática "En combo", SPEC-005), ni el sello en la ficha de producto (SPEC-004). RNF-14 (URLs limpias y mapa del sitio) lo verifica SPEC-011.

## Alcance

- Página de colección con cuadrícula de 2 columnas en celular y 4 desde 990 px, 24 productos por página.
- Filtros nativos de Shopify (app Search & Discovery): talla, color, línea, precio y disponibilidad.
- Orden: destacados, novedad (más nuevo primero), precio menor a mayor y precio mayor a menor.
- Tarjeta de producto: foto, segunda foto al pasar el mouse (solo dispositivos con puntero), nombre, precio ("Desde" si varía entre variantes), precio anterior tachado si aplica y hasta dos sellos.
- Búsqueda predictiva en el encabezado (productos y colecciones) y página de resultados `/search`.

## Fuera de alcance

- Filtro por combo: colección automática "En combo" (SPEC-005 y runbook de configuración inicial).
- Sellos y disponibilidad en la ficha (SPEC-004).
- Reseñas y lista de deseos en la tarjeta (fase 2, RF-30 y RF-31).
- Búsqueda por voz o por foto.

## Qué se programa y qué se configura

| Pieza | Tipo | Quién |
| --- | --- | --- |
| Colecciones "Tenis", "Gorras" (automáticas por tipo de producto) y "En combo" (por etiqueta `combo`) | Admin | Equipo, con `docs/operaciones/configuracion-inicial.md` |
| Filtros (talla, color, línea, precio, disponibilidad), sus nombres en español y orden | Admin, app Search & Discovery (oficial de Shopify) | Equipo, con runbook de `operaciones-shopify` |
| Opciones de orden | Nativas de Shopify (`collection.sort_options`); el tema solo muestra las cuatro del alcance | Tema |
| Etiquetas `nuevo`, `combo`, `grupo-*` | Admin (producto o CSV) | Equipo |
| Umbral de "Últimas unidades" | Editor del tema (`settings.umbral_ultimas_unidades`, por defecto 3) | Equipo |
| Sinónimos de búsqueda (si se necesitan) | Admin, Search & Discovery | Equipo |
| Cuadrícula, tarjeta, panel de filtros, actualización sin recarga, búsqueda predictiva | Tema (Liquid, CSS, Web Components) | dev-tema-liquid, disenador-ui |
| Shopify Function | No aplica | — |

## Comportamiento

### Colección

1. El cliente llega a `/collections/tenis` desde un menú, una historia de Instagram o un enlace de WhatsApp. Ve el título, el número de productos y la cuadrícula.
2. **Celular (360 px):** encima de la cuadrícula hay una fila con dos botones de 44 px de alto: "Filtrar" (con el número de filtros activos, por ejemplo "Filtrar (2)") y el selector "Ordenar". "Filtrar" abre un panel desde abajo que ocupa hasta el 90 % del alto, con un grupo plegable por filtro, el botón principal "Ver N productos" y el enlace "Quitar filtros". El panel atrapa el foco, se cierra con Escape, con el botón "Cerrar" o tocando el fondo, y devuelve el foco a "Filtrar".
3. **Escritorio (1280 px):** los filtros se muestran como una fila de desplegables encima de la cuadrícula (como en el prototipo), con el orden a la derecha.
4. Los filtros activos aparecen como fichas removibles ("Talla: 42 ×") encima de la cuadrícula, en celular y en escritorio.
5. **Sin JavaScript:** los filtros son un formulario `GET` real con botón "Aplicar"; la página se recarga con los parámetros en la URL. **Con JavaScript:** cada cambio actualiza la cuadrícula, el conteo y las fichas sin recargar (Section Rendering API), actualiza la URL con `history.replaceState` para que el enlace se pueda compartir, y el botón "Aplicar" se oculta. El conteo "Ver N productos" del panel se actualiza con cada cambio.
6. Mientras carga la actualización, la cuadrícula conserva su altura (sin saltos) y se anuncia el nuevo conteo a lectores de pantalla con una región `aria-live="polite"`.
7. Los valores de filtro con 0 productos se ven deshabilitados, salvo que estén activos.
8. **Precio:** dos campos numéricos en pesos ("Desde", "Hasta") con teclado numérico en celular.

### Talla disponible

El filtro de talla debe devolver solo productos que tengan **esa talla con existencias**. Si Search & Discovery no lo logra con el filtro de talla solo, la combinación "Talla + Disponibilidad: en existencia" debe hacerlo y el tema activa "en existencia" por defecto al elegir una talla. Esto se verifica en la tienda de desarrollo antes de implementar (ver Plan, tarea 1).

### Sellos (RF-03)

Máximo dos por tarjeta, en este orden de prioridad:

1. **Agotado**: ninguna variante disponible.
2. **Últimas unidades**: el producto rastrea inventario y la suma de unidades disponibles de todas sus variantes es mayor que 0 y menor o igual a `umbral_ultimas_unidades`. Nunca aparece junto con "Agotado".
3. **Combo**: etiqueta `combo`.
4. **Nuevo**: etiqueta `nuevo`.

Los sellos son texto (no imagen), legibles en ambos modos con contraste AA, y el sello de combo usa el relleno de oro permitido por SPEC-001.

### Búsqueda

1. El ícono de búsqueda del encabezado abre un campo de búsqueda (en celular, a todo el ancho bajo el encabezado). Sin JS, el ícono sigue siendo un enlace a `/search`.
2. Desde 2 caracteres, tras 200 ms sin escribir, se piden sugerencias a `/search/suggest` (secciones con Section Rendering API): hasta 4 productos (foto, nombre, precio) y hasta 3 colecciones, más el enlace "Ver todos los resultados de «texto»".
3. Las sugerencias se navegan con flechas, Enter abre la elegida y Escape cierra la lista (patrón combobox de ARIA). El número de resultados se anuncia con `aria-live`.
4. Sin resultados: "No encontramos nada con «texto». Prueba con otra palabra o escríbenos por WhatsApp." (el enlace de WhatsApp solo si hay número configurado).
5. La página `/search` usa la misma tarjeta y la misma cuadrícula de la colección.

### Estados vacíos y casos borde

- Filtros sin resultados: "No encontramos productos con esos filtros." y botón "Quitar filtros".
- Colección sin productos y sin filtros activos: "Pronto tendremos productos aquí." y botón "Ver todo el catálogo" (a `/collections/all`). No se muestra "Quitar filtros".
- Producto sin foto: marcador de posición con la misma proporción 4:5 (sin salto de diseño).
- Producto sin segunda foto: no hay efecto al pasar el mouse.
- Nombre largo: se corta en 2 líneas con puntos suspensivos y el nombre completo sigue en el enlace accesible.
- Error de red en la actualización sin recarga: se navega a la URL del filtro (recarga normal).

## Datos y configuración

- Etiquetas de producto: `nuevo`, `combo`, `grupo-tenis`, `grupo-gorras` (SPEC-005, `docs/operaciones/cargar-productos.md`).
- Opción de variante "Talla" con valores EUR en tenis; en gorras, la que defina el equipo (ver preguntas).
- Filtros en Search & Discovery: Talla (opción de variante), Color (opción de variante), Línea (fuente por definir, ver preguntas), Precio, Disponibilidad.
- Ajuste del tema `umbral_ultimas_unidades` (número, por defecto 3; 0 apaga el sello).
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
| C8 | [ ] Dado un tenis con inventario rastreado y 2 unidades en total entre todas sus tallas y umbral 3, entonces su tarjeta muestra "Últimas unidades". | Cumple |
| C9 | [ ] Dado un tenis con 4 unidades y umbral 3, entonces no muestra "Últimas unidades". | Cumple |
| C10 | [ ] Dado un producto agotado con etiquetas `combo` y `nuevo`, entonces muestra "Agotado" y "Combo", y no muestra "Últimas unidades" ni "Nuevo". | Cumple |
| C11 | [ ] Dado un producto sin inventario rastreado, entonces nunca muestra "Últimas unidades". | Cumple |
| C12 | [ ] Dado el umbral en 0, entonces ningún producto muestra "Últimas unidades". | Parcial: el prototipo no exige inventario mayor que 0, así que un producto disponible con 0 unidades (por ejemplo, con "seguir vendiendo sin existencias") mostraría el sello con umbral 0 |
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
| C25 | [ ] En datos de prueba, textos de ejemplo, `alt` y placeholders no aparece ninguna marca de terceros ni palabras prohibidas por RNF-13 (revisión de cumplimiento). | Cumple en lo existente |

## Plan

Cada tarea cabe en menos de un día. El orden importa: las tareas 1 y 2 desbloquean el resto.

1. [ ] **Verificar plataforma** (dev-tema-liquid, con el MCP `shopify-dev`): confirmar cómo se comporta el filtro de opción de variante con la disponibilidad (criterio C2), el formato de `price_range` en COP (centavos y parámetros `filter.v.price`), los valores de `collection.sort_options` y la respuesta de `search/suggest` con `section_id`. Anotar el resultado en "Notas y decisiones".
2. [ ] **Runbook de filtros** (operaciones-shopify): pasos en `docs/operaciones/` para activar y nombrar en español los filtros de Search & Discovery (Talla, Color, Línea, Precio, Disponibilidad), ocultar productos agotados o no según la decisión del equipo, y crear las colecciones automáticas.
3. [ ] **Orden limitado** (dev-tema-liquid): mostrar solo destacados, más nuevos, precio ascendente y descendente; conservar el orden al filtrar (C7).
4. [ ] **Fichas de filtros activos** y contador "Filtrar (N)" (dev-tema-liquid) (C6).
5. [ ] **Panel de filtros en celular** (dev-tema-liquid + disenador-ui): `<dialog>` desde abajo con foco atrapado, cierre por Escape y fondo, botón "Ver N productos" (C5, C22).
6. [ ] **Actualización sin recarga** (dev-tema-liquid): Web Component `filtros-coleccion` con `fetch` + Section Rendering API, `replaceState`, región `aria-live`, altura reservada y caída a recarga si falla la red (C4).
7. [ ] **Estados vacíos** (dev-tema-liquid + contenido-copy): distinguir colección vacía y filtros sin resultados (C20, C21).
8. [ ] **Tarjeta** (dev-tema-liquid + disenador-ui): segunda foto solo con puntero (no descargarla en táctil), nombre a 2 líneas, revisar contraste de sellos en ambos modos, caso umbral 0 e inventario negativo (C12, C13, C16).
9. [ ] **Ajustes de la sección Colección** (dev-tema-liquid): productos por página y segunda foto (RNF-17).
10. [ ] **Búsqueda predictiva, marcado y estilos** (dev-tema-liquid + disenador-ui): campo en el encabezado, lista de sugerencias con patrón combobox, sin JS enlaza a `/search` (C18).
11. [ ] **Búsqueda predictiva, datos** (dev-tema-liquid): `fetch` a `/search/suggest` con espera de 200 ms, cancelación de peticiones viejas y mensaje sin resultados con WhatsApp (C17, C19).
12. [ ] **Revisión de textos** (contenido-copy, cumplimiento): sellos, estados vacíos, placeholders y nombres de filtros (C25).
13. [ ] **QA** (qa-calidad): Theme Check, Playwright en las cuatro combinaciones, Lighthouse móvil de la colección, teclado y lector de pantalla (C1, C13, C22 a C24).

## Notas y decisiones

- Prototipo revisado el 13 nov 2026 contra esta spec: ya cumple cuadrícula 2/4, formulario `GET` con "Aplicar", tarjeta con sellos en el orden correcto (máximo dos, "Agotado" excluye "Últimas unidades"), precio "Desde", precio anterior tachado y estado vacío de filtros. Falta: panel móvil, actualización sin recarga, fichas de filtros activos, orden limitado, búsqueda predictiva y estado de colección vacía.
- "Últimas unidades" usa el inventario **total** del producto (suma de todas sus tallas), no el de la talla elegida. La escasez por talla se ve en la ficha (SPEC-004). El sello debe reflejar el inventario real: no se fuerza a mano para no incurrir en publicidad engañosa (Ley 1480).
- El prototipo usa `<h3>` en la tarjeta dentro de una página con `<h1>`; revisar la jerarquía de títulos en la tarea 8.

## Preguntas para el equipo

Decisiones necesarias para aprobar esta spec:

1. **Filtro "Línea":** ¿qué es una línea para ustedes (por ejemplo, una familia de modelos o un estilo como caña alta o caña baja)? ¿Qué líneas existen al lanzar? Con eso se decide si sale del tipo de producto, de un metacampo de producto o de colecciones.
2. **Productos agotados en la colección:** ¿se muestran al final de la cuadrícula con el sello "Agotado", se muestran en su posición normal o se ocultan?
3. **Sello "Nuevo":** ¿lo ponen a mano con la etiqueta `nuevo` (como hoy) o prefieren que sea automático por días desde la publicación? Si es automático, ¿cuántos días?
4. **Umbral de "Últimas unidades":** ¿confirman que se cuenta sobre el total del producto y con qué número arrancan (hoy 3 como ejemplo)?
5. **Tallas de gorras:** ¿las gorras tienen una sola talla ("Única" o ajustable) o varias? Afecta cómo aparece el filtro de talla en la colección "Gorras".

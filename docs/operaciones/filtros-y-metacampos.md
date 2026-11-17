# Runbook: filtros, metacampos de Género y Gama, y colecciones automáticas

Parte de SPEC-003 (catálogo, filtros y búsqueda), tarea 2. Las pantallas del admin cambian: los pasos marcados **(verificar en pantalla)** no se pudieron confirmar en la documentación oficial y hay que comprobarlos al hacerlos. Si algo no coincide, avisa al agente `operaciones-shopify` para actualizar esta guía.

## ADVERTENCIA: no crear filtro por marca

No crees en Search & Discovery ningún filtro cuya fuente sea **Proveedor (Vendor)**, ni un metacampo "Marca", ni nada que muestre nombres de marcas. Mostrar marcas de terceros choca con la regla 1 del CLAUDE.md (catálogo legítimo) y con RNF-13: las pasarelas, Meta y TikTok bloquean cuentas por eso. Tampoco pongas marcas de terceros en el campo Proveedor de los productos. El filtro por marca solo se considera con decisión explícita del equipo y revisión de `cumplimiento` (SPEC-003, pregunta 2).

## Decisiones del equipo antes de empezar

1. **Gama:** solo existe el valor "Noctra Premium". Los demás tenis dejan la Gama **vacía**: no llevan sello ni nombre de gama.
2. **Agotados al final:** depende de la verificación de la tarea 1 de la spec (ver la sección "Agotados al final" más abajo). Si no existe ajuste nativo, el equipo debe elegir entre orden manual, una app de pago o dejarlos en su lugar (pregunta 4 de la spec).

(Decididas el 13 nov 2026: Género Hombre/Mujer con unisex = los dos valores; Gama = solo "Noctra Premium", los demás vacíos; los Noctra Premium nunca van en combo.)

## Requisitos previos

- Tienda de desarrollo creada (`docs/operaciones/configuracion-inicial.md`, pasos 1 a 5).
- Rol con permiso de administrar productos, colecciones y configuración.
- App **Search & Discovery** de Shopify instalada (gratis, oficial): https://apps.shopify.com/search-and-discovery
- No se necesitan documentos de la empresa ni datos bancarios.

## Parte 1. Crear los metacampos de producto

Fuente: https://help.shopify.com/en/manual/custom-data/metafields/metafield-definitions/creating-custom-metafield-definitions

### Metacampo Género

1. Admin → **Configuración** → **Datos personalizados** (en inglés, "Custom data") → **Productos** → **Agregar definición**. (La ruta exacta del menú: verificar en pantalla; la ayuda también permite empezar desde un producto, sección "Metafields" → "Add definition".)
2. **Nombre**: `Género`.
3. **Espacio de nombres y clave** ("Namespace and key"): `custom.genero`. Debe quedar exactamente así.
4. **Tipo**: elige **Texto de una línea** ("Single line text").
5. Cambia "Un valor" ("One value") por **Lista de valores** ("List of values"). Esto permite que un modelo unisex lleve Hombre y Mujer a la vez.
6. **Validación**: si aparece una opción para limitar a valores permitidos ("preset choices" o similar), agrega `Hombre` y `Mujer`. **(verificar en pantalla: la ayuda oficial solo confirma que existe una sección "Validation" cuyas opciones dependen del tipo; no confirma la lista de valores permitidos para este tipo.)** Si no existe, déjalo libre y escribe siempre los valores exactamente como `Hombre` y `Mujer` (mayúscula inicial, sin tilde extra, sin espacios al final).
7. Activa **Tiendas** ("Storefronts") para que la tienda online pueda leer el valor.
8. Opcional: activa "Usar como condición en colecciones" ("Use as a condition in collections") si el tipo lo permite. No es obligatorio para los filtros.
9. **Guardar**.

### Metacampo Gama

1. Mismo camino: **Agregar definición** en Productos.
2. **Nombre**: `Gama`.
3. **Espacio de nombres y clave**: `custom.gama`.
4. **Tipo**: **Texto de una línea**, dejando **Un valor** (no lista: cada producto tiene una sola gama).
5. **Validación**: un solo valor permitido, `Noctra Premium` (mismo aviso del paso 6 anterior: verificar en pantalla). El campo **no es obligatorio**: los tenis que no son Premium lo dejan vacío.
6. Activa **Tiendas** (Storefronts).
7. **Guardar**.

### Cómo probar

Abre cualquier producto: abajo, en la sección "Metafields", deben aparecer **Género** y **Gama**.

### Si falla

- No aparece "Lista de valores": revisa que el tipo sea "Texto de una línea" y no otro.
- Escribiste mal la clave: no se puede cambiar después sin recrear la definición. Bórrala (si aún no tiene datos) y créala de nuevo.

## Parte 2. Llenar Género y Gama en cada producto

### Desde el formulario del producto

1. Admin → **Productos** → abre el producto.
2. Baja a la sección **Metafields**.
3. **Género**: agrega `Hombre`, `Mujer` o **los dos** si es unisex. No existe el valor "Unisex".
4. **Gama**: escribe `Noctra Premium` solo si el tenis es de esa gama. Si no, **déjalo vacío**.
5. **Guardar**.
6. Regla de negocio: a los productos **Noctra Premium nunca** se les pone la etiqueta `combo`.

### Por CSV

Fuentes: https://help.shopify.com/en/manual/products/import-export/using-csv y https://help.shopify.com/en/manual/products/import-export/using-csv/csv-columns

1. **Primero** crea las dos definiciones (Parte 1). Sin definición, la columna puede no guardarse.
2. Usa `docs/operaciones/plantilla-productos.csv`. Las columnas de metacampo tienen este formato de encabezado (confirmado en la ayuda oficial):
   - `Género (product.metafields.custom.genero)`
   - `Gama (product.metafields.custom.gama)`
3. Se llenan solo en la **primera fila** de cada producto.
4. Valores: Género `Hombre`, `Mujer` o los dos; Gama `Noctra Premium` o **vacío**. Para unisex escribe `Hombre; Mujer` (punto y coma y espacio, como lo documenta Shopify para otras listas). **(verificar: la ayuda oficial no documenta el formato de `list.single_line_text_field`. Antes de cargar el catálogo real, exporta un producto unisex ya llenado desde el formulario y copia el formato exacto que Shopify escribe en esa columna. Si es distinto, corrige la plantilla.)**
5. Admin → **Productos** → **Importar**, sube el CSV y revisa la vista previa.

### Cómo probar

Abre un producto importado: Género y Gama deben aparecer llenos en "Metafields". Para unisex, deben verse los dos valores.

### Si falla

- Quedaron vacíos: la definición no existía al importar, o el encabezado no es exacto. Crea la definición y vuelve a importar con la opción de sobrescribir productos con el mismo handle.
- Unisex quedó como un solo valor raro ("Hombre; Mujer" junto): el formato de lista no es el esperado; llénalo a mano en el formulario y usa la exportación como modelo.

## Parte 3. Filtros de Search & Discovery

Fuente: https://help.shopify.com/en/manual/online-store/search-and-discovery/filters

Orden final obligatorio: **Talla, Color, Género, Gama, Precio, Disponibilidad**.

1. Admin → **Apps** → **Search & Discovery** → **Filtros** ("Filters").
2. Para cada filtro: **Agregar filtro** ("Add filter") → campo **Fuente** ("Source") → elige el atributo → opcionalmente escribe el nombre en **Etiqueta del filtro** ("Filter label") → **Guardar**.

| Orden | Etiqueta (en español) | Fuente |
| --- | --- | --- |
| 1 | Talla | Opción de producto "Talla" (filtro de variante) |
| 2 | Color | Opción de producto "Color" (filtro de variante) |
| 3 | Género | Metacampo "Género" (`custom.genero`) |
| 4 | Gama | Metacampo "Gama" (`custom.gama`) |
| 5 | Precio | Precio ("Price") |
| 6 | Disponibilidad | Disponibilidad ("Availability") |

3. Quita o no actives los demás filtros estándar (Tipo de producto, Etiquetas, Proveedor, Categoría). **Proveedor nunca** (ver la advertencia).
4. Ordena arrastrando cada filtro hasta que queden en el orden de la tabla.
5. En Género y Gama, la fuente es la definición del metacampo; la ayuda confirma que se aceptan "Single line text" y "Single line text (List)". Solo aparecen valores después de que haya productos con el metacampo lleno.
6. Cambiar la etiqueta solo cambia lo que ve el cliente; no cambia el nombre original del atributo.
7. Los nombres exactos de las opciones en el desplegable "Fuente" **(verificar en pantalla)**.

### Cómo probar

En la tienda de desarrollo, abre `/collections/tenis`: los filtros deben salir en ese orden y con esos nombres (el tema pinta lo que entrega Shopify). En `/collections/gorras` no debe salir Talla (las gorras no tienen esa opción; ver `cargar-productos.md`).

### Si falla

- Género o Gama no aparecen: revisa que la definición tenga el acceso "Tiendas" activo y que haya productos con el valor lleno; espera unos minutos, pueden tardar en indexarse. **(verificar en pantalla)**
- Un valor sale con 0 productos o duplicado ("Hombre " con espacio): corrige el valor en el producto.
- El filtro de talla muestra tallas agotadas: es la verificación C2 de la spec (tarea 1). Se resuelve combinando con "Disponibilidad: en existencia"; no se resuelve en este runbook.

## Parte 4. Colecciones automáticas

Fuentes: https://help.shopify.com/en/manual/products/collections/automated-collections y https://help.shopify.com/en/manual/products/collections/conditions

Admin → **Productos** → **Colecciones** → **Agregar colección**. En "Productos" elige la fuente automática y **Agregar condición**. Elige "Los productos deben cumplir todas las condiciones" ("Match all conditions") y **Guardar**.

| Colección | Condiciones (cumplir todas) |
| --- | --- |
| Tenis | Tipo de producto es igual a `Tenis` |
| Gorras | Tipo de producto es igual a `Gorras` |
| En combo | Etiqueta incluye `combo` |

(Los textos exactos de los operadores: verificar en pantalla. La ayuda confirma "includes" y "does not include" para etiquetas, y "is equal to" para metacampos de texto de una línea.)

### Por qué "En combo" no lleva condición de Gama

Los Noctra Premium no participan en combos. Shopify no permite excluir productos por metacampo en una colección automática (solo admite "es igual a" y las exclusiones son por categoría, etiqueta, tipo y proveedor). Como los tenis que no son Premium tienen la Gama vacía, tampoco se puede pedir "Gama es igual a…". Por eso "En combo" se arma solo con la etiqueta `combo`. La protección es una sola:

1. **Regla de carga:** a un Noctra Premium **nunca** se le pone la etiqueta `combo` (checklist de `cargar-productos.md`). El tema no les muestra el sello de combo.

Actualización 16 nov 2026: los combos pasaron a descuentos automáticos nativos (SPEC-005), que se aplican a las colecciones "Tenis en combo" y "Gorras en combo" y no leen la Gama. Ya no hay una segunda defensa en el motor de combos.

Riesgo que queda: un Premium mal etiquetado aparecería en "En combo" y en "Tenis en combo", y **sí recibiría el descuento del combo** en el carrito y el checkout. Revisa esas colecciones después de cada carga.

### Cómo probar

- "Tenis" muestra solo tenis; "Gorras" solo gorras.
- Con los datos de `plantilla-productos.csv` (en borrador, actívalos para probar), "En combo" debe mostrar Umbra 01, Cenit 03 y Gorra Vesper, y **no** Eclipse 02 (Noctra Premium sin etiqueta `combo`).
- Ningún Noctra Premium aparece en "En combo", "Tenis en combo" ni "Gorras en combo". Si aparece, quítale la etiqueta `combo` de inmediato.

### Si falla

- La colección sale vacía: el tipo de producto no coincide exacto (`Tenis`, `Gorras`) o el producto está en borrador / no publicado en Tienda online.
- No aparece la condición de metacampo: falta activar "Usar como condición en colecciones".

## Agotados al final (PENDIENTE: verificar en la tarea 1 de la spec)

Decisión del equipo: los productos agotados van al final de la cuadrícula con el sello "Agotado". **No hay un procedimiento confirmado.** Lo que se pudo verificar en la ayuda oficial:

- Search & Discovery tiene en **Configuración → Filtros → Valores vacíos** ("Empty values") las opciones "Ocultar", "Mostrar al final" y "Mostrar en el orden predeterminado" (https://help.shopify.com/en/manual/online-store/search-and-discovery/filters). **Esto aplica a los valores de un filtro** (por ejemplo, un color sin existencias), **no a los productos de la colección**. No se debe confundir con "agotados al final".
- No se encontró en la ayuda oficial un ajuste nativo que mande los productos agotados al final de una colección. Búsqueda web: solo hay soluciones manuales o apps de terceros (no oficiales, posible costo mensual). Queda sin confirmar si Shopify añadió algo reciente: dev-tema-liquid lo valida en la tienda de desarrollo con el MCP `shopify-dev` (tarea 1, punto f).
- Una colección automática con "Inventario mayor que 0" oculta los agotados en lugar de enviarlos al final; no cumple la decisión.
- Ordenar la colección manualmente ("Manual") con los agotados abajo funciona solo para el orden "Destacados" y hay que mantenerlo a mano al cambiar el inventario.

Hasta que se cierre la tarea 1 y el equipo decida (tarea 4), no configurar nada aquí. Cuando haya resultado, completar esta sección con los pasos.

## Nota: sello "Nuevo" y republicar

El sello "Nuevo" cuenta 7 días desde la publicación. Si despublicas y vuelves a publicar un producto, puede volver a contar desde cero (por confirmar, tarea 1 punto h). Evita despublicar productos solo para editarlos: usa el estado "Borrador" únicamente si de verdad deben salir.

## Enlaces consultados (todos leídos el 13 nov 2026)

- https://help.shopify.com/en/manual/custom-data/metafields/metafield-definitions/creating-custom-metafield-definitions
- https://help.shopify.com/en/manual/products/import-export/using-csv
- https://help.shopify.com/en/manual/products/import-export/using-csv/csv-columns
- https://help.shopify.com/en/manual/online-store/search-and-discovery/filters
- https://help.shopify.com/en/manual/products/collections/automated-collections
- https://help.shopify.com/en/manual/products/collections/conditions
- https://apps.shopify.com/search-and-discovery (no abierta; enlace oficial de la app)

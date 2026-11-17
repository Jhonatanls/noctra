# Runbook: agregar tenis y gorras al catálogo

Los productos **no se programan**: se cargan en el admin de Shopify y el tema los muestra solo. No hace falta desplegar nada para agregar, cambiar precios o fotos.

## Un producto a la vez (admin de Shopify → Productos → Agregar producto)

1. **Título**: nombre del modelo sin la palabra tenis ni marcas de terceros, por ejemplo "Umbra 01".
2. **Descripción**: materiales, horma, para qué ocasión, cuidado. Pídela a `contenido-copy` si quieres.
3. **Multimedia**: arrastra las fotos y el video.
   - La **primera** foto es la que se ve en el catálogo y la que abre la ficha. La **segunda** aparece al pasar el mouse en computador. Ordénalas arrastrando.
   - Mínimo 5 fotos y un video corto (RF-04).
   - Formato vertical **4:5**, mínimo **1600 × 2000 px**, fondo neutro y uniforme (gris oscuro o claro), producto centrado.
   - En cada foto, "Agregar texto alternativo": describe lo que se ve ("Tenis Umbra 01 negro, vista lateral"). El texto alternativo es para personas con lector de pantalla: no lo uses para clasificar fotos.
   - **Galería por color (aplica cuando el equipo apruebe el cambio propuesto en SPEC-004; mientras tanto la ficha muestra todas las fotos):** si el producto tiene varios colores, la ficha mostrará solo las fotos y videos del color elegido. Para eso:
     1. Ordena la Multimedia **por color, en bloques seguidos**: primero todas las fotos y el video del Negro, después todas las del Blanco, y así con cada color. No mezcles colores dentro de un bloque.
     2. La **primera** foto de cada bloque es la "foto del color". En el paso 7 se asigna a sus variantes.
     3. El primer bloque es también el que se ve en el catálogo. Pon primero el color que quieras en la tarjeta.
     4. Si quieres fotos para todos los colores (por ejemplo, el empaque), ponlas **al principio**, antes del primer color: la ficha las muestra al final de la galería de cada color. Ten en cuenta que la primera de ellas será la foto del catálogo.
     5. Si no asignas foto a ninguna variante, la ficha muestra todas las fotos, como hoy.
4. **Precio**: en pesos, sin centavos (189900). **Precio de comparación** solo si es un precio anterior real (Estatuto del Consumidor): el tema lo muestra tachado.
5. **Costo por artículo**: lo que te cuesta. Shopify calcula el margen; no lo ve el cliente.
6. **Inventario**: activa "Hacer seguimiento de la cantidad" y SKU por variante.
7. **Variantes**:
   - **Tenis:** agrega la opción **Talla** con los números EUR (38, 39, 40…) y, si aplica, **Color**. Pon la cantidad de cada talla. Si una talla queda en 0, el tema la muestra tachada con "Preguntar disponibilidad por WhatsApp".
   - **Gorras:** **no agregues la opción "Talla"** (son de talla única o ajustable). Usa solo la opción **Color** (o una sola variante si hay un único color). Así el filtro de talla no aparece en la colección "Gorras".
   - Si una gorra llega con una opción "Talla" de un solo valor (por ejemplo, "Única"), la ficha no la muestra, pero quítala igual para mantener los datos limpios.
   - Con varios colores, asigna a cada variante su foto: así al elegir el color cambia la imagen.
     - **Cuando se apruebe la galería por color (SPEC-004):** asigna a **todas** las variantes de un color (todas sus tallas) la **misma** foto: la primera del bloque de ese color en Multimedia. Dos colores distintos nunca comparten foto asignada; si pasa, la ficha muestra todas las fotos para esos colores. Un color sin foto asignada también muestra todas las fotos.
   - **Plantilla de la ficha (solo gorras):** en la ficha de cada gorra, en **Plantilla de tema**, elige `gorra`. Esa plantilla no muestra selector de talla ni guía de tallas, muestra el selector de **Color** y el texto "Ajustable" (se cambia en el editor del tema: Productos → plantilla `gorra` → bloque "Texto"). Los tenis dejan la plantilla `Producto predeterminado`.
8. **Organización del producto**:
   - **Tipo de producto**: `Tenis` o `Gorras` (alimenta las colecciones automáticas).
   - **Etiquetas**: `grupo-tenis` o `grupo-gorras` y `combo` si participa en combos (la etiqueta `combo` más el tipo de producto lo meten en "Tenis en combo" o "Gorras en combo", que es lo que decide el descuento; las etiquetas `grupo-*` ya no deciden el combo, ver SPEC-005). **Los productos Noctra Premium nunca llevan la etiqueta `combo`.** La etiqueta `nuevo` ya no se usa: el sello "Nuevo" sale solo durante 7 días desde que se publica el producto.
   - **Metacampos** (sección "Metafields" del producto): **Género** (Hombre, Mujer, o los dos si es unisex) y **Gama** (`Noctra Premium` solo si lo es; si no, vacío). Género es obligatorio en todos los productos, o no aparecerán al filtrar por género. Cómo se crean: `docs/operaciones/filtros-y-metacampos.md`.
9. **Publicación**: marca los canales Tienda online y Facebook e Instagram (para el catálogo de redes y WhatsApp).
10. **SEO** (abajo): título y descripción cortos para Google.
11. **Estado**: `Borrador` mientras lo revisas; `Activo` para que aparezca en la tienda.

## Muchos productos a la vez (CSV)

1. Copia `docs/operaciones/plantilla-productos.csv` en Excel o Google Sheets. Cada fila es una variante (una talla de un tenis, un color de una gorra); el `Handle` agrupa las filas del mismo producto. Las dos últimas columnas son los metacampos **Género** y **Gama**: se llenan solo en la primera fila de cada producto. **Antes de importar, crea las dos definiciones de metacampo** (`docs/operaciones/filtros-y-metacampos.md`), o esas columnas no se guardarán. Para un modelo unisex escribe `Hombre; Mujer` (formato de lista por verificar con una exportación de tu tienda, ver ese runbook).
2. Las fotos van como URL pública en `Image Src`. Si las tienes en el computador, súbelas antes en Contenido → Archivos y copia sus enlaces.
3. Admin → Productos → Importar → sube el CSV. Shopify muestra una vista previa antes de crear nada.
4. Las cantidades de inventario es más seguro cargarlas después con la exportación e importación de **Inventario** del admin.

También puedes pedirle a Claude Code: "Convierte esta hoja de productos en un CSV de Shopify con la plantilla de docs/operaciones" y revisar el resultado antes de importarlo.

## Precios de combos

El precio individual de cada producto se pone en su ficha. Los combos no se cargan como productos: los aplican tres descuentos automáticos nativos de Shopify a los productos de las colecciones "Tenis en combo" y "Gorras en combo" (SPEC-005, `docs/operaciones/combos-nativos.md`). Para que el precio del combo cuadre, **todos los tenis en combo cuestan $175.000 y todas las gorras en combo $60.000**; un producto con otro precio no debe llevar la etiqueta `combo`. Si cambian el precio o el descuento de un combo, actualícenlo también en el metaobjeto `combo` y en la sección "Combos destacados" del inicio.

## Antes de activar un producto

- [ ] Fotos propias, sin logos ni marcas de terceros.
- [ ] Todas las tallas con su cantidad y SKU.
- [ ] Etiqueta `grupo-tenis` o `grupo-gorras` (y `combo` solo si no es Noctra Premium).
- [ ] Género lleno; Gama = `Noctra Premium` solo si lo es.
- [ ] Gorras sin opción "Talla" y con la plantilla de tema `gorra`.
- [ ] Con varios colores (cuando se apruebe la galería por color): Multimedia en bloques por color y cada variante con la primera foto de su color.
- [ ] Vista previa revisada en el celular.

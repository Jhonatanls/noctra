# Runbook: agregar tenis y gorras al catálogo

Los productos **no se programan**: se cargan en el admin de Shopify y el tema los muestra solo. No hace falta desplegar nada para agregar, cambiar precios o fotos.

## Un producto a la vez (admin de Shopify → Productos → Agregar producto)

1. **Título**: nombre del modelo sin la palabra tenis ni marcas de terceros, por ejemplo "Umbra 01".
2. **Descripción**: materiales, horma, para qué ocasión, cuidado. Pídela a `contenido-copy` si quieres.
3. **Multimedia**: arrastra las fotos y el video.
   - La **primera** foto es la que se ve en el catálogo y la que abre la ficha. La **segunda** aparece al pasar el mouse en computador. Ordénalas arrastrando.
   - Mínimo 5 fotos y un video corto (RF-04).
   - Formato vertical **4:5**, mínimo **1600 × 2000 px**, fondo neutro y uniforme (gris oscuro o claro), producto centrado.
   - En cada foto, "Agregar texto alternativo": describe lo que se ve ("Tenis Umbra 01 negro, vista lateral").
4. **Precio**: en pesos, sin centavos (189900). **Precio de comparación** solo si es un precio anterior real (Estatuto del Consumidor): el tema lo muestra tachado.
5. **Costo por artículo**: lo que te cuesta. Shopify calcula el margen; no lo ve el cliente.
6. **Inventario**: activa "Hacer seguimiento de la cantidad" y SKU por variante.
7. **Variantes**:
   - **Tenis:** agrega la opción **Talla** con los números EUR (38, 39, 40…) y, si aplica, **Color**. Pon la cantidad de cada talla. Si una talla queda en 0, el tema la muestra tachada con "Preguntar disponibilidad por WhatsApp".
   - **Gorras:** **no agregues la opción "Talla"** (son de talla única o ajustable). Usa solo la opción **Color** (o una sola variante si hay un único color). Así el filtro de talla no aparece en la colección "Gorras".
   - Con varios colores, asigna a cada variante su foto: así al elegir el color cambia la imagen.
8. **Organización del producto**:
   - **Tipo de producto**: `Tenis` o `Gorras` (alimenta las colecciones automáticas).
   - **Etiquetas**: `grupo-tenis` o `grupo-gorras` (obligatoria para que entre a los combos) y `combo` si participa en combos. **Los productos Noctra Premium nunca llevan la etiqueta `combo`.** La etiqueta `nuevo` ya no se usa: el sello "Nuevo" sale solo durante 7 días desde que se publica el producto.
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

El precio individual de cada producto se pone en su ficha. Los combos (2 tenis + 1 gorra = $350.000) no se cargan como productos: los aplica el motor de descuentos (SPEC-005) a cualquier producto con las etiquetas `grupo-*`. Si cambian el precio de un combo, actualícenlo también en la sección "Combos destacados" del inicio.

## Antes de activar un producto

- [ ] Fotos propias, sin logos ni marcas de terceros.
- [ ] Todas las tallas con su cantidad y SKU.
- [ ] Etiqueta `grupo-tenis` o `grupo-gorras` (y `combo` solo si no es Noctra Premium).
- [ ] Género lleno; Gama = `Noctra Premium` solo si lo es.
- [ ] Gorras sin opción "Talla".
- [ ] Vista previa revisada en el celular.

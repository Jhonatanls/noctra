# Runbook: configuración inicial (etapa 0)

Objetivo: dejar lista la tienda de desarrollo para que los agentes puedan probar el tema.

> Las pantallas del admin de Shopify cambian con frecuencia. Si un paso no coincide con lo que ves, búscalo en help.shopify.com y avisa al agente `operaciones-shopify` para actualizar esta guía.

## Requisitos previos

- Cuenta de Shopify Partners (gratis) o una tienda en prueba.
- Node.js 22 o superior y Shopify CLI instalados en el computador de desarrollo.
- Claude Code instalado.

## Pasos

1. **Crear la tienda de desarrollo** desde el panel de Partners (tienda de desarrollo para pruebas). Anota su dirección `xxxx.myshopify.com` y ponla en `shopify.theme.toml` (entorno `desarrollo`). No pongas contraseñas en ese archivo.
2. **Clonar este repositorio** y, dentro de la carpeta, ejecutar `shopify theme dev -e desarrollo`. La CLI pide iniciar sesión en el navegador.
3. **Menús** (Tienda online → Navegación):
   - `main-menu`: Tenis, Gorras, Combos, Guía de tallas.
   - `footer`: Envíos, Cambios y devoluciones, Garantía, Preguntas frecuentes, Términos y condiciones, Política de datos.
4. **Colecciones**: "Tenis" y "Gorras" (automáticas por tipo de producto) y "En combo" (etiqueta `combo` y Gama igual a Media, para excluir los Noctra Premium). Los pasos exactos están en `docs/operaciones/filtros-y-metacampos.md`.
5. **Productos de prueba**: al menos 3 tenis con opción **Talla** (valores EUR, por ejemplo 38 a 44) y **Color**, y 2 gorras. Etiquetas: `grupo-tenis` o `grupo-gorras`; `combo` si participan en combos (nunca en los Noctra Premium). Las gorras llevan solo la opción Color, sin Talla. La etiqueta `nuevo` ya no se usa. Usa fotos propias o de prueba sin marcas de terceros.
6. **Metaobjeto de guía de tallas** (Configuración → Datos personalizados → Metaobjetos → Agregar definición):
   - Nombre: Guía de tallas. Tipo (handle): `guia_tallas`.
   - Campos: `eur` (texto de una línea), `cm` (número decimal), `us` (texto de una línea).
   - Activa el acceso de la tienda online (Storefront) para que el tema pueda leerlo.
   - Crea una entrada por talla con las **medidas reales** de las hormas que venden.
7. **Página de guía de tallas** (Tienda online → Páginas): crea "Guía de tallas" y elige la plantilla `page.guia-tallas`.
8. **Ajustes del tema** (Personalizar → Configuración del tema): nombre de la marca, número de WhatsApp con indicativo (573…), umbral de envío gratis y redes.
9. **Filtros y metacampos** (app Search & Discovery): sigue el runbook `docs/operaciones/filtros-y-metacampos.md`. Filtros en este orden: Talla, Color, Género, Gama, Precio y Disponibilidad. No se crea filtro por marca.

## Cómo probar que quedó bien

- El inicio muestra la portada y las colecciones de Tenis y Gorras.
- En un tenis, cada talla muestra debajo su medida en cm y "¿Cuál es mi talla?" abre la guía.
- El botón "Pedir por WhatsApp" abre un mensaje con el nombre, la talla y el enlace.

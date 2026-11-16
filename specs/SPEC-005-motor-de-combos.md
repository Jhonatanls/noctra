# SPEC-005: Motor de combos

- **Estado:** borrador (lógica pura implementada y probada en `packages/combos`)
- **Etapa:** 3
- **Requerimientos:** RF-08, RF-09, RF-10, RF-11, RF-13
- **Responsable:** dev-funciones
- **Revisores:** qa-calidad, cumplimiento (términos de cada combo)

## Objetivo

Que los combos de precio fijo se apliquen solos en el carrito y en el checkout, que el equipo los cree y cambie sin tocar código, y que el cliente siempre sepa cuánto le falta para el siguiente combo.

## Alcance

- Modelo de datos de un combo.
- Algoritmo de asignación (fuente única en `packages/combos/src/combos.js`).
- Shopify Function de descuento que aplica el algoritmo en el checkout.
- La misma lógica en el tema (`assets/combos.js`) para mostrar "te falta…" y el ahorro en carrito y ficha (SPEC-006).
- Códigos de campaña e influenciadores con descuentos nativos de Shopify (RF-13), sin código propio.

## Fuera de alcance

- Precio Club (fase 2).
- Combos entre tiendas o canales distintos al online.

## Modelo de datos

```json
{
  "id": "look-completo",
  "nombre": "Combo Look completo",
  "precio": 35000000,
  "requisitos": { "tenis": 2, "gorras": 1 },
  "desde": "2026-12-01",
  "hasta": "2026-12-31",
  "activo": true,
  "limitePorPedido": 2
}
```

- `precio` en **centavos** de COP, igual que Shopify (350.000 pesos = 35.000.000).
- `requisitos`: grupo → cantidad. Un producto pertenece a un grupo por la etiqueta `grupo-<nombre>` (`grupo-tenis`, `grupo-gorras`).
- `desde`/`hasta` opcionales (fechas ISO, hora de Colombia); `limitePorPedido` opcional.
- Los combos **no se acumulan** con códigos de descuento salvo que el equipo lo decida por combo (se configura en la combinación de descuentos de Shopify).

## Algoritmo

1. Expandir el carrito en unidades (una línea con cantidad 2 son 2 unidades), cada una con su precio y su grupo.
2. Mientras sea posible: para cada combo vigente, tomar las unidades **más caras** disponibles de cada grupo requerido y calcular el ahorro (`suma de precios − precio del combo`).
3. Aplicar el combo con mayor ahorro positivo; marcar sus unidades como usadas. Repetir.
4. El descuento de cada aplicación se reparte entre sus unidades en proporción a su precio (para que devoluciones parciales sean justas).
5. Un combo sin ahorro positivo nunca se aplica (el cliente nunca paga más por un combo).

Elegir las unidades más caras maximiza el ahorro del cliente; es la regla que el equipo comunica ("siempre te damos el mejor precio").

## Mensaje "te falta…" (RF-10)

Con las unidades que quedaron sin combo, se calcula para cada combo vigente qué falta (por grupo) y se muestra el que necesita menos unidades: "Agrega 1 gorra y completa el Combo Look completo". Si hay empate, gana el de mayor ahorro posible.

## Dónde viven los combos (decisión pendiente del equipo)

| Opción | Cómo edita el equipo | Cómo lo lee la Function | Complejidad |
| --- | --- | --- | --- |
| A. Metaobjeto `combo` + sincronización | Admin → Contenido → Metaobjetos (formulario) | Un script o Flow copia los metaobjetos a un metacampo JSON del descuento | Media |
| B. Metacampo JSON de la tienda | Admin → Configuración → Metacampos (editar JSON) | Lee el metacampo directamente | Baja, pero editar JSON es propenso a errores |
| C. Interfaz propia en la app (extensión de admin) | Formulario en la página del descuento | Metacampo del descuento | Alta |

Recomendación: **A** para cumplir RF-09 ("sin tocar código") con poco desarrollo.

## Shopify Function

- App privada creada con `shopify app init` en `apps/combos/` y extensión de descuento generada con la CLI.
- **Antes de escribirla, verificar con el MCP `shopify-dev` la API vigente de Discount Functions** (nombres de targets, esquema de entrada y salida, versión de API). No escribir de memoria.
- Entrada: líneas del carrito con precio unitario, cantidad, id de variante y si el producto tiene las etiquetas `grupo-*` (`hasAnyTag`), más el metacampo de configuración.
- Salida: un descuento de monto fijo por línea según el reparto del algoritmo, con el mensaje "Combo <nombre>".

## Riesgo: plan de Shopify (bloqueante, agregado el 16 nov 2026)

**Decisión del equipo (16 nov 2026):** la tienda real pasa a **Shopify Plus** antes del lanzamiento, así que se mantiene la app privada con la Function de descuento. La Function se prueba en la tienda de desarrollo, donde sí corre. Mientras la tienda real esté en Basic, los combos no se aplican en el checkout real. Hay que actualizar "plan Basic al lanzar" en CLAUDE.md (sección 4); lo hace el equipo.

**Restricción verificada en shopify.dev (16 nov 2026):** "Stores on any plan can use public apps that are distributed through the Shopify App Store and contain functions. Only stores on a Shopify Plus plan can use custom apps that contain Shopify Function APIs."

La tienda lanza en plan **Basic**. La app privada que plantea la sección anterior (`apps/combos/`, creada con `shopify app init`) es una custom app. Se puede instalar y probar en la tienda de desarrollo, pero **su Function de descuento no correría en la tienda de producción**. Sin una decisión, la etapa 3 no tiene cómo aplicar los combos en el checkout. La lógica pura de `packages/combos` y su uso en el tema (`assets/combos.js`, mensajes "te falta…") no se ven afectados.

La misma restricción afecta a la contraentrega de SPEC-007 (no se puede ocultar el método con una Function propia).

### Alternativas

| Alternativa | Pros | Contras |
| --- | --- | --- |
| **1. Subir a Shopify Plus** | Se mantiene el diseño actual: Function propia con el algoritmo exacto (unidades más caras, reparto proporcional, `limitePorPedido`, exclusión de Noctra Premium). También resuelve la contraentrega de SPEC-007 con una Function de personalización de pagos | Costo mensual mucho mayor que Basic (consultar el precio vigente con Shopify; no se estima aquí). Sobredimensionado para el volumen de lanzamiento |
| **2. Publicar la app propia como pública en la App Store** | Conserva la Function y la fuente única de lógica. Corre en cualquier plan | Revisión de Shopify antes de publicarla, con sus requisitos (ficha de la app, política de privacidad, soporte, webhooks de datos personales, entre otros), que toma semanas y puede rechazarla. Mantenimiento como producto público. Hay que verificar con `shopify-dev` si existe una forma de distribución pública no listada y si cuenta como "distribuida por la App Store" |
| **3. App pública de combos o descuentos de la App Store** | Sin código propio para el checkout. Instalación rápida. Corre en Basic | Costo mensual. Hay que encontrar una que haga precio fijo por mezcla de grupos (2 tenis cualesquiera + 1 gorra) con la regla de las unidades más caras; si sus reglas difieren, el mensaje "te falta…" y el ahorro del carrito (calculados con `packages/combos`) no coincidirían con el checkout. Dependencia de un tercero con acceso a pedidos (revisión de cumplimiento). RF-09 ("configurable sin tocar código") queda en manos de la app |
| **4. Descuentos automáticos nativos de Shopify** | Gratis, sin app, sin código. Se configuran en el admin (RNF-17) | No existe "precio fijo por un conjunto". Las opciones nativas (monto o porcentaje sobre productos con cantidad mínima, "compra X y lleva Y") solo dan el precio exacto del combo si todos los productos elegibles de cada grupo tienen el mismo precio: con tenis de $190.000 y $180.000, un descuento fijo no deja el combo en $350.000 en todos los casos. Tampoco eligen las unidades más caras ni respetan `limitePorPedido` con la misma lógica. El tema tendría que replicar las reglas nativas para que el carrito diga lo mismo que el checkout |
| **4b. Nativos + precios uniformes** | Igual que 4, y el combo es exacto: si todos los tenis elegibles cuestan lo mismo y todas las gorras también, "2 tenis + 1 gorra" es un descuento de monto fijo conocido | Es una decisión comercial: obliga a tener un solo precio por grupo para los productos en combo. Cualquier producto con otro precio rompe el combo |

### Decisión

La decisión es **del equipo** y debe tomarse **antes de empezar la etapa 3**. Hasta entonces no se crea `apps/combos/` ni la extensión de descuento.

Para decidir, el equipo necesita: precio vigente de Plus; si los precios de los productos en combo serán uniformes por grupo; y una lista corta de apps públicas candidatas, que se revisa con `cumplimiento` y se prueba en la tienda de desarrollo con los criterios de esta spec. Si se elige 3, 4 o 4b, se reescriben la sección "Shopify Function" y los criterios "La Function devuelve el mismo descuento que `packages/combos`" y "El equipo crea un combo nuevo desde el admin y se aplica sin desplegar código", y se agregan pruebas que comparen el carrito con el checkout.

Sugerencia no vinculante: evaluar primero 4b, porque es la única sin costo ni terceros, y, si el equipo no quiere precios uniformes, comparar 3 con 1 por costo.

## Criterios de aceptación

- [x] 2 tenis ($190.000 y $180.000) + 1 gorra ($60.000) con el combo de $350.000 → ahorro $80.000.
- [x] 3 tenis ($200.000, $190.000, $180.000) con el combo de $420.000 → ahorro $150.000.
- [x] Con 1 tenis en el carrito, el mensaje dice que falta 1 tenis y 1 gorra, o 2 tenis, según el combo más cercano.
- [x] Un combo vencido o inactivo no se aplica.
- [x] Un combo que no genera ahorro no se aplica.
- [x] `limitePorPedido` se respeta.
- [ ] La Function devuelve el mismo descuento que `packages/combos` para los mismos casos (pruebas compartidas).
- [ ] El equipo crea un combo nuevo desde el admin y se aplica sin desplegar código.

## Plan

- [x] Lógica pura con pruebas (`npm test`).
- [x] Script `npm run sync:combos` que copia la lógica a `theme/assets/combos.js`.
- [ ] Verificar API de Discount Functions con `shopify-dev` y crear la app y la extensión.
- [ ] Definir con el equipo la opción A, B o C y crear el metaobjeto.
- [ ] Colección automática "En combo" (productos con etiqueta `combo`).


## Decisiones del equipo (13 nov 2026)

- **Los productos Noctra Premium (gama alta) nunca cuentan para un combo.** Un producto con el metacampo `custom.gama` = "Noctra Premium" queda excluido de todos los grupos de combo, aunque tenga la etiqueta `grupo-tenis` o `combo`. La exclusión va en la lógica pura (`packages/combos`) y en la Shopify Function, con pruebas, para que no dependa de que el equipo se acuerde de quitar etiquetas. Se implementa al aprobar esta spec. Por ahora no hay cambios de código.

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

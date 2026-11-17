# SPEC-007: Pagos, envíos y checkout

- **Estado:** borrador (reescrita el 16 nov 2026 con las decisiones del equipo; pendiente de aprobación)
- **Etapa:** 4
- **Requerimientos:** RF-15, RF-17 (modificado por el equipo: sin Wompi), RF-18 (activación y prueba), RF-19, RF-20, RF-27 (parcial: estado de pago según el medio); RNF-06, RNF-08, RNF-10, RNF-12, RNF-13 (parciales, en lo que toca a pagos y envíos)
- **Responsable:** operaciones-shopify (runbook `docs/operaciones/pagos-y-envios.md`) · el equipo ejecuta en el admin
- **Revisores:** cumplimiento, qa-calidad, contenido-copy (textos de instrucciones y mensajes), dev-tema-liquid (solo los ajustes del tema de la tarea 11)

## Objetivo

Que el cliente pague como prefiera (cuotas, Mercado Pago, transferencia o contraentrega), que el envío lo haga una sola transportadora con recaudo y que cada pedido llegue al equipo con el estado de pago correcto, sin que el tema toque datos de pago ni prometa condiciones que no estén confirmadas.

## Trazabilidad

| Requerimiento | Qué cubre esta spec | Dónde se cumple |
| --- | --- | --- |
| RF-15 | Dirección con departamento y ciudad de Colombia (formulario nativo del checkout) y costo de envío de la transportadora. El costo **por ciudad** depende de que la app de la transportadora calcule tarifas en el checkout; con zonas nativas el costo llega solo a nivel de departamento (ver "Envíos") | Admin: Envíos y entregas + app de la transportadora |
| RF-17 | Medios de pago: **Addi, Sistecrédito, Mercado Pago (tarjeta, PSE y los demás medios que el equipo active en su cuenta), transferencia bancaria y pago contraentrega**. **Wompi sale del alcance** por decisión del equipo (16 nov 2026) | Admin: Configuración → Pagos + apps oficiales |
| RF-18 | Activación del mensaje de cuotas ya construido en SPEC-004 (bloques de app + ajuste `mostrar_cuotas` + "Sujeto a aprobación.") y su prueba con las apps reales; cuotas en el carrito solo si las apps entregan un bloque para el carrito | Apps de Addi y Sistecrédito + editor del tema; tema solo si aplica la tarea 11 |
| RF-19 | Contraentrega solo en los municipios habilitados, con la app pública "Control Contraentrega Colombia" (Moship), sin Function propia; monto máximo y confirmación por WhatsApp antes de despachar (ver "Contraentrega") | App pública + admin + proceso del equipo |
| RF-20 | Transferencia como método manual con instrucciones; comprobante por WhatsApp o correo; pedido "pendiente de pago" hasta validar. **Cambio respecto al texto de RF-20:** la "carga de comprobante" no se hace en la tienda sino por WhatsApp o correo (para cumplir RNF-08) | Admin (método manual) + proceso del equipo |
| RF-27 (parcial) | Estado de pago con que nace cada pedido según el medio y qué ve el cliente. Los estados de preparación, despacho y entrega los define SPEC-008 | Admin (estados nativos); detalle en SPEC-008 |
| RNF-06 | Ningún dato de tarjeta pasa por el tema: todo lo procesan Mercado Pago, Addi y Sistecrédito en su propio flujo | Pasarelas; revisión de cumplimiento |
| RNF-08 | Comprobantes de transferencia nunca en una URL pública (ni en Contenido → Archivos, que son públicos) | Proceso del equipo |
| RNF-10 | Textos de pago y envío del tema sin promesas no confirmadas; condiciones en la política de envíos del admin | Tema + políticas (SPEC-010) |
| RNF-12 | Persona jurídica y cuentas empresariales como requisito previo de cada pasarela | Equipo (trámites) |
| RNF-13 | Catálogo legítimo, condición de todas las pasarelas | Equipo + cumplimiento |

**Cambio de requerimientos por decisión del equipo (16 nov 2026):**

- RF-17 se reescribe sin Wompi. Propuesta aplicada en `docs/contexto/requerimientos.md` (fila RF-17, con la nota "cambio por decisión del equipo 16 nov 2026").
- Quedan por actualizar, sin tocar en esta spec: la línea 24 de `docs/contexto/requerimientos.md` ("Pagos con Mercado Pago y Wompi"), `CLAUDE.md` sección 1 (párrafo inicial) y sección 3 (tabla "Quién hace qué"), `docs/decisiones/ADR-001-shopify-tema-propio.md`, `docs/GUIA-CLAUDE-CODE.md` (etapa 4) y la descripción del agente `.claude/agents/operaciones-shopify.md`. CLAUDE.md y la configuración de agentes los cambia el equipo.
- RF-20: el comprobante se recibe por WhatsApp o correo, no con una carga en la tienda.
- RF-19: "ciudades habilitadas" se cumple en el checkout con la app de Moship (el método no aparece fuera de los municipios habilitados). Si la app no permite tope por monto, el monto máximo se cumple con la confirmación por WhatsApp antes de despachar, no impidiendo elegir el método. Esa parte requiere aceptación explícita del equipo al aprobar esta spec.

Sin spec: ninguno de los RF de pagos queda descubierto. La factura electrónica al quedar pagado un pedido (RNF-11) va en SPEC-010; la notificación de despacho y guía (RF-23) en SPEC-009.

## Alcance

- Configuración en el admin de Mercado Pago, Addi, Sistecrédito, transferencia (método manual) y contraentrega (método manual), en modo de prueba primero.
- Envíos con una sola transportadora (por definir) que ofrezca recaudo contraentrega: tarifas, zonas, cobertura y envío gratis desde el umbral que defina el equipo.
- Contraentrega por municipio con la app "Control Contraentrega Colombia" (Moship), runbook `docs/operaciones/contraentrega-moship.md`.
- Flujo de transferencia: instrucciones, recepción del comprobante y validación.
- Estado de pago inicial por medio y lo que ve el cliente en la página de gracias y en el correo de confirmación.
- Activación del mensaje de cuotas en la ficha (SPEC-004, C19) y decisión sobre el carrito.
- Marca en el checkout (logo, colores y tipografía disponibles en el editor del checkout del plan Basic).
- Revisión de los textos del tema que hablan de pagos o envíos: barra de anuncios, ficha, carrito y pie.
- Runbook `docs/operaciones/pagos-y-envios.md`.

## Fuera de alcance

- **Wompi** (decisión del equipo, 16 nov 2026).
- Una Shopify Function propia de personalización de pagos o de validación del checkout: la tienda sigue en plan Basic, sin Plus (decisión del equipo, 16 nov 2026), y ahí las Functions propias no corren. La app de Moship trae su propia función como app pública, lo que sí se permite en Basic (por confirmar, pregunta 17).
- Estados de preparación, despacho, entrega y devolución, y pedidos borrador por WhatsApp (SPEC-008).
- Notificaciones de despacho y número de guía por WhatsApp y correo (SPEC-009).
- Redacción de las políticas de envío, cambios y retracto (SPEC-010). Esta spec solo dice qué datos necesitan.
- Factura electrónica DIAN (SPEC-010, RNF-11).
- Carrito lateral (SPEC-006). Si las cuotas van en el carrito, se agregan primero en `/cart` y SPEC-006 las hereda.
- Datáfono y pagos en la tienda física (fase 2).

## Qué se programa y qué se configura

| Pieza | Tipo | Quién |
| --- | --- | --- |
| Mercado Pago como proveedor de pagos externo, medios activos en su cuenta | Admin → Configuración → Pagos | Equipo, con el runbook |
| Apps oficiales de Addi y Sistecrédito (pago y mensaje de cuotas) | Shopify App Store + Configuración → Pagos | Equipo, con el runbook |
| Transferencia: método de pago manual con nombre, detalles e instrucciones | Admin → Configuración → Pagos → Métodos de pago manuales | Equipo; textos de contenido-copy |
| Contraentrega: método de pago manual con instrucciones | Igual que transferencia | Equipo; textos de contenido-copy |
| Restricción de contraentrega por municipio | App pública "Control Contraentrega Colombia" (Moship), instalada y configurada en el admin | Equipo, con `docs/operaciones/contraentrega-moship.md` |
| Monto máximo de contraentrega | En la app, si lo permite; si no, revisión del equipo en la confirmación por WhatsApp | Equipo |
| Transportadora: app de la transportadora o tarifas manuales por zona | Shopify App Store + Configuración → Envíos y entregas | Equipo |
| Envío gratis | Tarifa con condición de precio del pedido en cada zona (nativo) + ajuste del tema `envio_gratis_desde` para la barra del carrito | Equipo |
| Marca en el checkout | Editor del checkout (Configuración → Checkout → Personalizar) | Equipo, con el runbook |
| Correo de confirmación de pedido con las instrucciones de pago manual | Configuración → Notificaciones | Equipo; textos de contenido-copy |
| Plantilla de mensaje de WhatsApp para confirmar contraentrega y para pedir el comprobante | Respuestas rápidas de WhatsApp Business | Equipo; textos de contenido-copy |
| `mostrar_cuotas` y bloques de app de cuotas en la ficha | Editor del tema (ya programado en SPEC-004) | Equipo |
| Bloque de app de cuotas en el carrito | Tema (`sections/main-cart.liquid`), **solo si** la tarea 1 confirma que las apps lo entregan | dev-tema-liquid |
| Texto de la barra de anuncios | Editor del tema (`sections/header-group.json`) | Equipo, tras revisión de cumplimiento |
| Íconos de medios de pago en el pie | Tema (ya existe: `shop.enabled_payment_types` con `payment_type_svg_tag`) | Ninguno: solo verificar |
| Shopify Function propia | **No aplica**: tienda en Basic sin Plus; la función de la app de Moship es de un tercero y no se programa aquí | — |

## Medios de pago (RF-17)

| Medio | Cómo se activa | Requisito previo | Comisión |
| --- | --- | --- | --- |
| Addi | App oficial de Addi | Aprobación de Addi; persona jurídica (pregunta 11) | La de Addi + la comisión de Shopify por pasarela externa |
| Sistecrédito | App oficial de Sistecrédito | Aprobación de Sistecrédito (pregunta 11) | La de Sistecrédito + comisión de Shopify |
| Mercado Pago | Proveedor de pagos externo | Cuenta empresarial verificada | La de Mercado Pago + comisión de Shopify |
| Transferencia bancaria | Método de pago manual | Cuenta bancaria empresarial (pregunta 10) | Sin comisión de pasarela (verificar en la tarea 1 que Shopify no cobra comisión sobre métodos manuales) |
| Contraentrega | Método de pago manual | Transportadora con recaudo (pregunta 1) | La del recaudo de la transportadora (pregunta 8) |

- **Mercado Pago:** cubre tarjeta y PSE, y los demás medios que el equipo active en su cuenta. Esta spec no supone cuáles (pregunta 9). Lo que vea el cliente en el checkout sale de la cuenta, no del tema.
- La comisión adicional de Shopify por pasarela externa es la que ya registra `docs/contexto/requerimientos.md` (2 % en Basic); el runbook la confirma con el precio vigente del plan.

## Envíos (RF-15)

- **Una sola transportadora**, por definir (pregunta 1), con servicio de recaudo contraentrega.
- El checkout nativo pide departamento y ciudad. Hay que verificar en la tarea 1 si en Colombia la ciudad es una lista o texto libre: si es texto libre, cualquier regla por ciudad (de una app o del equipo) debe tolerar variaciones de escritura.
- **Costo por ciudad:** las zonas de envío nativas llegan hasta el departamento. Para que el costo cambie por ciudad hace falta que la app de la transportadora calcule la tarifa en el checkout (tarifas calculadas por terceros). En la tarea 1 se verifica si eso está disponible en plan Basic y con qué condición. Si no lo está, la alternativa es una tarifa por departamento, y RF-15 queda parcial (el equipo decide).
- **Envío gratis:** tarifa nativa con condición "precio del pedido desde X" en cada zona, más el ajuste del tema `envio_gratis_desde` para la barra del carrito. Los dos valores deben coincidir. Hoy el ajuste está en 0 (barra oculta) y así sigue hasta que el equipo defina el umbral y lo publique en la política de envíos (pregunta 5).
- Quién paga el envío, tiempos de entrega por ciudad y cobertura: preguntas 4 y 6. Viven en la política de envíos del admin, no en el código.

## Contraentrega (RF-19)

### Recomendación: app "Control Contraentrega Colombia" (Moship)

La tienda sigue en plan Basic, sin Plus y sin Functions propias (decisión del equipo, 16 nov 2026). La contraentrega se controla por municipio con la app pública **"Control Contraentrega Colombia"** de Moship, instalada desde la App Store. No se programa nada: la app muestra u oculta el método de pago manual "Pago contraentrega" según el municipio de la dirección de envío. Pasos y verificaciones: `docs/operaciones/contraentrega-moship.md`.

Por qué esta y no otra: cumple RF-19 en el checkout (el cliente fuera de cobertura no ve el método), sin código propio y sin cambiar de plan. Las apps públicas con funciones de personalización de pagos corren en cualquier plan; lo que exige Plus son las Functions propias en custom apps (restricción citada en "Historial").

**Antes de instalarla hay que verificar** (pregunta 17): que la app existe en la App Store con ese nombre y desarrollador, su costo vigente y que funciona en plan Basic. El runbook registra lo que se leyó en la ficha el 16 nov 2026, incluida una nota de compatibilidad que no se pudo leer completa; nada de eso se da por confirmado hasta que el equipo lo vea en pantalla y lo pruebe en el periodo de prueba de la app.

Puntos que la app no resuelve o que están por confirmar:

1. **Monto máximo:** la ficha no menciona límite por monto. Si la app no lo permite, el monto máximo se revisa en la confirmación por WhatsApp antes de despachar (pregunta 2).
2. **Cobertura real de recaudo:** la app solo muestra u oculta el método. Los municipios activos deben coincidir con la cobertura de recaudo de la transportadora (preguntas 1 y 3).
3. **Datos personales:** la app pide acceso a datos de clientes y pedidos. Cumplimiento la revisa frente a la Ley 1581 y la política de datos antes de instalar.
4. **Ciudad escrita a mano:** si la ciudad del checkout es texto libre, hay que probar variaciones de escritura (tarea 1 y C9).

Si la app no pasa la verificación o no funciona en Basic, el plan de respaldo es la alternativa A del historial (método manual para todos y validación por WhatsApp), hasta que el equipo elija otra app pública.

### Flujo

1. El cliente escribe su dirección en el checkout. Si el municipio está habilitado en la app, ve "Pago contraentrega" con sus instrucciones; si no, no lo ve.
2. Al elegirlo, el pedido nace con pago **pendiente**. La página de gracias y el correo de confirmación muestran las instrucciones.
3. El equipo escribe al cliente por WhatsApp con la plantilla de confirmación (contenido-copy): productos, combo aplicado si hay, total, dirección, municipio y, si aplica, el recargo (pregunta 7).
4. Si el total no pasa del máximo (cuando la app no lo controla) y el cliente confirma, el equipo prepara y despacha (SPEC-008).
5. Si no cumple, el equipo ofrece pagar por otro medio (enlace de pago o transferencia) o cancela el pedido. Cancelar devuelve el inventario.
6. El pedido se marca como pagado cuando corresponda según la pregunta 12 (al entregar o al recibir el recaudo de la transportadora).

## Transferencia (RF-20)

1. El cliente elige "Transferencia bancaria". Las instrucciones del método muestran los datos de la cuenta empresarial (los escribe el equipo en el admin, nunca en el código) y piden enviar el comprobante por WhatsApp o correo con el número de pedido.
2. El pedido nace con pago **pendiente**. Inventario reservado según la configuración nativa (verificar en la tarea 1 cuándo descuenta inventario un pedido con pago manual).
3. El equipo valida el comprobante contra el extracto bancario y marca el pedido como pagado.
4. El comprobante se guarda solo en el WhatsApp o el correo del equipo. **Nunca** se sube a Contenido → Archivos, a un metacampo ni a un comentario visible del pedido (los archivos de Shopify tienen URL pública; RNF-08).
5. Si el pago no llega en el plazo que defina el equipo (pregunta 15), el pedido se cancela y el inventario se libera.

## Estado de pago por medio (RF-27, relación con SPEC-008)

Lo que sigue es el comportamiento esperado. Se confirma con un pedido de prueba por medio (tarea 13).

| Medio | Estado de pago al crear el pedido | Qué ve el cliente | Qué hace el equipo |
| --- | --- | --- | --- |
| Mercado Pago (aprobado al instante) | Pagado | Página de gracias y correo de confirmación | Preparar (SPEC-008) |
| Mercado Pago (medio que queda en espera, si el equipo activa alguno) | Pendiente hasta que Mercado Pago lo confirme | Página de gracias con pago en proceso | Esperar la confirmación; no despachar antes |
| Addi / Sistecrédito (crédito aprobado) | Pagado | Página de gracias; el plan de cuotas lo informa la pasarela | Preparar |
| Addi / Sistecrédito (crédito rechazado) | No se crea pedido (verificar en la tarea 1) | Vuelve al checkout para elegir otro medio | — |
| Transferencia | Pendiente | Página de gracias y correo con las instrucciones y cómo enviar el comprobante | Validar comprobante y marcar como pagado |
| Contraentrega | Pendiente | Página de gracias y correo con las instrucciones y el aviso de confirmación por WhatsApp | Confirmar por WhatsApp, despachar y marcar como pagado según la pregunta 12 |

- El estado "pendiente de pago" de RF-27 es el estado de pago nativo "Pendiente". Los demás estados de RF-27 (en preparación, despachado, entregado, devuelto) los define SPEC-008.
- Regla para todo el equipo: **no se despacha ningún pedido con pago pendiente**, salvo contraentrega confirmada por WhatsApp.

## Cuotas (RF-18)

SPEC-004 ya construyó la pieza del tema y esta spec no la cambia:

- Bloque "Mensaje de cuotas" en la ficha, seguido de los bloques de app de Addi y Sistecrédito.
- Ajuste global `mostrar_cuotas` (apagado por defecto). Apagado: no se pinta ningún bloque de cuotas ni la nota. Encendido con al menos un bloque: bloques y, debajo, "Sujeto a aprobación." en texto secundario. Encendido sin bloques: nada.
- El tema no calcula cuotas: el monto lo calcula cada app.

Lo que define esta spec:

1. **Cuándo se enciende:** solo cuando Addi o Sistecrédito estén aprobados y activos **en producción** (no en modo de prueba) y un pedido de prueba con ese medio haya funcionado. Antes, `mostrar_cuotas` sigue apagado en `prod`.
2. **Orden de activación:** instalar la app → agregar su bloque debajo de "Mensaje de cuotas" en la plantilla de tenis y en la de gorras → encender `mostrar_cuotas` → revisar a 360 px en ambos modos.
3. **Si una app solo entrega incrustación (app embed):** el tema no la puede apagar con `mostrar_cuotas`. Su visibilidad se controla en Configuración del tema → Incrustaciones de app, y la nota "Sujeto a aprobación." no aparece sola (SPEC-004). Se anota en "Notas y decisiones" tras la tarea 1 y cumplimiento revisa si la app ya incluye un aviso equivalente.
4. **Carrito:** al lanzar, el carrito **no** muestra cuotas, salvo que la tarea 1 confirme que alguna app entrega un bloque para el carrito. En ese caso, la tarea 11 agrega en `/cart` un espacio de bloques de app bajo el total con la misma regla de `mostrar_cuotas` y la nota "Sujeto a aprobación.".
5. **Texto de la nota:** "Sujeto a aprobación." hasta que cumplimiento confirme si las condiciones de Addi o Sistecrédito exigen otro (pregunta 4 de SPEC-004).

## Textos del tema sobre pagos y envíos (RNF-10)

| Lugar | Hoy | Criterio |
| --- | --- | --- |
| Barra de anuncios (`sections/header-group.json`) | "Envíos a toda Colombia" | Solo puede quedar si la transportadora elegida confirma cobertura en todo el país **y** la política de envíos lo dice. Si no, se cambia por un texto confirmado o se quita. El otro mensaje ("Combos desde $350.000") depende de los combos definitivos (SPEC-005) y cumplimiento lo revisa en la misma pasada |
| Ficha | Mensaje de cuotas detrás de `mostrar_cuotas`; desplegable "Envíos y cambios" con enlaces a las políticas (SPEC-004) | Sin cambios. No se agregan plazos, cobertura ni medios de pago escritos en el código |
| Carrito | "IVA incluido. El envío se calcula al finalizar la compra." y barra de envío gratis si `envio_gratis_desde` > 0 | Sin cambios de texto. La barra sigue apagada hasta que exista el umbral y la política de envíos lo publique |
| Pie | Íconos de `shop.enabled_payment_types` | Muestra solo los medios que Shopify reporta como activos. Los métodos manuales no tienen ícono y no se dibujan a mano. No se agregan logos de pasarelas como imágenes propias |

- El tema no escribe en el código una lista de medios de pago, montos máximos, ciudades, tiempos, recargos ni datos bancarios. Si el equipo quiere anunciarlos, van como texto del editor (barra de anuncios) o en las políticas, con revisión de cumplimiento.
- Ningún texto dice "envío gratis" mientras no haya umbral definido y publicado.

## Marca en el checkout

- El checkout no tiene modo claro y oscuro: usa un solo esquema. El equipo elige cuál (pregunta 16). En cualquier caso, texto y botones con contraste AA y logo legible sobre el fondo elegido.
- Logo: el equipo sube la versión del logo que corresponda al fondo elegido, desde `docs/marca/` (reglas en `docs/marca/README.md`).
- Tipografía: en la tarea 1 se verifica si el editor del checkout de plan Basic permite fuentes propias o solo una lista. Si no permite Pirata One ni Jost, se usa la fuente de la lista más cercana a Jost y el logo lleva la identidad.

## Datos y configuración

Todos los valores marcados "pregunta" los define el equipo. Ningún agente los inventa.

| Dato | Dónde vive | Valor |
| --- | --- | --- |
| Transportadora | Admin (app o tarifas) | Pregunta 1 |
| Monto máximo de contraentrega | Instrucciones del método + política de envíos | Pregunta 2 |
| Municipios con cobertura de recaudo | App de Moship + política de envíos | Pregunta 3 |
| Quién paga el envío y tarifas | Envíos y entregas + política de envíos | Pregunta 4 |
| Umbral de envío gratis | Tarifa nativa + `envio_gratis_desde` (hoy 0) | Pregunta 5 |
| Tiempos de entrega | Política de envíos | Pregunta 6 |
| Recargo por contraentrega | Tarifa o instrucciones | Pregunta 7 |
| Medios activos en Mercado Pago | Cuenta de Mercado Pago | Pregunta 9 |
| Datos bancarios | Instrucciones del método manual de transferencia | Pregunta 10 |
| `mostrar_cuotas` | Editor del tema | Apagado hasta cumplir "Cuándo se enciende" |

## Criterios de aceptación

Se verifican en la tienda de desarrollo con cada pasarela en modo de prueba. C3, C4 y C13 se verifican en producción si Addi o Sistecrédito no ofrecen modo de prueba (lo confirma la tarea 1). Pedido de prueba: un tenis de $189.900 con talla 41 en Negro, enviado a una dirección de prueba. Los montos de contraentrega se expresan con M, el monto máximo que defina el equipo (pregunta 2).

| # | Criterio |
| --- | --- |
| C1 | [ ] Dado Mercado Pago en modo de prueba, cuando pago el pedido de prueba con una tarjeta de prueba aprobada, entonces el pedido queda "Pagado" y el cliente ve la página de gracias y recibe el correo de confirmación. |
| C2 | [ ] Dado Mercado Pago en modo de prueba, cuando pago con PSE de prueba, entonces el pedido queda en el estado que reporta Mercado Pago (pagado o pendiente) y nunca "Pagado" antes de que Mercado Pago lo confirme. |
| C3 | [ ] Dado Addi activo, cuando el cliente paga el pedido de prueba con Addi y el crédito se aprueba, entonces el pedido queda "Pagado"; cuando el crédito se rechaza, entonces el cliente vuelve al checkout y no queda un pedido pagado. |
| C4 | [ ] Lo mismo que C3 con Sistecrédito. |
| C5 | [ ] Dada la transferencia como método manual, cuando el cliente la elige y completa el pedido, entonces el pedido queda "Pendiente" y la página de gracias y el correo muestran los datos bancarios y cómo enviar el comprobante por WhatsApp o correo, con el número de pedido. |
| C6 | [ ] Dado un pedido por transferencia "Pendiente", cuando el equipo valida el comprobante y lo marca como pagado, entonces queda "Pagado"; el comprobante no aparece en Contenido → Archivos ni en ninguna URL pública (revisión de cumplimiento, RNF-08). |
| C7 | [ ] Dada la app de Moship activa y un municipio habilitado, cuando el cliente elige "Pago contraentrega", entonces ve antes de pagar las instrucciones con el monto máximo M y el aviso de confirmación por WhatsApp; el pedido queda "Pendiente". |
| C8 | [ ] Dado un pedido con contraentrega por M + $1.000 en un municipio habilitado (si la app no limita por monto), cuando el equipo lo revisa siguiendo el runbook, entonces no lo despacha y le ofrece otro medio por WhatsApp o lo cancela, y al cancelar el inventario de la talla 41 en Negro vuelve a subir 1 unidad. |
| C9 | [ ] Dada la app de Moship activa, cuando llego al paso de pago con una dirección en un municipio **no** habilitado, entonces "Pago contraentrega" no aparece; con el pedido de prueba de $189.900 en un municipio habilitado, sí aparece. Se repite escribiendo el mismo municipio con y sin tilde y con mayúsculas distintas. Si la app permite tope por monto, también: con M + $1.000 no aparece y con M sí. |
| C20 | [ ] Antes de instalar la app, el equipo deja anotado en "Notas y decisiones" que la vio en la App Store con ese nombre y desarrollador, su costo vigente, que no exige un plan superior a Basic, y la revisión de cumplimiento sobre los datos que pide. |
| C10 | [ ] Dado el pedido de prueba a una ciudad de cada zona configurada, cuando llego al paso de envío, entonces veo la tarifa de la transportadora para esa zona (o para esa ciudad, si la app calcula por ciudad). |
| C11 | [ ] Dado un umbral de envío gratis U definido por el equipo, con la tarifa nativa y `envio_gratis_desde` = U: con un carrito de U − $1.000 el checkout cobra envío y el carrito dice cuánto falta; con un carrito de U, el checkout muestra envío gratis y el carrito dice "Tu pedido tiene envío gratis.". Con `envio_gratis_desde` en 0, la barra no aparece. |
| C12 | [ ] Dado `mostrar_cuotas` apagado en `prod` mientras Addi y Sistecrédito no estén activos en producción, entonces la ficha no muestra cuotas ni "Sujeto a aprobación." (repite C18 de SPEC-004 en `prod`). |
| C13 | [ ] Dadas las apps de Addi y Sistecrédito activas y sus bloques agregados debajo de "Mensaje de cuotas", cuando enciendo `mostrar_cuotas`, entonces la ficha del tenis de $189.900 muestra el mensaje de cuotas de cada app seguido de "Sujeto a aprobación." en 360 px y 1280 px, oscuro y claro, con contraste AA (cierra C19 de SPEC-004). |
| C14 | [ ] Dado que la tarea 1 confirma un bloque de cuotas para el carrito, cuando `mostrar_cuotas` está encendido, entonces `/cart` muestra el bloque bajo el total con "Sujeto a aprobación."; apagado, no muestra nada. Si no hay bloque para el carrito, este criterio no aplica y se anota. |
| C15 | [ ] El pie muestra solo los íconos que entrega `shop.enabled_payment_types` para los medios activos; ningún ícono de pasarela está dibujado a mano ni guardado en `theme/assets/`. |
| C16 | [ ] Antes de unir a `prod`, cumplimiento revisa la barra de anuncios: "Envíos a toda Colombia" solo queda si la transportadora cubre todo el país y la política de envíos lo publica; si no, se cambia o se quita. |
| C17 | [ ] Ningún archivo de `theme/` contiene datos bancarios, montos máximos, listas de ciudades, tiempos de entrega, recargos ni el nombre de Wompi (búsqueda en el repositorio, revisión de cumplimiento). |
| C18 | [ ] Ningún archivo del tema recibe, guarda ni envía datos de tarjeta: el pago ocurre dentro de Mercado Pago, Addi o Sistecrédito (revisión de cumplimiento, RNF-06). |
| C19 | [ ] El checkout muestra el logo de Noctra legible y textos y botones con contraste AA en el esquema elegido por el equipo, a 360 px y 1280 px. |

## Plan

Cada tarea cabe en menos de un día. La tarea 2 bloquea las de configuración real; las tareas 3 a 9 se pueden escribir antes con los datos marcados como pendientes.

1. [ ] **Verificar plataforma** (operaciones-shopify, con el MCP `shopify-dev`): métodos manuales en plan Basic (nombre, instrucciones, estado "Pendiente", cuándo descuentan inventario, si Shopify les cobra comisión); si el envío gratis nativo se calcula sobre el subtotal ya descontado por los combos (SPEC-006); si las tarifas calculadas por terceros están disponibles en Basic y con qué condición; si la ciudad en direcciones de Colombia es lista o texto libre; opciones de fuente y colores del editor del checkout en Basic; qué entregan Addi y Sistecrédito (bloque de app, incrustación, bloque para carrito) y qué pasa con el pedido si el crédito se rechaza. Anotar en "Notas y decisiones".
2. [ ] **Decisiones del equipo** (equipo): responder las preguntas 1 a 17, verificar la app de Moship en la App Store (C20) y aceptar los cambios de RF-19 y RF-20.
3. [ ] **Runbook, Mercado Pago** (operaciones-shopify): activar, modo de prueba, medios de la cuenta, prueba de pago (C1, C2).
4. [ ] **Runbook, Addi y Sistecrédito** (operaciones-shopify): instalar, modo de prueba, bloques en las plantillas de tenis y gorras, cuándo y cómo encender `mostrar_cuotas` (C3, C4, C12, C13). Reemplaza la tarea 15 de SPEC-004.
5. [ ] **Runbook, transferencia** (operaciones-shopify): método manual, instrucciones, validación del comprobante, dónde guardarlo y dónde no, plazo de cancelación (C5, C6).
6. [ ] **Runbook, contraentrega** (operaciones-shopify): completar `docs/operaciones/contraentrega-moship.md` con lo que confirme la tarea 2 (instalación, municipios, monto si la app lo permite) y la revisión del monto por WhatsApp antes de despachar si no lo permite (C7, C8, C9).
7. [ ] **Runbook, envíos** (operaciones-shopify): app de la transportadora o tarifas por zona, envío gratis nativo y `envio_gratis_desde` con el mismo valor (C10, C11).
8. [ ] **Runbook, checkout y notificaciones** (operaciones-shopify): marca del checkout, correo de confirmación con las instrucciones de pago manual (C19).
9. [ ] **Textos** (contenido-copy): nombres e instrucciones de los métodos manuales, plantillas de WhatsApp para confirmar contraentrega y pedir el comprobante, sección de pagos y envíos de la política de envíos (con SPEC-010). Sin datos inventados: deja marcadores donde falten.
10. [ ] **Revisión de cumplimiento** (cumplimiento): textos de la tarea 9, barra de anuncios, nota de cuotas frente a las condiciones de Addi y Sistecrédito, datos que pide la app de Moship (Ley 1581), RNF-06 y RNF-08 (C6, C16, C17, C18, C20).
11. [ ] **Ajustes del tema** (dev-tema-liquid), solo lo que aplique tras las tareas 1 y 10: espacio de bloques de app de cuotas en `/cart` con la regla de `mostrar_cuotas` (C14); cambio del texto por defecto de la barra de anuncios si cumplimiento lo pide (traer antes la versión de `prod` de `sections/header-group.json`). Si no aplica nada, se marca como no aplica.
12. [ ] **Pedidos de prueba en desarrollo** (qa-calidad con el equipo): un pedido por medio y los casos de C8, C10 y C11; registrar estado y capturas.
13. [ ] **Verificación en producción** (qa-calidad con el equipo, tras aprobar el despliegue): Addi y Sistecrédito reales, encendido de `mostrar_cuotas`, C3, C4, C13 y C19; Theme Check sin errores si hubo cambios de tema.

## Notas y decisiones

- **16 nov 2026, decisiones del equipo incorporadas:**
  - Medios de pago: Addi, Sistecrédito, Mercado Pago, transferencia y contraentrega. **Wompi sale** del alcance.
  - Todos los envíos los hace una transportadora (por definir) con recaudo contraentrega.
  - Mercado Pago cubre tarjeta, PSE y los demás medios que el equipo active en su cuenta.
- **16 nov 2026, restricción de plataforma** (verificada en shopify.dev): las custom apps con Functions solo corren en Plus; las apps públicas de la App Store con funciones corren en cualquier plan.
- **16 nov 2026, decisión del equipo:** la tienda queda en Basic, sin Plus y sin Functions propias. Los combos van con descuentos nativos (SPEC-005, riesgo de plan resuelto) y la contraentrega por municipio con la app de Moship. Reemplaza la recomendación anterior (alternativa A al lanzar), que queda en "Historial" como respaldo.
- La versión anterior de esta spec tenía el criterio "El checkout muestra la marca en ambos modos". Se cambió por C19: el checkout tiene un solo esquema.
- Lo que la spec da como comportamiento esperado de Shopify y de las pasarelas (estados, rechazo de crédito, tarifas calculadas en Basic, comisión sobre métodos manuales) no está verificado. Lo confirma la tarea 1 o los pedidos de prueba, y se corrige aquí.

## Preguntas para el equipo

Bloquean las tareas de configuración real (tarea 2), no la redacción de los runbooks.

1. **Transportadora:** ¿cuál? Tiene que ofrecer recaudo contraentrega. ¿Tiene app en la App Store de Shopify? ¿Calcula tarifas por ciudad? ¿Maneja contraentrega y cobertura dentro de su app (alternativa C)?
2. **Monto máximo de contraentrega:** ¿cuál es? ¿Lo pone la transportadora o lo deciden ustedes?
3. **Ciudades con contraentrega:** ¿cuáles? ¿Las de la cobertura de recaudo de la transportadora completa o solo algunas?
4. **Quién paga el envío:** ¿el cliente siempre, salvo envío gratis? ¿Tarifa fija, por departamento o calculada por la transportadora?
5. **Umbral de envío gratis:** ¿cuál? Hoy CLAUDE.md dice $150.000 de ejemplo y el tema tiene 0 (barra oculta). ¿Aplica a todo el país o solo a algunas zonas?
6. **Tiempos de entrega:** ¿cuántos días hábiles por tipo de destino? Van en la política de envíos.
7. **Recargo por contraentrega:** ¿se cobra un valor extra por el recaudo? ¿Cuánto y cómo se muestra (en la tarifa de envío o en las instrucciones)?
8. **Comisión del recaudo:** ¿cuánto cobra la transportadora por recaudar? Solo para su margen, no se muestra al cliente salvo que decidan cobrarlo (pregunta 7).
9. **Medios en Mercado Pago:** ¿cuáles van a activar en su cuenta además de tarjeta y PSE?
10. **Cuenta bancaria empresarial:** ¿ya existe a nombre de la empresa? ¿En qué banco? Los datos los escriben ustedes en el admin, no se pasan por el repositorio.
11. **Persona jurídica:** ¿Addi y Sistecrédito les exigen la SAS ya constituida (RNF-12)? ¿En qué etapa va el trámite? Si se demora, ¿lanzan sin cuotas y con `mostrar_cuotas` apagado?
12. **Contraentrega pagada:** ¿marcan el pedido como pagado cuando la transportadora confirma la entrega o cuando les gira el recaudo?
13. **Respaldo de contraentrega:** si la app de Moship no pasa la verificación, ¿lanzan con la alternativa A del historial (el cliente puede elegirla y ustedes validan por WhatsApp) o esperan otra app?
14. **Monto máximo sin la app:** si la app no limita por monto, ¿aceptan que el tope se revise en la confirmación por WhatsApp y no en el checkout?
15. **Plazo de la transferencia:** ¿cuántas horas o días esperan el comprobante antes de cancelar el pedido?
16. **Checkout:** ¿lo quieren en esquema oscuro (como la tienda) o claro? El checkout no tiene interruptor.
17. **App "Control Contraentrega Colombia" (Moship):** verifiquen en la App Store que existe con ese nombre y desarrollador, cuánto cuesta hoy (y en qué moneda se cobra), que funciona en plan Basic (lean completa la nota de compatibilidad de la ficha) y si limita por monto. ¿Quién aprueba el cobro mensual?

## Historial

### Restricción de plataforma (16 nov 2026)

Verificado en shopify.dev: "Stores on any plan can use public apps that are distributed through the Shopify App Store and contain functions. Only stores on a Shopify Plus plan can use custom apps that contain Shopify Function APIs." Por eso no se puede ocultar la contraentrega con una Function propia en Basic. La primera versión de esta spec contemplaba esa Function; quedó descartada.

### Alternativas evaluadas antes de elegir la app de Moship

| Alternativa | Cómo funciona | Estado |
| --- | --- | --- |
| **A. Método manual + validación del equipo por WhatsApp** | La contraentrega aparece en el checkout para todos; las instrucciones dicen ciudades y monto; el equipo revisa antes de despachar y, si no cumple, ofrece otro medio o cancela | Era la recomendación al lanzar. Queda como **respaldo** si la app no pasa la verificación (pregunta 13). No cumple RF-19 al pie de la letra (el cliente puede elegirla) |
| **B. App pública que oculte métodos de pago** | Una app pública con funciones de personalización de pagos oculta la contraentrega por municipio o total | **Elegida**, en la forma concreta de la app de Moship |
| **C. Recaudo dentro de la app de la transportadora** | La app de la transportadora maneja cobertura y contraentrega | Descartada por ahora: la transportadora no está definida |
| **D. Contraentrega solo por WhatsApp** | No aparece en el checkout; el equipo crea un pedido borrador | Descartada: más fricción y más carga para el equipo |
| **E. Subir a Shopify Plus** | Function propia de personalización de pagos | Descartada por la decisión del 16 nov 2026 (sin Plus) |

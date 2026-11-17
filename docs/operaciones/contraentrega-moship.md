# Contraentrega por municipio con Moship (Control Contraentrega Colombia)

Estado: borrador. Información de la App Store consultada el 16 nov 2026. La app NO se ha instalado ni se ha creado ninguna cuenta.

## Preguntas para el equipo (decidir antes de instalar)

1. **Monto máximo de contraentrega.** La ficha de la app no menciona un tope por monto. Si el negocio quiere limitarlo, decidir cuánto y cómo se aplicaría (ver "Montos"). Valor: `[MONTO_MAXIMO_COP]`.
2. **Municipios y departamentos habilitados.** Lista inicial: `[CIUDADES]`.
3. **Transportadora** que recauda la contraentrega: `[TRANSPORTADORA]`. La app solo oculta o muestra el medio de pago; la transportadora debe tener cobertura de recaudo en esos municipios.
4. **Plan de pago de la app** (US$5 al mes tras 7 días de prueba, ver abajo): aprobación de quien paga.

## Objetivo

Mostrar "Pago contra entrega" en el checkout solo cuando la dirección de envío está en un municipio habilitado, y ocultarlo en los demás.

## Qué es la app (según la ficha oficial)

Ficha: [Control Contraentrega Colombia en la App Store](https://apps.shopify.com/cod-control?locale=es) (versión en inglés: [enlace](https://apps.shopify.com/cod-control)).

| Dato | Lo que dice la ficha | Estado |
| --- | --- | --- |
| Existe | Sí, desarrollador Moship (Medellín), publicada el 4 sep 2023, en español | Confirmado |
| Qué hace | Permite elegir en qué municipios de Colombia se ofrece contraentrega; todos los municipios vienen precargados y se activan o desactivan con un clic; plantillas para activar destinos de una vez; oculta el medio de pago donde no hay recaudo | Confirmado |
| Montos | La ficha no habla de límites por monto de pedido | Por verificar en la App Store o con soporte de Moship |
| Precio | Plan Pro US$5 al mes (cobro cada 30 días, en dólares), prueba gratis de 7 días. Incluye configuración hecha por Moship, soporte por WhatsApp en español y AnyDesk | Confirmado. Otras versiones de la ficha podrían mostrar otro precio: verificar en pantalla |
| Calificación | La ficha en español consultada muestra 5,0 con 4 reseñas. Un buscador mostró otras cifras (4,8 con más de 2.000 reseñas y 4,9 con 833) en versiones de otros idiomas | Inconsistente entre fuentes: verificar en la App Store el día de instalar |
| Plan Basic y Functions | La app usa una extensión de Shopify Functions de personalización de pagos y permiso para editar metaobjetos. No hay restricción de plan en la ficha. La ayuda de Shopify indica que las apps públicas de personalización de pagos funcionan en planes Basic o superiores; lo que requiere Plus es escribir Functions propias ([Personalizar métodos de pago y opciones de entrega](https://help.shopify.com/en/manual/checkout-settings/checkout-customization)) | Probable que funcione en Basic; confirmar con la prueba gratis de 7 días |
| Transportadoras | La ficha no exige una transportadora | Por verificar con Moship |
| Datos que pide | Datos de clientes (nombre, correo, teléfono, dirección, IP), datos del dueño y pedidos de los últimos 60 días | Confirmado; revisar con la política de datos personales (ver `cumplimiento`) |

Aviso: la ficha tiene una nota "solo es compatible con tiendas que..." que no pudo leerse completa. **Léela en pantalla antes de instalar.**

## Requisitos previos

- Medio de pago manual de contraentrega ya creado en el admin (Configuración > Pagos > Métodos de pago manuales > "Pago contra reembolso" o "Contra entrega"; nombre exacto: verificar en pantalla). Ver [Métodos de pago manuales](https://help.shopify.com/en/manual/payments/manual-payments). Sin él, la app no tiene nada que mostrar u ocultar.
- Zonas de envío y tarifas configuradas (ver `docs/operaciones/configuracion-inicial.md`).
- Quien instala debe ser el propietario de la tienda o personal con permiso para apps.
- Tarjeta o método de facturación de Shopify para el cobro de la app (se ingresa en el admin, nunca en el repositorio).
- Decisiones de las preguntas de arriba.

## Pasos

1. Abre la [ficha de la app](https://apps.shopify.com/cod-control?locale=es) e inicia sesión con la cuenta de Shopify de la tienda.
2. Pulsa **Instalar** y elige la tienda. Revisa los permisos que pide y acepta.
3. Acepta el plan Pro con la prueba gratis de 7 días (el cobro se aprueba en la pantalla de Shopify).
4. Al abrir la app, sigue su asistente de inicio. Las pantallas exactas no están documentadas públicamente: **verificar en pantalla**.
5. Municipios: todos vienen precargados. Elige el modo que ofrezca la app (activar solo los habilitados o usar una plantilla) y deja activos solo `[CIUDADES]`. Activa o desactiva con el interruptor de cada municipio.
6. Montos: busca en la app una opción de monto mínimo o máximo. Si no existe, pregunta a Moship por WhatsApp (el soporte está incluido) si se puede limitar por monto, o decide si el límite se maneja por confirmación manual en WhatsApp antes de despachar (regla de contraentrega del proyecto). No inventes el límite en el tema.
7. Si la app ofrece configuración hecha por el equipo de Moship (incluida en el plan Pro), pídela entregándoles solo la lista de municipios, no datos bancarios ni contraseñas.
8. Guarda y confirma que la app queda **Activa** en Configuración > Apps y canales de venta.

## Cómo probar que quedó bien

1. En una ventana de incógnito, agrega un producto al carrito y entra al checkout.
2. Escribe una dirección de un municipio **habilitado**: debe aparecer "Pago contra entrega" entre los medios de pago.
3. Cambia a una dirección de un municipio **no habilitado**: el medio de pago debe desaparecer.
4. Si definiste un monto máximo, repite con un carrito por encima y por debajo.
5. Haz un pedido de prueba con contraentrega en un municipio habilitado y confirma que llega a Pedidos con el medio de pago correcto. Cancélalo después.
6. Confirma por WhatsApp el flujo de verificación antes de despachar.

## Si falla

- No aparece contraentrega en ningún municipio: revisa que el método de pago manual esté activo y que el municipio esté habilitado en la app. Comprueba que la app esté instalada y activa.
- Aparece en municipios no habilitados: revisa que no haya otra app de pagos o reglas duplicadas, y que el departamento no esté activado completo.
- El municipio no aparece en la lista: el nombre en la dirección debe coincidir con el listado; consulta a Moship.
- La app dice que requiere un plan que la tienda no tiene: copia el mensaje y escribe al soporte de Moship por WhatsApp.
- Alternativa si no funciona en Basic: otra app de contraentrega con función equivalente (la ficha lista alternativas como formularios de contraentrega; ninguna ha sido evaluada aquí) o manejar la contraentrega solo por WhatsApp.
- Para quitar la app: Configuración > Apps y canales de venta > la app > Desinstalar, y cancela el plan para no pagar.

## Pendiente de verificar

- Nombres exactos de pantallas de la app y su asistente.
- Si admite montos mínimo y máximo.
- Calificación y número de reseñas actuales.
- Compatibilidad exacta con plan Basic (nota cortada en la ficha).
- Transportadoras con las que se integra (reseñas mencionan Coordinadora, sin confirmación oficial).

# ADR-002: Identidad Noctra (nombre, logo, paleta y tipografía)

- Estado: aceptada
- Fecha: 2026-11-13

## Contexto

El equipo eligió el nombre **Noctra** y un logo gótico en tres piezas (isotipo en forma de N con puntas de lanza, logotipo en letra gótica y versión completa superpuesta), en blanco y plata sobre negro. El proyecto estaba diseñado con una dirección de casa italiana (paleta Noir y oro, Cinzel y Cormorant).

## Decisión

- Nombre de la marca y de la tienda: Noctra.
- Paleta **Noir y plata** derivada del logo; el token de acento se renombra de `--color-oro` a `--color-acento`.
- Tipografía: **Pirata One** para títulos y eslogan (afín al logotipo gótico) y **Jost** para texto. Ambas autoalojadas.
- Forma afilada (radio 0 en botones y campos).
- La tienda entra en modo oscuro; modo claro disponible con el interruptor (cambio sobre RF-34 pendiente de aprobación).
- El logo se usa siempre desde el snippet `logo`, como máscara CSS para que cambie de color con el modo.

## Consecuencias

- Los SVG actuales salen de vectorizar automáticamente la imagen entregada (generada con IA). Sirven para la web, pero para bordados, empaques y el registro de marca conviene un archivo vectorial redibujado por un diseñador.
- Las imágenes generadas con IA pueden tener protección de derechos de autor limitada según la jurisdicción; registrar Noctra como marca en la SIC (nombre y logo) es lo que protege de verdad.
- Se descartan las piezas de identidad anteriores (Vértice, Cima, Vantto y la paleta dorada).

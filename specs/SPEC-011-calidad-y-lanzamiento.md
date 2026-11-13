# SPEC-011: Rendimiento, SEO y lanzamiento

- **Estado:** borrador
- **Etapa:** 6
- **Requerimientos:** RNF-01, RNF-02, RNF-05, RNF-14, RNF-15, RNF-16
- **Responsable:** qa-calidad
- **Revisores:** el equipo

## Objetivo

Lanzar una tienda rápida, encontrable en Google y sin errores, con un proceso de publicación que se pueda repetir.

## Presupuestos

| Métrica | Meta (celular, 4G) |
| --- | --- |
| LCP | < 2,5 s |
| CLS | < 0,1 |
| INP | < 200 ms |
| Lighthouse rendimiento | ≥ 85 |
| JS propio total | < 30 KB comprimido |
| CSS propio total | < 40 KB comprimido |

## SEO

- Títulos y descripciones por producto y colección (plantilla en el admin).
- Datos estructurados de producto (JSON-LD con precio, disponibilidad y marca propia).
- Imágenes con texto alternativo descriptivo y sin marcas de terceros.
- Mapa del sitio y robots nativos de Shopify.

## Checklist de lanzamiento

- [ ] Todas las specs de fase 1 en estado `hecha`.
- [ ] Pedido real de prueba con cada medio de pago y anulación.
- [ ] Dominio propio conectado y redirección a HTTPS.
- [ ] Verificación en dos pasos para todo el equipo (RNF-07).
- [ ] Políticas legales revisadas por una persona.
- [ ] Contraseña de la tienda retirada solo con aprobación del equipo.

## Proceso de publicación (RNF-16)

Definido en `docs/operaciones/ramas-y-despliegue.md`:

1. `spec/*` → PR a `dev` (CI) → tema Dev en la tienda de desarrollo.
2. `dev` → PR a `test` → tema no publicado "Noctra · Pre-prod" en la tienda real; el equipo prueba con la vista previa.
3. Sincronizar cambios del editor de producción y unir su PR.
4. `test` → PR a `prod` → aprobación del ambiente `prod` en GitHub → tema publicado y etiqueta `prod-AAAAMMDD-HHMM`.
5. Revertir: volver a desplegar la etiqueta anterior o publicar desde el admin la versión previa del tema.

- [ ] Ramas protegidas y Environments configurados.
- [ ] Dominio propio conectado con SSL activo.

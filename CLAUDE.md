# CLAUDE.md — Noctra, tienda online de tenis y gorras

Este archivo es la memoria del proyecto para Claude Code. Léelo completo al iniciar cada sesión. Si algo aquí contradice una spec, manda la spec aprobada más reciente y se corrige este archivo.

## 1. Qué estamos construyendo

Una tienda online de lujo accesible para Colombia que vende tenis y gorras de marca propia u originales, con el gancho comercial de **combos de precio fijo** (por ejemplo, 2 tenis + 1 gorra por $350.000, o 3 tenis por $420.000). Las personas llegan sobre todo desde Instagram y TikTok en el celular, conversan por WhatsApp y pagan con Addi, Sistecrédito, Mercado Pago, Wompi (tarjeta, PSE, Nequi, Daviplata), transferencia o contraentrega.

La marca se llama **Noctra**: una marca nocturna de lujo urbano. Su identidad es gótica y afilada (isotipo en forma de N con puntas de lanza y logotipo en letra gótica), en negro, blanco y plata. La prioridad número uno es la **impresión visual**: la página tiene que sentirse oscura, sobria e imponente, como una vitrina de noche donde solo brilla el producto. La prioridad número dos es que **comprar sea muy fácil** desde el celular, incluyendo cerrar la venta por WhatsApp.

El proyecto es de largo plazo. Después vendrán ropa premium, lociones, accesorios y una tienda física. Todo lo que construyamos debe aguantar ese crecimiento sin rehacerse.

Contexto completo, requerimientos funcionales (RF-01 a RF-36) y no funcionales (RNF-01 a RNF-18): `docs/contexto/requerimientos.md`.

## 2. Reglas no negociables

1. **Catálogo legítimo.** Solo productos de marca propia u originales. Nunca escribas en código, contenido, metadatos, nombres de archivo, alt de imágenes ni datos de prueba nombres o logos de marcas de terceros (Nike, Adidas, New Era, etc.), ni palabras como "réplica", "AAA", "1.1" o "inspirado en". Las pasarelas, Meta y TikTok bloquean cuentas por esto (RNF-13). Si una tarea lo pide, detente y avisa al equipo.
2. **Nada llega a producción sin aprobación humana.** Trabaja en local con `shopify theme dev -e desarrollo` y en ramas `spec/*` o `fix/*`. Nunca empujes a `test` ni a `prod`, nunca uses force push, `shopify theme publish`, `--live` ni `--allow-live`: los despliegues los hace GitHub Actions cuando el equipo une y aprueba.
3. **Cero secretos en el repositorio.** Tokens, claves de API, contraseñas de tienda y datos de clientes van en variables de entorno o en el admin de Shopify, nunca en archivos versionados.
4. **Spec primero.** No se escribe código de una funcionalidad sin una spec en estado `aprobada` (ver sección 7). Los cambios menores de estilo o correcciones de bugs pueden ir con una nota en la spec existente.
5. **Tokens, no valores sueltos.** Ningún color, fuente, tamaño de texto, espaciado ni radio va escrito a mano en un componente. Todo sale de `theme/assets/tokens.css` (RNF-04). El logotipo sale del snippet `logo` (SVG de `theme/assets/noctra-*.svg`) y el nombre de `settings.nombre_marca`; nunca se escribe ni se dibuja a mano.
6. **Español de Colombia** en todo lo que ve el cliente: tuteo cercano, pesos con punto de miles (`$350.000`), sin anglicismos innecesarios. Los botones dicen exactamente lo que hacen ("Agregar al carrito", "Pedir por WhatsApp").
7. **Celular primero.** Todo se diseña y prueba primero a 360 px de ancho (RNF-03) y cumple los presupuestos de rendimiento de RNF-01.
8. **Accesibilidad mínima AA**: contraste 4,5:1, foco visible, objetivos táctiles de 44 px, `prefers-reduced-motion` respetado, formularios con etiquetas (RNF-05).

## 3. Quién hace qué

| Actor | Responsabilidades | Lo que NO hace |
| --- | --- | --- |
| **Equipo (dueños del negocio)** | Nombre y marca final; proveedores, costos y precios; definición de combos y su vigencia; fotos y videos; aprobar specs y cada publicación; configurar el admin de Shopify (pagos, envíos, apps, impuestos); atender WhatsApp; trámites legales (SAS, SIC, DIAN) | Editar código del tema directamente en producción |
| **Claude Code + subagentes** | Escribir y refinar specs; código del tema (Liquid, CSS, JS); lógica de combos y su Shopify Function; pruebas automáticas; revisiones de calidad, accesibilidad, rendimiento y cumplimiento; runbooks paso a paso para lo que se configura en el admin | Publicar el tema, tocar pagos o datos reales de clientes, aprobar sus propias specs, inventar datos (tallas, precios, políticas) |
| **Shopify (plataforma)** | Hosting, CDN y disponibilidad; checkout y seguridad PCI; catálogo, variantes e inventario; pedidos y clientes; descuentos automáticos y ejecución de Functions; canales de Instagram, Facebook y TikTok; POS para la tienda física (fase 2) | Diseño de la marca, reglas de combos propias, mensajes de WhatsApp |
| **Apps y servicios externos** | Addi y Sistecrédito (cuotas), Mercado Pago y Wompi (pagos), transportadora (guías y contraentrega), Alegra o Siigo (factura electrónica DIAN), Meta/WhatsApp Business (catálogo y mensajes) | Se configuran en el admin; el tema solo les deja espacio (bloques de app) |

Regla práctica: si algo se puede resolver con una función nativa de Shopify o una app oficial, no lo programamos. Programamos solo lo que nos diferencia: el diseño, la experiencia de tallas, los combos y el flujo con WhatsApp.

## 4. Stack y estructura del repositorio

- **Shopify** (plan Basic al lanzar) con **tema propio Online Store 2.0** en Liquid, sin frameworks de CSS ni de JS. JavaScript con Web Components nativos, sin dependencias en el navegador.
- **Shopify CLI** para desarrollo del tema y, en la etapa 3, para la app privada que aloja la Function de combos.
- **Node.js 22+** solo para pruebas y scripts de apoyo (`packages/`).
- Git con tres ramas de ambiente: `dev` (tienda de desarrollo), `test` (pre-producción, tema no publicado en la tienda real) y `prod` (tema publicado, dominio propio). El trabajo se hace en ramas `spec/SPEC-00X-nombre-corto` o `fix/...` que salen de `dev`. CI/CD con GitHub Actions: `docs/operaciones/ramas-y-despliegue.md`.

```
.
├── CLAUDE.md                  ← este archivo
├── .mcp.json                  ← servidores MCP del proyecto
├── .github/                   ← CI, despliegue y sincronización con el editor de Shopify
├── .claude/
│   ├── settings.json          ← permisos (bloquea publicar el tema)
│   └── agents/                ← subagentes especializados
├── docs/
│   ├── contexto/              ← requerimientos y contexto de negocio
│   ├── decisiones/            ← ADRs (decisiones de arquitectura)
│   └── operaciones/           ← runbooks para configurar el admin
├── specs/                     ← specs ASDD (una por funcionalidad)
├── packages/
│   └── combos/                ← lógica pura de combos + pruebas (fuente única)
├── theme/                     ← tema de Shopify (raíz que se sube con la CLI)
│   ├── layout/ templates/ sections/ snippets/
│   ├── assets/                ← tokens.css, base.css, theme.js, combos.js
│   ├── config/ locales/
└── shopify.theme.toml         ← entornos de la CLI (sin secretos)
```

## 5. Comandos

```bash
npm test                         # pruebas de packages/ (node --test)
npm run sync:combos              # copia la lógica de combos a theme/assets/combos.js
shopify theme dev --path theme   # servidor local contra la tienda de desarrollo
shopify theme check --path theme # Theme Check (debe quedar sin errores)
shopify theme push --path theme --unpublished   # solo con aprobación, nunca --live
```

Antes de dar por terminada cualquier tarea de tema: `shopify theme check` sin errores, `npm test` en verde y revisión del subagente `qa-calidad`.

## 6. Sistema de diseño (resumen)

Paleta **Noir y plata**, derivada del logo. La tienda **siempre inicia en modo oscuro** (decisión de marca aprobada el 13 nov 2026); el interruptor permite pasar a claro y recuerda la preferencia (RF-34).

| Token CSS | Modo oscuro (base) | Modo claro | Uso |
| --- | --- | --- | --- |
| `--color-fondo` | #0E0F11 | #F3F3F1 | Fondo de página |
| `--color-superficie` | #17181B | #FFFFFF | Tarjetas, diálogos, carrito |
| `--color-borde` | #2A2C30 | #D6D8DB | Líneas y divisores |
| `--color-texto` | #F2F3F5 | #0E0F11 | Texto principal y logotipo |
| `--color-texto-2` | #9EA2A9 | #575B62 | Texto secundario |
| `--color-acento` | #C9CCD1 (plata) | #4A4E55 (plata oscura) | Isotipo |
| `--color-oro` | #B8975A | #8C6E3A | Acabados: filos de botones, ornamentos, marcos, precios, sello de combo, foco |
| `--color-oro-suave` | oro al 35 % | oro al 35 % | Filos finos: encabezado, tarjetas, divisores |
| `--color-boton-fondo` / `--color-boton-texto` | #F2F3F5 / #0E0F11 | #0E0F11 / #F3F3F1 | Botón principal |
| `--color-exito` / `--color-error` | #6FA37F / #E07A6E | #3E7350 / #A4443A | Estados |

- **Logo:** tres piezas en `theme/assets/` y `docs/marca/`: isotipo (`noctra-isotipo.svg`), logotipo (`noctra-wordmark.svg`) y completo superpuesto (`noctra-completo.svg`, dos tonos, solo sobre fondo oscuro). Isotipo y logotipo se pintan con máscara CSS y toman el color del texto, así sirven en ambos modos. Reglas de uso: `docs/marca/README.md`.
- **Tipografía:** **Pirata One** (gótica, solo títulos de sección, nombre del producto en la ficha y eslogan, nunca en párrafos) y **Jost** (todo lo demás). Ambas autoalojadas en `assets/`.
- **Forma:** aristas afiladas como el isotipo (radio 0 en botones, 2 px en tarjetas). Sin sombras ni degradados decorativos.
- **Metales:** la plata es del logo (isotipo). El **oro es el acabado**: filos de 1 px, el ornamento de línea con rombo, esquinas de marco, precios, sello de combo y anillo de foco. Nunca rellenos grandes de oro, salvo el sello de combo y el botón al pasar el mouse. El blanco del logotipo y del botón principal es lo que más brilla.
- **Portada animada:** al hacer scroll, el isotipo crece y el logotipo sube hasta superponerse y formar el logo completo (SPEC-002). Sin JS o con "reducir movimiento" se muestra el logo completo directamente.
- **Lo memorable es una sola cosa:** el logotipo gótico grande en la portada y, en cada ficha, el producto sobre fondo oscuro. Todo lo demás guarda silencio.
- Detalle completo: `specs/SPEC-001-sistema-de-diseno.md`.

## 7. Cómo trabajamos: ASDD (desarrollo guiado por specs y agentes)

Cada funcionalidad vive en una spec en `specs/`. El ciclo es:

1. **Especificar** — `arquitecto-specs` redacta la spec desde los RF/RNF, con criterios de aceptación verificables. Estado: `borrador`.
2. **Aprobar** — el equipo la revisa y cambia el estado a `aprobada`. Claude nunca aprueba.
3. **Planear** — el agente responsable descompone la spec en tareas pequeñas dentro de la misma spec (sección "Plan").
4. **Implementar** — el agente de la especialidad crea una rama `spec/...` desde `dev`, escribe el código y abre un PR hacia `dev`. Estado: `en-progreso`.
5. **Verificar** — `qa-calidad` corre Theme Check, pruebas, revisión a 360 px en modo claro y oscuro, accesibilidad y rendimiento; `cumplimiento` revisa textos y datos. Estado: `en-revision`.
6. **Aceptar** — el equipo une el PR a `dev`; en la siguiente release la cambian a `test` (pre-producción) y, tras probar, a `prod` aprobando el despliegue en GitHub. Estado: `hecha` cuando llega a `prod`.

**Definición de terminado:** todos los criterios de aceptación marcados, Theme Check sin errores, pruebas en verde, verificado a 360 px y 1280 px en ambos modos, sin valores fuera de los tokens, textos revisados y la spec actualizada con lo que cambió.

## 8. Etapas

| Etapa | Objetivo | Specs | Criterio de salida |
| --- | --- | --- | --- |
| 0. Fundaciones | Repo, agentes, MCP, tienda de desarrollo | — | `shopify theme dev` levanta el tema base |
| 1. Sistema de diseño y esqueleto | Tokens, modos, encabezado, pie, inicio | SPEC-001, SPEC-002 | Inicio navegable en ambos modos, Lighthouse móvil ≥ 85 |
| 2. Catálogo y producto | Colecciones, filtros, ficha, tallas, WhatsApp | SPEC-003, SPEC-004 | Se puede elegir talla con guía y pedir por WhatsApp |
| 3. Motor de combos | Function de descuento + mensajes en carrito | SPEC-005, SPEC-006 | Combos se aplican solos y el carrito dice qué falta |
| 4. Pagos y checkout | Configurar pasarelas, envíos, contraentrega | SPEC-007 | Compra de prueba aprobada con cada medio de pago |
| 5. Canales y analítica | Catálogo en redes, notificaciones, píxeles | SPEC-008, SPEC-009 | Ventas atribuidas por canal y por combo |
| 6. Contenido, legal y lanzamiento | Páginas, políticas, SEO, QA final | SPEC-010, SPEC-011 | Checklist de lanzamiento completo |
| 7. Fase 2 | Precio Club, reseñas, lista de deseos, POS | Por escribir | Según plan de crecimiento |

**Etapa activa: 1.** El esqueleto del tema y la lógica de combos ya tienen una primera versión (ver estado en cada spec). Para terminar la etapa 0, el equipo sigue `docs/operaciones/configuracion-inicial.md` (tienda de desarrollo, menús, colecciones, metaobjeto de tallas).

**Estado verificado del código:** Theme Check sin errores ni avisos, fuentes autoalojadas, 13 pruebas de combos en verde y vista previa estática revisada a 390 px en ambos modos. El tema aún no se ha probado contra una tienda real.

## 9. Subagentes

Están en `.claude/agents/`. Delega en ellos en vez de hacerlo todo en la conversación principal.

| Agente | Úsalo para |
| --- | --- |
| `arquitecto-specs` | Escribir o refinar specs, descomponer etapas en tareas, mantener la trazabilidad RF/RNF → spec → código |
| `disenador-ui` | Tokens, CSS, composición visual, revisión de pantallas con capturas en ambos modos |
| `dev-tema-liquid` | Secciones, snippets, plantillas, JavaScript del tema, configuración del editor |
| `dev-funciones` | Lógica de combos en `packages/combos`, Shopify Function de descuento, pruebas |
| `contenido-copy` | Textos de la tienda, fichas, páginas de ayuda, mensajes de WhatsApp, en español colombiano |
| `cumplimiento` | Revisión legal y de políticas: datos personales, consumidor, catálogo legítimo, términos de combos |
| `qa-calidad` | Theme Check, pruebas, accesibilidad, rendimiento y revisión visual antes de pedir aprobación |
| `operaciones-shopify` | Runbooks paso a paso para que el equipo configure el admin (pagos, envíos, apps, metaobjetos) |

## 10. Servidores MCP

Configurados en `.mcp.json`:

- **shopify-dev** (`@shopify/dev-mcp`): documentación actual de shopify.dev, esquema GraphQL y validación de Liquid. Úsalo antes de escribir cualquier Liquid, objeto, filtro o API de Functions que no hayas verificado: la plataforma cambia y la memoria del modelo se desactualiza. No lee ni modifica la tienda.
- **playwright**: abrir el tema de desarrollo en un navegador, tomar capturas a 360 px y 1280 px en ambos modos, y probar flujos (elegir talla, agregar al carrito, pedir por WhatsApp).
- **notion** (opcional): leer el tablero de decisiones y la tabla de estrategia de ventas del equipo. Solo lectura salvo que el equipo pida lo contrario.

Las versiones de los MCP van fijas en `.mcp.json` y en `devDependencies` (`npm install` una vez al clonar). Con `@latest`, `npx` consulta el registro en cada arranque, tarda más de 30 s y Claude Code da el servidor por caído. Para actualizarlos, cambia la versión en los dos lugares.

No agregues un MCP con acceso de escritura a la tienda (Admin API) sin una spec aprobada que lo justifique y un token de alcance mínimo.

## 11. Convenciones de código

- **Liquid**: una sección por bloque de página, snippets para piezas reutilizables, nombres de archivo en español y kebab-case (`ficha-producto`, `tarjeta-producto`). Esquemas de secciones con etiquetas en español. Usa `image_url` + `image_tag` con `widths` y `sizes` para todas las imágenes, con `loading: 'lazy'` salvo la primera visible.
- **CSS**: un archivo de tokens, un `base.css` global y un archivo por componente (`componente-*.css`) cargado solo donde se usa. Nombres de clase en español con BEM ligero (`.ficha__precio`, `.boton--secundario`). Sin `!important`, salvo en utilidades de accesibilidad (`.oculto-visual`, reducir movimiento). Propiedades lógicas (`inline`, `block`) cuando sea práctico.
- **JavaScript**: Web Components nativos (`customElements.define('ficha-producto', ...)`), `defer`, sin librerías externas. Todo funciona primero sin JS cuando es posible (formularios con `method="get"`/`post` reales).
- **Precios**: Shopify trabaja en centavos. En Liquid usa `| money`; en JS formatea con `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })`.
- **Datos editables por el equipo** (guía de tallas, combos, textos) van en configuraciones del tema, metaobjetos o metacampos, nunca en el código. Los productos, precios y fotos se cargan en el admin (`docs/operaciones/cargar-productos.md`).
- **JSON del editor**: `templates/*.json`, `sections/*.json` y `config/settings_data.json` también los cambia el equipo en producción. Antes de tocarlos, trae la última versión de `prod` (flujo de sincronización) para no pisar su trabajo.
- **Commits** en español, en imperativo, con el ID de la spec: `SPEC-004: agrega selector de talla con equivalencia en cm`.

## 12. Glosario

- **Eslogan**: "Viste la noche." Úsalo como cierre, no en cada frase. Hashtag de campaña: #VisteLaNoche.

- **Combo**: promoción de precio fijo por un conjunto de productos (2 tenis + 1 gorra = $350.000).
- **Precio Club**: precio especial para clientes registrados (fase 2).
- **Talla EUR**: la talla del tenis se elige por el número europeo de la etiqueta de un tenis que le quede bien al cliente; la guía muestra la equivalencia en centímetros de pie.
- **Contraentrega**: el cliente paga en efectivo al recibir; requiere confirmación por WhatsApp antes de despachar.
- **Tienda de desarrollo**: tienda o tema no publicado donde se prueba todo antes de aprobar.

## 13. Decisiones pendientes que afectan el código

- Verificación del nombre Noctra en la SIC (clases 25 y 35), dominio y usuarios de redes.
- Archivo vectorial original del logo hecho por un diseñador (los SVG actuales son una vectorización automática de la imagen generada; ver `docs/marca/README.md`).
- Verificar en la SIC que el eslogan "Viste la noche" se pueda registrar como lema comercial junto con la marca.
- Combos definitivos y su vigencia (hoy los dos de ejemplo).
- Número de WhatsApp Business (hoy vacío en la configuración).
- Medidas reales por horma para la guía de tallas (hoy hay una tabla de referencia general marcada como provisional).
- Umbral de envío gratis (hoy $150.000 de ejemplo).

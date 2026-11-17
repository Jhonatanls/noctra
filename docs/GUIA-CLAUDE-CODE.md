# Guía: cómo trabajar el proyecto Noctra con Claude Code

Esta guía te lleva desde el archivo `noctra.zip` hasta tener la tienda corriendo en una tienda de desarrollo, y te explica cómo pedirle trabajo a Claude Code cada día sin riesgos.

## Qué vas a lograr

1. Tener el proyecto en tu computador, versionado con Git.
2. Ver el tema de Noctra funcionando en una tienda de desarrollo de Shopify, con despliegue automático a pre-producción y producción.
3. Abrir Claude Code en la carpeta, con sus 8 agentes y sus 3 MCP listos.
4. Avanzar etapa por etapa: tú decides y apruebas, los agentes construyen y revisan.

## Antes de empezar (una sola vez)

### Cuentas

- **Claude** con acceso a Claude Code (plan de pago de Claude o cuenta de la Consola de Anthropic).
- **Shopify Partners** (gratis): permite crear tiendas de desarrollo sin pagar plan mientras construyes.
- **GitHub** (opcional, recomendado): para guardar una copia privada del proyecto.

### Programas

| Programa | Para qué | Cómo instalarlo |
| --- | --- | --- |
| Node.js 22 o superior (versión LTS) | Pruebas, Shopify CLI y los MCP | Descárgalo de nodejs.org |
| Git | Guardar versiones y trabajar por ramas | git-scm.com |
| Claude Code | El asistente que trabaja en el proyecto | macOS/Linux: `curl -fsSL https://claude.ai/install.sh \| bash` · Windows (PowerShell): `irm https://claude.ai/install.ps1 \| iex` |
| Shopify CLI | Ver y subir el tema | `npm install -g @shopify/cli@latest` |
| VS Code (opcional) | Ver los archivos y los cambios con comodidad | code.visualstudio.com |

Verifica en una terminal:

```bash
node -v        # debe decir v20 o más
git --version
claude --version
shopify version
```

Las formas de instalación cambian con el tiempo. Si un comando falla, revisa la documentación oficial de Claude Code y de Shopify CLI.

## Paso 1: descomprimir y guardar la primera versión

```bash
unzip noctra.zip
cd noctra
git init
git add .
git commit -m "Etapa 0: base del proyecto Noctra"
git branch -M prod
```

Después crearás `test` y `dev` a partir de `prod` (ver `docs/operaciones/ramas-y-despliegue.md`).

Si usas GitHub, crea un repositorio **privado** llamado `noctra` y súbelo:

```bash
git remote add origin https://github.com/TU-USUARIO/noctra.git
git push -u origin prod
```

## Paso 2: comprobar que todo está sano

```bash
npm test
```

Debe decir `pass 13` y `fail 0`. Son las pruebas del motor de combos.

## Paso 3: crear la tienda de desarrollo y ver el tema

1. Sigue el runbook `docs/operaciones/configuracion-inicial.md`: crear la tienda de desarrollo, menús, colecciones "Tenis" y "Gorras", productos de prueba con etiquetas `grupo-tenis`/`grupo-gorras`, y el metaobjeto `guia_tallas`.
2. Abre `shopify.theme.toml` y cambia `PENDIENTE-noctra-dev.myshopify.com` por la dirección real de tu tienda de desarrollo. **No pongas contraseñas en ese archivo.**
3. Ejecuta:

```bash
shopify theme dev -e desarrollo
```

La CLI te pide iniciar sesión en el navegador. Luego te da un enlace local (normalmente `http://127.0.0.1:9292`) donde ves la tienda con el tema de Noctra: la barra de anuncios, la portada animada, los combos y las colecciones. Deja esa terminal abierta mientras trabajas.

4. En el editor del tema de Shopify (Personalizar) completa: número de WhatsApp Business con indicativo (`57…`), redes sociales y umbral de envío gratis.

## Paso 4: abrir Claude Code

En **otra** terminal, dentro de la carpeta `noctra`:

```bash
claude
```

Lo que pasa la primera vez:

- **Claude lee `CLAUDE.md` solo.** Ahí está la visión, las reglas, los roles, las etapas y los agentes. No necesitas explicárselo.
- **Te pregunta si apruebas los MCP del proyecto** (`shopify-dev`, `playwright`, `notion`). Acepta. Si no aparece la pregunta, escribe `/mcp` para ver su estado.
- **Notion** pide iniciar sesión: en `/mcp`, elige `notion` y autentícate. Es opcional; si no usan Notion, puedes ignorarlo.
- Escribe `/agents` para confirmar que aparecen los 8 agentes de `.claude/agents/`.

No ejecutes `/init`: sirve para generar un CLAUDE.md nuevo y el proyecto ya tiene uno.

## Paso 5: la primera conversación

Copia y pega estas instrucciones, una a la vez, esperando cada respuesta:

1. > Lee CLAUDE.md y specs/README.md. Resúmeme en qué etapa estamos, qué está hecho y qué falta para cerrar la etapa 1.
2. > Con el agente qa-calidad, revisa el tema corriendo en http://127.0.0.1:9292 a 360 px y 1280 px en modo oscuro y claro. Revisa sobre todo la animación de la portada y los acabados dorados. Dame los hallazgos sin corregir nada todavía.
3. > Con el agente cumplimiento, revisa todo el repositorio y dime si hay algún problema bloqueante.

## Cómo trabajar cada día (el ciclo de las specs)

Cada funcionalidad tiene una spec en `specs/`. El trabajo siempre sigue este orden:

| Paso | Qué le dices a Claude | Qué haces tú |
| --- | --- | --- |
| 1. Especificar | "Con arquitecto-specs, revisa SPEC-003 y déjala lista para aprobar. Hazme las preguntas que necesites." | Respondes las preguntas del negocio (precios, tallas, políticas) |
| 2. Aprobar | — | Lees la spec y cambias su estado a `aprobada` (o le dices "apruebo SPEC-003") |
| 3. Implementar | "Desde dev, crea la rama spec/SPEC-003-catalogo e implementa SPEC-003 con dev-tema-liquid." | Esperas; Claude te pedirá permiso antes de acciones sensibles |
| 4. Verificar | "Ahora qa-calidad y cumplimiento revisan SPEC-003." | Lees el reporte |
| 5. Probar | — | Pruebas en `http://127.0.0.1:9292` desde tu celular y computador |
| 6. Cerrar | "Todo bien: haz commit, sube la rama y abre el PR hacia dev." | Revisas y unes el PR en GitHub |

Consejos:

- **Una tarea por conversación.** Cuando termines una spec, escribe `/clear` para empezar limpio la siguiente. Claude vuelve a leer CLAUDE.md.
- **Para tareas grandes, pide un plan primero:** "Antes de escribir código, muéstrame el plan para SPEC-005." También puedes activar el modo de planificación de Claude Code (en muchas versiones se alterna con Shift + Tab).
- **Revisa los cambios** antes de aprobarlos: en VS Code, la pestaña de control de código fuente muestra exactamente qué cambió.
- **Si algo va mal, para.** Presiona `Esc` para interrumpir a Claude, y con Git siempre puedes volver al último commit.

## Hoja de ruta por etapa

| Etapa | Qué pedirle a Claude | Qué decides o haces tú |
| --- | --- | --- |
| 1. Diseño y esqueleto | "Cierra la etapa 1: corrige los hallazgos de QA y mide los contrastes de SPEC-001." | Apruebas cómo se ve la portada y los acabados |
| 2. Catálogo y ficha | "Implementa SPEC-003 y SPEC-004: filtros, búsqueda predictiva, galería con zoom y barra de compra fija en celular." | Cargas medidas reales de tallas en el metaobjeto y fotos reales |
| 3. Combos | "Con dev-funciones, implementa la lógica `compraXllevaY` de SPEC-005 con sus pruebas. Luego SPEC-006: carrito lateral con mensajes de combo y el selector de gorra de regalo." | Creas las colecciones y los tres descuentos automáticos con `docs/operaciones/combos-nativos.md` y defines la vigencia de cada combo |
| 4. Pagos y envíos | "Con operaciones-shopify, escribe los runbooks de SPEC-007 y SPEC-008." | Activas Addi, Sistecrédito, Mercado Pago, Wompi, envíos y contraentrega siguiendo los runbooks |
| 5. Canales | "Runbooks y ajustes de SPEC-009: Instagram, TikTok, WhatsApp, píxeles y banner de cookies." | Conectas las cuentas de Meta y TikTok |
| 6. Lanzamiento | "Con contenido-copy, redacta las páginas de SPEC-010. Luego qa-calidad corre el checklist de SPEC-011." | Revisión legal de las políticas, dominio, pedido real de prueba |

## Publicar cambios

El proyecto usa tres ramas: `dev`, `test` (pre-producción) y `prod` (lo que ven los clientes). GitHub Actions despliega cada una a su tema de Shopify cuando se une un PR. Claude Code **no puede** empujar a `test` ni a `prod`: eso lo haces tú desde GitHub.

1. Cuando haya varias specs unidas en `dev`, abre en GitHub un PR de `dev` a `test`. Al unirlo, se actualiza "Noctra · Pre-prod".
2. Prueba en la vista previa de Pre-prod (Shopify → Tienda online → Temas → Vista previa).
3. En GitHub → Actions, ejecuta **Sincronizar desde producción** y une su PR si aparece.
4. Abre un PR de `test` a `prod`, únelo y aprueba el despliegue cuando GitHub lo pida.

Configuración y reglas completas: `docs/operaciones/ramas-y-despliegue.md`.

## Reglas de oro

- Nunca pegues contraseñas, tokens ni datos bancarios en el chat ni en archivos del proyecto.
- Catálogo solo de marca propia u originales; nada de marcas de terceros en fotos, textos ni datos de prueba.
- Toda decisión de negocio (precios, políticas, tallas) la das tú; si Claude no la sabe, debe preguntarte, no inventarla.
- Un cambio grande = una spec = una rama.
- Haz commit cada vez que algo quede bien.

## Problemas frecuentes

| Problema | Qué hacer |
| --- | --- |
| No aparecen los MCP | Escribe `/mcp`. Si siguen pendientes, sal y ejecuta `claude mcp reset-project-choices`, y vuelve a abrir `claude` para aprobarlos |
| `shopify theme dev` pide permisos o falla | Ejecuta `shopify auth logout`, vuelve a iniciar sesión y revisa la dirección de la tienda en `shopify.theme.toml` |
| Theme Check muestra errores | Pídele a Claude: "Corre shopify theme check y corrige los errores" |
| Claude quiere hacer algo que no entiendes | Pregúntale "¿por qué?" antes de aprobar; puedes rechazar cualquier acción |
| La conversación se vuelve lenta o confusa | `/clear` y empieza de nuevo con una sola tarea |
| Cambiaste algo y se dañó | `git status` para ver qué cambió y `git restore .` para volver al último commit (o pídeselo a Claude) |

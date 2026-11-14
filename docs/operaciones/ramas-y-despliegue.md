# Ramas, ambientes y despliegue (CI/CD)

## Los tres ambientes

| Rama | Ambiente | Dónde vive | Quién lo ve | Se actualiza |
| --- | --- | --- | --- | --- |
| `dev` | Desarrollo | Tema "Noctra", **publicado** en la **tienda de desarrollo** con contraseña (datos y pagos de prueba). Va publicado porque el admin solo ofrece las plantillas del tema publicado (por ejemplo, `gorra`) | El equipo | Automático al unir un PR a `dev` |
| `test` | Pre-producción | Tema **no publicado** "Noctra · Pre-prod" en la **tienda real** | El equipo, con el enlace de vista previa | Automático al unir un PR a `test` |
| `prod` | Producción | Tema **publicado** en la tienda real, en el dominio propio | Todos los clientes | Al unir un PR a `prod` **y** aprobar el despliegue en GitHub |

Pre-producción vive en la tienda real a propósito: así se prueba con los productos, precios, apps de pago y envíos reales, sin que los clientes lo vean. La vista previa se abre desde Tienda online → Temas → "Noctra · Pre-prod" → Vista previa, y se puede compartir el enlace.

## Flujo de una funcionalidad

1. Se crea una rama desde `dev`: `spec/SPEC-003-catalogo` (o `fix/...` para correcciones menores).
2. Se trabaja en local con `shopify theme dev -e desarrollo`.
3. PR de `spec/...` hacia `dev`. CI corre pruebas, Theme Check y la revisión de marcas. Al unir, se despliega al tema Dev.
4. Cuando hay un grupo de cambios listo (una release), PR de `dev` hacia `test`. Al unir, se despliega a Pre-prod.
5. El equipo prueba en la vista previa de Pre-prod con celular y computador.
6. Se ejecuta el flujo **Sincronizar desde producción** y se une su PR si hubo cambios del editor.
7. PR de `test` hacia `prod`. Una persona del equipo lo aprueba y, en GitHub, aprueba el despliegue del ambiente `prod`. Se publica y se crea la etiqueta `prod-AAAAMMDD-HHMM`.

## Ramas permitidas por destino

El CI rechaza cualquier PR que no siga estas reglas:

| Hacia | Solo desde |
| --- | --- |
| `dev` | `spec/*`, `fix/*`, `back/*` |
| `test` | `dev`, `back/*` |
| `prod` | `test`, `hotfix/*`, `sync/*` |

- **Hotfix** (algo roto en producción): rama `hotfix/descripcion` desde `prod`, PR a `prod`, y luego PRs `back/...` de `prod` hacia `test` y `dev` para que no se pierda.
- **Back-merge** (`back/*`): devuelve a `test` y `dev` lo que entró a `prod` por hotfix o sincronización.

## Cambios hechos en el editor de Shopify

Textos, imágenes, orden de secciones y ajustes del tema los cambia el equipo en el editor de Shopify, directamente en producción. Esos cambios se guardan en los JSON del tema (`templates/*.json`, `sections/*.json`, `config/settings_data.json`).

- El despliegue **nunca pisa** `config/settings_data.json`.
- El flujo **Sincronizar desde producción** corre cada noche (y a mano antes de cada release): baja esos JSON del tema publicado y abre un PR `sync/editor-produccion` hacia `prod`.
- **Regla:** no se despliega a `prod` con un PR de sincronización abierto. Primero se une, luego se hace el back-merge a `test` y `dev`.

## Configuración (una sola vez)

### 1. GitHub

1. Crear el repositorio privado `noctra` y subir el proyecto (ver `docs/GUIA-CLAUDE-CODE.md`).
2. Crear `test` y `dev` a partir de `prod` (que ya existe si seguiste la guía):

```bash
git checkout prod
git checkout -b test && git push -u origin test
git checkout -b dev  && git push -u origin dev
```

3. En Settings → Branches → Add rule, proteger `prod`, `test` y `dev`:
   - Requerir pull request antes de unir, con 1 aprobación (en `prod` y `test`).
   - Requerir que pasen los checks **Pruebas y Theme Check** y **Regla de ramas**.
   - Bloquear force push y borrado.
4. En Settings → General, poner `dev` como rama por defecto.

### 2. Shopify

1. **Tienda de desarrollo** (Partners) para `dev`, y **tienda real** con plan pago para `test` y `prod`.
2. En cada tienda, instalar la app **Theme Access** de Shopify y generar una contraseña para el despliegue. Es una credencial solo de temas: no da acceso a pedidos ni clientes.
3. Crear los temas:
   - Tienda de desarrollo: subir el tema como "Noctra · Dev".
   - Tienda real: "Noctra · Pre-prod" (no publicado) y "Noctra" (el que se publicará).
   - Anotar el ID de cada tema (aparece en la URL al editar el código del tema, o con `shopify theme list`).

### 3. GitHub Environments

En Settings → Environments, crear `dev`, `test` y `prod`. En cada uno:

| Tipo | Nombre | Valor |
| --- | --- | --- |
| Secret | `SHOPIFY_CLI_THEME_TOKEN` | Contraseña de Theme Access de esa tienda |
| Variable | `SHOPIFY_STORE` | `noctra-dev.myshopify.com` (dev) o `noctra.myshopify.com` (test y prod) |
| Variable | `SHOPIFY_THEME_ID` | ID del tema de ese ambiente |

En `prod`, activar **Required reviewers** con al menos una persona del equipo y limitar el ambiente a la rama `prod`. Así ningún despliegue llega a los clientes sin un clic humano.

### 4. Dominio

1. En Shopify: Configuración → Dominios → Conectar dominio existente, y escribir el dominio.
2. Shopify muestra los registros DNS exactos. Normalmente son un registro **A** para `@` apuntando a la IP de Shopify y un **CNAME** para `www` apuntando a `shops.myshopify.com`. Cópialos tal como los muestra el admin.
3. En el panel del proveedor del dominio, reemplazar los registros actuales por esos.
4. La propagación tarda de minutos a 48 horas. Shopify activa el certificado SSL solo.
5. Definir el dominio como principal y activar la redirección de `myshopify.com` y `www`.

**Ojo:** al cambiar el registro A, la página de Vértice que hoy está en ese dominio deja de verse. Si quieren conservarla, muévanla antes a un subdominio (por ejemplo `vertice.tudominio.com`) en su hosting actual. Si el dominio se llama como Vértice, consideren comprar uno con el nombre Noctra (por ejemplo `.co` o `.com.co`) y conectar ambos: el de Noctra como principal y el otro redirigiendo.

## Qué puede y qué no puede hacer Claude Code

- Puede: crear ramas `spec/*` y `fix/*`, hacer commits, abrir PRs hacia `dev`.
- No puede (bloqueado en `.claude/settings.json`): empujar a `test` o `prod`, hacer force push, publicar temas ni subir al tema publicado.
